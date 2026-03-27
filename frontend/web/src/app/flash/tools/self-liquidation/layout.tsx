import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Self-Liquidation — Save 5-15% on DeFi Liquidations | VAEA Flash',
  description: 'Avoid costly DeFi liquidation penalties on Solana. Self-liquidate your Marginfi, Kamino or Drift position with VAEA Flash loans and pay only 0.03% instead of the 5-15% protocol penalty. Protect your capital atomically.',
  keywords: 'self-liquidation, DeFi liquidation, flash loan, Solana, avoid liquidation penalty, VAEA, Marginfi, Kamino, health factor',
  openGraph: {
    title: 'Self-Liquidation — VAEA Flash',
    description: 'Self-liquidate your DeFi position for 0.03% instead of 5-15%. Save thousands on Solana.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
