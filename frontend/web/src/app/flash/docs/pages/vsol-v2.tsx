import { Code } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function VsolV2() {
  return (<>
    <div style={{ display: 'inline-flex', padding: '5px 14px', borderRadius: 'var(--r-full)', background: '#823FFF10', color: '#823FFF', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
      Coming Soon
    </div>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>vSOL — Unlimited Flash Loans</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>A fundamentally new approach to flash loans that eliminates congestion, removes dependence on third-party protocols, and enables <strong>unlimited borrowing capacity</strong> through a synthetic mint/burn mechanism.</p>

    <Callout type="warn">vSOL V2 is <strong>in development</strong> and will launch after the V1 beta is validated. This page describes the architecture and vision. The V1 flash loan system (30 tokens via protocol aggregation) is live and fully functional today.</Callout>

    <h2 id="vision" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Vision</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>VAEA Flash V1 aggregates liquidity from lending protocols (Marginfi, Kamino) to offer flash loans. <strong>V2 creates its own liquidity</strong> via vSOL — a liquid staking token (LST) that enables unlimited flash loans without any pool to drain.</p>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>This innovation will make VAEA the foundational flash loan infrastructure on Solana — not just an aggregator, but <strong>the source of liquidity itself</strong>.</p>

    <h2 id="problem" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>The Problem Today</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>During a market crash (SOL -30% in 5 minutes), thousands of liquidations need to happen simultaneously. With pool-based flash loans:</p>
    <Code code={`Market crash → thousands of liquidations needed simultaneously

With pool-based flash loans (current):
  Pool: 500,000 SOL

  Block N:
    Bot 1:  flash 50K → pool = 450K  ✅
    Bot 2:  flash 50K → pool = 400K  ✅
    ...
    Bot 10: flash 50K → pool = 0     ✅
    Bot 11: flash 50K → FAIL ❌ pool empty
    Bot 12-200 → ALL FAIL ❌

  Result:
    → Positions not liquidated = bad debt
    → Liquidators lose gas + Jito tips
    → Systemic risk for all Solana DeFi`} lang="text" />

    <h2 id="solution" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>How vSOL Works</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>vSOL operates on <strong>two independent layers</strong>:</p>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '20px 22px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--emerald)', marginBottom: 8 }}>Layer 1 — Real vSOL (LST)</div>
        <ul style={{ fontSize: '0.82rem', lineHeight: 1.8, paddingLeft: 18, color: 'var(--text-2)', margin: 0 }}>
          <li>SOL deposited by holders → staked via validators</li>
          <li>vSOL = SPL token, yield-bearing (~7% APY + flash fees)</li>
          <li>Listed on Jupiter, composable with all DeFi</li>
          <li>Usable as collateral (Marginfi, Kamino)</li>
          <li><strong>Never affected</strong> by synthetic mints</li>
        </ul>
      </div>
      <div style={{ background: 'white', borderRadius: 20, padding: '20px 22px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#823FFF', marginBottom: 8 }}>Layer 2 — Synthetic vSOL (Flash)</div>
        <ul style={{ fontSize: '0.82rem', lineHeight: 1.8, paddingLeft: 18, color: 'var(--text-2)', margin: 0 }}>
          <li>Minted during flash loan, burned at end of TX</li>
          <li>Exists for ~400ms max (1 Solana slot)</li>
          <li>Cannot leave the program — confined to the TX</li>
          <li>Net supply change = 0 → <strong>zero dilution</strong></li>
          <li>Cap: $100M per TX (anti-manipulation)</li>
          <li>Each TX independent → <strong>zero congestion</strong></li>
        </ul>
      </div>
    </div>

    <h2 id="congestion" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Zero Congestion</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>This is the <strong>killer feature</strong>. With mint/burn, every transaction creates its own tokens — no shared pool to drain:</p>
    <Code code={`With vSOL mint/burn — same crash scenario:

  Block N:
    Bot 1:   mint 50K vSOL → logic → burn → ✅
    Bot 2:   mint 50K vSOL → logic → burn → ✅
    Bot 3:   mint 50K vSOL → logic → burn → ✅
    ...
    Bot 200: mint 50K vSOL → logic → burn → ✅

  200 bots × 50K = 10M vSOL of flash loans in ONE BLOCK
  Zero contention. No pool to drain.
  Each TX mints its own tokens → completely independent.

  Result:
    → ALL liquidations succeed ✅
    → Zero bad debt ✅
    → Network stays stable ✅`} lang="text" />

    <h2 id="security" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Security Model</h2>
    <DocTable headers={['Protection', 'Mechanism', 'Purpose']} rows={[
      ['Introspection check', <><code>burn_flash</code> must exist in same TX</>, 'Guarantees repayment'],
      ['Same-slot enforcement', <><code>Clock::slot</code> verified at burn</>, 'Tokens cannot survive beyond 1 block'],
      ['Per-TX cap', '$100M maximum per transaction', 'Anti-manipulation'],
      ['Supply isolation', 'Synthetic mints don\u2019t affect real vSOL', 'No dilution for holders'],
      ['Program confinement', 'Tokens cannot be transferred outside VAEA', 'Cannot be sold on DEX'],
    ]} />

    <h2 id="roadmap" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Roadmap</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
      {[
        { phase: 'Phase 1', title: 'V1 Beta (Now)', desc: 'Flash loans via protocol aggregation — 30 tokens, 3 SDKs, live on devnet', done: true },
        { phase: 'Phase 2', title: 'vSOL LST Creation', desc: 'Create vSOL via Sanctum, pool on Orca/Meteora, Jupiter listing', done: false },
        { phase: 'Phase 3', title: 'Unlimited Flash Loans', desc: 'mint_for_flash / burn_flash program, SDK integration, migration V1 → V2', done: false },
      ].map(r => (
        <div key={r.phase} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'white', borderRadius: 16, padding: '14px 18px', border: '1px solid var(--border)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.done ? 'var(--emerald)' : '#823FFF40', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase' }}>{r.phase}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{r.title}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{r.desc}</div>
          </div>
        </div>
      ))}
    </div>

    <Callout type="info">vSOL V2 will be <strong>backwards compatible</strong>. The SDK API will stay the same — <code>executeLocal()</code> will automatically use the vSOL mint/burn path when available. No code changes needed for existing integrations.</Callout>
  </>);
}
