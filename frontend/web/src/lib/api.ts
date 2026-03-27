export const API_URL = process.env.NEXT_PUBLIC_VAEA_API_URL || 'https://api.vaea.fi';

export interface TokenCapacity {
  symbol: string;
  mint: string;
  name: string;
  decimals: number;
  route_type: 'direct' | 'synthetic';
  source_protocol: string;
  swap_protocol?: string;
  max_amount: number;
  max_amount_usd: number;
  fee_sdk: { bps: number; pct: number; swap_bps?: number; total_pct: number };
  fee_ui: { bps: number; pct: number; swap_bps?: number; total_pct: number };
  status: 'available' | 'degraded' | 'offline';
  updated_at: number;
}

export interface CapacityResponse {
  updated_at: number;
  tokens: TokenCapacity[];
}

export interface QuoteResponse {
  token: string;
  mint: string;
  amount_requested: number;
  source: string;
  route: { type: 'direct' | 'synthetic'; steps: any[] };
  fee_breakdown: {
    source_fee: number;
    swap_in_fee: number;
    swap_out_fee: number;
    vaea_fee: number;
    total_fee_sol: number;
    total_fee_usd: number;
    total_fee_pct: number;
  };
  price_impact: number;
  valid_until: number;
  valid_for_slots: number;
}

export async function fetchCapacity(): Promise<CapacityResponse> {
  const res = await fetch(`${API_URL}/v1/capacity`, { next: { revalidate: 2 } });
  if (!res.ok) throw new Error('Failed to fetch capacity');
  return res.json();
}

export async function fetchQuote(token: string, amount: number, source = 'ui'): Promise<QuoteResponse> {
  const res = await fetch(`${API_URL}/v1/quote?token=${token}&amount=${amount}&source=${source}`);
  if (!res.ok) throw new Error('Failed to fetch quote');
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_URL}/v1/health`);
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}
