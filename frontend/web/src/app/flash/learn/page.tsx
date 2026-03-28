'use client';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

const STEPS = [
  { n: '1', title: 'Borrow', desc: 'You request any amount of any token — SOL, USDC, JitoSOL, mSOL, BONK... No collateral needed.', color: '#29C1A2' },
  { n: '2', title: 'Use', desc: 'Your logic executes: arbitrage between DEXs, liquidate underwater positions, swap collateral, loop leverage.', color: '#FF9060' },
  { n: '3', title: 'Repay', desc: 'Return the borrowed amount + a tiny fee (0.03%). If repayment fails, everything reverts. You lose nothing.', color: '#823FFF' },
];

const USE_CASES = [
  { icon: '📊', title: 'Arbitrage', desc: 'Spot a price difference between two DEXs? Flash loan the capital, execute both sides, pocket the profit. Zero risk, zero capital.', color: '#29C1A2' },
  { icon: '🛡', title: 'Self-Liquidation', desc: 'Your lending position is about to get liquidated with a 10% penalty? Flash loan to self-liquidate and save thousands.', color: '#FF718F' },
  { icon: '🔄', title: 'Collateral Swap', desc: 'Want to switch your collateral from SOL to JitoSOL? One atomic transaction — no position closing needed.', color: '#FF9060' },
  { icon: '📈', title: 'Leverage Looping', desc: 'Create 3-5x leveraged positions in one transaction instead of manually looping deposit→borrow→deposit.', color: '#823FFF' },
  { icon: '🤖', title: 'Liquidation Bots', desc: 'Flash loan the required token to liquidate undercollateralized positions. Keep the bonus, repay the loan.', color: '#8ECAE6' },
  { icon: '💱', title: 'DEX Rebalancing', desc: 'Protocols use flash loans to rebalance liquidity pools, oracle updates, and internal accounting.', color: '#29C1A2' },
];

const COMPARISONS = [
  { feature: 'Collateral Required', flash: 'None', traditional: '100-150%' },
  { feature: 'Duration', flash: 'Same transaction (instant)', traditional: 'Days to months' },
  { feature: 'Risk of Loss', flash: 'Zero — reverts if fails', traditional: 'Full capital at risk' },
  { feature: 'Capital Needed', flash: '$0', traditional: 'Full loan amount' },
  { feature: 'Use Case', flash: 'Arbitrage, liquidation, swaps', traditional: 'Trading, holding' },
  { feature: 'Access', flash: 'Anyone (permissionless)', traditional: 'KYC/credit check' },
];

export default function LearnPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="mx" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 800 }}>

        {/* Hero */}
        <div className="fade-in">
          <div className="tag tag-emerald" style={{ marginBottom: 16 }}>Learn</div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3rem)', marginBottom: 14, lineHeight: 1.15 }}>
            What Is a Flash Loan?
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 32, maxWidth: 620 }}>
            A flash loan lets you borrow <strong style={{ color: 'var(--text)' }}>any amount of any token</strong> with 
            <strong style={{ color: 'var(--text)' }}> zero collateral</strong> — as long as you repay it within the same transaction. 
            If you don&apos;t repay, the entire transaction reverts as if nothing happened.
          </p>
        </div>

        {/* How it works */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
          How Flash Loans Work
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', lineHeight: 1.8, marginBottom: 24 }}>
          On Solana, a flash loan happens inside a single <strong>atomic transaction</strong>. 
          &quot;Atomic&quot; means it either succeeds completely or fails completely — there is no in-between state.
          The entire borrow-use-repay cycle executes inside a <strong>single atomic transaction</strong>.
        </p>

        <div className="grid-3" style={{ gap: 14, marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} className="fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div style={{ background: `${s.color}08`, border: `1.5px solid ${s.color}25`, borderRadius: 20, padding: '24px 22px', height: '100%' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: `${s.color}30`, marginBottom: 8 }}>{s.n}</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 8 }}>{s.title}</div>
                <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* The key insight */}
        <div style={{ background: '#29C1A208', borderRadius: 20, padding: '24px 28px', borderLeft: '3px solid #29C1A2', marginBottom: 40 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#29C1A2', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>💡 Key Insight</div>
          <p style={{ color: 'var(--text)', fontSize: '0.95rem', lineHeight: 1.8 }}>
            Flash loans are <strong>risk-free for the borrower</strong>. If your arbitrage doesn&apos;t work out, 
            if the price moved, if anything goes wrong — the transaction simply reverts. You only pay the network 
            fee (~$0.0001 on Solana). The borrowed tokens are never actually &quot;at risk&quot;.
          </p>
        </div>

        {/* Use cases */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
          What Can You Do With Flash Loans?
        </h2>
        <div className="grid-2" style={{ gap: 14, marginBottom: 40 }}>
          {USE_CASES.map(uc => (
            <div key={uc.title} style={{ background: 'white', borderRadius: 20, padding: '22px 24px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: '1.3rem' }}>{uc.icon}</span>
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{uc.title}</span>
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.7 }}>{uc.desc}</p>
            </div>
          ))}
        </div>

        {/* Comparison */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
          Flash Loans vs Traditional Loans
        </h2>
        <div className="vtable-wrap">
        <table className="vtable" style={{ marginBottom: 40 }}>
          <thead>
            <tr><th></th><th style={{ color: '#29C1A2' }}>⚡ Flash Loan</th><th>Traditional Loan</th></tr>
          </thead>
          <tbody>
            {COMPARISONS.map(c => (
              <tr key={c.feature}>
                <td style={{ fontWeight: 700 }}>{c.feature}</td>
                <td style={{ color: '#29C1A2', fontWeight: 600 }}>{c.flash}</td>
                <td style={{ color: 'var(--text-2)' }}>{c.traditional}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Why Solana */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
          Why Solana Is Ideal for Flash Loans
        </h2>
        <div className="grid-3" style={{ gap: 14, marginBottom: 40 }}>
          {[
            { title: 'Sub-Second Blocks', desc: 'Solana processes blocks faster than any other chain — your flash loan confirms almost instantly.', icon: '⚡' },
            { title: '$0.0001 Fees', desc: 'Transaction fees are negligible. Failed flash loans cost virtually nothing.', icon: '💰' },
            { title: 'Atomic Transactions', desc: 'Solana transactions are all-or-nothing by design — perfect for flash loan safety.', icon: '🔗' },
          ].map(f => (
            <div key={f.title} style={{ background: 'white', borderRadius: 20, padding: '22px 20px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 6 }}>{f.title}</div>
              <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: 'white', borderRadius: 24, padding: '36px 40px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8 }}>Ready to Try Flash Loans?</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', marginBottom: 20 }}>
            VAEA Flash supports 27+ tokens on Solana. Start with our SDK in under 5 minutes.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/flash/docs" className="btn btn-dark">Read the Docs</Link>
            <Link href="/flash" className="btn btn-ghost">Explore Tokens →</Link>
          </div>
        </div>
      </div>

      {/* Footer */}
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
