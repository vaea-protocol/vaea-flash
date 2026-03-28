'use client';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function LearnPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ═══ Hero ═══ */}
      <section style={{ padding: '56px 0 48px' }}>
        <div className="mx" style={{ textAlign: 'center', maxWidth: 680, marginInline: 'auto' }}>
          <div className="tag tag-emerald fade-in" style={{ marginBottom: 16 }}>Learn</div>
          <h1 className="fade-in" style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', marginBottom: 16, lineHeight: 1.15 }}>
            What Is a Flash Loan?
          </h1>
          <p className="fade-in fade-in-1" style={{ color: 'var(--text-2)', fontSize: '1.05rem', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            Borrow <strong style={{ color: 'var(--text)' }}>any amount</strong> of <strong style={{ color: 'var(--text)' }}>any token</strong> with
            zero collateral — repay in the same transaction or it reverts automatically.
          </p>
        </div>
      </section>

      {/* ═══ How It Works — Visual Flow ═══ */}
      <section style={{ padding: '0 0 64px' }}>
        <div className="mx">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 32, textAlign: 'center' }}>How It Works</h2>

          {/* Flow steps */}
          <div className="grid-3" style={{ gap: 0, marginBottom: 40, position: 'relative' }}>
            {[
              { n: '1', title: 'Borrow', desc: 'Request any supported token. VAEA routes to the deepest liquidity source — no collateral, no approval.', color: '#29C1A2', icon: '↓' },
              { n: '2', title: 'Execute Your Logic', desc: 'Arbitrage, liquidation, collateral swap, leverage — your code runs with the borrowed funds in your wallet.', color: '#FF9060', icon: '⚙' },
              { n: '3', title: 'Repay + Fee', desc: 'Return the exact amount + 0.03% fee. If anything fails, the entire transaction reverts. You lose nothing.', color: '#823FFF', icon: '✓' },
            ].map((s, i) => (
              <div key={s.n} className="fade-in" style={{ animationDelay: `${i * 0.1}s`, textAlign: 'center', position: 'relative' }}>
                {/* Connector line */}
                {i < 2 && <div className="desktop-only" style={{ position: 'absolute', top: 28, right: -10, width: 20, height: 2, background: 'var(--border)', display: 'flex' }} />}
                <div style={{
                  width: 56, height: 56, borderRadius: 18, margin: '0 auto 16px',
                  background: `${s.color}12`, border: `2px solid ${s.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 900, color: s.color,
                }}>{s.n}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 260, margin: '0 auto' }}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Atomic callout */}
          <div style={{
            background: 'linear-gradient(135deg, #29C1A208, #823FFF06)',
            borderRadius: 20, padding: '24px 28px',
            border: '1px solid var(--border)',
            display: 'flex', gap: 16, alignItems: 'flex-start',
            maxWidth: 640, margin: '0 auto',
          }}>
            <div style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: 2 }}>🔒</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 6 }}>Atomic & Risk-Free</div>
              <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.75 }}>
                Flash loans are <strong style={{ color: 'var(--text)' }}>atomic</strong> — they either succeed completely or revert completely.
                If your arbitrage doesn't work, the price moved, or anything fails — the transaction rolls back.
                You only pay a negligible network fee (~$0.0001 on Solana).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Use Cases ═══ */}
      <section style={{ padding: '48px 0 64px' }}>
        <div className="mx">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 10 }}>Real Use Cases</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', maxWidth: 480, margin: '0 auto' }}>
              Flash loans unlock strategies that are impossible with traditional capital.
            </p>
          </div>

          <div className="grid-3" style={{ gap: 16 }}>
            {[
              { icon: '📊', title: 'DEX Arbitrage', desc: 'Exploit price differences between Raydium, Orca, and Jupiter in one transaction. Borrow, swap both sides, pocket the spread.', color: '#29C1A2' },
              { icon: '🛡️', title: 'Self-Liquidation', desc: 'Avoid the 5-10% liquidation penalty on Marginfi or Kamino. Flash loan to close your own position at market price.', color: '#FF718F' },
              { icon: '🔄', title: 'Collateral Swap', desc: 'Switch collateral from SOL to JitoSOL (or any pair) in one atomic transaction. No need to close and reopen your position.', color: '#FF9060' },
              { icon: '📈', title: 'Leverage Looping', desc: 'Create 3-5x leveraged lending positions in one transaction instead of manually looping deposit → borrow → deposit.', color: '#823FFF' },
              { icon: '🤖', title: 'Liquidation Bots', desc: 'Flash loan the required token to liquidate undercollateralized positions on lending protocols. Keep the liquidation bonus.', color: '#8ECAE6' },
              { icon: '🏗️', title: 'Protocol Operations', desc: 'Protocols use flash loans internally for pool rebalancing, oracle price updates, and accounting reconciliation.', color: '#29C1A2' },
            ].map((uc, i) => (
              <div key={uc.title} className="fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div style={{
                  background: 'var(--bg)', borderRadius: 20, padding: '24px',
                  border: '1px solid var(--border)', height: '100%',
                  transition: 'transform 0.25s var(--ease), box-shadow 0.25s var(--ease)',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: `${uc.color}12`, border: `1.5px solid ${uc.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', marginBottom: 14,
                  }}>{uc.icon}</div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: 8 }}>{uc.title}</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.7 }}>{uc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Comparison ═══ */}
      <section style={{ padding: '64px 0' }}>
        <div className="mx" style={{ maxWidth: 720 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 10 }}>Flash Loan vs Traditional Loan</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.92rem' }}>
              Why flash loans are fundamentally different from any conventional borrowing.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { feature: 'Collateral', flash: 'None', trad: '100–150%', flashIcon: '✓', tradIcon: '✗' },
              { feature: 'Duration', flash: 'Instant (same TX)', trad: 'Days to months', flashIcon: '✓', tradIcon: '—' },
              { feature: 'Risk of Loss', flash: 'Zero — auto-reverts', trad: 'Full capital at risk', flashIcon: '✓', tradIcon: '✗' },
              { feature: 'Capital Needed', flash: '$0', trad: 'Full loan amount', flashIcon: '✓', tradIcon: '✗' },
              { feature: 'Access', flash: 'Permissionless', trad: 'KYC / Credit check', flashIcon: '✓', tradIcon: '—' },
              { feature: 'Failed Attempt Cost', flash: '~$0.0001', trad: 'N/A', flashIcon: '✓', tradIcon: '—' },
            ].map((c) => (
              <div key={c.feature} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                background: 'white', borderRadius: 14, padding: '14px 20px',
                border: '1px solid var(--border)', alignItems: 'center',
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{c.feature}</span>
                <span style={{ color: '#29C1A2', fontWeight: 700, fontSize: '0.88rem' }}>
                  <span style={{ marginRight: 6 }}>{c.flashIcon}</span>{c.flash}
                </span>
                <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>
                  <span style={{ marginRight: 6 }}>{c.tradIcon}</span>{c.trad}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Why Solana ═══ */}
      <section style={{ padding: '48px 0 64px' }}>
        <div className="mx">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 10 }}>Why Solana?</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', maxWidth: 480, margin: '0 auto' }}>
              Solana's architecture makes it the ideal chain for flash loans.
            </p>
          </div>

          <div className="grid-3" style={{ gap: 16 }}>
            {[
              { title: 'Sub-Second Finality', desc: 'Transactions confirm in under a second. Flash loans execute and finalize almost instantly.', color: '#29C1A2' },
              { title: 'Near-Zero Fees', desc: 'Network fees of ~$0.0001. Failed flash loans cost virtually nothing — experiment freely.', color: '#FF9060' },
              { title: 'Atomic by Design', desc: 'Solana transactions are all-or-nothing. Perfect for the borrow → execute → repay pattern of flash loans.', color: '#823FFF' },
            ].map((f, i) => (
              <div key={f.title} className="fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <div style={{
                  background: `${f.color}06`, borderRadius: 20, padding: '28px 24px',
                  border: `1.5px solid ${f.color}18`, height: '100%', textAlign: 'center',
                }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: 12,
                    background: f.color, margin: '0 auto 16px', opacity: 0.7,
                  }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ padding: '64px 0 80px' }}>
        <div className="mx" style={{ maxWidth: 560, textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)', fontWeight: 900, marginBottom: 12 }}>Ready to Build?</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 24 }}>
            VAEA Flash supports {27}+ tokens on Solana with SDKs in TypeScript, Rust, and Python.
            Integrate flash loans in under 5 minutes.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/flash/docs" className="btn btn-dark">Read the Docs</Link>
            <Link href="/flash" className="btn btn-ghost">Explore Dashboard →</Link>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer style={{ padding: '28px 0', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="mx" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-3)', fontSize: '0.78rem', fontWeight: 500 }}>© 2026 VAEA Protocol</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'Docs', href: '/flash/docs' },
              { label: 'Dashboard', href: '/flash' },
              { label: 'Tools', href: '/flash/tools' },
              { label: 'GitHub', href: 'https://github.com/vaea-protocol/vaea-flash' },
            ].map(l => (
              <a key={l.label} href={l.href} style={{ color: 'var(--text-3)', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 500 }}>{l.label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
