'use client';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import {
  SECTIONS, OVERVIEW_CONTENT, QUICKSTART, TOKENS_DIRECT, TOKENS_SYNTHETIC,
  API_ENDPOINTS, ERRORS, FAQ,
} from './content';

// ═══ Helper: Code block ═══
function Code({ code, lang }: { code: string; lang?: string }) {
  return (
    <div className="code-block" style={{ marginBottom: 24, position: 'relative' }}>
      {lang && (
        <div style={{ position: 'absolute', top: 12, right: 16, fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {lang}
        </div>
      )}
      <pre style={{ margin: 0 }}><code>{code}</code></pre>
    </div>
  );
}

// ═══ Helper: Callout ═══
function Callout({ type, children }: { type: 'info' | 'tip' | 'warn'; children: React.ReactNode }) {
  const cfg = { info: { bg: '#29C1A210', border: '#29C1A2', icon: 'ℹ️' }, tip: { bg: '#823FFF10', border: '#823FFF', icon: '💡' }, warn: { bg: '#FF718F10', border: '#FF718F', icon: '⚠️' } }[type];
  return (
    <div style={{ padding: '16px 20px', borderRadius: 14, background: cfg.bg, borderLeft: `3px solid ${cfg.border}`, marginBottom: 24, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7 }}>
      <span style={{ marginRight: 8 }}>{cfg.icon}</span>{children}
    </div>
  );
}

// ═══ Helper: Section title ═══
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8, marginTop: 40 }}>{children}</h2>;
}
function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8, marginTop: 28 }}>{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 16, fontSize: '0.92rem' }}>{children}</p>;
}

// ═══ Diagram: Architecture (SVG) ═══
function ArchDiagram() {
  const W = 700, H = 380;
  const box = (x: number, y: number, w: number, h: number, label: string, sub: string, color: string) => (
    <g key={label}>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={`${color}12`} stroke={color} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 - 6} textAnchor="middle" fill="var(--text)" fontWeight={800} fontSize={12} fontFamily="Outfit">{label}</text>
      <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle" fill="var(--text-3)" fontSize={9.5} fontFamily="Outfit">{sub}</text>
    </g>
  );
  const arrow = (x1: number, y1: number, x2: number, y2: number) => (
    <line key={`${x1}${y1}${x2}${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-3)" strokeWidth={1.2} markerEnd="url(#ah)" />
  );
  return (
    <div style={{ background: 'white', borderRadius: 'var(--r-lg)', padding: 24, border: '1px solid var(--border)', marginBottom: 24, overflow: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
        <defs><marker id="ah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="var(--text-3)" /></marker></defs>
        {box(240, 8, 220, 44, 'Your App / Bot', 'SDK TS · Rust · Python', '#29C1A2')}
        {arrow(350, 52, 350, 80)}
        {box(180, 80, 340, 100, 'VAEA Flash Backend', 'Route Calculator · Liquidity Scanner · Redis Cache', '#823FFF')}
        {arrow(350, 180, 350, 210)}
        {box(200, 210, 300, 44, 'VAEA On-Chain Program', 'begin_flash → your logic → end_flash', '#FF718F')}
        {arrow(270, 254, 160, 290)}
        {arrow(430, 254, 540, 290)}
        {box(40, 290, 240, 56, 'Direct Sources', 'Jupiter Lend · Marginfi · Kamino · Save', '#29C1A2')}
        {box(420, 290, 240, 56, 'Synthetic (via Swap)', 'Flash SOL → Sanctum / Jupiter → Token', '#FF9060')}
      </svg>
    </div>
  );
}

// ═══ Diagram: Transaction Flow (SVG) ═══
function TxFlowDiagram() {
  const steps = [
    { label: 'begin_flash()', sub: 'Register loan on-chain', color: '#29C1A2' },
    { label: 'Borrow from source', sub: 'Jupiter Lend / Marginfi / ...', color: '#8ECAE6' },
    { label: 'Your instructions', sub: 'Arb · Liquidation · Swap', color: '#FF9060' },
    { label: 'Repay to source', sub: 'Return borrowed amount', color: '#8ECAE6' },
    { label: 'end_flash()', sub: 'Verify repay + collect fee', color: '#823FFF' },
  ];
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'stretch', marginBottom: 28 }}>
      {steps.map((s, i) => (
        <div key={s.label} className="fade-in" style={{ flex: 1, animationDelay: `${i * 0.06}s` }}>
          <div style={{ background: `${s.color}15`, border: `1.5px solid ${s.color}`, borderRadius: 16, padding: '18px 14px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: s.color, marginBottom: 6, fontFamily: 'monospace' }}>{i + 1}</div>
            <div style={{ fontWeight: 800, fontSize: '0.78rem', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{s.sub}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.9rem', marginTop: 4 }}>→</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══ Fee Calculator ═══
function FeeCalc() {
  const [amount, setAmount] = useState(1000);
  const [route, setRoute] = useState<'direct' | 'synthetic'>('direct');
  const vaeFee = amount * 0.0003;
  const swapFee = route === 'synthetic' ? amount * 0.0006 : 0;
  const total = vaeFee + swapFee;
  const totalPct = route === 'direct' ? 0.03 : 0.09;
  return (
    <div style={{ background: 'white', borderRadius: 'var(--r-lg)', padding: 28, border: '1px solid var(--border)', marginBottom: 28 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: 14 }}>Fee Calculator</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Borrow Amount (SOL)</label>
          <input type="number" className="input-pill" value={amount} onChange={e => setAmount(Number(e.target.value) || 0)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Route Type</label>
          <div className="pill-nav" style={{ width: '100%' }}>
            <button className={route === 'direct' ? 'active' : ''} onClick={() => setRoute('direct')}>Direct</button>
            <button className={route === 'synthetic' ? 'active' : ''} onClick={() => setRoute('synthetic')}>Synthetic</button>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: 6 }}>VAEA Fee</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>{vaeFee.toFixed(2)}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--emerald)' }}>0.03%</div>
        </div>
        <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: 6 }}>Swap Fee</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>{swapFee.toFixed(2)}</div>
          <div style={{ fontSize: '0.72rem', color: route === 'synthetic' ? 'var(--orange)' : 'var(--text-3)' }}>{route === 'synthetic' ? '~0.06%' : '—'}</div>
        </div>
        <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: 6 }}>Total Cost</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text)' }}>{total.toFixed(2)}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--purple)' }}>{totalPct.toFixed(2)}%</div>
        </div>
      </div>
    </div>
  );
}

// ═══ Main Docs Page ═══
export default function DocsPage() {
  const [section, setSection] = useState('overview');
  const [lang, setLang] = useState<'typescript' | 'rust' | 'python'>('typescript');

  const groups = SECTIONS.reduce<Record<string, typeof SECTIONS>>((acc, s) => {
    (acc[s.group] = acc[s.group] || []).push(s);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="mx" style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: 48, paddingTop: 40, paddingBottom: 80 }}>

        {/* ═══ Sidebar ═══ */}
        <aside style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 18 }}>Documentation</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Object.entries(groups).map(([group, items]) => (
              <div key={group} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 14px', marginBottom: 4 }}>{group}</div>
                {items.map(s => (
                  <button key={s.id} onClick={() => setSection(s.id)} style={{
                    textAlign: 'left', padding: '8px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', width: '100%',
                    background: section === s.id ? 'white' : 'transparent',
                    color: section === s.id ? 'var(--text)' : 'var(--text-3)',
                    boxShadow: section === s.id ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {s.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          {/* SDK picker */}
          <div style={{ marginTop: 16, background: 'white', borderRadius: 16, padding: 14, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SDK Language</div>
            <div className="tabs" style={{ width: '100%' }}>
              {(['typescript', 'rust', 'python'] as const).map(l => (
                <button key={l} className={`tab ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)} style={{ flex: 1 }}>
                  {l === 'typescript' ? 'TS' : l === 'rust' ? 'Rust' : 'Py'}
                </button>
              ))}
            </div>
          </div>
          {/* Version */}
          <div style={{ marginTop: 14, textAlign: 'center', fontSize: '0.68rem', color: 'var(--text-3)' }}>
            v0.1.0 · Solana Mainnet
          </div>
        </aside>

        {/* ═══ Main Content ═══ */}
        <main className="fade-in" key={section}>

          {/* ─── OVERVIEW ─── */}
          {section === 'overview' && (<>
            <h1 style={{ fontSize: '2.6rem', marginBottom: 6 }}>VAEA Flash</h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--emerald)', fontWeight: 700, marginBottom: 20 }}>{OVERVIEW_CONTENT.tagline}</p>
            <P>{OVERVIEW_CONTENT.intro}</P>

            {/* Stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
              {OVERVIEW_CONTENT.stats.map(s => (
                <div key={s.label} style={{ background: 'white', borderRadius: 'var(--r)', padding: '18px 20px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 2 }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <SectionTitle>The Problem</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {OVERVIEW_CONTENT.whyExists.map(w => (
                <div key={w.problem} style={{ background: 'white', borderRadius: 'var(--r)', padding: '18px 20px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--coral)', fontWeight: 700, marginBottom: 6 }}>✗ {w.problem}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--emerald)', fontWeight: 700 }}>✓ {w.solution}</div>
                </div>
              ))}
            </div>

            <SectionTitle>Who is it for?</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {OVERVIEW_CONTENT.audiences.map(a => (
                <div key={a.title} style={{ background: 'white', borderRadius: 'var(--r)', padding: '20px 22px', border: '1px solid var(--border)', display: 'flex', gap: 14 }}>
                  <span style={{ fontSize: '1.5rem' }}>{a.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </>)}

          {/* ─── QUICK START ─── */}
          {section === 'quickstart' && (<>
            <h1 style={{ fontSize: '2.6rem', marginBottom: 6 }}>Quick Start</h1>
            <P>Flash loan any SPL token on Solana in under 5 minutes.</P>
            <Callout type="info">All code examples adapt to the SDK language selected in the sidebar.</Callout>

            <SectionTitle>1. Install the SDK</SectionTitle>
            <Code code={QUICKSTART.install[lang]} lang={lang} />

            <SectionTitle>2. Your First Flash Loan</SectionTitle>
            <P>The basic flow is always the same: initialize → execute → your logic runs inside the flash loan.</P>
            <Code code={QUICKSTART.firstLoan[lang]} lang={lang} />
            <Callout type="tip">The <code>onFunds</code> callback (TS) or <code>instructions</code> field (Rust) is where you put your arbitrage, liquidation, or swap logic. These instructions execute between begin_flash and end_flash.</Callout>

            <SectionTitle>3. How a Flash Loan Transaction Works</SectionTitle>
            <TxFlowDiagram />
            <P>All 5 steps happen in a single atomic Solana transaction. If any step fails, everything reverts — no risk of partial execution.</P>

            <SectionTitle>4. Advanced Configuration</SectionTitle>
            <Code code={QUICKSTART.advancedConfig[lang]} lang={lang} />
          </>)}

          {/* ─── ARCHITECTURE ─── */}
          {section === 'architecture' && (<>
            <h1 style={{ fontSize: '2.6rem', marginBottom: 6 }}>Architecture</h1>
            <P>VAEA Flash is a three-layer system: SDK → Backend API → On-chain program. It owns no liquidity — it routes to existing protocols.</P>
            <ArchDiagram />

            <SectionTitle>Components</SectionTitle>
            <table className="vtable">
              <thead><tr><th>Layer</th><th>Role</th><th>Technology</th></tr></thead>
              <tbody>
                {[
                  ['SDK', 'Developer-facing API: one-line flash loans', 'TypeScript · Rust · Python'],
                  ['Backend API', 'Route calculation, liquidity scanning, fee estimation', 'Rust + Tokio'],
                  ['On-chain Program', 'Enforce repayment via instruction introspection', 'Rust + Anchor'],
                  ['Cache Layer', 'Real-time route & capacity caching (2s TTL)', 'Redis'],
                  ['Data Layer', 'Live pool state from lending protocols', 'Helius RPC + gRPC'],
                ].map(([a, b, c]) => (
                  <tr key={a}><td style={{ fontWeight: 700 }}>{a}</td><td style={{ color: 'var(--text-2)' }}>{b}</td><td><span className="tag tag-default">{c}</span></td></tr>
                ))}
              </tbody>
            </table>

            <SectionTitle>Transaction Anatomy</SectionTitle>
            <TxFlowDiagram />
            <Callout type="info">The on-chain program uses Solana instruction introspection to verify that <code>end_flash</code> exists in the same transaction as <code>begin_flash</code>. This ensures repayment without holding funds in escrow.</Callout>

            <SectionTitle>Multi-Source Splitting</SectionTitle>
            <P>When a single protocol can't cover the full amount, VAEA automatically splits across multiple sources:</P>
            <Code code={`Example: Flash loan 200,000 USDC
  Jupiter Lend capacity: 150,000 USDC
  Marginfi capacity:      80,000 USDC

  → Single TX:
    [Jupiter.borrow(150K)]
    [Marginfi.borrow(50K)]
    [Your Logic]
    [Marginfi.repay(50K)]
    [Jupiter.repay(150K)]
    [VAEA.collectFee()]`} />
          </>)}

          {/* ─── ROUTING ─── */}
          {section === 'routing' && (<>
            <h1 style={{ fontSize: '2.6rem', marginBottom: 6 }}>Routing Logic</h1>
            <P>VAEA Flash supports two types of routes: Direct and Synthetic. The route is selected automatically based on token availability and cost.</P>

            <SectionTitle>Direct Route</SectionTitle>
            <P>The token is natively available as a flash loan from a lending protocol. Fastest and cheapest.</P>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              {['Protocol', '→', 'Token', '→', 'Your Wallet'].map((s, i) => (
                <div key={i} style={s === '→' ? { color: 'var(--text-3)', fontSize: '1.2rem' } : { background: '#29C1A215', border: '1.5px solid #29C1A2', borderRadius: 12, padding: '10px 18px', fontWeight: 700, fontSize: '0.85rem' }}>
                  {s}
                </div>
              ))}
            </div>
            <table className="vtable">
              <thead><tr><th>Token</th><th>Primary Source</th><th>Source Fee</th><th>Fallback Chain</th></tr></thead>
              <tbody>
                {TOKENS_DIRECT.map(t => (
                  <tr key={t.symbol}><td style={{ fontWeight: 700 }}>{t.symbol}</td><td>{t.source}</td><td><span className="tag tag-emerald">{t.fee}</span></td><td style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{t.fallback}</td></tr>
                ))}
              </tbody>
            </table>

            <SectionTitle>Synthetic Route</SectionTitle>
            <P>The token isn't available as a direct flash loan. VAEA borrows SOL, swaps it to the target token, delivers it to you, then swaps back on repayment.</P>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {['Flash SOL', '→', 'Swap via Sanctum/Jupiter', '→', 'Target Token', '→', 'Your Logic', '→', 'Swap Back', '→', 'Repay SOL'].map((s, i) => (
                <div key={i} style={s === '→' ? { color: 'var(--text-3)' } : { background: i === 4 ? '#FF906015' : '#8ECAE615', border: `1.5px solid ${i === 4 ? '#FF9060' : '#8ECAE6'}`, borderRadius: 10, padding: '8px 14px', fontWeight: 700, fontSize: '0.75rem' }}>
                  {s}
                </div>
              ))}
            </div>
            <table className="vtable">
              <thead><tr><th>Token</th><th>Swap Via</th><th>Est. Slippage</th><th>Total Fee</th></tr></thead>
              <tbody>
                {TOKENS_SYNTHETIC.map(t => (
                  <tr key={t.symbol}><td style={{ fontWeight: 700 }}>{t.symbol}</td><td>{t.swap}</td><td style={{ color: 'var(--text-2)' }}>{t.slippage}</td><td><span className="tag tag-purple">{t.totalFee}</span></td></tr>
                ))}
              </tbody>
            </table>
          </>)}

          {/* ─── FEES ─── */}
          {section === 'fees' && (<>
            <h1 style={{ fontSize: '2.6rem', marginBottom: 6 }}>Fee Model</h1>
            <P>VAEA Flash charges a transparent, predictable fee on top of the underlying protocol costs.</P>

            <SectionTitle>Fee Structure</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
              <div style={{ background: '#29C1A210', borderRadius: 'var(--r)', padding: 24, border: '1.5px solid #29C1A2' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#29C1A2', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Direct Route</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 4 }}>0.03%</div>
                <P>Source fee (0%) + VAEA fee (0.03%). That's it. No hidden costs.</P>
              </div>
              <div style={{ background: '#823FFF10', borderRadius: 'var(--r)', padding: 24, border: '1.5px solid #823FFF' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#823FFF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Synthetic Route</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 4 }}>~0.09%</div>
                <P>Source fee (0%) + swap round-trip (~0.06%) + VAEA fee (0.03%).</P>
              </div>
            </div>

            <Callout type="tip">Use <code>maxFeeBps</code> in your SDK calls to automatically reject transactions where the fee exceeds your threshold.</Callout>

            <SectionTitle>Interactive Calculator</SectionTitle>
            <FeeCalc />

            <SectionTitle>Fee Example: 10,000 mSOL (Synthetic)</SectionTitle>
            <Code code={`Borrow: 10,000 mSOL via synthetic route
  SOL needed:         ~10,050 SOL (at current mSOL/SOL rate)
  Source fee (Jupiter): 0%      =  0 SOL
  Swap SOL → mSOL:    ~0.03%  =  ~3 SOL
  Swap mSOL → SOL:    ~0.03%  =  ~3 SOL
  VAEA fee:            0.03%  =  ~3 SOL
  ─────────────────────────────────────
  Total cost:          ~9 SOL  (~0.09% of notional)`} />
          </>)}

          {/* ─── API REFERENCE ─── */}
          {section === 'api' && (<>
            <h1 style={{ fontSize: '2.6rem', marginBottom: 6 }}>REST API</h1>
            <P>Base URL: <code>https://api.vaea.fi</code>. All endpoints return JSON. No authentication required.</P>
            <Callout type="info">If you're using the SDK, you don't need to call the API directly — the SDK handles everything. Use the API for custom integrations or monitoring.</Callout>

            {API_ENDPOINTS.map(ep => (
              <div key={ep.path} style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span className={`tag ${ep.method === 'GET' ? 'tag-emerald' : 'tag-orange'}`} style={{ fontFamily: 'monospace', fontWeight: 900 }}>{ep.method}</span>
                  <code style={{ fontWeight: 800, fontSize: '1rem' }}>{ep.path}</code>
                </div>
                <P>{ep.desc}</P>
                {ep.params.length > 0 && (
                  <table className="vtable" style={{ marginBottom: 14 }}>
                    <thead><tr><th>Parameter</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
                    <tbody>
                      {ep.params.map(p => (
                        <tr key={p.name}><td><code style={{ fontWeight: 700 }}>{p.name}</code></td><td style={{ color: 'var(--text-2)' }}>{p.type}</td><td>{p.required ? <span className="tag tag-emerald">Yes</span> : <span className="tag tag-default">No</span>}</td><td style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{p.desc}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <SubTitle>Response</SubTitle>
                <Code code={ep.response} lang="json" />
              </div>
            ))}
          </>)}

          {/* ─── SDK ─── */}
          {section === 'sdk' && (<>
            <h1 style={{ fontSize: '2.6rem', marginBottom: 6 }}>SDK Reference</h1>
            <P>VAEA Flash SDKs are available in TypeScript, Rust, and Python. All SDKs share the same API design and feature set.</P>

            <SectionTitle>Initialization</SectionTitle>
            <Code code={QUICKSTART.firstLoan[lang].split('\n').slice(0, lang === 'python' ? 5 : 6).join('\n')} lang={lang} />

            <SectionTitle>Core Methods</SectionTitle>
            <table className="vtable">
              <thead><tr><th>Method</th><th>Description</th><th>Returns</th></tr></thead>
              <tbody>
                {[
                  ['execute() / borrow()', 'Execute a flash loan with your instructions', 'Transaction signature'],
                  ['getQuote() / get_quote()', 'Get fee breakdown before executing', 'Quote object with fee details'],
                  ['getCapacity() / get_capacity()', 'Check real-time borrowing limits', 'Array of token capacities'],
                  ['getHealth() / get_health()', 'System health and protocol status', 'Health status object'],
                ].map(([m, d, r]) => (
                  <tr key={m}><td><code style={{ fontWeight: 700, fontSize: '0.78rem' }}>{m}</code></td><td style={{ color: 'var(--text-2)' }}>{d}</td><td style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>{r}</td></tr>
                ))}
              </tbody>
            </table>

            <SectionTitle>Configuration Options</SectionTitle>
            <table className="vtable">
              <thead><tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                {[
                  ['apiUrl', 'string', 'https://api.vaea.fi', 'VAEA Flash API endpoint'],
                  ['source', 'string', '"sdk"', 'Source identifier for analytics'],
                  ['maxFeeBps', 'number', '50', 'Max fee in basis points (auto-reject above)'],
                  ['slippageBps', 'number', '100', 'Swap slippage tolerance for synthetic routes'],
                  ['priorityFee', 'number', '0', 'Solana priority fee in microlamports'],
                  ['simulate', 'boolean', 'false', 'Simulate tx before sending (debug)'],
                ].map(([o, t, d, desc]) => (
                  <tr key={o}><td><code style={{ fontWeight: 700 }}>{o}</code></td><td style={{ color: 'var(--text-2)' }}>{t}</td><td><code style={{ color: 'var(--text-3)' }}>{d}</code></td><td style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{desc}</td></tr>
                ))}
              </tbody>
            </table>
          </>)}

          {/* ─── USE CASES ─── */}
          {section === 'usecases' && (<>
            <h1 style={{ fontSize: '2.6rem', marginBottom: 6 }}>Use Cases</h1>
            <P>Production patterns for VAEA Flash. Each example includes the flow and code snippet.</P>

            {[
              { title: '🤖 Liquidation Bot', color: '#FF718F', desc: 'Flash loan the collateral token, liquidate the underwater position, keep the liquidation bonus.', flow: 'Flash mSOL → Liquidate Marginfi position → Receive collateral → Swap to SOL → Repay flash', code: { typescript: `const sig = await flash.execute({
  token: 'mSOL', amount: 5000,
  onFunds: async (ixs) => {
    // Liquidate the underwater position
    ixs.push(marginfiLiquidateIx);
    // The liquidation bonus covers the flash fee
    return ixs;
  },
  maxFeeBps: 15,
});`, rust: `let sig = flash.execute(BorrowParams {
    token: "mSOL".into(),
    amount: 5000.0,
    instructions: vec![marginfi_liquidate_ix],
    max_fee_bps: Some(15),
    ..Default::default()
}).await?;`, python: `result = await flash.borrow(
    token="mSOL", amount=5000,
    user_pubkey=str(wallet.pubkey()),
    user_instructions=[marginfi_liquidate_ix],
)` } },
              { title: '📊 LST Arbitrage', color: '#29C1A2', desc: 'Exploit price discrepancies between LST exchange rates. Flash SOL, swap to discounted LST, redeem for more SOL.', flow: 'Flash SOL → Swap via Sanctum (discount) → Unstake LST → Profit', code: { typescript: `const sig = await flash.execute({
  token: 'SOL', amount: 10000,
  onFunds: async (ixs) => {
    ixs.push(swapSolToDiscountedJitoSol);
    ixs.push(redeemJitoSolForSol);
    return ixs;
  },
  maxFeeBps: 5,
});`, rust: `let sig = flash.execute(BorrowParams {
    token: "SOL".into(),
    amount: 10000.0,
    instructions: vec![swap_ix, redeem_ix],
    max_fee_bps: Some(5),
    ..Default::default()
}).await?;`, python: `result = await flash.borrow(
    token="SOL", amount=10000,
    user_pubkey=str(wallet.pubkey()),
    user_instructions=[swap_ix, redeem_ix],
)` } },
              { title: '🔄 Collateral Swap', color: '#FF9060', desc: 'Change your lending collateral without closing your position. Zero liquidation risk during the swap.', flow: 'Flash token B → Deposit B as collateral → Withdraw token A → Swap A → Repay flash', code: { typescript: `const sig = await flash.execute({
  token: 'JitoSOL', amount: 1000,
  onFunds: async (ixs) => {
    ixs.push(depositJitoSolAsCollateral);
    ixs.push(withdrawSolCollateral);
    ixs.push(swapSolToJitoSol);
    return ixs;
  },
});`, rust: `let sig = flash.execute(BorrowParams {
    token: "JitoSOL".into(),
    amount: 1000.0,
    instructions: vec![deposit_ix, withdraw_ix, swap_ix],
    ..Default::default()
}).await?;`, python: `result = await flash.borrow(
    token="JitoSOL", amount=1000,
    user_pubkey=str(wallet.pubkey()),
    user_instructions=[deposit_ix, withdraw_ix, swap_ix],
)` } },
            ].map(uc => (
              <div key={uc.title} style={{ marginBottom: 36 }}>
                <SubTitle>{uc.title}</SubTitle>
                <P>{uc.desc}</P>
                <div style={{ background: `${uc.color}10`, borderRadius: 'var(--r)', padding: '14px 20px', marginBottom: 14, borderLeft: `3px solid ${uc.color}` }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: uc.color, textTransform: 'uppercase', marginBottom: 6 }}>Flow</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{uc.flow}</div>
                </div>
                <Code code={uc.code[lang]} lang={lang} />
              </div>
            ))}
          </>)}

          {/* ─── ERRORS ─── */}
          {section === 'errors' && (<>
            <h1 style={{ fontSize: '2.6rem', marginBottom: 6 }}>Error Codes</h1>
            <P>All errors returned by the VAEA Flash SDK and API.</P>
            {ERRORS.map(e => (
              <div key={e.code} style={{ background: 'white', borderRadius: 'var(--r)', padding: '20px 24px', border: '1px solid var(--border)', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <code style={{ fontWeight: 900, color: 'var(--coral)', fontSize: '0.82rem' }}>{e.code}</code>
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-2)', marginBottom: 8, lineHeight: 1.6 }}>{e.desc}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--emerald)', fontWeight: 600 }}>💡 {e.fix}</div>
              </div>
            ))}
          </>)}

          {/* ─── FAQ ─── */}
          {section === 'faq' && (<>
            <h1 style={{ fontSize: '2.6rem', marginBottom: 6 }}>FAQ</h1>
            <P>Frequently asked questions about VAEA Flash.</P>
            {FAQ.map((f, i) => (
              <details key={i} style={{ background: 'white', borderRadius: 'var(--r)', border: '1px solid var(--border)', marginBottom: 10, overflow: 'hidden' }}>
                <summary style={{ padding: '18px 24px', cursor: 'pointer', fontWeight: 800, fontSize: '0.92rem' }}>{f.q}</summary>
                <div style={{ padding: '0 24px 20px', color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.75 }}>{f.a}</div>
              </details>
            ))}
          </>)}

        </main>
      </div>
    </div>
  );
}
