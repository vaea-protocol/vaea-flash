import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flash Loan Tools — Collateral Swap, Self-Liquidation, Leverage | VAEA Flash',
  description: 'Flash loan powered DeFi tools on Solana. Collateral Swap to change positions atomically, Self-Liquidation to avoid 5-15% penalties, One-Click Leverage for instant 2-5x positions. All in one transaction, from 0.03% fee.',
  keywords: 'flash loan tools, Solana DeFi tools, collateral swap, self-liquidation, leverage, VAEA Flash, atomic transactions, DeFi automation',
  openGraph: {
    title: 'Flash Loan DeFi Tools — VAEA Flash',
    description: 'Atomic DeFi tools powered by flash loans on Solana. Swap collateral, self-liquidate, leverage — all in one transaction.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
