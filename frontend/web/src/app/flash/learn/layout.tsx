import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'What Is a Flash Loan? — Complete Guide to Flash Loans on Solana',
  description: 'Learn what flash loans are, how they work on Solana, and why they are the most powerful DeFi primitive. Understand atomic transactions, arbitrage, liquidations, and collateral swaps — all without collateral. Complete guide with code examples.',
  keywords: [
    'what is a flash loan', 'flash loan explained', 'flash loan guide',
    'how do flash loans work', 'flash loan Solana', 'flash loan tutorial',
    'DeFi flash loan', 'uncollateralized loan crypto', 'atomic transaction DeFi',
    'flash loan arbitrage', 'flash loan liquidation', 'flash loan use cases',
    'Solana DeFi guide', 'flash loan for beginners', 'flash loan protocol',
    'borrow without collateral', 'instant crypto loan', 'flash loan risk free',
  ],
  openGraph: {
    title: 'What Is a Flash Loan? — Complete Guide',
    description: 'Everything you need to know about flash loans: how they work, use cases, and how to get started on Solana.',
    type: 'article',
    url: 'https://vaea.fi/flash/learn',
  },
  alternates: { canonical: '/flash/learn' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
