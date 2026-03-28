/// VAEA Flash — Auto Slippage Calculator (Rust)
///
/// Calculates optimal slippage based on route type and price impact.
/// Uses data from our own QuoteResponse — zero external API calls.

/// Slippage mode: auto, aggressive, safe, or exact bps.
pub enum SlippageMode {
    /// Balanced (default)
    Auto,
    /// Minimal slippage — higher risk of TX failure
    Aggressive,
    /// Wide margin — higher cost but safer
    Safe,
    /// Exact bps value
    Exact(u16),
}

/// Calculate optimal slippage in bps for a flash loan.
///
/// # Arguments
/// * `mode` — Slippage mode
/// * `route_type` — "direct" (no swap) or "synthetic" (SOL → swap → target)
/// * `price_impact` — Price impact as percentage (e.g. 0.03 = 0.03%)
pub fn calculate_slippage_bps(
    mode: SlippageMode,
    route_type: &str,
    price_impact: f64,
) -> u16 {
    match mode {
        SlippageMode::Exact(bps) => bps,
        _ => {
            if route_type == "direct" {
                match mode {
                    SlippageMode::Auto => 10,
                    SlippageMode::Aggressive => 5,
                    SlippageMode::Safe => 50,
                    SlippageMode::Exact(_) => unreachable!(),
                }
            } else {
                // Synthetic: 2x price_impact as base, minimum 30 bps
                let base_bps = ((price_impact * 100.0 * 2.0).ceil() as u16).max(30);
                let multiplier = match mode {
                    SlippageMode::Auto => 1.5,
                    SlippageMode::Aggressive => 1.0,
                    SlippageMode::Safe => 3.0,
                    SlippageMode::Exact(_) => unreachable!(),
                };
                (base_bps as f64 * multiplier).ceil() as u16
            }
        }
    }
}
