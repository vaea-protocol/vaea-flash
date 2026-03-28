'use client';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import {
  SECTIONS, OVERVIEW_CONTENT, QUICKSTART, TOKENS_DIRECT, TOKENS_SYNTHETIC,
  API_ENDPOINTS, ERRORS, FAQ,
  TURBO_MODE, SIMULATE, MULTI_FLASH, PROFITABILITY, SMART_RETRY,
  JITO_BUNDLES,
} from './content';

/* ═══════════════════════════════════════════════
   Design System Components — Fumadocs/Mintlify inspired
   Charte: warm cream (#FEF4EF), Outfit, pastel accents
   ═══════════════════════════════════════════════ */

/* ── Code Block with copy ── */
function Code({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ position: 'relative', marginBottom: 20, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#1c1c1c', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{lang || 'code'}</span>
        <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, color: copied ? '#29C1A2' : 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '16px 20px', background: '#1a1a1a', overflowX: 'auto' }}>
        <code style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: '0.82rem', lineHeight: 1.7, color: '#e0e0e0' }}>{code}</code>
      </pre>
    </div>
  );
}

/* ── SDK Tabs — inline tabs above code ── */
function SdkTabs({ lang, setLang }: { lang: 'typescript' | 'rust' | 'python'; setLang: (l: 'typescript' | 'rust' | 'python') => void }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginBottom: 0, background: '#1c1c1c', borderRadius: '16px 16px 0 0', padding: '4px 6px', border: '1px solid rgba(0,0,0,0.06)', borderBottom: 'none' }}>
      {([['typescript', 'TypeScript'], ['rust', 'Rust'], ['python', 'Python']] as const).map(([k, label]) => (
        <button key={k} onClick={() => setLang(k)} style={{
          padding: '7px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
          fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif',
          background: lang === k ? 'rgba(255,255,255,0.1)' : 'transparent',
          color: lang === k ? '#fff' : 'rgba(255,255,255,0.35)',
          transition: 'all 0.2s',
        }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function SdkCode({ code, lang, setLang }: { code: Record<string, string>; lang: 'typescript' | 'rust' | 'python'; setLang: (l: 'typescript' | 'rust' | 'python') => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code[lang]); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1c1c1c', borderRadius: '16px 16px 0 0', padding: '4px 6px 4px 6px', border: '1px solid rgba(0,0,0,0.06)', borderBottom: 'none' }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {([['typescript', 'TypeScript'], ['rust', 'Rust'], ['python', 'Python']] as const).map(([k, label]) => (
            <button key={k} onClick={() => setLang(k)} style={{
              padding: '7px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif',
              background: lang === k ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: lang === k ? '#fff' : 'rgba(255,255,255,0.35)',
              transition: 'all 0.2s',
            }}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, color: copied ? '#29C1A2' : 'rgba(255,255,255,0.4)', padding: '0 10px' }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '16px 20px', background: '#1a1a1a', borderRadius: '0 0 16px 16px', overflowX: 'auto', border: '1px solid rgba(0,0,0,0.06)', borderTop: 'none' }}>
        <code style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: '0.82rem', lineHeight: 1.7, color: '#e0e0e0' }}>{code[lang]}</code>
      </pre>
    </div>
  );
}

/* ── Callouts — Fumadocs-style with icons ── */
function Callout({ type, children }: { type: 'info' | 'tip' | 'warn'; children: React.ReactNode }) {
  const cfg = {
    info: { bg: '#29C1A208', border: '#29C1A2', icon: 'ℹ️', label: 'Note' },
    tip: { bg: '#823FFF08', border: '#823FFF', icon: '💡', label: 'Tip' },
    warn: { bg: '#FF718F08', border: '#FF718F', icon: '⚠️', label: 'Warning' },
  }[type];
  return (
    <div style={{ padding: '16px 20px', borderRadius: 14, background: cfg.bg, borderLeft: `3px solid ${cfg.border}`, marginBottom: 20, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7 }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: cfg.border, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {cfg.icon} {cfg.label}
      </div>
      {children}
    </div>
  );
}

/* ── Typography ── */
function H1({ children }: { children: React.ReactNode }) {
  return <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em', lineHeight: 1.15 }}>{children}</h1>;
}
function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return <h2 id={id} style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, letterSpacing: '-0.02em', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 8, marginTop: 24 }}>{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>{children}</p>;
}

/* ── Architecture Diagram — cleaner ── */
function ArchDiagram() {
  const layers = [
    { label: 'Your App / Bot', sub: 'SDK: TypeScript · Rust · Python', color: '#29C1A2', icon: '🔧' },
    { label: 'VAEA Flash API', sub: 'Route Calculator · Liquidity Scanner · Cache', color: '#823FFF', icon: '⚡' },
    { label: 'On-Chain Program', sub: 'begin_flash → your logic → end_flash', color: '#FF718F', icon: '🔗' },
  ];
  const sources = [
    { label: 'Direct Sources', sub: 'Jupiter Lend · Marginfi · Kamino', color: '#29C1A2' },
    { label: 'Synthetic (via Swap)', sub: 'Sanctum · Jupiter DEX', color: '#FF9060' },
  ];
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'center' }}>
        {layers.map((l, i) => (
          <div key={l.label}>
            <div style={{ background: `${l.color}08`, border: `1.5px solid ${l.color}30`, borderRadius: 16, padding: '16px 32px', textAlign: 'center', minWidth: 360 }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 3 }}>{l.icon} {l.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{l.sub}</div>
            </div>
            {i < layers.length - 1 && <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.9rem', padding: '4px 0' }}>↓</div>}
          </div>
        ))}
        <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.9rem', padding: '4px 0' }}>↓</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 500 }}>
          {sources.map(s => (
            <div key={s.label} style={{ background: `${s.color}08`, border: `1.5px solid ${s.color}30`, borderRadius: 16, padding: '14px 18px', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Transaction Flow ── */
function TxFlow() {
  const steps = [
    { label: 'begin_flash()', color: '#29C1A2' },
    { label: 'Borrow', color: '#8ECAE6' },
    { label: 'Your Logic', color: '#FF9060' },
    { label: 'Repay', color: '#8ECAE6' },
    { label: 'end_flash()', color: '#823FFF' },
  ];
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ flex: 1, background: `${s.color}12`, border: `1.5px solid ${s.color}40`, borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.55rem', fontWeight: 900, color: s.color, marginBottom: 3 }}>{i + 1}</div>
            <div style={{ fontWeight: 700, fontSize: '0.72rem', fontFamily: "'SF Mono', monospace" }}>{s.label}</div>
          </div>
          {i < steps.length - 1 && <span style={{ color: 'var(--text-3)', fontSize: '0.7rem', flexShrink: 0 }}>→</span>}
        </div>
      ))}
    </div>
  );
}

/* ── Fee Calculator ── */
function FeeCalc() {
  const [amount, setAmount] = useState(1000);
  const [route, setRoute] = useState<'direct' | 'synthetic'>('direct');
  const vaeFee = amount * 0.0003;
  const swapFee = route === 'synthetic' ? amount * 0.0006 : 0;
  const total = vaeFee + swapFee;
  const totalPct = route === 'direct' ? 0.03 : 0.09;
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid var(--border)', marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Borrow Amount (SOL)</label>
          <input type="number" className="input-pill" value={amount} onChange={e => setAmount(Number(e.target.value) || 0)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Route Type</label>
          <div className="pill-nav" style={{ width: '100%' }}>
            <button className={route === 'direct' ? 'active' : ''} onClick={() => setRoute('direct')}>Direct</button>
            <button className={route === 'synthetic' ? 'active' : ''} onClick={() => setRoute('synthetic')}>Synthetic</button>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {[
          { label: 'VAEA Fee', value: vaeFee.toFixed(2), pct: '0.03%', color: 'var(--emerald)' },
          { label: 'Swap Fee', value: swapFee.toFixed(2), pct: route === 'synthetic' ? '~0.06%' : '—', color: route === 'synthetic' ? 'var(--orange)' : 'var(--text-3)' },
          { label: 'Total Cost', value: total.toFixed(2), pct: `${totalPct.toFixed(2)}%`, color: 'var(--purple)' },
        ].map(f => (
          <div key={f.label} style={{ background: 'var(--bg)', borderRadius: 16, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: 6 }}>{f.label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>{f.value}</div>
            <div style={{ fontSize: '0.72rem', color: f.color, fontWeight: 600 }}>{f.pct}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SIDEBAR CONFIG — restructured with clear hierarchy
   ═══════════════════════════════════════════════ */
const NAV = [
  { group: 'Getting Started', items: [
    { id: 'overview', label: 'Introduction', icon: '📖' },
    { id: 'quickstart', label: 'Quick Start', icon: '🚀' },
  ]},
  { group: 'Core Concepts', items: [
    { id: 'architecture', label: 'How It Works', icon: '⚙️' },
    { id: 'routing', label: 'Routing & Tokens', icon: '🔀' },
    { id: 'fees', label: 'Fees & Pricing', icon: '💰' },
  ]},
  { group: 'Developer Reference', items: [
    { id: 'api', label: 'REST API', icon: '🌐' },
    { id: 'sdk', label: 'SDK Methods', icon: '📦' },
    { id: 'usecases', label: 'Code Examples', icon: '💡' },
    { id: 'errors', label: 'Error Handling', icon: '🔴' },
  ]},
  { group: 'Help', items: [
    { id: 'faq', label: 'FAQ', icon: '❓' },
  ]},
];

/* ═══════════════════════════════════════════════
   MAIN DOC PAGE
   ═══════════════════════════════════════════════ */
export default function DocsPage() {
  const [section, setSection] = useState('overview');
  const [lang, setLang] = useState<'typescript' | 'rust' | 'python'>('typescript');

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="mx grid-sidebar" style={{ gap: 40, paddingTop: 32, paddingBottom: 80 }}>

        {/* ═══ Sidebar ═══ */}
        <aside className="desktop-only" style={{ position: 'sticky', top: 72, height: 'fit-content', maxHeight: 'calc(100vh - 90px)', overflowY: 'auto', flexDirection: 'column' }}>
          {NAV.map(g => (
            <div key={g.group} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 12px', marginBottom: 6 }}>
                {g.group}
              </div>
              {g.items.map(item => (
                <button key={item.id} onClick={() => setSection(item.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  fontSize: '0.84rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif',
                  background: section === item.id ? 'white' : 'transparent',
                  color: section === item.id ? 'var(--text)' : 'var(--text-2)',
                  boxShadow: section === item.id ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s var(--ease)',
                }}>
                  <span style={{ fontSize: '0.85rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}

          {/* Version badge */}
          <div style={{ marginTop: 12, padding: '10px 12px', background: 'white', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-3)' }}>v0.1.0 · Solana Mainnet</div>
          </div>
        </aside>

        {/* ═══ Mobile Section Selector ═══ */}
        <div className="mobile-only" style={{ marginBottom: 20, flexDirection: 'column' }}>
          <select
            value={section}
            onChange={e => setSection(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 16,
              border: '1.5px solid var(--border)', background: 'white',
              fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 700,
              color: 'var(--text)', outline: 'none', cursor: 'pointer',
              appearance: 'auto',
            }}
          >
            {NAV.map(g => g.items.map(item => (
              <option key={item.id} value={item.id}>{g.group} — {item.label}</option>
            )))}
          </select>
        </div>

        {/* ═══ Content ═══ */}
        <main className="fade-in" key={section} style={{ maxWidth: 720, minWidth: 0 }}>

          {/* ─── OVERVIEW ─── */}
          {section === 'overview' && (<>
            <H1>Introduction</H1>
            <P>{OVERVIEW_CONTENT.intro}</P>

            <div className="grid-4" style={{ gap: 10, marginBottom: 32 }}>
              {OVERVIEW_CONTENT.stats.map(s => (
                <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: '16px 14px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{s.value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <H2>The Problem</H2>
            <div className="grid-2" style={{ gap: 10, marginBottom: 24 }}>
              {OVERVIEW_CONTENT.whyExists.map(w => (
                <div key={w.problem} style={{ background: 'white', borderRadius: 16, padding: '16px 18px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--coral)', fontWeight: 700, marginBottom: 6 }}>✗ {w.problem}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--emerald)', fontWeight: 700 }}>✓ {w.solution}</div>
                </div>
              ))}
            </div>

            <H2>Who Is It For?</H2>
            <div className="grid-2" style={{ gap: 12 }}>
              {OVERVIEW_CONTENT.audiences.map(a => (
                <div key={a.title} style={{ background: 'white', borderRadius: 16, padding: '18px 20px', border: '1px solid var(--border)', display: 'flex', gap: 14 }}>
                  <span style={{ fontSize: '1.4rem' }}>{a.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: 3, fontSize: '0.9rem' }}>{a.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </>)}

          {/* ─── QUICK START ─── */}
          {section === 'quickstart' && (<>
            <H1>Quick Start</H1>
            <P>Flash loan any SPL token on Solana in under 5 minutes.</P>
            <Callout type="info">All code examples adapt to the language selected below.</Callout>

            <H2>1. Install the SDK</H2>
            <SdkCode code={QUICKSTART.install} lang={lang} setLang={setLang} />

            <H2>2. Your First Flash Loan</H2>
            <P>Initialize the client and execute a flash loan — your logic runs inside the callback.</P>
            <SdkCode code={QUICKSTART.firstLoan} lang={lang} setLang={setLang} />
            <Callout type="tip">The <code>onFunds</code> callback (TS) or <code>instructions</code> field (Rust/Python) is where you put your arbitrage, liquidation, or swap logic.</Callout>

            <H2>3. Transaction Anatomy</H2>
            <TxFlow />
            <P>All 5 steps execute in a single atomic Solana transaction. If any step fails, everything reverts automatically.</P>

            <H2>4. Advanced Configuration</H2>
            <SdkCode code={QUICKSTART.advancedConfig} lang={lang} setLang={setLang} />
          </>)}

          {/* ─── ARCHITECTURE ─── */}
          {section === 'architecture' && (<>
            <H1>How It Works</H1>
            <P>VAEA Flash is a three-layer system: SDK → Backend API → On-chain program. It owns no liquidity — it routes to existing protocols.</P>
            <ArchDiagram />

            <H2>Components</H2>
            <table className="vtable">
              <thead><tr><th>Layer</th><th>Role</th><th>Stack</th></tr></thead>
              <tbody>
                {[
                  ['SDK', 'Developer-facing API: one-line flash loans', 'TypeScript · Rust · Python'],
                  ['Backend API', 'Route calculation, liquidity scanning, fee estimation', 'Rust + Tokio'],
                  ['On-chain Program', 'Enforce repayment via instruction introspection', 'Anchor (Rust)'],
                  ['Cache Layer', 'Real-time route & capacity caching (2s TTL)', 'Redis'],
                  ['Data Layer', 'Live pool state from lending protocols', 'Triton RPC'],
                ].map(([a, b, c]) => (
                  <tr key={a}><td style={{ fontWeight: 700 }}>{a}</td><td style={{ color: 'var(--text-2)' }}>{b}</td><td><span className="tag tag-default">{c}</span></td></tr>
                ))}
              </tbody>
            </table>

            <H2>Transaction Flow</H2>
            <TxFlow />
            <Callout type="info">The on-chain program uses Solana instruction introspection to verify that <code>end_flash</code> exists in the same transaction as <code>begin_flash</code>. This ensures repayment without escrow.</Callout>

            <H2>Multi-Source Splitting</H2>
            <P>When a single protocol can&apos;t cover the full amount, VAEA automatically splits across multiple sources:</P>
            <Code code={`Example: Flash loan 200,000 USDC\n  Jupiter Lend capacity: 150,000 USDC\n  Marginfi capacity:      80,000 USDC\n\n  → Single TX:\n    [Jupiter.borrow(150K)]\n    [Marginfi.borrow(50K)]\n    [Your Logic]\n    [Marginfi.repay(50K)]\n    [Jupiter.repay(150K)]\n    [VAEA.collectFee()]`} />
          </>)}

          {/* ─── ROUTING ─── */}
          {section === 'routing' && (<>
            <H1>Routing & Tokens</H1>
            <P>VAEA Flash supports two types of routes: <strong>Direct</strong> and <strong>Synthetic</strong>. The route is selected automatically based on token availability and cost.</P>

            <H2>Direct Route</H2>
            <P>The token is natively available as a flash loan from a lending protocol. Fastest and cheapest.</P>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {['Lending Protocol', '→', 'Token', '→', 'Your Wallet'].map((s, i) => (
                <div key={i} style={s === '→' ? { color: 'var(--text-3)', fontSize: '1rem' } : { background: '#29C1A210', border: '1.5px solid #29C1A230', borderRadius: 12, padding: '10px 18px', fontWeight: 700, fontSize: '0.82rem' }}>
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

            <H2>Synthetic Route</H2>
            <P>Token isn&apos;t available for direct flash loan. VAEA borrows SOL, swaps it via Sanctum or Jupiter, delivers the target token, then swaps back on repayment.</P>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              {['Flash SOL', '→', 'Swap', '→', 'Target Token', '→', 'Your Logic', '→', 'Swap Back', '→', 'Repay'].map((s, i) => (
                <div key={i} style={s === '→' ? { color: 'var(--text-3)', fontSize: '0.85rem' } : { background: `${i === 4 || i === 6 ? '#FF9060' : '#8ECAE6'}10`, border: `1.5px solid ${i === 4 || i === 6 ? '#FF9060' : '#8ECAE6'}30`, borderRadius: 10, padding: '8px 12px', fontWeight: 700, fontSize: '0.72rem' }}>
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
            <H1>Fees & Pricing</H1>
            <P>Transparent, predictable fees on top of underlying protocol costs.</P>

            <div className="grid-2" style={{ gap: 14, marginBottom: 28 }}>
              <div style={{ background: '#29C1A208', borderRadius: 20, padding: 24, border: '1.5px solid #29C1A230' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#29C1A2', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Direct Route</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 4 }}>0.03%</div>
                <P>Source fee (0%) + VAEA fee (0.03%). No hidden costs.</P>
              </div>
              <div style={{ background: '#823FFF08', borderRadius: 20, padding: 24, border: '1.5px solid #823FFF30' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#823FFF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Synthetic Route</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 4 }}>~0.09%</div>
                <P>Source (0%) + swap round-trip (~0.06%) + VAEA (0.03%).</P>
              </div>
            </div>

            <Callout type="tip">Use <code>maxFeeBps</code> in your SDK calls to automatically reject transactions where the fee exceeds your threshold.</Callout>

            <H2>Interactive Calculator</H2>
            <FeeCalc />

            <H2>Fee Breakdown Example</H2>
            <Code code={`Borrow: 10,000 mSOL via synthetic route\n  SOL needed:          ~10,050 SOL\n  Source fee (Jupiter):  0%     =  0 SOL\n  Swap SOL → mSOL:     ~0.03% =  ~3 SOL\n  Swap mSOL → SOL:     ~0.03% =  ~3 SOL\n  VAEA fee:             0.03% =  ~3 SOL\n  ─────────────────────────────────────\n  Total cost:           ~9 SOL (~0.09%)`} />
          </>)}

          {/* ─── TURBO MODE ─── */}
          {section === 'turbo' && (<>
            <H1>🚀 {TURBO_MODE.title}</H1>
            <P>{TURBO_MODE.tagline}</P>
            <P>{TURBO_MODE.description}</P>

            <H2>Latency Comparison</H2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: '0.88rem' }}>
              <thead><tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-3)' }}>SDK</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-3)' }}>Network Calls</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-3)' }}>Total Time</th>
              </tr></thead>
              <tbody>
                {TURBO_MODE.comparison.map(c => (
                  <tr key={c.sdk} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: c.sdk.includes('Turbo') ? 800 : 500, color: c.sdk.includes('Turbo') ? '#29C1A2' : 'inherit' }}>{c.sdk}</td>
                    <td style={{ padding: '10px 12px', fontFamily: "'SF Mono', monospace", fontSize: '0.82rem' }}>{c.calls}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{c.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <H2>Usage</H2>
            <Code code={TURBO_MODE.code} lang="typescript" />

            <Callout type="tip">Turbo Mode works <strong>offline</strong> — it doesn&apos;t depend on the VAEA API at all. Only the Solana RPC connection is needed to send the transaction.</Callout>
          </>)}

          {/* ─── SIMULATION ─── */}
          {section === 'simulate' && (<>
            <H1>🔬 {SIMULATE.title}</H1>
            <P>{SIMULATE.tagline}</P>
            <P>{SIMULATE.description}</P>
            <Code code={SIMULATE.code} lang="typescript" />
            <Callout type="info">Simulation uses <code>sigVerify: false</code> — you don&apos;t need to sign the transaction to simulate it.</Callout>
          </>)}

          {/* ─── MULTI-FLASH ─── */}
          {section === 'multiflash' && (<>
            <H1>⚡ {MULTI_FLASH.title}</H1>
            <P>{MULTI_FLASH.tagline}</P>
            <P>{MULTI_FLASH.description}</P>

            <H2>Transaction Pattern</H2>
            <div style={{ background: '#1a1a1a', borderRadius: 16, padding: '16px 20px', marginBottom: 20, fontFamily: "'SF Mono', monospace", fontSize: '0.82rem', color: '#e0e0e0', overflowX: 'auto' }}>
              {MULTI_FLASH.pattern}
            </div>

            <H2>Usage</H2>
            <Code code={MULTI_FLASH.code} lang="typescript" />
            <Callout type="tip">Each token gets its own PDA: <code>[&quot;flash&quot;, payer, token_mint]</code>. No collision between simultaneous loans.</Callout>
          </>)}

          {/* ─── PROFITABILITY ─── */}
          {section === 'profitability' && (<>
            <H1>📊 {PROFITABILITY.title}</H1>
            <P>{PROFITABILITY.tagline}</P>
            <P>{PROFITABILITY.description}</P>
            <Code code={PROFITABILITY.code} lang="typescript" />
            <H3>Recommendations</H3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'send', desc: 'Profit > 2× costs', color: '#29C1A2', icon: '✅' },
                { label: 'wait', desc: 'Marginal profit', color: '#FF9060', icon: '⏳' },
                { label: 'abort', desc: 'Unprofitable', color: '#FF718F', icon: '🚫' },
              ].map(r => (
                <div key={r.label} style={{ background: `${r.color}08`, border: `1.5px solid ${r.color}30`, borderRadius: 16, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{r.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: 4, fontFamily: "'SF Mono', monospace" }}>{r.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </>)}

          {/* ─── SMART RETRY ─── */}
          {section === 'retry' && (<>
            <H1>🔄 {SMART_RETRY.title}</H1>
            <P>{SMART_RETRY.tagline}</P>
            <P>{SMART_RETRY.description}</P>
            <Code code={SMART_RETRY.code} lang="typescript" />

            <H2>Error Classification</H2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: '0.88rem' }}>
              <thead><tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-3)' }}>Error Type</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-3)' }}>Action</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-3)' }}>Retried</th>
              </tr></thead>
              <tbody>
                {SMART_RETRY.errorClasses.map(e => (
                  <tr key={e.type} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{e.type}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-2)' }}>{e.action}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{e.retried ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Callout type="warn">Program errors (your logic bugs) are <strong>never retried</strong>. This prevents wasting SOL on transactions that will always fail.</Callout>
          </>)}

          {/* ─── JITO BUNDLES ─── */}
          {section === 'jito' && (<>
            <H1>🔗 {JITO_BUNDLES.title}</H1>
            <P>{JITO_BUNDLES.tagline}</P>
            <P>{JITO_BUNDLES.description}</P>
            <Code code={JITO_BUNDLES.code} lang="typescript" />

            <H2>Tip Strategies</H2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: '0.88rem' }}>
              <thead><tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-3)' }}>Strategy</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-3)' }}>Tip Amount</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-3)' }}>Use Case</th>
              </tr></thead>
              <tbody>
                {JITO_BUNDLES.tipStrategies.map(s => (
                  <tr key={s.strategy} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: "'SF Mono', monospace", fontWeight: 700 }}>{s.strategy}</td>
                    <td style={{ padding: '10px 12px' }}>{s.amount}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-2)' }}>{s.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <H3>What this gives you</H3>
            <div style={{ marginBottom: 20 }}>
              {JITO_BUNDLES.gives.map(g => (
                <div key={g} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, fontSize: '0.88rem' }}>
                  <span style={{ color: '#29C1A2', fontWeight: 700 }}>✓</span>
                  <span>{g}</span>
                </div>
              ))}
            </div>

            <H3>What this does NOT guarantee</H3>
            <div style={{ marginBottom: 20 }}>
              {JITO_BUNDLES.doesNot.map(d => (
                <div key={d} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, fontSize: '0.88rem' }}>
                  <span style={{ color: '#FF718F', fontWeight: 700 }}>✗</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>

            <Callout type="warn">Jito Block Engine is <strong>mainnet only</strong>. There is no Jito devnet. Bundle tests require mainnet SOL.</Callout>
          </>)}

          {/* ─── API REFERENCE ─── */}
          {section === 'api' && (<>
            <H1>REST API</H1>
            <P>Base URL: <code style={{ padding: '3px 8px', background: 'var(--bg)', borderRadius: 8, fontWeight: 700 }}>https://api.vaea.fi</code> — All endpoints return JSON. No authentication required.</P>
            <Callout type="info">If you&apos;re using the SDK, you don&apos;t need to call the API directly — the SDK handles everything.</Callout>

            {API_ENDPOINTS.map(ep => (
              <div key={ep.path} style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: '0.68rem', fontWeight: 900, fontFamily: 'monospace', background: ep.method === 'GET' ? '#29C1A215' : '#FF906015', color: ep.method === 'GET' ? '#29C1A2' : '#FF9060' }}>{ep.method}</span>
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
                <H3>Response</H3>
                <Code code={ep.response} lang="json" />
              </div>
            ))}
          </>)}

          {/* ─── SDK ─── */}
          {section === 'sdk' && (<>
            <H1>SDK Methods</H1>
            <P>Available in TypeScript, Rust, and Python. All SDKs share the same design and feature set.</P>

            <H2>Initialization</H2>
            <SdkCode code={{ typescript: QUICKSTART.firstLoan.typescript.split('\n').slice(0, 6).join('\n'), rust: QUICKSTART.firstLoan.rust.split('\n').slice(0, 5).join('\n'), python: QUICKSTART.firstLoan.python.split('\n').slice(0, 5).join('\n') }} lang={lang} setLang={setLang} />

            <H2>Core Methods</H2>
            <table className="vtable">
              <thead><tr><th>Method</th><th>Description</th><th>Returns</th></tr></thead>
              <tbody>
                {[
                  ['execute() / borrow()', 'Execute a flash loan with your instructions', 'Transaction signature'],
                  ['getQuote()', 'Get fee breakdown before executing', 'Quote with fees'],
                  ['getCapacity()', 'Check real-time borrowing limits', 'Token capacities'],
                  ['getHealth()', 'System health and protocol status', 'Health status'],
                ].map(([m, d, r]) => (
                  <tr key={m}><td><code style={{ fontWeight: 700, fontSize: '0.78rem' }}>{m}</code></td><td style={{ color: 'var(--text-2)' }}>{d}</td><td style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>{r}</td></tr>
                ))}
              </tbody>
            </table>

            <H2>Configuration Options</H2>
            <table className="vtable">
              <thead><tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                {[
                  ['apiUrl', 'string', 'https://api.vaea.fi', 'API endpoint'],
                  ['source', 'string', '"sdk"', 'Source identifier'],
                  ['maxFeeBps', 'number', '50', 'Max fee (auto-reject above)'],
                  ['slippageBps', 'number', '100', 'Swap slippage tolerance'],
                  ['priorityFee', 'number', '0', 'Priority fee (microlamports)'],
                  ['simulate', 'boolean', 'false', 'Simulate before sending'],
                ].map(([o, t, d, desc]) => (
                  <tr key={o}><td><code style={{ fontWeight: 700 }}>{o}</code></td><td style={{ color: 'var(--text-2)' }}>{t}</td><td><code style={{ color: 'var(--text-3)' }}>{d}</code></td><td style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{desc}</td></tr>
                ))}
              </tbody>
            </table>
          </>)}

          {/* ─── USE CASES ─── */}
          {section === 'usecases' && (<>
            <H1>Code Examples</H1>
            <P>Production-ready patterns for VAEA Flash. Each example includes the flow and code snippet.</P>

            {[
              { title: 'Liquidation Bot', icon: '🤖', color: '#FF718F', desc: 'Flash loan the collateral token, liquidate the underwater position, keep the liquidation bonus.', flow: 'Flash mSOL → Liquidate Position → Receive Collateral → Swap → Repay', code: { typescript: `const sig = await flash.execute({\n  token: 'mSOL', amount: 5000,\n  onFunds: async (ixs) => {\n    ixs.push(marginfiLiquidateIx);\n    return ixs;\n  },\n  maxFeeBps: 15,\n});`, rust: `let sig = flash.execute(BorrowParams {\n    token: "mSOL".into(),\n    amount: 5000.0,\n    instructions: vec![marginfi_liquidate_ix],\n    max_fee_bps: Some(15),\n    ..Default::default()\n}).await?;`, python: `result = await flash.borrow(\n    token="mSOL", amount=5000,\n    user_pubkey=str(wallet.pubkey()),\n    user_instructions=[marginfi_liquidate_ix],\n)` } },
              { title: 'LST Arbitrage', icon: '📊', color: '#29C1A2', desc: 'Exploit price discrepancies between LST exchange rates. Flash SOL, swap to discounted LST, redeem for more SOL.', flow: 'Flash SOL → Swap (Sanctum discount) → Unstake LST → Profit', code: { typescript: `const sig = await flash.execute({\n  token: 'SOL', amount: 10000,\n  onFunds: async (ixs) => {\n    ixs.push(swapSolToDiscountedJitoSol);\n    ixs.push(redeemJitoSolForSol);\n    return ixs;\n  },\n  maxFeeBps: 5,\n});`, rust: `let sig = flash.execute(BorrowParams {\n    token: "SOL".into(),\n    amount: 10000.0,\n    instructions: vec![swap_ix, redeem_ix],\n    max_fee_bps: Some(5),\n    ..Default::default()\n}).await?;`, python: `result = await flash.borrow(\n    token="SOL", amount=10000,\n    user_pubkey=str(wallet.pubkey()),\n    user_instructions=[swap_ix, redeem_ix],\n)` } },
              { title: 'Collateral Swap', icon: '🔄', color: '#FF9060', desc: 'Change lending collateral without closing your position. Zero liquidation risk during the swap.', flow: 'Flash Token B → Deposit B → Withdraw A → Swap A→B → Repay', code: { typescript: `const sig = await flash.execute({\n  token: 'JitoSOL', amount: 1000,\n  onFunds: async (ixs) => {\n    ixs.push(depositJitoSolAsCollateral);\n    ixs.push(withdrawSolCollateral);\n    ixs.push(swapSolToJitoSol);\n    return ixs;\n  },\n});`, rust: `let sig = flash.execute(BorrowParams {\n    token: "JitoSOL".into(),\n    amount: 1000.0,\n    instructions: vec![deposit_ix, withdraw_ix, swap_ix],\n    ..Default::default()\n}).await?;`, python: `result = await flash.borrow(\n    token="JitoSOL", amount=1000,\n    user_pubkey=str(wallet.pubkey()),\n    user_instructions=[deposit_ix, withdraw_ix, swap_ix],\n)` } },
            ].map(uc => (
              <div key={uc.title} style={{ marginBottom: 36 }}>
                <H2>{uc.icon} {uc.title}</H2>
                <P>{uc.desc}</P>
                <div style={{ background: `${uc.color}08`, borderRadius: 14, padding: '14px 20px', marginBottom: 14, borderLeft: `3px solid ${uc.color}` }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: uc.color, textTransform: 'uppercase', marginBottom: 4 }}>Flow</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{uc.flow}</div>
                </div>
                <SdkCode code={uc.code} lang={lang} setLang={setLang} />
              </div>
            ))}
          </>)}

          {/* ─── ERRORS ─── */}
          {section === 'errors' && (<>
            <H1>Error Handling</H1>
            <P>All errors returned by the VAEA Flash SDK and API.</P>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ERRORS.map(e => (
                <div key={e.code} style={{ background: 'white', borderRadius: 16, padding: '18px 22px', border: '1px solid var(--border)' }}>
                  <code style={{ fontWeight: 900, color: 'var(--coral)', fontSize: '0.82rem', background: '#FF718F08', padding: '2px 8px', borderRadius: 6 }}>{e.code}</code>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-2)', margin: '8px 0', lineHeight: 1.6 }}>{e.desc}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--emerald)', fontWeight: 600 }}>💡 {e.fix}</div>
                </div>
              ))}
            </div>
          </>)}

          {/* ─── FAQ ─── */}
          {section === 'faq' && (<>
            <H1>Frequently Asked Questions</H1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              {FAQ.map((f, i) => (
                <details key={i} style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <summary style={{ padding: '16px 22px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.4 }}>{f.q}</summary>
                  <div style={{ padding: '0 22px 18px', color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.8 }}>{f.a}</div>
                </details>
              ))}
            </div>
          </>)}

        </main>
      </div>
    </div>
  );
}
