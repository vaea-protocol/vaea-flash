'use client';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

const STEPS = [
  { n: '01', label: 'Detect low health factor', desc: 'Monitor your position — when health factor drops below your threshold, trigger self-liquidation.' },
  { n: '02', label: 'Flash borrow repayment token', desc: 'VAEA borrows the exact tokens needed to repay your debt on the lending protocol.' },
  { n: '03', label: 'Repay your debt', desc: 'The borrowed amount repays your loan on Marginfi, Kamino, or Drift — unlocking your collateral.' },
  { n: '04', label: 'Withdraw & swap', desc: 'Collateral is withdrawn, swapped to repay the flash loan. You keep the rest — 0.03% fee only.' },
];

export default function SelfLiquidationPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="mx" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <Link href="/flash/tools" style={{ color: 'var(--text-3)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>← All Tools</Link>

        <div className="grid-hero" style={{ gap: 20, marginTop: 20 }}>
          <div className="fade-in">
            <div style={{ display: 'inline-flex', padding: '5px 14px', borderRadius: 'var(--r-full)', background: '#FF718F10', color: '#FF718F', fontSize: '0.72rem', fontWeight: 800, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Coming Soon
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: 12, lineHeight: 1.15 }}>
              Self-Liquidation
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: '1rem', lineHeight: 1.75, maxWidth: 420, marginBottom: 24 }}>
              When your health factor drops, lending protocols charge a <strong style={{ color: '#FF718F' }}>5-15% liquidation penalty</strong>. 
              Self-liquidate with VAEA and pay only <strong style={{ color: 'var(--emerald)' }}>0.03%</strong>.
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: '14px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FF718F' }}>5-15%</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>Protocol penalty</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-3)', fontSize: '1.2rem' }}>→</div>
              <div style={{ background: '#29C1A208', borderRadius: 'var(--r)', padding: '14px 20px', textAlign: 'center', border: '1px solid #29C1A215' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#29C1A2' }}>0.03%</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>VAEA Flash fee</div>
              </div>
            </div>
            <button className="btn btn-dark" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Available Soon</button>
          </div>
          <div className="fade-in fade-in-2" style={{
            background: 'linear-gradient(145deg, #fef0f3, #fce4ea)',
            borderRadius: 24, padding: '40px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
            border: '1px solid #FF718F18', minHeight: 280,
          }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '24px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #FF718F20', maxWidth: 240 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FF718F', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>You Save</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>99.7%</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginTop: 8 }}>vs protocol liquidation</div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FF718F', textDecoration: 'line-through' }}>$1,500</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>10% penalty on $15K</div>
              </div>
              <span style={{ color: 'var(--text-3)' }}>→</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#29C1A2' }}>$4.50</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>0.03% VAEA fee</div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ How it works ═══ */}
        <section style={{ marginTop: 56 }}>
          <h2 className="fade-in" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 28 }}>How it works</h2>
          <div className="grid-4" style={{ gap: 16 }}>
            {STEPS.map((s, i) => (
              <div key={s.n} className="fade-in" style={{ animationDelay: `${i * 0.08}s`, padding: '28px 24px', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#FF718F20', marginBottom: 10 }}>{s.n}</div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8 }}>{s.label}</div>
                <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Savings example ═══ */}
        <section style={{ marginTop: 48 }}>
          <div className="fade-in" style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', padding: '36px 40px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Example Savings</div>
            <p style={{ color: 'var(--text)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: 640 }}>
              Your <strong>$5,000 SOL</strong> position on Marginfi hits health factor 1.05. 
              A liquidation bot would take <strong style={{ color: '#FF718F' }}>$500-$750</strong> as penalty (10-15%). 
              With VAEA Self-Liquidation, you pay <strong style={{ color: '#29C1A2' }}>$1.50</strong> (0.03%). 
              That's up to <strong>$748.50 saved</strong> — money that stays in your wallet.
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
