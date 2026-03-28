import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  AccountMeta,
  SendOptions,
  AddressLookupTableAccount,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import {
  VaeaFlashConfig,
  VaeaError,
  CapacityResponse,
  QuoteResponse,
  BuildRequest,
  BuildResponse,
  BorrowParams,
  BorrowMultiParams,
  SimulateParams,
  SimulateResult,
  ExecuteOptions,
  HealthResponse,
  ApiInstructionData,
  TokenCapacity,
  VAEA_API_URL,
  VAEA_LOOKUP_TABLE,
  SUPPORTED_TOKENS,
} from './types';
import { WarmCache } from './warm-cache';
import { sendWithRetry, DEFAULT_RETRY_CONFIG } from './retry';
import { calculateProfitability, ProfitabilityParams, ProfitabilityResult } from './profitability';

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
  private warmCache?: WarmCache;

  constructor(config: VaeaFlashConfig & {
    connection?: Connection;
    wallet?: Keypair;
    /** Enable background capacity pre-warming (default: false) */
    preWarm?: boolean;
    /** Refresh interval in ms for pre-warming (default: 2000) */
    refreshInterval?: number;
  } = {}) {
    this.apiUrl = config.apiUrl ?? VAEA_API_URL;
    this.source = config.source ?? 'sdk';
    this.connection = config.connection;
    this.wallet = config.wallet;

    if (config.preWarm) {
      this.warmCache = new WarmCache(this.apiUrl, config.refreshInterval ?? 2000);
      this.warmCache.start().catch(() => {}); // non-blocking start
    }
  }

  /** Stop background pre-warming (if enabled). */
  destroy(): void {
    this.warmCache?.stop();
  }

  /** Validate wallet is set and return public key as base58. */
  private requireWalletPublicKey(method: string): string {
    if (!this.wallet) {
      throw new VaeaError('API_ERROR', `Wallet is required for ${method}(). Pass it in VaeaFlash config.`);
    }
    return this.wallet.publicKey.toBase58();
  }

  // ═══════════════════════════════════════════════════════════
  //  GET /v1/capacity
  // ═══════════════════════════════════════════════════════════

  /**
   * Get real-time flash loan capacity for all supported tokens.
   * Data refreshes every 2 seconds from on-chain liquidity scanning.
   * If pre-warming is enabled, returns cached data instantly.
   */
  async getCapacity(): Promise<CapacityResponse> {
    const cached = this.warmCache?.getCapacity();
    if (cached) return cached;
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

    // 1. Fee guard — ONLY fetch quote if user set maxFeeBps (saves ~100ms for bots)
    if (params.maxFeeBps !== undefined) {
      const quote = await this.getQuote(symbol, params.amount);
      const actualBps = Math.round(quote.fee_breakdown.total_fee_pct * 100);
      if (actualBps > params.maxFeeBps) {
        throw new VaeaError('FEE_TOO_HIGH', `Fee ${actualBps} bps exceeds max ${params.maxFeeBps} bps`, {
          actualFeeBps: actualBps,
          maxFeeBps: params.maxFeeBps,
          quote,
        });
      }
    }

    // 2. Build prefix/suffix — single HTTP call, backend is pure CPU (0 RPC, 0 DB)
    const buildResponse = await this.build({
      token: symbol,
      amount: params.amount,
      user_pubkey: this.requireWalletPublicKey('borrow'),
      source: this.source,
      slippage_bps: params.slippageBps ?? 50,
      max_fee_bps: params.maxFeeBps,
    });

    const prefix = buildResponse.prefix_instructions.map(parseApiInstruction);
    const suffix = buildResponse.suffix_instructions.map(parseApiInstruction);

    // 3. Let user add their instructions
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
  async execute(params: BorrowParams, options?: ExecuteOptions): Promise<string> {
    if (!this.connection) {
      throw new VaeaError('API_ERROR', 'Connection is required for execute(). Pass it in VaeaFlash config.');
    }
    if (!this.wallet) {
      throw new VaeaError('API_ERROR', 'Wallet (Keypair) is required for execute(). Pass it in VaeaFlash config.');
    }

    // Parallelize: borrow + ALT fetch happen simultaneously
    const [allIxs, lookupTables] = await Promise.all([
      this.borrow(params),
      this.fetchLookupTable(),
    ]);
    const retryConfig = options?.retry ?? DEFAULT_RETRY_CONFIG;

    return sendWithRetry(
      this.connection,
      this.wallet,
      allIxs,
      lookupTables,
      retryConfig,
      options?.priorityMicroLamports,
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  simulate() — Dry Run
  // ═══════════════════════════════════════════════════════════

  /**
   * Simulate a flash loan transaction without sending it.
   * Returns success/failure, CU consumption, and program logs.
   *
   * No wallet signing needed — uses sigVerify:false.
   */
  async simulate(params: SimulateParams): Promise<SimulateResult> {
    if (!this.connection) {
      throw new VaeaError('API_ERROR', 'Connection is required for simulate()');
    }
    if (!this.wallet) {
      throw new VaeaError('API_ERROR', 'Wallet is required for simulate() (used as payer key, NOT for signing)');
    }

    // Build instruction set via borrow()
    const allIxs = await this.borrow({
      token: params.token,
      amount: params.amount,
      onFunds: async () => params.instructions,
      slippageBps: params.slippageBps,
      maxFeeBps: params.maxFeeBps,
    });

    // Add max CU budget for simulation headroom
    allIxs.unshift(ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }));

    const lookupTables = await this.fetchLookupTable();

    // Use dummy blockhash — RPC will replace it
    const messageV0 = new TransactionMessage({
      payerKey: this.wallet.publicKey,
      recentBlockhash: PublicKey.default.toBase58(),
      instructions: allIxs,
    }).compileToV0Message(lookupTables);

    const tx = new VersionedTransaction(messageV0);
    // DO NOT sign — sigVerify:false allows unsigned sim

    const sim = await this.connection.simulateTransaction(tx, {
      sigVerify: false,
      replaceRecentBlockhash: true,
    });

    return {
      success: sim.value.err === null,
      error: sim.value.err ? JSON.stringify(sim.value.err) : undefined,
      computeUnits: sim.value.unitsConsumed ?? 0,
      logs: sim.value.logs ?? [],
    };
  }

  // ═══════════════════════════════════════════════════════════
  //  borrowMulti() — Multi-Token Atomic Flash Loans
  // ═══════════════════════════════════════════════════════════

  /**
   * Build a multi-token atomic flash loan with nested sandwich pattern:
   *   prefix_A → prefix_B → [user IXs] → suffix_B → suffix_A
   *
   * Requires the on-chain program to use `[b"flash", payer, token_mint]` PDA seeds.
   */
  async borrowMulti(params: BorrowMultiParams): Promise<TransactionInstruction[]> {
    if (!this.wallet) {
      throw new VaeaError('API_ERROR', 'Wallet is required for borrowMulti()');
    }

    // Build prefix/suffix for each loan in parallel
    const builds = await Promise.all(
      params.loans.map(loan => {
        const symbol = loan.token instanceof PublicKey ? loan.token.toBase58() : loan.token;
        return this.build({
          token: symbol,
          amount: loan.amount,
          user_pubkey: this.wallet!.publicKey.toBase58(),
          source: this.source,
          slippage_bps: params.slippageBps ?? 50,
          max_fee_bps: params.maxFeeBps,
        });
      })
    );

    // Nest: prefix_1 + prefix_2 + ... + [user IXs] + ... + suffix_2 + suffix_1
    const allPrefixes = builds.map(b => b.prefix_instructions.map(parseApiInstruction));
    const allSuffixes = builds.map(b => b.suffix_instructions.map(parseApiInstruction));

    const userIxs = await params.onFunds([]);

    return [
      ...allPrefixes.flat(),
      ...userIxs,
      ...allSuffixes.reverse().flat(),
    ];
  }

  // ═══════════════════════════════════════════════════════════
  //  TURBO — borrowLocal() / executeLocal()
  //  Zero HTTP, ~0.1ms instruction build, ~100ms total TX
  // ═══════════════════════════════════════════════════════════

  /**
   * Build flash loan instructions 100% locally — NO API call.
   *
   * ~0.1ms vs ~80ms for borrow(). Use this for latency-critical bots.
   * The instructions are identical to what /v1/build returns.
   *
   * @example
   * ```typescript
   * const ixs = await flash.borrowLocal({
   *   token: 'SOL',
   *   amount: 1000,
   *   onFunds: async () => [myArbIx],
   * });
   * ```
   */
  async borrowLocal(params: BorrowParams): Promise<TransactionInstruction[]> {
    const { localBuild } = await import('./local-builder');

    const result = localBuild({
      payer: this.wallet?.publicKey ?? PublicKey.default,
      token: params.token,
      amount: params.amount,
      source: this.source,
    });

    const userIxs = await params.onFunds([]);
    return [result.beginFlash, ...userIxs, result.endFlash];
  }

  /**
   * Build, sign, and send a flash loan in ~100ms — NO API call.
   *
   * Uses local instruction building + direct RPC.
   * Critical path: localBuild(<1ms) → getBlockhash(~50ms) → send(~50ms)
   *
   * @example
   * ```typescript
   * // ~100ms total
   * const sig = await flash.executeLocal({
   *   token: 'SOL',
   *   amount: 1000,
   *   onFunds: async () => [myArbIx],
   * });
   * ```
   */
  async executeLocal(params: BorrowParams, options?: ExecuteOptions): Promise<string> {
    if (!this.connection) {
      throw new VaeaError('API_ERROR', 'Connection is required for executeLocal().');
    }
    if (!this.wallet) {
      throw new VaeaError('API_ERROR', 'Wallet is required for executeLocal().');
    }

    // Parallelize: local build + ALT fetch (ALT cached after 1st call)
    const [allIxs, lookupTables] = await Promise.all([
      this.borrowLocal(params),
      this.fetchLookupTable(),
    ]);
    const retryConfig = options?.retry ?? DEFAULT_RETRY_CONFIG;

    return sendWithRetry(
      this.connection,
      this.wallet,
      allIxs,
      lookupTables,
      retryConfig,
      options?.priorityMicroLamports,
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  isProfitable() — Profitability Check
  // ═══════════════════════════════════════════════════════════

  /**
   * Check if a flash loan strategy is profitable after all fees.
   * Uses our own getQuote() API — zero external dependencies.
   */
  async isProfitable(params: ProfitabilityParams): Promise<ProfitabilityResult> {
    return calculateProfitability(
      (token, amount) => this.getQuote(token, amount),
      params,
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  ALT helper — fetch and cache our lookup table
  // ═══════════════════════════════════════════════════════════

  private lookupTableCache?: AddressLookupTableAccount;

  /**
   * Fetch the VAEA Address Lookup Table.
   * Cached after first fetch. Saves ~124 bytes per transaction.
   */
  async fetchLookupTable(): Promise<AddressLookupTableAccount[]> {
    if (!this.connection) return [];
    if (this.lookupTableCache) return [this.lookupTableCache];

    try {
      const result = await this.connection.getAddressLookupTable(VAEA_LOOKUP_TABLE);
      if (result.value) {
        this.lookupTableCache = result.value;
        return [result.value];
      }
    } catch {
      // Graceful fallback: if ALT fetch fails, TX still works without it
    }
    return [];
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
