'use client';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

const STEPS = [
  { n: '01', label: 'Flash borrow capital', desc: 'VAEA flash borrows the extra capital needed for your target leverage multiplier.' },
  { n: '02', label: 'Deposit as collateral', desc: 'Your funds + borrowed funds are deposited on the lending protocol as collateral.' },
  { n: '03', label: 'Borrow & loop', desc: 'The protocol lends against the collateral, and the loop repeats until target leverage is reached.' },
  { n: '04', label: 'Repay flash loan', desc: 'Final borrowed amount repays the flash loan. Your leveraged position is live — gas: ~0.001 SOL.' },
];

const MULTIPLIERS = ['2x', '3x', '4x', '5x'];

export default function LeveragePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="mx" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <Link href="/flash/tools" style={{ color: 'var(--text-3)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>← All Tools</Link>

        <div className="grid-hero" style={{ gap: 20, marginTop: 20 }}>
          <div className="fade-in">
            <div style={{ display: 'inline-flex', padding: '5px 14px', borderRadius: 'var(--r-full)', background: '#823FFF10', color: '#823FFF', fontSize: '0.72rem', fontWeight: 800, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Coming Soon
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: 12, lineHeight: 1.15 }}>
              One-Click Leverage
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: '1rem', lineHeight: 1.75, maxWidth: 420, marginBottom: 24 }}>
              Create <strong style={{ color: 'var(--text)' }}>2-5x leveraged positions</strong> in a single atomic transaction. 
              No manual deposit-borrow-deposit loops. Unwind instantly when you need to.
            </p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              {MULTIPLIERS.map(m => (
                <div key={m} style={{
                  padding: '10px 20px', borderRadius: 'var(--r)',
                  background: m === '3x' ? '#823FFF' : 'var(--bg)',
                  color: m === '3x' ? 'white' : 'var(--text)',
                  fontWeight: 900, fontSize: '1.1rem',
                  border: m === '3x' ? 'none' : '1px solid var(--border)',
                }}>
                  {m}
                </div>
              ))}
            </div>
            <button className="btn btn-dark" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Available Soon</button>
          </div>
          <div className="fade-in fade-in-2" style={{
            background: 'linear-gradient(145deg, #f5f0ff, #ede4ff)',
            borderRadius: 24, padding: '40px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
            border: '1px solid #823FFF18', minHeight: 280,
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#823FFF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Leverage Multiplier</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              {[
                { m: '1x', h: 40, active: false },
                { m: '2x', h: 60, active: false },
                { m: '3x', h: 90, active: true },
                { m: '4x', h: 70, active: false },
                { m: '5x', h: 50, active: false },
              ].map(b => (
                <div key={b.m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 36, height: b.h, borderRadius: 10,
                    background: b.active ? 'linear-gradient(180deg, #823FFF, #6B2FD9)' : '#823FFF20',
                    border: b.active ? 'none' : '1px solid #823FFF25',
                    boxShadow: b.active ? '0 4px 16px rgba(130,63,255,0.3)' : 'none',
                  }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: b.active ? 900 : 600, color: b.active ? '#823FFF' : 'var(--text-3)' }}>{b.m}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600 }}>Single TX • Atomic • ~0.001 SOL gas</div>
          </div>
        </div>

        {/* ═══ How it works ═══ */}
        <section style={{ marginTop: 56 }}>
          <h2 className="fade-in" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 28 }}>How it works</h2>
          <div className="grid-4" style={{ gap: 16 }}>
            {STEPS.map((s, i) => (
              <div key={s.n} className="fade-in" style={{ animationDelay: `${i * 0.08}s`, padding: '28px 24px', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#823FFF20', marginBottom: 10 }}>{s.n}</div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8 }}>{s.label}</div>
                <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Comparison ═══ */}
        <section style={{ marginTop: 48 }}>
          <div className="fade-in" style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', padding: '36px 40px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Why One-Click Leverage</div>
            <div className="grid-2" style={{ gap: 28 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', marginBottom: 10, color: 'var(--text-3)' }}>Manual looping</div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['5+ transactions', '~0.01 SOL gas total', 'Price risk between txs', '2-3 minutes of work'].map(s => (
                    <li key={s} style={{ fontSize: '0.85rem', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#FF718F', fontWeight: 700 }}>✕</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', marginBottom: 10, color: '#823FFF' }}>VAEA One-Click</div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['1 transaction', '~0.001 SOL gas', 'Zero price risk (atomic)', 'Under 3 seconds'].map(s => (
                    <li key={s} style={{ fontSize: '0.85rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#29C1A2', fontWeight: 700 }}>✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
