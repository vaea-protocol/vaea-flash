"""VAEA Flash — Universal Flash Loan SDK for Solana"""

from .types import (
    VaeaConfig,
    VaeaError,
    VaeaErrorCode,
    CapacityResponse,
    TokenCapacity,
    FeeInfo,
    QuoteResponse,
    FeeBreakdown,
    RouteStep,
    RouteQuote,
    BuildRequest,
    BuildResponse,
    HealthResponse,
    ApiInstructionData,
    ApiAccountMeta,
    VAEA_API_URL,
    VAEA_PROGRAM_ID,
    SUPPORTED_TOKENS,
)

from .client import VaeaFlash
from .slippage import calculate_slippage_bps, SlippageMode
from .profitability import (
    calculate_profitability,
    ProfitabilityParams,
    ProfitabilityResult,
    ProfitabilityBreakdown,
)

__all__ = [
    "VaeaFlash",
    "VaeaConfig",
    "VaeaError",
    "VaeaErrorCode",
    "CapacityResponse",
    "TokenCapacity",
    "FeeInfo",
    "QuoteResponse",
    "FeeBreakdown",
    "RouteStep",
    "RouteQuote",
    "BuildRequest",
    "BuildResponse",
    "HealthResponse",
    "ApiInstructionData",
    "ApiAccountMeta",
    "VAEA_API_URL",
    "VAEA_PROGRAM_ID",
    "SUPPORTED_TOKENS",
    # Extended
    "calculate_slippage_bps",
    "SlippageMode",
    "calculate_profitability",
    "ProfitabilityParams",
    "ProfitabilityResult",
    "ProfitabilityBreakdown",
]
