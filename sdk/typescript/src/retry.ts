/**
 * VAEA Flash — Smart Retry
 *
 * Automatic transaction retry with:
 * - Blockhash refresh on expiry
 * - Priority fee escalation on congestion
 * - Never retries program errors (Custom(...), InstructionError)
 *
 * Uses standard Solana RPC only — zero external dependencies.
 */

import {
  Connection,
  VersionedTransaction,
  TransactionMessage,
  TransactionInstruction,
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  Keypair,
} from '@solana/web3.js';

export type RetryReason = 'expired' | 'congestion' | 'program_error';

export interface RetryConfig {
  /** Maximum number of attempts (default: 3) */
  maxAttempts: number;
  /** Retry strategy: 'none' = no retry, 'adaptive' = smart retry */
  strategy: 'none' | 'adaptive';
  /** Called on each retry attempt */
  onRetry?: (attempt: number, reason: RetryReason) => void;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  strategy: 'adaptive',
};

/**
 * Send a transaction with smart retry logic.
 *
 * @param connection - Solana RPC connection
 * @param wallet - Transaction signer
 * @param instructions - Instructions to include (rebuilt on each attempt)
 * @param lookupTables - Address Lookup Tables for V0 messages
 */
export async function sendWithRetry(
  connection: Connection,
  wallet: Keypair,
  instructions: TransactionInstruction[],
  lookupTables: AddressLookupTableAccount[],
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  initialPriorityMicroLamports?: number,
): Promise<string> {
  if (config.strategy === 'none') {
    return sendOnce(connection, wallet, instructions, lookupTables, initialPriorityMicroLamports ?? 0);
  }

  let lastError: Error | undefined;
  let priorityMicroLamports = initialPriorityMicroLamports ?? 1_000;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const sig = await sendOnce(
        connection, wallet, instructions, lookupTables, priorityMicroLamports,
      );
      return sig;
    } catch (err: any) {
      lastError = err;
      const reason = classifyError(err);

      // Never retry program errors — they'll fail again
      if (reason === 'program_error') throw err;
      if (attempt >= config.maxAttempts) throw err;

      config.onRetry?.(attempt, reason);

      // Escalate priority fee on congestion
      if (reason === 'congestion') {
        priorityMicroLamports = Math.floor(priorityMicroLamports * 1.5);
        await sleep(400); // Wait 1 slot
      }
      // Expired: just rebuild with new blockhash (next loop iteration)
    }
  }
  throw lastError!;
}

async function sendOnce(
  connection: Connection,
  wallet: Keypair,
  instructions: TransactionInstruction[],
  lookupTables: AddressLookupTableAccount[],
  priorityMicroLamports: number,
): Promise<string> {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('confirmed');

  // Prepend priority fee if > 0
  const allIxs = priorityMicroLamports > 0
    ? [ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityMicroLamports }), ...instructions]
    : instructions;

  const messageV0 = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash,
    instructions: allIxs,
  }).compileToV0Message(lookupTables);

  const tx = new VersionedTransaction(messageV0);
  tx.sign([wallet]);

  const sig = await connection.sendTransaction(tx, {
    skipPreflight: true, // We already simulated
    maxRetries: 0,       // We handle retries
  });

  await connection.confirmTransaction(
    { signature: sig, blockhash, lastValidBlockHeight },
    'confirmed',
  );

  return sig;
}

function classifyError(err: any): RetryReason {
  const msg = String(err?.message || err);
  if (msg.includes('Blockhash') || msg.includes('expired') || msg.includes('block height exceeded')) {
    return 'expired';
  }
  if (msg.includes('InstructionError') || msg.includes('Custom(') || msg.includes('custom program error')) {
    return 'program_error';
  }
  return 'congestion';
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
