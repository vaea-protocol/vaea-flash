import { PublicKey, TransactionInstruction } from '@solana/web3.js';

// ═══════════════════════════════════════════════════════════
//  Config
// ═══════════════════════════════════════════════════════════

export interface VaeaFlashConfig {
  apiUrl?: string;
  /** "sdk" or "ui" — affects fee calculation */
  source?: 'sdk' | 'ui';
}

// ═══════════════════════════════════════════════════════════
//  Error types
// ═══════════════════════════════════════════════════════════

export type VaeaErrorCode =
  | 'INSUFFICIENT_LIQUIDITY'
  | 'TOKEN_NOT_SUPPORTED'
  | 'SLIPPAGE_EXCEEDED'
  | 'FEE_TOO_HIGH'
  | 'REPAY_FAILED'
  | 'TX_EXPIRED'
  | 'SOURCE_UNAVAILABLE'
  | 'PROGRAM_PAUSED'
  | 'INVALID_AMOUNT'
  | 'INSUFFICIENT_SOL_FOR_FEE'
  | 'API_ERROR'
  | 'NETWORK_ERROR';

export class VaeaError extends Error {
  constructor(
    public code: VaeaErrorCode,
    message: string,
    public meta?: Record<string, any>
  ) {
    super(message);
    this.name = 'VaeaError';
  }
}

// ═══════════════════════════════════════════════════════════
//  Capacity types
// ═══════════════════════════════════════════════════════════

export interface FeeInfo {
  bps: number;
  pct: number;
  swap_bps?: number;
  total_pct: number;
}

export interface TokenCapacity {
  symbol: string;
  mint: string;
  name: string;
  decimals: number;
  route_type: 'direct' | 'synthetic';
  source_protocol: string;
  swap_protocol?: string;
  max_amount: number;
  max_amount_usd: number;
  fee_sdk: FeeInfo;
  fee_ui: FeeInfo;
  status: 'available' | 'degraded' | 'offline';
  updated_at: number;
}

export interface CapacityResponse {
  updated_at: number;
  tokens: TokenCapacity[];
}

// ═══════════════════════════════════════════════════════════
//  Quote types
// ═══════════════════════════════════════════════════════════

export interface RouteStep {
  action: string;
  protocol: string;
  token: string;
  amount: number;
  expected_output?: number;
  price_impact?: number;
}

export interface FeeBreakdown {
  source_fee: number;
  swap_in_fee: number;
  swap_out_fee: number;
  vaea_fee: number;
  total_fee_sol: number;
  total_fee_usd: number;
  total_fee_pct: number;
}

export interface QuoteResponse {
  token: string;
  mint: string;
  amount_requested: number;
  source: string;
  route: {
    type: 'direct' | 'synthetic';
    steps: RouteStep[];
  };
  fee_breakdown: FeeBreakdown;
  price_impact: number;
  valid_until: number;
  valid_for_slots: number;
}

// ═══════════════════════════════════════════════════════════
//  Build types
// ═══════════════════════════════════════════════════════════

export interface BuildRequest {
  token: string;
  amount: number;
  user_pubkey: string;
  source?: 'sdk' | 'ui';
  slippage_bps?: number;
  max_fee_bps?: number;
}

export interface ApiAccountMeta {
  pubkey: string;
  is_signer: boolean;
  is_writable: boolean;
}

export interface ApiInstructionData {
  program_id: string;
  data: string;  // base64 encoded
  accounts: ApiAccountMeta[];
}

export interface BuildResponse {
  prefix_instructions: ApiInstructionData[];
  suffix_instructions: ApiInstructionData[];
  lookup_tables: string[];
  estimated_fee_lamports: number;
  valid_for_slots: number;
  quote?: QuoteResponse;
}

// ═══════════════════════════════════════════════════════════
//  Health types
// ═══════════════════════════════════════════════════════════

export interface HealthResponse {
  status: string;
  timestamp: number;
  components: {
    redis: { status: string };
    scanner: { status: string; cache_age_ms?: number };
    program: { status: string; program_id?: string };
  };
  sources: Record<string, { status: string; available_sol?: number; reason?: string }>;
}

// ═══════════════════════════════════════════════════════════
//  Borrow params (high-level execute API)
// ═══════════════════════════════════════════════════════════

export interface BorrowParams {
  /** Token symbol ("mSOL") or mint address */
  token: string | PublicKey;
  /** Amount in human-readable units (not lamports) */
  amount: number;
  /** Your instructions to insert between borrow and repay */
  onFunds: (instructions: TransactionInstruction[]) => Promise<TransactionInstruction[]> | TransactionInstruction[];
  /** Max slippage in bps (default: 50 = 0.5%) */
  slippageBps?: number;
  /** Revert if total fee exceeds this (in bps) */
  maxFeeBps?: number;
}

// ═══════════════════════════════════════════════════════════
//  Constants
// ═══════════════════════════════════════════════════════════

export const VAEA_API_URL = 'https://api.vaea.fi';
export const VAEA_PROGRAM_ID = new PublicKey('HoYiwkNB7a3gmZXEkTqLkborNDc976vKEUAzBm8YpK5E');

/**
 * Pre-loaded Address Lookup Table with VAEA fixed accounts:
 *   [0] Config PDA:          27qrSQk6xUGtdMQmMobsQWCSts67jtXqA2gZzPK1wubQ
 *   [1] Fee Vault PDA:       BQNpRH1kahoFqxu5tiZaQYuKb7p41o3cmyXrFWsDmYPn
 *   [2] Sysvar Instructions: Sysvar1nstructions1111111111111111111111111
 *   [3] System Program:      11111111111111111111111111111111
 *
 * Using this ALT saves ~124 bytes per transaction (4 accounts × 31 bytes each).
 */
export const VAEA_LOOKUP_TABLE = new PublicKey('DjncKSi9KqtnFx6hFYa7ARmwJ7B4Y7UH3XpR2XEuXNJr');

export const SUPPORTED_TOKENS = [
  // Direct routes
  'SOL', 'USDC', 'USDT', 'JitoSOL', 'JupSOL', 'JUP', 'JLP', 'cbBTC',
  // Synthetic routes — LSTs
  'mSOL', 'bSOL', 'INF', 'laineSOL',
  // Synthetic routes — Majors
  'TRUMP', 'PENGU', 'VIRTUAL',
  // Synthetic routes — Mid-caps
  'BONK', 'WIF', 'RAY', 'HNT', 'RNDR', 'JITO', 'KMNO',
  // Synthetic routes — Stablecoins
  'PYUSD', 'USDS', 'USD1', 'USDG', 'EURC',
] as const;


export type SupportedToken = typeof SUPPORTED_TOKENS[number];

// ═══════════════════════════════════════════════════════════
//  Simulate types
// ═══════════════════════════════════════════════════════════

export interface SimulateParams {
  /** Token symbol or mint */
  token: string | PublicKey;
  /** Borrow amount in human units */
  amount: number;
  /** Your instructions to sandwich between borrow and repay */
  instructions: TransactionInstruction[];
  /** Max slippage in bps */
  slippageBps?: number;
  /** Max fee guard in bps */
  maxFeeBps?: number;
}

export interface SimulateResult {
  /** Whether the TX would succeed */
  success: boolean;
  /** Error details if simulation failed */
  error?: string;
  /** Exact compute units consumed */
  computeUnits: number;
  /** Full program logs */
  logs: string[];
}

// ═══════════════════════════════════════════════════════════
//  Multi-Borrow types
// ═══════════════════════════════════════════════════════════

export interface MultiBorrowRequest {
  /** Token symbol or mint */
  token: string | PublicKey;
  /** Borrow amount in human units */
  amount: number;
}

export interface BorrowMultiParams {
  /** Array of loans to execute atomically */
  loans: MultiBorrowRequest[];
  /** Your instructions to insert between all borrows and all repays */
  onFunds: (ixs: TransactionInstruction[]) => Promise<TransactionInstruction[]> | TransactionInstruction[];
  /** Max slippage in bps */
  slippageBps?: number;
  /** Max fee guard in bps */
  maxFeeBps?: number;
}

// ═══════════════════════════════════════════════════════════
//  Execute options
// ═══════════════════════════════════════════════════════════

export interface ExecuteOptions {
  /** Retry configuration */
  retry?: import('./retry').RetryConfig;
  /** Priority fee in micro-lamports per CU (default: auto) */
  priorityMicroLamports?: number;
}

