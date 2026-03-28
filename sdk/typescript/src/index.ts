// Core client
export { VaeaFlash, parseApiInstruction } from './client';

// Types
export {
  VaeaFlashConfig,
  VaeaError,
  VaeaErrorCode,
  CapacityResponse,
  TokenCapacity,
  FeeInfo,
  QuoteResponse,
  FeeBreakdown,
  RouteStep,
  BuildRequest,
  BuildResponse,
  BorrowParams,
  HealthResponse,
  ApiInstructionData,
  ApiAccountMeta,
  VAEA_API_URL,
  VAEA_PROGRAM_ID,
  VAEA_LOOKUP_TABLE,
  SUPPORTED_TOKENS,
  SupportedToken,
  // Extended types
  SimulateParams,
  SimulateResult,
  MultiBorrowRequest,
  BorrowMultiParams,
  ExecuteOptions,
} from './types';

// Extended modules
export { WarmCache } from './warm-cache';
export { sendWithRetry, DEFAULT_RETRY_CONFIG } from './retry';
export type { RetryConfig, RetryReason } from './retry';
export { calculateProfitability } from './profitability';
export type { ProfitabilityParams, ProfitabilityResult } from './profitability';
export { calculateSlippageBps } from './slippage';
export type { SlippageMode } from './slippage';
// Turbo: local instruction builder (zero HTTP)
export { localBuild, TOKEN_REGISTRY, FEE_BPS_SDK, FEE_BPS_UI } from './local-builder';
export type { LocalBuildParams, LocalBuildResult } from './local-builder';
