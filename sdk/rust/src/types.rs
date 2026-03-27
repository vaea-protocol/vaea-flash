use serde::{Deserialize, Serialize};
use std::fmt;

// ═══════════════════════════════════════════════════════════
//  Config
// ═══════════════════════════════════════════════════════════

#[derive(Debug, Clone)]
pub struct VaeaConfig {
    pub api_url: String,
    pub source: Source,
}

impl Default for VaeaConfig {
    fn default() -> Self {
        Self {
            api_url: "https://api.vaea.fi".to_string(),
            source: Source::Sdk,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Source {
    Sdk,
    Ui,
}

impl fmt::Display for Source {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Source::Sdk => write!(f, "sdk"),
            Source::Ui => write!(f, "ui"),
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  Error types
// ═══════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VaeaErrorCode {
    InsufficientLiquidity,
    TokenNotSupported,
    SlippageExceeded,
    FeeTooHigh,
    RepayFailed,
    TxExpired,
    SourceUnavailable,
    ProgramPaused,
    InvalidAmount,
    InsufficientSolForFee,
    ApiError,
    NetworkError,
}

impl fmt::Display for VaeaErrorCode {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            VaeaErrorCode::InsufficientLiquidity => write!(f, "INSUFFICIENT_LIQUIDITY"),
            VaeaErrorCode::TokenNotSupported => write!(f, "TOKEN_NOT_SUPPORTED"),
            VaeaErrorCode::SlippageExceeded => write!(f, "SLIPPAGE_EXCEEDED"),
            VaeaErrorCode::FeeTooHigh => write!(f, "FEE_TOO_HIGH"),
            VaeaErrorCode::RepayFailed => write!(f, "REPAY_FAILED"),
            VaeaErrorCode::TxExpired => write!(f, "TX_EXPIRED"),
            VaeaErrorCode::SourceUnavailable => write!(f, "SOURCE_UNAVAILABLE"),
            VaeaErrorCode::ProgramPaused => write!(f, "PROGRAM_PAUSED"),
            VaeaErrorCode::InvalidAmount => write!(f, "INVALID_AMOUNT"),
            VaeaErrorCode::InsufficientSolForFee => write!(f, "INSUFFICIENT_SOL_FOR_FEE"),
            VaeaErrorCode::ApiError => write!(f, "API_ERROR"),
            VaeaErrorCode::NetworkError => write!(f, "NETWORK_ERROR"),
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  Capacity types
// ═══════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapacityResponse {
    pub updated_at: u64,
    pub tokens: Vec<TokenCapacity>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenCapacity {
    pub symbol: String,
    pub mint: String,
    pub name: String,
    pub decimals: u8,
    pub route_type: String,
    pub source_protocol: String,
    pub swap_protocol: Option<String>,
    pub max_amount: f64,
    pub max_amount_usd: f64,
    pub fee_sdk: FeeInfo,
    pub fee_ui: FeeInfo,
    pub status: String,
    pub updated_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeeInfo {
    pub bps: u16,
    pub pct: f64,
    pub swap_bps: Option<u16>,
    pub total_pct: f64,
}

// ═══════════════════════════════════════════════════════════
//  Quote types
// ═══════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuoteResponse {
    pub token: String,
    pub mint: String,
    pub amount_requested: f64,
    pub source: String,
    pub route: RouteQuote,
    pub fee_breakdown: FeeBreakdown,
    pub price_impact: f64,
    pub valid_until: u64,
    pub valid_for_slots: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouteQuote {
    #[serde(rename = "type")]
    pub route_type: String,
    pub steps: Vec<RouteStep>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouteStep {
    pub action: String,
    pub protocol: String,
    pub token: String,
    pub amount: f64,
    pub expected_output: Option<f64>,
    pub price_impact: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeeBreakdown {
    pub source_fee: f64,
    pub swap_in_fee: f64,
    pub swap_out_fee: f64,
    pub vaea_fee: f64,
    pub total_fee_sol: f64,
    pub total_fee_usd: f64,
    pub total_fee_pct: f64,
}

// ═══════════════════════════════════════════════════════════
//  Build types
// ═══════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildRequest {
    pub token: String,
    pub amount: f64,
    pub user_pubkey: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slippage_bps: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_fee_bps: Option<u16>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiInstructionData {
    pub program_id: String,
    pub data: String,
    pub accounts: Vec<ApiAccountMeta>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiAccountMeta {
    pub pubkey: String,
    pub is_signer: bool,
    pub is_writable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildResponse {
    pub prefix_instructions: Vec<ApiInstructionData>,
    pub suffix_instructions: Vec<ApiInstructionData>,
    pub lookup_tables: Vec<String>,
    pub estimated_fee_lamports: u64,
    pub valid_for_slots: u64,
}

// ═══════════════════════════════════════════════════════════
//  Health types
// ═══════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub timestamp: u64,
    pub components: serde_json::Value,
    pub sources: serde_json::Value,
}

// ═══════════════════════════════════════════════════════════
//  Borrow params
// ═══════════════════════════════════════════════════════════

pub struct BorrowParams {
    pub token: String,
    pub amount: f64,
    pub instructions: Vec<solana_sdk::instruction::Instruction>,
    pub slippage_bps: Option<u16>,
    pub max_fee_bps: Option<u16>,
}

// ═══════════════════════════════════════════════════════════
//  Constants
// ═══════════════════════════════════════════════════════════

pub const VAEA_API_URL: &str = "https://api.vaea.fi";
pub const VAEA_PROGRAM_ID: &str = "HoYiwkNB7a3gmZXEkTqLkborNDc976vKEUAzBm8YpK5E";

pub const SUPPORTED_TOKENS: &[&str] = &[
    "SOL", "USDC", "USDT", "JitoSOL", "JupSOL", "JUP", "JLP", "cbBTC",
    "mSOL", "bSOL", "INF", "laineSOL", "wETH",
    "BONK", "WIF", "PYTH", "RAY", "HNT", "RNDR", "JITO", "KMNO",
];
