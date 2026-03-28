/**
 * VAEA Flash — Auto Slippage Calculator
 *
 * Calculates optimal slippage based on route type and price impact.
 * Uses data from our own QuoteResponse — zero external API calls.
 */

export type SlippageMode = 'auto' | 'aggressive' | 'safe' | number;

/**
 * Calculate optimal slippage in bps for a flash loan.
 *
 * @param mode - 'auto' (balanced), 'aggressive' (minimal), 'safe' (wide), or a number (exact bps)
 * @param routeType - 'direct' (no swap) or 'synthetic' (SOL → swap → target)
 * @param priceImpact - Price impact as a percentage (e.g. 0.03 = 0.03%)
 * @returns Slippage in basis points
 */
export function calculateSlippageBps(
  mode: SlippageMode,
  routeType: 'direct' | 'synthetic',
  priceImpact: number,
): number {
  // Exact bps specified — respect it
  if (typeof mode === 'number') return mode;

  // Direct routes: no swap involved, minimal slippage
  if (routeType === 'direct') {
    const directBps: Record<string, number> = {
      auto: 10,        // 0.1%
      aggressive: 5,   // 0.05%
      safe: 50,        // 0.5%
    };
    return directBps[mode] ?? 10;
  }

  // Synthetic routes: slippage depends on swap
  // Base = 2x the price_impact (safety margin), minimum 30 bps
  const baseBps = Math.max(Math.ceil(priceImpact * 100 * 2), 30);
  const multipliers: Record<string, number> = {
    auto: 1.5,
    aggressive: 1.0,
    safe: 3.0,
  };
  return Math.ceil(baseBps * (multipliers[mode] ?? 1.5));
}
