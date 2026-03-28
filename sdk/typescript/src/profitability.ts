/**
 * VAEA Flash — Profitability Calculator
 *
 * Calculates if a flash loan strategy is profitable after all fees.
 * Uses data from our own getQuote() API — zero external dependencies.
 */

import { QuoteResponse } from './types';

export interface ProfitabilityParams {
  /** Token symbol or mint */
  token: string;
  /** Borrow amount in human units */
  amount: number;
  /** Expected gross profit from strategy in SOL (e.g. arb profit after repay) */
  expectedRevenue: number;
  /** Optional Jito tip in SOL */
  jitoTip?: number;
  /** Optional priority fee in SOL */
  priorityFee?: number;
}

export interface ProfitabilityResult {
  /** Whether the strategy is net-profitable */
  profitable: boolean;
  /** Net profit in token units (negative = loss) */
  netProfit: number;
  /** Detailed cost breakdown */
  breakdown: {
    revenue: number;
    vaeFee: number;
    swapFees: number;
    networkFee: number;
    priorityFee: number;
    jitoTip: number;
    totalCost: number;
  };
  /** 'send' if profit > 2x costs, 'wait' if marginal, 'abort' if unprofitable */
  recommendation: 'send' | 'wait' | 'abort';
}

/**
 * Calculate profitability of a flash loan strategy.
 *
 * @param getQuote - Function to fetch a quote (bound from VaeaFlash instance)
 * @param params - Strategy parameters
 * @returns Detailed profitability analysis
 */
export async function calculateProfitability(
  getQuote: (token: string, amount: number) => Promise<QuoteResponse>,
  params: ProfitabilityParams,
): Promise<ProfitabilityResult> {
  const quote = await getQuote(params.token, params.amount);

  const vaeFee = quote.fee_breakdown.vaea_fee;
  const swapFees = quote.fee_breakdown.swap_in_fee + quote.fee_breakdown.swap_out_fee;
  const networkFee = 0.000005; // ~5000 lamports base fee (fixed on Solana)
  const priorityFee = params.priorityFee ?? 0;
  const jitoTip = params.jitoTip ?? 0;

  const totalCost = vaeFee + swapFees + networkFee + priorityFee + jitoTip;
  const netProfit = params.expectedRevenue - totalCost;

  let recommendation: 'send' | 'wait' | 'abort';
  if (netProfit > totalCost * 2) {
    recommendation = 'send';    // Clear profit: > 2x costs
  } else if (netProfit > 0) {
    recommendation = 'wait';    // Marginal profit
  } else {
    recommendation = 'abort';   // Unprofitable
  }

  return {
    profitable: netProfit > 0,
    netProfit,
    breakdown: {
      revenue: params.expectedRevenue,
      vaeFee,
      swapFees,
      networkFee,
      priorityFee,
      jitoTip,
      totalCost,
    },
    recommendation,
  };
}
