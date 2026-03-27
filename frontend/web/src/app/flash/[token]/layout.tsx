import type { Metadata } from 'next';
import { SUPPORTED_TOKENS } from '@/lib/constants';

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const upper = token.toUpperCase();
  const info = SUPPORTED_TOKENS.find(t => t.symbol.toUpperCase() === upper);
  const name = info?.name || upper;
  const route = info?.route || 'direct';

  const title = `Flash Loan ${upper} — Borrow ${name} Instantly on Solana`;
  const description = `Flash loan ${upper} (${name}) on Solana in one atomic transaction. ${route === 'direct' ? 'Direct route, from 0.03% fee.' : 'Synthetic route via swap, from ~0.09% fee.'} No collateral required. Borrow and repay ${upper} in the same transaction with VAEA Flash.`;

  return {
    title,
    description,
    keywords: [
      `${upper} flash loan`,
      `flash loan ${upper}`,
      `borrow ${upper} Solana`,
      `${name} flash loan`,
      `${upper} DeFi`,
      `Solana flash loan ${upper}`,
      `VAEA ${upper}`,
      'flash loan',
      'Solana DeFi',
      'atomic transaction',
      'no collateral loan',
      ...(route === 'synthetic' ? [`synthetic flash loan ${upper}`, `swap ${upper}`] : [`direct flash loan ${upper}`]),
    ],
    openGraph: {
      title: `Flash Loan ${upper} — VAEA Flash`,
      description: `Borrow ${name} (${upper}) on Solana with zero collateral. ${route === 'direct' ? 'From 0.03% fee.' : 'Synthetic route from ~0.09%.'}`,
      type: 'website',
      url: `https://vaea.fi/flash/${upper}`,
    },
    alternates: {
      canonical: `/flash/${upper}`,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
