import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  AccountMeta,
  SendOptions,
} from '@solana/web3.js';
import {
  VaeaFlashConfig,
  VaeaError,
  CapacityResponse,
  QuoteResponse,
  BuildRequest,
  BuildResponse,
  BorrowParams,
  HealthResponse,
  ApiInstructionData,
  TokenCapacity,
  VAEA_API_URL,
  SUPPORTED_TOKENS,
} from './types';

/**
 * VAEA Flash — Universal Flash Loan SDK for Solana
 *
 * @example
 * ```typescript
 * import { VaeaFlash } from '@vaea/flash';
 *
 * const flash = new VaeaFlash({ connection, wallet });
 *
 * // One-liner flash loan
 * const sig = await flash.execute({
 *   token: 'mSOL',
 *   amount: 1000,
 *   onFunds: async (ixs) => {
 *     ixs.push(myArbitrageInstruction);
 *     return ixs;
 *   }
 * });
 * ```
 */
export class VaeaFlash {
  private readonly apiUrl: string;
  private readonly source: 'sdk' | 'ui';
  private readonly connection?: Connection;
  private readonly wallet?: Keypair;

  constructor(config: VaeaFlashConfig & { connection?: Connection; wallet?: Keypair } = {}) {
    this.apiUrl = config.apiUrl ?? VAEA_API_URL;
    this.source = config.source ?? 'sdk';
    this.connection = config.connection;
    this.wallet = config.wallet;
  }

  // ═══════════════════════════════════════════════════════════
  //  GET /v1/capacity
  // ═══════════════════════════════════════════════════════════

  /**
   * Get real-time flash loan capacity for all supported tokens.
   * Data refreshes every 2 seconds from on-chain liquidity scanning.
   */
  async getCapacity(): Promise<CapacityResponse> {
    return this.apiGet<CapacityResponse>('/v1/capacity');
  }

  /**
   * Get capacity for a single token.
   * @throws VaeaError TOKEN_NOT_SUPPORTED if token is not found
   */
  async getTokenCapacity(token: string | PublicKey): Promise<TokenCapacity> {
    const symbol = token instanceof PublicKey ? token.toBase58() : token;
    const capacity = await this.getCapacity();
    const found = capacity.tokens.find(
      t => t.symbol.toLowerCase() === symbol.toLowerCase() || t.mint === symbol
    );
    if (!found) {
      throw new VaeaError('TOKEN_NOT_SUPPORTED', `Token '${symbol}' is not supported`, {
        supported: SUPPORTED_TOKENS,
      });
    }
    return found;
  }

  // ═══════════════════════════════════════════════════════════
  //  GET /v1/quote
  // ═══════════════════════════════════════════════════════════

  /**
   * Get a real-time quote with exact fee breakdown for a flash loan.
   *
   * @param token - Token symbol ("mSOL") or mint address
   * @param amount - Amount in human-readable units (e.g. 1000 for 1000 mSOL)
   * @returns Detailed quote with fee breakdown, route info, and validity window
   */
  async getQuote(token: string | PublicKey, amount: number): Promise<QuoteResponse> {
    if (amount <= 0) {
      throw new VaeaError('INVALID_AMOUNT', 'Amount must be greater than 0', { amount });
    }
    const symbol = token instanceof PublicKey ? token.toBase58() : token;
    return this.apiGet<QuoteResponse>(
      `/v1/quote?token=${encodeURIComponent(symbol)}&amount=${amount}&source=${this.source}`
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  POST /v1/build
  // ═══════════════════════════════════════════════════════════

  /**
   * Build the prefix (begin_flash + borrow) and suffix (repay + end_flash) instructions.
   * Insert your own instructions between them to create a complete flash loan TX.
   */
  async build(request: BuildRequest): Promise<BuildResponse> {
    return this.apiPost<BuildResponse>('/v1/build', {
      ...request,
      source: request.source ?? this.source,
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  GET /v1/health
  // ═══════════════════════════════════════════════════════════

  /**
   * Check the health of all VAEA Flash components (scanner, Redis, protocols).
   */
  async getHealth(): Promise<HealthResponse> {
    return this.apiGet<HealthResponse>('/v1/health');
  }

  // ═══════════════════════════════════════════════════════════
  //  High-level: borrow()
  // ═══════════════════════════════════════════════════════════

  /**
   * Build a complete flash loan transaction with your instructions sandwiched
   * between begin_flash and end_flash.
   *
   * @returns Array of all instructions (prefix + user + suffix)
   */
  async borrow(params: BorrowParams): Promise<TransactionInstruction[]> {
    const symbol = params.token instanceof PublicKey ? params.token.toBase58() : params.token;

    // 1. Get quote to validate
    const quote = await this.getQuote(symbol, params.amount);

    // 2. Fee guard
    if (params.maxFeeBps !== undefined) {
      const actualBps = Math.round(quote.fee_breakdown.total_fee_pct * 100);
      if (actualBps > params.maxFeeBps) {
        throw new VaeaError('FEE_TOO_HIGH', `Fee ${actualBps} bps exceeds max ${params.maxFeeBps} bps`, {
          actualFeeBps: actualBps,
          maxFeeBps: params.maxFeeBps,
          quote,
        });
      }
    }

    // 3. Build prefix/suffix
    const buildResponse = await this.build({
      token: symbol,
      amount: params.amount,
      user_pubkey: this.wallet?.publicKey.toBase58() ?? '',
      source: this.source,
      slippage_bps: params.slippageBps ?? 50,
      max_fee_bps: params.maxFeeBps,
    });

    const prefix = buildResponse.prefix_instructions.map(parseApiInstruction);
    const suffix = buildResponse.suffix_instructions.map(parseApiInstruction);

    // 4. Let user add their instructions
    const userIxs = await params.onFunds([]);

    return [...prefix, ...userIxs, ...suffix];
  }

  // ═══════════════════════════════════════════════════════════
  //  High-level: execute()
  // ═══════════════════════════════════════════════════════════

  /**
   * Build, sign, and send a flash loan transaction in one call.
   * Requires `connection` and `wallet` to be set in config.
   *
   * @returns Transaction signature
   * @throws VaeaError if connection/wallet not configured
   *
   * @example
   * ```typescript
   * const sig = await flash.execute({
   *   token: 'mSOL',
   *   amount: 1000,
   *   onFunds: async (ixs) => {
   *     ixs.push(liquidationIx);
   *     return ixs;
   *   }
   * });
   * ```
   */
  async execute(params: BorrowParams, sendOptions?: SendOptions): Promise<string> {
    if (!this.connection) {
      throw new VaeaError('API_ERROR', 'Connection is required for execute(). Pass it in VaeaFlash config.');
    }
    if (!this.wallet) {
      throw new VaeaError('API_ERROR', 'Wallet (Keypair) is required for execute(). Pass it in VaeaFlash config.');
    }

    const allIxs = await this.borrow(params);
    const blockhash = await this.connection.getLatestBlockhash('confirmed');

    const messageV0 = new TransactionMessage({
      payerKey: this.wallet.publicKey,
      recentBlockhash: blockhash.blockhash,
      instructions: allIxs,
    }).compileToV0Message();

    const tx = new VersionedTransaction(messageV0);
    tx.sign([this.wallet]);

    const signature = await this.connection.sendTransaction(tx, {
      skipPreflight: false,
      ...sendOptions,
    });

    await this.connection.confirmTransaction(
      { signature, ...blockhash },
      'confirmed'
    );

    return signature;
  }

  // ═══════════════════════════════════════════════════════════
  //  HTTP helpers with proper error handling
  // ═══════════════════════════════════════════════════════════

  private async apiGet<T>(path: string): Promise<T> {
    try {
      const res = await fetch(`${this.apiUrl}${path}`);
      if (!res.ok) {
        const body = await res.text();
        try {
          const err = JSON.parse(body);
          throw new VaeaError(
            (err.error as any) ?? 'API_ERROR',
            err.message ?? `API returned ${res.status}`,
            err
          );
        } catch (e) {
          if (e instanceof VaeaError) throw e;
          throw new VaeaError('API_ERROR', `API returned ${res.status}: ${body}`);
        }
      }
      return res.json();
    } catch (e) {
      if (e instanceof VaeaError) throw e;
      throw new VaeaError('NETWORK_ERROR', `Failed to reach VAEA API: ${(e as Error).message}`);
    }
  }

  private async apiPost<T>(path: string, body: any): Promise<T> {
    try {
      const res = await fetch(`${this.apiUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        try {
          const err = JSON.parse(text);
          throw new VaeaError(
            (err.error as any) ?? 'API_ERROR',
            err.message ?? `API returned ${res.status}`,
            err
          );
        } catch (e) {
          if (e instanceof VaeaError) throw e;
          throw new VaeaError('API_ERROR', `API returned ${res.status}: ${text}`);
        }
      }
      return res.json();
    } catch (e) {
      if (e instanceof VaeaError) throw e;
      throw new VaeaError('NETWORK_ERROR', `Failed to reach VAEA API: ${(e as Error).message}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  Utility: parse API instruction into TransactionInstruction
// ═══════════════════════════════════════════════════════════

export function parseApiInstruction(ix: ApiInstructionData): TransactionInstruction {
  const keys: AccountMeta[] = ix.accounts.map(acc => ({
    pubkey: new PublicKey(acc.pubkey),
    isSigner: acc.is_signer,
    isWritable: acc.is_writable,
  }));

  return new TransactionInstruction({
    programId: new PublicKey(ix.program_id),
    keys,
    data: Buffer.from(ix.data, 'base64'),
  });
}
