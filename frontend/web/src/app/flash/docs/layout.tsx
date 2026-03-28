import type { Metadata } from 'next';
import DocsLayout from './DocsLayout';

export const metadata: Metadata = {
  title: { template: '%s — VAEA Flash Docs', default: 'Documentation — VAEA Flash' },
  description: 'Complete documentation for VAEA Flash: quick start, SDK reference (TypeScript, Rust, Python), REST API, routing, fee model, and code examples for Solana flash loans.',
  keywords: ['flash loan documentation', 'flash loan SDK', 'Solana flash loan API', 'VAEA Flash docs', 'TypeScript flash loan', 'Rust flash loan', 'Python flash loan'],
  openGraph: {
    title: 'Documentation — VAEA Flash',
    description: 'Complete flash loan SDK & API documentation. TypeScript, Rust, Python.',
    type: 'website',
    url: 'https://vaea.fi/flash/docs',
  },
  alternates: { canonical: '/flash/docs' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DocsLayout>{children}</DocsLayout>;
}
