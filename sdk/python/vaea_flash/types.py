"""VAEA Flash — Universal Flash Loan SDK for Solana (Python)"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


# ═══════════════════════════════════════════════════════════
#  Constants
# ═══════════════════════════════════════════════════════════

VAEA_API_URL = "https://api.vaea.fi"
VAEA_PROGRAM_ID = "HoYiwkNB7a3gmZXEkTqLkborNDc976vKEUAzBm8YpK5E"

SUPPORTED_TOKENS = [
    "SOL", "USDC", "USDT", "JitoSOL", "JupSOL", "JUP", "JLP", "cbBTC",
    "mSOL", "bSOL", "INF", "laineSOL", "wETH",
    "BONK", "WIF", "PYTH", "RAY", "HNT", "RNDR", "JITO", "KMNO",
]


# ═══════════════════════════════════════════════════════════
#  Error types
# ═══════════════════════════════════════════════════════════

class VaeaErrorCode(str, Enum):
    INSUFFICIENT_LIQUIDITY = "INSUFFICIENT_LIQUIDITY"
    TOKEN_NOT_SUPPORTED = "TOKEN_NOT_SUPPORTED"
    SLIPPAGE_EXCEEDED = "SLIPPAGE_EXCEEDED"
    FEE_TOO_HIGH = "FEE_TOO_HIGH"
    REPAY_FAILED = "REPAY_FAILED"
    TX_EXPIRED = "TX_EXPIRED"
    SOURCE_UNAVAILABLE = "SOURCE_UNAVAILABLE"
    PROGRAM_PAUSED = "PROGRAM_PAUSED"
    INVALID_AMOUNT = "INVALID_AMOUNT"
    INSUFFICIENT_SOL_FOR_FEE = "INSUFFICIENT_SOL_FOR_FEE"
    API_ERROR = "API_ERROR"
    NETWORK_ERROR = "NETWORK_ERROR"


class VaeaError(Exception):
    """Typed error from the VAEA Flash SDK."""
    def __init__(self, code: VaeaErrorCode, message: str, meta: Optional[Dict[str, Any]] = None):
        super().__init__(f"[{code.value}] {message}")
        self.code = code
        self.message = message
        self.meta = meta or {}


# ═══════════════════════════════════════════════════════════
#  Config
# ═══════════════════════════════════════════════════════════

class VaeaConfig(BaseModel):
    api_url: str = VAEA_API_URL
    source: str = "sdk"  # "sdk" or "ui"


# ═══════════════════════════════════════════════════════════
#  API types
# ═══════════════════════════════════════════════════════════

class ApiAccountMeta(BaseModel):
    pubkey: str
    is_signer: bool
    is_writable: bool


class ApiInstructionData(BaseModel):
    program_id: str
    data: str  # base64
    accounts: List[ApiAccountMeta]


class FeeInfo(BaseModel):
    bps: int
    pct: float
    swap_bps: Optional[int] = None
    total_pct: float


class RouteStep(BaseModel):
    action: str
    protocol: str
    token: str
    amount: float
    expected_output: Optional[float] = None
    price_impact: Optional[float] = None


class FeeBreakdown(BaseModel):
    source_fee: float
    swap_in_fee: float
    swap_out_fee: float
    vaea_fee: float
    total_fee_sol: float
    total_fee_usd: float
    total_fee_pct: float


class TokenCapacity(BaseModel):
    symbol: str
    mint: str
    name: str
    decimals: int
    route_type: str
    source_protocol: str
    swap_protocol: Optional[str] = None
    max_amount: float
    max_amount_usd: float
    fee_sdk: FeeInfo
    fee_ui: FeeInfo
    status: str
    updated_at: int


class CapacityResponse(BaseModel):
    updated_at: int
    tokens: List[TokenCapacity]


class RouteQuote(BaseModel):
    type: str
    steps: List[RouteStep]


class QuoteResponse(BaseModel):
    token: str
    mint: str
    amount_requested: float
    source: str
    route: RouteQuote
    fee_breakdown: FeeBreakdown
    price_impact: float
    valid_until: int
    valid_for_slots: int


class BuildRequest(BaseModel):
    token: str
    amount: float
    user_pubkey: str
    source: Optional[str] = None
    slippage_bps: Optional[int] = None
    max_fee_bps: Optional[int] = None


class BuildResponse(BaseModel):
    prefix_instructions: List[ApiInstructionData]
    suffix_instructions: List[ApiInstructionData]
    lookup_tables: List[str]
    estimated_fee_lamports: int
    valid_for_slots: int


class HealthResponse(BaseModel):
    status: str
    timestamp: int
    components: Dict[str, Any]
    sources: Dict[str, Any]
