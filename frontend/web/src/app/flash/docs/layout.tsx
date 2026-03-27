import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation — Flash Loan SDK & API Reference | VAEA Flash',
  description: 'Complete documentation for VAEA Flash: quick start guide, SDK reference (TypeScript, Rust, Python), REST API endpoints, routing logic, fee model, error codes, and code examples for arbitrage, liquidation, and collateral swaps on Solana.',
  keywords: [
    'flash loan documentation', 'flash loan SDK', 'Solana flash loan API',
    'flash loan tutorial', 'flash loan code example', 'VAEA Flash docs',
    'TypeScript flash loan', 'Rust flash loan', 'Python flash loan',
    'flash loan integration', 'Solana DeFi SDK', 'flash loan guide',
    'arbitrage bot Solana', 'liquidation bot tutorial',
  ],
  openGraph: {
    title: 'Documentation — VAEA Flash',
    description: 'Complete flash loan SDK & API documentation. TypeScript, Rust, Python.',
    type: 'website',
    url: 'https://vaea.fi/flash/docs',
  },
  alternates: { canonical: '/flash/docs' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
