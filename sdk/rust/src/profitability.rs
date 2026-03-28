/// VAEA Flash — Profitability Calculator (Rust)
///
/// Calculates if a flash loan strategy is profitable after all fees.
/// Uses data from our own QuoteResponse — zero external dependencies.

use crate::types::QuoteResponse;

/// Parameters for profitability check.
pub struct ProfitabilityParams {
    /// Token symbol or mint
    pub token: String,
    /// Borrow amount in human units
    pub amount: f64,
    /// Expected gross profit from strategy in SOL (e.g. arb profit after repay)
    pub expected_revenue: f64,
    /// Optional Jito tip in SOL
    pub jito_tip: f64,
    /// Optional priority fee in SOL
    pub priority_fee: f64,
}

/// Profitability analysis result.
pub struct ProfitabilityResult {
    /// Whether the strategy is net-profitable
    pub profitable: bool,
    /// Net profit in SOL (negative = loss)
    pub net_profit: f64,
    /// Detailed cost breakdown
    pub breakdown: ProfitabilityBreakdown,
    /// Recommendation: "send" if profit > 2x costs, "wait" if marginal, "abort" if unprofitable
    pub recommendation: Recommendation,
}

pub struct ProfitabilityBreakdown {
    pub revenue: f64,
    pub vaea_fee: f64,
    pub swap_fees: f64,
    pub network_fee: f64,
    pub priority_fee: f64,
    pub jito_tip: f64,
    pub total_cost: f64,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Recommendation {
    /// Clear profit (> 2x costs)
    Send,
    /// Marginal profit
    Wait,
    /// Unprofitable
    Abort,
}

/// Calculate profitability from a QuoteResponse.
pub fn calculate_profitability(
    quote: &QuoteResponse,
    params: &ProfitabilityParams,
) -> ProfitabilityResult {
    let vaea_fee = quote.fee_breakdown.vaea_fee;
    let swap_fees = quote.fee_breakdown.swap_in_fee + quote.fee_breakdown.swap_out_fee;
    let network_fee = 0.000005; // ~5000 lamports base fee
    let priority_fee = params.priority_fee;
    let jito_tip = params.jito_tip;

    let total_cost = vaea_fee + swap_fees + network_fee + priority_fee + jito_tip;
    let net_profit = params.expected_revenue - total_cost;

    let recommendation = if net_profit > total_cost * 2.0 {
        Recommendation::Send
    } else if net_profit > 0.0 {
        Recommendation::Wait
    } else {
        Recommendation::Abort
    };

    ProfitabilityResult {
        profitable: net_profit > 0.0,
        net_profit,
        breakdown: ProfitabilityBreakdown {
            revenue: params.expected_revenue,
            vaea_fee,
            swap_fees,
            network_fee,
            priority_fee,
            jito_tip,
            total_cost,
        },
        recommendation,
    }
}
