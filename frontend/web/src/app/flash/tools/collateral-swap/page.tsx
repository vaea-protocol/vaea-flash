'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

const SwapOrb = dynamic(() => import('@/components/three/ToolShapes').then(m => ({ default: m.SwapOrb })), { ssr: false });

const STEPS = [
  { n: '01', label: 'Flash borrow token B', desc: 'VAEA borrows the target collateral token via flash loan.' },
  { n: '02', label: 'Deposit token B', desc: 'The new token is deposited as collateral on Marginfi, Kamino, or Drift.' },
  { n: '03', label: 'Withdraw token A', desc: 'Your old collateral is freed since the new one now backs the position.' },
  { n: '04', label: 'Swap A → B & repay', desc: 'Original collateral is swapped to repay the flash loan. Position stays open.' },
];

export default function CollateralSwapPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="mx" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <Link href="/flash/tools" style={{ color: 'var(--text-3)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>← All Tools</Link>

        <div className="grid-hero" style={{ gap: 20, marginTop: 20 }}>
          <div className="fade-in">
            <div style={{ display: 'inline-flex', padding: '5px 14px', borderRadius: 'var(--r-full)', background: '#29C1A210', color: '#29C1A2', fontSize: '0.72rem', fontWeight: 800, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Coming Soon
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: 12, lineHeight: 1.15 }}>
              Collateral Swap
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: '1rem', lineHeight: 1.75, maxWidth: 420, marginBottom: 24 }}>
              Change your DeFi collateral in <strong style={{ color: 'var(--text)' }}>one atomic transaction</strong>. 
              Your position never closes, there is no liquidation risk during the swap, and no manual close/reopen cycles.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {['Marginfi', 'Kamino', 'Drift'].map(p => (
                <span key={p} className="tag tag-default">{p}</span>
              ))}
            </div>
            <button className="btn btn-dark" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Available Soon</button>
          </div>
          <div className="fade-in fade-in-2">
            <Suspense fallback={<div style={{ height: 280 }} />}>
              <SwapOrb />
            </Suspense>
          </div>
        </div>

        {/* ═══ How it works ═══ */}
        <section style={{ marginTop: 56 }}>
          <h2 className="fade-in" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 28 }}>How it works</h2>
          <div className="grid-4" style={{ gap: 16 }}>
            {STEPS.map((s, i) => (
              <div key={s.n} className="fade-in" style={{ animationDelay: `${i * 0.08}s`, padding: '28px 24px', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#29C1A220', marginBottom: 10 }}>{s.n}</div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8 }}>{s.label}</div>
                <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Use case ═══ */}
        <section style={{ marginTop: 48 }}>
          <div className="fade-in" style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', padding: '36px 40px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Example Scenario</div>
            <p style={{ color: 'var(--text)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: 640 }}>
              You hold <strong>SOL</strong> as collateral on Marginfi but want <strong>JitoSOL</strong> for its staking yield. 
              Normally, you'd close the position, swap, and re-deposit — 3+ transactions with liquidation risk in between. 
              With VAEA Collateral Swap, it happens <strong>atomically</strong>: your SOL becomes JitoSOL as collateral in a single signed transaction.
            </p>
          </div>
        </section>
      </div>

      <footer style={{ padding: '28px 0', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
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
