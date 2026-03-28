/**
 * VAEA Flash — Jito Bundle Integration
 *
 * Send flash loan transactions via Jito Block Engine for:
 * - Bundle privacy (not in public mempool)
 * - Auto-calculated tips based on current tip floor
 * - Atomic execution guarantees
 *
 * Zero npm dependencies — pure fetch() calls.
 */

import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  VersionedTransaction,
} from '@solana/web3.js';

// ═══════════════════════════════════════════════════════════
//  Constants
// ═══════════════════════════════════════════════════════════

/** Jito Block Engine URLs by region. */
export const JITO_BLOCK_ENGINE_URLS: Record<string, string> = {
  mainnet: 'https://mainnet.block-engine.jito.wtf',
  amsterdam: 'https://amsterdam.mainnet.block-engine.jito.wtf',
  frankfurt: 'https://frankfurt.mainnet.block-engine.jito.wtf',
  ny: 'https://ny.mainnet.block-engine.jito.wtf',
  tokyo: 'https://tokyo.mainnet.block-engine.jito.wtf',
  slc: 'https://slc.mainnet.block-engine.jito.wtf',
};

/**
 * Hardcoded Jito tip accounts (from getTipAccounts).
 * Used as fallback if the dynamic fetch fails.
 * Refreshed periodically via fetchTipAccounts().
 */
export const JITO_TIP_ACCOUNTS: PublicKey[] = [
  new PublicKey('96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5'),
  new PublicKey('HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe'),
  new PublicKey('Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY'),
  new PublicKey('ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49'),
  new PublicKey('DfXygSm4jCyNCzbzYAKhb58Pi6BteBuKVjBJhZSLQndT'),
  new PublicKey('ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt'),
  new PublicKey('DttWaMuVvTiduCN3AwnFnBbEG9HshVEy7BkH6V1RB2oz'),
  new PublicKey('3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT'),
];

// ═══════════════════════════════════════════════════════════
//  Types
// ═══════════════════════════════════════════════════════════

/**
 * Tip strategy for Jito bundles.
 * - `'min'` — tip floor (~1,000-5,000 lamports). Cheapest, lowest priority.
 * - `'competitive'` — tip floor × 3 (~10k-50k lamports). Recommended.
 * - `'aggressive'` — 100,000+ lamports. For high-value opportunities.
 * - `number` — exact tip in lamports. Full control.
 */
export type TipStrategy = 'min' | 'competitive' | 'aggressive' | number;

export interface JitoConfig {
  /** Tip strategy (default: 'competitive') */
  tip?: TipStrategy;
  /** Block Engine region or full URL (default: 'mainnet') */
  region?: string;
}

export interface JitoBundleResult {
  bundleId: string;
  signatures: string[];
}

// ═══════════════════════════════════════════════════════════
//  URL Resolution
// ═══════════════════════════════════════════════════════════

/**
 * Resolve a region name to a full Block Engine URL.
 * Accepts 'mainnet', 'amsterdam', 'ny', 'tokyo', 'frankfurt', 'slc',
 * or a full URL like 'https://my-custom-engine.example.com'.
 */
export function resolveBlockEngineUrl(region?: string): string {
  if (!region) return JITO_BLOCK_ENGINE_URLS.mainnet;
  if (region.startsWith('http')) return region;
  return JITO_BLOCK_ENGINE_URLS[region] ?? JITO_BLOCK_ENGINE_URLS.mainnet;
}

// ═══════════════════════════════════════════════════════════
//  Tip Calculation
// ═══════════════════════════════════════════════════════════

const MIN_TIP_LAMPORTS = 1_000;
const COMPETITIVE_MULTIPLIER = 3;
const AGGRESSIVE_TIP_LAMPORTS = 100_000;

/**
 * Calculate tip amount in lamports based on strategy.
 * When strategy is 'min', 'competitive', or 'aggressive', a default
 * floor of 10,000 lamports is used (overridden by fetchTipFloor).
 */
export function calculateTip(strategy: TipStrategy, floorLamports: number = 10_000): number {
  if (typeof strategy === 'number') {
    return Math.max(strategy, MIN_TIP_LAMPORTS);
  }
  switch (strategy) {
    case 'min':
      return Math.max(floorLamports, MIN_TIP_LAMPORTS);
    case 'competitive':
      return Math.max(floorLamports * COMPETITIVE_MULTIPLIER, MIN_TIP_LAMPORTS * 10);
    case 'aggressive':
      return Math.max(AGGRESSIVE_TIP_LAMPORTS, floorLamports * 5);
  }
}

/**
 * Build a tip instruction — simple SystemProgram.transfer to a random Jito tip account.
 */
export function buildTipInstruction(
  payer: PublicKey,
  tipLamports: number,
  tipAccounts?: PublicKey[],
): TransactionInstruction {
  const accounts = tipAccounts ?? JITO_TIP_ACCOUNTS;
  const randomTipAccount = accounts[Math.floor(Math.random() * accounts.length)];
  return SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: randomTipAccount,
    lamports: tipLamports,
  });
}

// ═══════════════════════════════════════════════════════════
//  Block Engine API — pure fetch, zero dependencies
// ═══════════════════════════════════════════════════════════

/**
 * Fetch current tip accounts from Jito Block Engine.
 * Falls back to hardcoded JITO_TIP_ACCOUNTS on failure.
 */
export async function fetchTipAccounts(blockEngineUrl: string): Promise<PublicKey[]> {
  try {
    const res = await fetch(`${blockEngineUrl}/api/v1/bundles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTipAccounts',
        params: [],
      }),
    });
    const data = await res.json();
    if (data.result && Array.isArray(data.result)) {
      return data.result.map((addr: string) => new PublicKey(addr));
    }
  } catch {
    // Fallback to hardcoded accounts
  }
  return JITO_TIP_ACCOUNTS;
}

/**
 * Send a bundle of signed transactions to the Jito Block Engine.
 *
 * @param blockEngineUrl - Block Engine endpoint
 * @param transactions - Signed VersionedTransactions to bundle
 * @returns Bundle ID for status polling
 */
export async function sendJitoBundle(
  blockEngineUrl: string,
  transactions: VersionedTransaction[],
): Promise<string> {
  // Serialize all TXs to base64 (supported by Jito Block Engine)
  const encodedTxs = transactions.map(tx =>
    Buffer.from(tx.serialize()).toString('base64')
  );

  const res = await fetch(`${blockEngineUrl}/api/v1/bundles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sendBundle',
      params: [encodedTxs, { encoding: 'base64' }],
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(`Jito sendBundle error: ${data.error.message} (code: ${data.error.code})`);
  }

  return data.result; // bundle_id
}

/**
 * Poll Jito Block Engine for bundle landing status.
 *
 * @param blockEngineUrl - Block Engine endpoint
 * @param bundleId - Bundle ID from sendBundle
 * @param timeoutMs - Max time to wait (default: 30s)
 * @returns First transaction signature once landed
 */
export async function pollBundleStatus(
  blockEngineUrl: string,
  bundleId: string,
  timeoutMs: number = 30_000,
): Promise<string> {
  const start = Date.now();
  const pollInterval = 500; // 500ms between polls

  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${blockEngineUrl}/api/v1/bundles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBundleStatuses',
          params: [[bundleId]],
        }),
      });

      const data = await res.json();
      if (data.result?.value?.[0]) {
        const status = data.result.value[0];
        if (status.confirmation_status === 'confirmed' || status.confirmation_status === 'finalized') {
          // Return the first TX signature
          return status.transactions?.[0] ?? bundleId;
        }
        if (status.err) {
          throw new Error(`Jito bundle failed: ${JSON.stringify(status.err)}`);
        }
      }
    } catch (err: any) {
      // Network errors during polling are not fatal — just retry
      if (err.message?.includes('bundle failed')) throw err;
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Jito bundle ${bundleId} did not land within ${timeoutMs}ms`);
}
