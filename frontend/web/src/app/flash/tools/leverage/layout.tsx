import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'One-Click Leverage — Flash Loan Leverage on Solana | VAEA Flash',
  description: 'Create leveraged DeFi positions in one atomic Solana transaction. Get up to 5x leverage on SOL, JitoSOL, or any supported token using flash loans. No manual looping, instant unwind. Powered by VAEA Flash.',
  keywords: 'leverage, flash loan leverage, Solana DeFi, one-click leverage, VAEA, loop leverage, 5x leverage, Marginfi leverage, Kamino leverage',
  openGraph: {
    title: 'One-Click Leverage — VAEA Flash',
    description: 'Create up to 5x leveraged DeFi positions in one atomic Solana transaction.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
