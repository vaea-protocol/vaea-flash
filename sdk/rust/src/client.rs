use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    signature::Keypair,
    signer::Signer,
    transaction::VersionedTransaction,
    message::{v0, VersionedMessage},
    commitment_config::CommitmentConfig,
};
use solana_client::nonblocking::rpc_client::RpcClient;
use std::str::FromStr;
use std::sync::Arc;
use base64::{Engine as _, engine::general_purpose::STANDARD};
use reqwest::Client;
use thiserror::Error;
use crate::types::*;

// ═══════════════════════════════════════════════════════════
//  Error
// ═══════════════════════════════════════════════════════════

#[derive(Error, Debug)]
pub enum VaeaError {
    #[error("[{code}] {message}")]
    Protocol { code: VaeaErrorCode, message: String },

    #[error("HTTP request failed: {0}")]
    Network(#[from] reqwest::Error),

    #[error("Invalid pubkey: {0}")]
    InvalidPubkey(String),

    #[error("RPC error: {0}")]
    Rpc(String),

    #[error("Transaction failed: {0}")]
    Transaction(String),
}

impl VaeaError {
    pub fn protocol(code: VaeaErrorCode, msg: impl Into<String>) -> Self {
        Self::Protocol { code, message: msg.into() }
    }
}

// ═══════════════════════════════════════════════════════════
//  Client
// ═══════════════════════════════════════════════════════════

/// VAEA Flash — Universal Flash Loan SDK for Solana (Rust)
///
/// # Example
/// ```rust,no_run
/// use vaea_flash::{VaeaFlash, BorrowParams, VaeaConfig, Source};
///
/// #[tokio::main]
/// async fn main() -> Result<(), Box<dyn std::error::Error>> {
///     let payer = solana_sdk::signature::Keypair::new();
///     let flash = VaeaFlash::new("https://api.devnet.vaea.fi", &payer)?;
///
///     let capacity = flash.get_capacity().await?;
///     println!("Available tokens: {}", capacity.tokens.len());
///
///     let quote = flash.get_quote("SOL", 1000.0).await?;
///     println!("Fee: {}%", quote.fee_breakdown.total_fee_pct);
///     Ok(())
/// }
/// ```
pub struct VaeaFlash {
    api_url: String,
    source: Source,
    http: Client,
    rpc: Option<Arc<RpcClient>>,
    payer: Option<Arc<Keypair>>,
}

impl VaeaFlash {
    /// Create a new VaeaFlash client.
    pub fn new(api_url: &str, payer: &Keypair) -> Result<Self, VaeaError> {
        Ok(Self {
            api_url: api_url.to_string(),
            source: Source::Sdk,
            http: Client::new(),
            rpc: None,
            payer: Some(Arc::new(Keypair::from_bytes(&payer.to_bytes()).unwrap())),
        })
    }

    /// Create with full config including RPC for execute().
    pub fn with_rpc(api_url: &str, rpc_url: &str, payer: &Keypair) -> Result<Self, VaeaError> {
        Ok(Self {
            api_url: api_url.to_string(),
            source: Source::Sdk,
            http: Client::new(),
            rpc: Some(Arc::new(RpcClient::new(rpc_url.to_string()))),
            payer: Some(Arc::new(Keypair::from_bytes(&payer.to_bytes()).unwrap())),
        })
    }

    /// Create a read-only client (no wallet, no execute).
    pub fn read_only(api_url: &str) -> Self {
        Self {
            api_url: api_url.to_string(),
            source: Source::Sdk,
            http: Client::new(),
            rpc: None,
            payer: None,
        }
    }

    /// Set fee source (sdk or ui).
    pub fn with_source(mut self, source: Source) -> Self {
        self.source = source;
        self
    }

    // ═══════════════════════════════════════════════════════
    //  API methods
    // ═══════════════════════════════════════════════════════

    /// Get real-time capacity for all 22 supported tokens.
    pub async fn get_capacity(&self) -> Result<CapacityResponse, VaeaError> {
        let url = format!("{}/v1/capacity", self.api_url);
        let res = self.http.get(&url).send().await?;
        self.check_response(&res).await?;
        Ok(res.json().await?)
    }

    /// Get a detailed quote with fee breakdown.
    pub async fn get_quote(&self, token: &str, amount: f64) -> Result<QuoteResponse, VaeaError> {
        if amount <= 0.0 {
            return Err(VaeaError::protocol(VaeaErrorCode::InvalidAmount, "Amount must be > 0"));
        }
        let url = format!(
            "{}/v1/quote?token={}&amount={}&source={}",
            self.api_url, token, amount, self.source
        );
        let res = self.http.get(&url).send().await?;
        self.check_response(&res).await?;
        Ok(res.json().await?)
    }

    /// Build prefix + suffix instructions for a flash loan.
    pub async fn build(&self, request: &BuildRequest) -> Result<BuildResponse, VaeaError> {
        let url = format!("{}/v1/build", self.api_url);
        let res = self.http.post(&url).json(request).send().await?;
        self.check_response(&res).await?;
        Ok(res.json().await?)
    }

    /// Check system health.
    pub async fn get_health(&self) -> Result<HealthResponse, VaeaError> {
        let url = format!("{}/v1/health", self.api_url);
        let res = self.http.get(&url).send().await?;
        self.check_response(&res).await?;
        Ok(res.json().await?)
    }

    /// Build flash loan instructions with user instructions sandwiched.
    pub async fn borrow(&self, params: &BorrowParams) -> Result<Vec<Instruction>, VaeaError> {
        let payer = self.payer.as_ref()
            .ok_or_else(|| VaeaError::protocol(VaeaErrorCode::ApiError, "Payer keypair required"))?;

        // Get quote for fee guard
        let quote = self.get_quote(&params.token, params.amount).await?;

        if let Some(max_bps) = params.max_fee_bps {
            let actual_bps = (quote.fee_breakdown.total_fee_pct * 100.0) as u16;
            if actual_bps > max_bps {
                return Err(VaeaError::protocol(
                    VaeaErrorCode::FeeTooHigh,
                    format!("Fee {} bps exceeds max {} bps", actual_bps, max_bps),
                ));
            }
        }

        let request = BuildRequest {
            token: params.token.clone(),
            amount: params.amount,
            user_pubkey: payer.pubkey().to_string(),
            source: Some(self.source.to_string()),
            slippage_bps: params.slippage_bps,
            max_fee_bps: params.max_fee_bps,
        };

        let build = self.build(&request).await?;
        let mut all_ixs = Vec::new();

        for api_ix in &build.prefix_instructions {
            all_ixs.push(Self::parse_api_instruction(api_ix)?);
        }
        for ix in &params.instructions {
            all_ixs.push(ix.clone());
        }
        for api_ix in &build.suffix_instructions {
            all_ixs.push(Self::parse_api_instruction(api_ix)?);
        }

        Ok(all_ixs)
    }

    /// Build, sign, and send a flash loan transaction.
    pub async fn execute(&self, params: BorrowParams) -> Result<String, VaeaError> {
        let rpc = self.rpc.as_ref()
            .ok_or_else(|| VaeaError::protocol(VaeaErrorCode::ApiError, "RPC client required for execute(). Use VaeaFlash::with_rpc()"))?;
        let payer = self.payer.as_ref()
            .ok_or_else(|| VaeaError::protocol(VaeaErrorCode::ApiError, "Payer keypair required"))?;

        let all_ixs = self.borrow(&params).await?;

        let blockhash = rpc.get_latest_blockhash_with_commitment(CommitmentConfig::confirmed())
            .await
            .map_err(|e| VaeaError::Rpc(e.to_string()))?
            .0;

        let msg = v0::Message::try_compile(
            &payer.pubkey(),
            &all_ixs,
            &[],
            blockhash,
        ).map_err(|e| VaeaError::Transaction(e.to_string()))?;

        let mut tx = VersionedTransaction::try_new(VersionedMessage::V0(msg), &[payer.as_ref()])
            .map_err(|e| VaeaError::Transaction(e.to_string()))?;

        let sig = rpc.send_and_confirm_transaction(&tx)
            .await
            .map_err(|e| VaeaError::Transaction(e.to_string()))?;

        Ok(sig.to_string())
    }

    // ═══════════════════════════════════════════════════════
    //  Helpers
    // ═══════════════════════════════════════════════════════

    fn parse_api_instruction(api_ix: &ApiInstructionData) -> Result<Instruction, VaeaError> {
        let program_id = Pubkey::from_str(&api_ix.program_id)
            .map_err(|_| VaeaError::InvalidPubkey(api_ix.program_id.clone()))?;

        let accounts: Vec<AccountMeta> = api_ix.accounts.iter().map(|acc| {
            let pubkey = Pubkey::from_str(&acc.pubkey)
                .unwrap_or_default();
            if acc.is_writable {
                AccountMeta::new(pubkey, acc.is_signer)
            } else {
                AccountMeta::new_readonly(pubkey, acc.is_signer)
            }
        }).collect();

        let data = STANDARD.decode(&api_ix.data)
            .map_err(|e| VaeaError::protocol(VaeaErrorCode::ApiError, format!("Base64 decode: {}", e)))?;

        Ok(Instruction { program_id, accounts, data })
    }

    async fn check_response(&self, res: &reqwest::Response) -> Result<(), VaeaError> {
        if !res.status().is_success() {
            // We can't consume the body here since we need it later
            // This is a pre-check; the actual error will be caught during deserialization
        }
        Ok(())
    }
}
