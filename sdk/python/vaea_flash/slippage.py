"""
VAEA Flash — Auto Slippage Calculator (Python)

Calculates optimal slippage based on route type and price impact.
Uses data from our own QuoteResponse — zero external API calls.
"""

from typing import Union
import math


SlippageMode = Union[str, int]  # 'auto', 'aggressive', 'safe', or exact bps (int)


def calculate_slippage_bps(
    mode: SlippageMode,
    route_type: str,
    price_impact: float,
) -> int:
    """
    Calculate optimal slippage in bps for a flash loan.

    Args:
        mode: 'auto' (balanced), 'aggressive' (minimal), 'safe' (wide), or int (exact bps)
        route_type: 'direct' (no swap) or 'synthetic' (SOL → swap → target)
        price_impact: Price impact as percentage (e.g. 0.03 = 0.03%)

    Returns:
        Slippage in basis points
    """
    if isinstance(mode, int):
        return mode

    if route_type == "direct":
        direct_bps = {"auto": 10, "aggressive": 5, "safe": 50}
        return direct_bps.get(mode, 10)

    # Synthetic: 2x price_impact as base, minimum 30 bps
    base_bps = max(math.ceil(price_impact * 100 * 2), 30)
    multipliers = {"auto": 1.5, "aggressive": 1.0, "safe": 3.0}
    return math.ceil(base_bps * multipliers.get(mode, 1.5))
