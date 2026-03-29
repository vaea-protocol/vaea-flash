import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flash Loan Dashboard — All 26 Tokens & Real-Time Liquidity',
  description: 'Browse all 26 flash loan tokens available on Solana. Real-time liquidity, fees, and prices for SOL, USDC, JitoSOL, mSOL, BONK, and more. Direct and synthetic routes from 0.03% fee. The most complete flash loan aggregator on Solana.',
  keywords: [
    'flash loan dashboard', 'Solana flash loan tokens', 'flash loan liquidity',
    'SOL flash loan', 'USDC flash loan', 'JitoSOL flash loan', 'mSOL flash loan',
    'BONK flash loan', 'WIF flash loan', 'flash loan aggregator Solana',
    'DeFi dashboard', 'flash loan fee comparison', 'Solana DeFi tokens',
  ],
  openGraph: {
    title: 'Flash Loan Dashboard — VAEA Flash',
    description: '30+ tokens available for flash loans on Solana. Real-time liquidity and fees.',
    type: 'website',
    url: 'https://vaea.fi/flash',
  },
  alternates: { canonical: '/flash' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
