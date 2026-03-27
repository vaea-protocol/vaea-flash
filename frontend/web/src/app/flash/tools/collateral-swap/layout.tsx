import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collateral Swap — Atomic Collateral Change | VAEA Flash',
  description: 'Swap your DeFi collateral in one atomic Solana transaction. Change from SOL to JitoSOL, USDC to USDT, or any supported token without closing your position. Zero exposure gap, zero liquidation risk during swap. Powered by VAEA Flash loans.',
  keywords: 'collateral swap, flash loan, Solana DeFi, atomic swap, VAEA, change collateral, Marginfi, Kamino',
  openGraph: {
    title: 'Collateral Swap — VAEA Flash',
    description: 'Swap DeFi collateral atomically in one Solana transaction. No position close needed.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
