export const SUPPORTED_TOKENS = [
  { symbol: 'SOL', name: 'Solana', decimals: 9, route: 'direct', icon: '◎' },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6, route: 'direct', icon: '$' },
  { symbol: 'USDT', name: 'Tether USD', decimals: 6, route: 'direct', icon: '₮' },
  { symbol: 'JitoSOL', name: 'Jito Staked SOL', decimals: 9, route: 'direct', icon: '⚡' },
  { symbol: 'JupSOL', name: 'Jupiter Staked SOL', decimals: 9, route: 'direct', icon: '♃' },
  { symbol: 'JUP', name: 'Jupiter', decimals: 6, route: 'direct', icon: '♃' },
  { symbol: 'JLP', name: 'Jupiter Perps LP', decimals: 6, route: 'direct', icon: '📊' },
  { symbol: 'cbBTC', name: 'Coinbase Wrapped BTC', decimals: 8, route: 'direct', icon: '₿' },
  { symbol: 'mSOL', name: 'Marinade Staked SOL', decimals: 9, route: 'synthetic', icon: '🌊' },
  { symbol: 'bSOL', name: 'BlazeStake Staked SOL', decimals: 9, route: 'synthetic', icon: '🔥' },
  { symbol: 'INF', name: 'Infinity by Sanctum', decimals: 9, route: 'synthetic', icon: '∞' },
  { symbol: 'laineSOL', name: 'Laine Staked SOL', decimals: 9, route: 'synthetic', icon: 'ℓ' },
  { symbol: 'wETH', name: 'Wrapped Ethereum', decimals: 8, route: 'synthetic', icon: 'Ξ' },
  { symbol: 'BONK', name: 'Bonk', decimals: 5, route: 'synthetic', icon: '🐕' },
  { symbol: 'WIF', name: 'dogwifhat', decimals: 6, route: 'synthetic', icon: '🎩' },
  { symbol: 'PYTH', name: 'Pyth Network', decimals: 6, route: 'synthetic', icon: '🔮' },
  { symbol: 'RAY', name: 'Raydium', decimals: 6, route: 'synthetic', icon: '☀️' },
  { symbol: 'HNT', name: 'Helium Network Token', decimals: 8, route: 'synthetic', icon: 'ℍ' },
  { symbol: 'RNDR', name: 'Render Network', decimals: 8, route: 'synthetic', icon: '🎬' },
  { symbol: 'JITO', name: 'Jito Governance', decimals: 9, route: 'synthetic', icon: '⚡' },
  { symbol: 'KMNO', name: 'Kamino Finance', decimals: 6, route: 'synthetic', icon: 'K' },
] as const;

export const formatAmount = (amount: number, decimals = 2): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(decimals)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(decimals)}K`;
  return amount.toFixed(decimals);
};

export const formatPct = (pct: number): string => {
  return `${pct.toFixed(pct < 0.01 ? 4 : 2)}%`;
};

export const formatFee = (bps: number): string => {
  return `${(bps / 100).toFixed(2)}%`;
};
