"""
VAEA Flash — Profitability Calculator (Python)

Calculates if a flash loan strategy is profitable after all fees.
Uses data from our own QuoteResponse — zero external dependencies.
"""

from dataclasses import dataclass
from typing import Literal

from .types import QuoteResponse


@dataclass
class ProfitabilityParams:
    """Parameters for profitability check."""
    token: str
    amount: float
    expected_revenue: float  # Gross profit from strategy in SOL
    jito_tip: float = 0.0
    priority_fee: float = 0.0


@dataclass
class ProfitabilityBreakdown:
    """Detailed cost breakdown."""
    revenue: float
    vaea_fee: float
    swap_fees: float
    network_fee: float
    priority_fee: float
    jito_tip: float
    total_cost: float


@dataclass
class ProfitabilityResult:
    """Profitability analysis result."""
    profitable: bool
    net_profit: float
    breakdown: ProfitabilityBreakdown
    recommendation: Literal["send", "wait", "abort"]


def calculate_profitability(
    quote: QuoteResponse,
    params: ProfitabilityParams,
) -> ProfitabilityResult:
    """
    Calculate profitability from a QuoteResponse.

    Args:
        quote: Quote from get_quote()
        params: Strategy parameters

    Returns:
        Detailed profitability analysis
    """
    vaea_fee = quote.fee_breakdown.vaea_fee
    swap_fees = quote.fee_breakdown.swap_in_fee + quote.fee_breakdown.swap_out_fee
    network_fee = 0.000005  # ~5000 lamports base fee
    priority_fee = params.priority_fee
    jito_tip = params.jito_tip

    total_cost = vaea_fee + swap_fees + network_fee + priority_fee + jito_tip
    net_profit = params.expected_revenue - total_cost

    if net_profit > total_cost * 2:
        recommendation = "send"
    elif net_profit > 0:
        recommendation = "wait"
    else:
        recommendation = "abort"

    return ProfitabilityResult(
        profitable=net_profit > 0,
        net_profit=net_profit,
        breakdown=ProfitabilityBreakdown(
            revenue=params.expected_revenue,
            vaea_fee=vaea_fee,
            swap_fees=swap_fees,
            network_fee=network_fee,
            priority_fee=priority_fee,
            jito_tip=jito_tip,
            total_cost=total_cost,
        ),
        recommendation=recommendation,
    )
