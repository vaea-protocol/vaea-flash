'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

const SwapOrb = dynamic(() => import('@/components/three/ToolShapes').then(m => ({ default: m.SwapOrb })), { ssr: false });
const ShieldOrb = dynamic(() => import('@/components/three/ToolShapes').then(m => ({ default: m.ShieldOrb })), { ssr: false });
const LeverageOrb = dynamic(() => import('@/components/three/ToolShapes').then(m => ({ default: m.LeverageOrb })), { ssr: false });

const TOOLS = [
  {
    id: 'collateral-swap',
    title: 'Collateral Swap',
    tagline: 'Change your collateral without closing your position.',
    desc: 'Swap token A for token B as collateral — atomically, in a single transaction. Your position stays open. Zero exposure gap.',
    color: '#29C1A2',
    icon: '⇄',
    Orb: SwapOrb,
  },
  {
    id: 'self-liquidation',
    title: 'Self-Liquidation',
    tagline: 'Protect yourself from costly protocol liquidations.',
    desc: 'When your health factor drops, self-liquidate with VAEA Flash and pay 0.03% instead of the 5-15% penalty charged by lending protocols.',
    color: '#FF718F',
    icon: '🛡',
    Orb: ShieldOrb,
  },
  {
    id: 'leverage',
    title: 'One-Click Leverage',
    tagline: 'Create leveraged positions in one atomic transaction.',
    desc: 'Flash borrow → deposit → borrow → loop → repay. Get up to 5x leverage without manual looping. Set-and-forget, unwind instantly.',
    color: '#823FFF',
    icon: '✕',
    Orb: LeverageOrb,
  },
];

export default function ToolsHubPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ═══ Hero ═══ */}
      <section className="mx" style={{ paddingTop: 56, paddingBottom: 20 }}>
        <div className="fade-in" style={{ maxWidth: 520 }}>
          <div className="tag tag-emerald" style={{ marginBottom: 16 }}>Flash-Powered DeFi Tools</div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.2rem)', marginBottom: 14, lineHeight: 1.15 }}>
            DeFi superpowers,<br />one transaction.
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '1.02rem', lineHeight: 1.75, maxWidth: 420 }}>
            Flash loans are the engine. These tools are what you actually use.
            No code required — connect, pick, sign.
          </p>
        </div>
      </section>

      {/* ═══ Tool Sections ═══ */}
      {TOOLS.map((t, i) => (
        <section key={t.id} className="mx fade-in" style={{ animationDelay: `${i * 0.1}s`, paddingBottom: 20 }}>
          <Link href={`/flash/tools/${t.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div
              className="tool-section-card grid-hero"
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--r-xl)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                transition: 'box-shadow 0.35s var(--ease), transform 0.35s var(--ease)',
                cursor: 'pointer',
              }}
            >
              {/* 3D side */}
              <div style={{ order: i % 2 === 0 ? 1 : 2 }}>
                <Suspense fallback={<div style={{ height: 280 }} />}>
                  <t.Orb />
                </Suspense>
              </div>

              {/* Content side */}
              <div style={{ order: i % 2 === 0 ? 2 : 1, padding: '40px 44px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '5px 14px', borderRadius: 'var(--r-full)',
                  background: `${t.color}10`, color: t.color,
                  fontSize: '0.72rem', fontWeight: 800,
                  marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  Coming Soon
                </div>

                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.02em' }}>
                  {t.title}
                </h2>

                <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', lineHeight: 1.75, marginBottom: 20, maxWidth: 380 }}>
                  {t.desc}
                </p>

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: '0.82rem', fontWeight: 700, color: t.color,
                }}>
                  Learn more
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </section>
      ))}

      {/* ═══ Footer ═══ */}
      <footer style={{ padding: '40px 0 28px', borderTop: '1px solid rgba(0,0,0,0.04)', marginTop: 40 }}>
        <div className="mx" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-3)', fontSize: '0.78rem', fontWeight: 500 }}>© 2026 VAEA Protocol</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {[{ label: 'Docs', href: '/flash/docs' }, { label: 'Dashboard', href: '/flash' }, { label: 'GitHub', href: 'https://github.com/vaea-protocol/vaea-flash' }].map(l => (
              <a key={l.label} href={l.href} style={{ color: 'var(--text-3)', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 500 }}>{l.label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
