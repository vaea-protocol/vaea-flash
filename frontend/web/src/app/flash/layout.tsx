import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '30 Flash Loan Tokens — Real-Time Liquidity',
  description: 'Browse all 30 flash loan tokens on Solana. Live liquidity, fees, and prices for SOL, USDC, wETH, JitoSOL, BONK, WIF, and more. Direct and synthetic routes from 0.03%.',
  keywords: [
    'flash loan dashboard', 'Solana flash loan tokens', 'flash loan liquidity',
    'SOL flash loan', 'USDC flash loan', 'JitoSOL flash loan', 'mSOL flash loan',
    'BONK flash loan', 'WIF flash loan', 'flash loan aggregator Solana',
    'DeFi dashboard', 'flash loan fee comparison', 'Solana DeFi tokens',
  ],
  openGraph: {
    title: '30 Flash Loan Tokens — VAEA Flash',
    description: '30 tokens available for flash loans on Solana. Real-time liquidity and fees.',
    type: 'website',
    url: 'https://vaea.fi/flash',
  },
  alternates: { canonical: '/flash' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
