import { notFound } from 'next/navigation';
import { SLUGS, ALL_PAGES } from '../nav';
import type { Metadata } from 'next';

/* ── Lazy-load page components ── */
const PAGES: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  'introduction':        () => import('../pages/introduction'),
  'quickstart':          () => import('../pages/quickstart'),
  'architecture':        () => import('../pages/architecture'),
  'supported-tokens':    () => import('../pages/supported-tokens'),
  'routing':             () => import('../pages/routing'),
  'fees':                () => import('../pages/fees'),
  'turbo-mode':          () => import('../pages/turbo-mode'),
  'simulation':          () => import('../pages/simulation'),
  'multi-token-flash':   () => import('../pages/multi-token-flash'),
  'profitability-check': () => import('../pages/profitability-check'),
  'smart-retry':         () => import('../pages/smart-retry'),
  'jito-bundles':        () => import('../pages/jito-bundles'),
  'warm-cache':          () => import('../pages/warm-cache'),
  'fee-guard':           () => import('../pages/fee-guard'),
  'auto-slippage':       () => import('../pages/auto-slippage'),
  'rest-api':            () => import('../pages/rest-api'),
  'sdk-utilities':       () => import('../pages/sdk-utilities'),
  'error-codes':         () => import('../pages/error-codes'),
  'faq':                 () => import('../pages/faq'),
  'zero-cpi-integration':() => import('../pages/zero-cpi-integration'),
  'vsol-v2':             () => import('../pages/vsol-v2'),
};

export function generateStaticParams() {
  return SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const page = ALL_PAGES.find(p => p.slug === slug);
  if (!page) return {};
  return { title: page.title, description: page.description };
}

export default async function DocPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const loader = PAGES[slug];
  if (!loader) notFound();
  const Mod = await loader();
  const Component = Mod.default;
  return <Component />;
}
