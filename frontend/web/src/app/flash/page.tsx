'use client';
import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import TokenIcon from '@/components/TokenIcon';
import Navbar from '@/components/layout/Navbar';
import type { TokenCapacity } from '@/lib/api';
import { SUPPORTED_TOKENS, formatAmount, formatPct, formatUsd } from '@/lib/constants';
import { API_URL } from '@/lib/api';

const HeroScene = dynamic(() => import('@/components/three/HeroOrb'), { ssr: false });

const PALLETTE = ['#29C1A2', '#FF718F', '#823FFF', '#FF9060', '#8ECAE6', '#29C1A2', '#FF718F', '#823FFF'];
// Realistic fee estimates per swap provider (VAEA 3bps + swap fee)
const SYNTH_FEES: Record<string, number> = {
  // LSTs via Sanctum (~0.03% swap) → total ~0.06%
  mSOL: 0.06, bSOL: 0.06, INF: 0.06, laineSOL: 0.06,
  // Stablecoins via Jupiter (~0.01-0.05% swap) → total ~0.04-0.08%
  PYUSD: 0.04, USDS: 0.04, USD1: 0.05, USDG: 0.05, EURC: 0.08,
  // Majors via Jupiter (~0.05-0.10% swap) → total ~0.08-0.13%
  TRUMP: 0.10, PENGU: 0.12,
  // Mid-caps via Jupiter (~0.08-0.15% swap) → total ~0.11-0.18%
  BONK: 0.11, WIF: 0.11, RAY: 0.10, HNT: 0.14, RNDR: 0.13, JITO: 0.09, KMNO: 0.12,
  // Infrastructure via Jupiter (~0.05-0.15% swap) → total ~0.08-0.18%
  wETH: 0.10, PYTH: 0.14, W: 0.15, ORCA: 0.11,
};

const FALLBACK_TOKENS: TokenCapacity[] = SUPPORTED_TOKENS.map(t => {
  const totalPct = t.route === 'direct' ? 0.03 : (SYNTH_FEES[t.symbol] ?? 0.10);
  return {
    symbol: t.symbol, mint: '', name: t.name, decimals: t.decimals,
    route_type: t.route === 'direct' ? 'direct' as const : 'synthetic' as const,
    source_protocol: t.route === 'direct' ? 'marginfi' : 'marginfi',
    swap_protocol: t.route === 'synthetic' ? (['mSOL','bSOL','INF','laineSOL'].includes(t.symbol) ? 'sanctum' : 'jupiter') : undefined,
    max_amount: 0, max_amount_usd: 0,
    fee_sdk: { bps: 3, pct: 0.03, total_pct: totalPct },
    fee_ui: { bps: 5, pct: 0.05, total_pct: totalPct + 0.02 },
    status: 'available' as const, updated_at: Date.now()/1000,
  };
});

// CoinGecko IDs for free price API (no key needed)
const COINGECKO_MAP: Record<string, string> = {
  SOL: 'solana', USDC: 'usd-coin', USDT: 'tether',
  JitoSOL: 'jito-staked-sol', JupSOL: 'jupiter-staked-sol',
  JUP: 'jupiter-exchange-solana', JLP: 'jupiter-perpetuals-liquidity-provider-token',
  cbBTC: 'coinbase-wrapped-btc', mSOL: 'msol', bSOL: 'blazestake-staked-sol',
  INF: 'socean-staked-sol', laineSOL: 'solana', // laineSOL not on CoinGecko, use SOL ~1:1
  TRUMP: 'official-trump',
  PENGU: 'pudgy-penguins', BONK: 'bonk',
  WIF: 'dogwifcoin', RAY: 'raydium',
  HNT: 'helium', RNDR: 'render-token',
  JITO: 'jito-governance-token', KMNO: 'kamino',
  PYUSD: 'paypal-usd', USDS: 'usds',
  USD1: 'usd1', USDG: 'usdg',
  EURC: 'euro-coin',
  wETH: 'weth', PYTH: 'pyth-network',
  W: 'wormhole', ORCA: 'orca',
};

export default function FlashDashboard() {
  const [tokens, setTokens] = useState<TokenCapacity[]>(FALLBACK_TOKENS);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'symbol' | 'fee' | 'capacity'>('symbol');
  const [filter, setFilter] = useState<'all' | 'direct' | 'synthetic'>('all');

  // Fetch capacity data from our API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/v1/capacity`);
        if (res.ok) { const d = await res.json(); if (d.tokens?.length) setTokens(d.tokens); }
      } catch {}
    };
    load();
    const iv = setInterval(load, 10_000);
    return () => clearInterval(iv);
  }, []);

  // Fetch USD prices from CoinGecko (free, no API key, 1 call every 60s)
  useEffect(() => {
    const loadPrices = async () => {
      try {
        const ids = [...new Set(Object.values(COINGECKO_MAP))].join(',');
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        if (!res.ok) return;
        const data = await res.json();
        const map: Record<string, number> = {};
        for (const [symbol, cgId] of Object.entries(COINGECKO_MAP)) {
          const p = data[cgId]?.usd;
          if (p) map[symbol] = Number(p);
        }
        setPrices(map);
      } catch {}
    };
    loadPrices();
    const iv = setInterval(loadPrices, 60_000);
    return () => clearInterval(iv);
  }, []);

  const filtered = tokens
    .filter(t => filter === 'all' || t.route_type === filter)
    .filter(t => !search || t.symbol.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === 'fee') return a.fee_sdk.total_pct - b.fee_sdk.total_pct;
      if (sortKey === 'capacity') return b.max_amount - a.max_amount;
      return a.symbol.localeCompare(b.symbol);
    });

  const directCount = tokens.filter(t => t.route_type === 'direct').length;
  const synthCount = tokens.filter(t => t.route_type === 'synthetic').length;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ═══ Hero ═══ */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="mx grid-hero" style={{ minHeight: 520, gap: 20 }}>
          <div className="fade-in">
            <div className="tag tag-emerald" style={{ marginBottom: 16 }}>Universal Flash Loans on Solana</div>
            <h1 style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4rem)', marginBottom: 16 }}>
              Flash any<br />token, instantly
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', maxWidth: 400, marginBottom: 28, lineHeight: 1.7 }}>
              Borrow <strong style={{ color: 'var(--text)' }}>{tokens.length} tokens</strong> and
              repay in the same transaction. From <strong style={{ color: 'var(--emerald)' }}>0.03%</strong>.
            </p>
            <div className="hero-buttons" style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <Link href="/flash/docs" className="btn btn-dark">Get Started</Link>
              <Link href="#tokens" className="btn btn-ghost">Explore Tokens ↓</Link>
            </div>
            <div className="hero-stats" style={{ display: 'flex', gap: 20, fontSize: '0.82rem', color: 'var(--text-3)' }}>
              <span><strong style={{ color: 'var(--text)', fontWeight: 800 }}>{directCount}</strong> direct</span>
              <span><strong style={{ color: 'var(--text)', fontWeight: 800 }}>{synthCount}</strong> synthetic</span>
              <span><strong style={{ color: 'var(--text)', fontWeight: 800 }}>3</strong> SDKs</span>
            </div>
          </div>
          <div className="fade-in fade-in-2">
            <Suspense fallback={<div style={{ height: 640 }} />}>
              <HeroScene />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ═══ Token Table ═══ */}
      <section id="tokens" style={{ paddingBottom: 80 }}>
        <div className="mx">
          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div className="pill-nav">
              {(['all', 'direct', 'synthetic'] as const).map(f => (
                <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
                  {f === 'all' ? `All (${tokens.length})` : f === 'direct' ? `Direct (${directCount})` : `Synthetic (${synthCount})`}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="input-pill" placeholder="Search token..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', maxWidth: 260, paddingLeft: 42 }} />
            </div>
          </div>

          <div className="vtable-wrap desktop-only" style={{ flexDirection: 'column' }}>
          <table className="vtable">
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th>Token</th>
                <th style={{ cursor: 'pointer' }} onClick={() => setSortKey('capacity')}>Capacity {sortKey === 'capacity' && '↓'}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => setSortKey('fee')}>Fee {sortKey === 'fee' && '↓'}</th>
                <th>Route</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.symbol} onClick={() => window.location.href = `/flash/${t.symbol}`}>
                  <td style={{ color: 'var(--text-3)', fontWeight: 700, fontSize: '0.8rem' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <TokenIcon symbol={t.symbol} size={36} index={i} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{t.symbol}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{t.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{t.max_amount > 0 ? formatAmount(t.max_amount) : '—'}</div>
                    {t.max_amount > 0 && prices[t.symbol] ? (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 2 }}>
                        {formatUsd(t.max_amount * prices[t.symbol])}
                      </div>
                    ) : null}
                  </td>
                  <td><span className="tag tag-emerald">{t.route_type === 'synthetic' ? '~' : ''}{formatPct(t.fee_sdk.total_pct)}</span></td>
                  <td>
                    <span className={`tag ${t.route_type === 'direct' ? 'tag-emerald' : 'tag-purple'}`}>{t.route_type}</span>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    {prices[t.symbol]
                      ? prices[t.symbol] >= 1000
                        ? `$${prices[t.symbol].toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                        : prices[t.symbol] >= 1
                          ? `$${prices[t.symbol].toFixed(2)}`
                          : prices[t.symbol] >= 0.01
                            ? `$${prices[t.symbol].toFixed(4)}`
                            : `$${prices[t.symbol].toFixed(8)}`
                      : <span style={{ color: 'var(--text-3)' }}>—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* ═══ Mobile Token Cards ═══ */}
          <div className="token-cards-mobile" style={{ display: 'none' }}>
            {filtered.map((t, i) => (
              <div key={t.symbol} className="token-card-m" onClick={() => window.location.href = `/flash/${t.symbol}`}>
                <TokenIcon symbol={t.symbol} size={40} index={i} />
                <div className="token-card-m-info">
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{t.symbol}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{t.name}</div>
                </div>
                <div className="token-card-m-right">
                  <span className="tag tag-emerald">{t.route_type === 'synthetic' ? '~' : ''}{formatPct(t.fee_sdk.total_pct)}</span>
                  <span className={`tag ${t.route_type === 'direct' ? 'tag-emerald' : 'tag-purple'}`} style={{ fontSize: '0.62rem' }}>{t.route_type}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SEO CONTENT ═══ */}
      <section style={{ padding: '64px 0 0' }}>
        <div className="mx">

          {/* — Why VAEA Flash — */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="tag tag-emerald" style={{ marginBottom: 14 }}>Why VAEA Flash</div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: 12 }}>The Universal Flash Loan Aggregator on Solana</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '1rem', lineHeight: 1.8, maxWidth: 620, margin: '0 auto' }}>
              VAEA Flash aggregates liquidity from multiple lending protocols and routes it through a single
              atomic transaction — enabling developers and bots to borrow any SPL token with zero collateral.
            </p>
          </div>

          <div className="grid-3" style={{ gap: 16, marginBottom: 64 }}>
            {[
              { icon: '🔗', title: 'Aggregated Liquidity', desc: 'VAEA scans Marginfi, Jupiter Lend, Kamino, and more in real-time to find the deepest available liquidity for every token. If no single source covers your amount, it splits across multiple protocols automatically.', color: '#29C1A2' },
              { icon: '🛡️', title: 'Zero Collateral, Zero Risk', desc: 'Flash loans are atomic — you borrow and repay in the same transaction. If repayment fails, everything reverts. You never risk a single SOL. The on-chain program uses instruction introspection to enforce repayment.', color: '#823FFF' },
              { icon: '⚡', title: 'One Line of Code', desc: 'Our SDK abstracts all the complexity. Install the package, call flashLoan(), and put your logic inside the callback. Available in TypeScript, Rust, and Python — from prototyping to production.', color: '#FF9060' },
            ].map((f, i) => (
              <div key={f.title} className="card fade-in" style={{ animationDelay: `${i * 0.08}s`, border: `1.5px solid ${f.color}20`, textAlign: 'center', padding: '32px 24px' }}>
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.75 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* — How Flash Loans Work — */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)', marginBottom: 12 }}>How Flash Loans Work on Solana</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
              A flash loan executes in a single atomic Solana transaction. The entire cycle — borrow, use, repay — is instant and trustless.
            </p>
          </div>

          <div className="grid-3" style={{ gap: 14, marginBottom: 64 }}>
            {[
              { n: '1', title: 'Borrow', desc: 'Request any amount of any supported token. VAEA finds the optimal route and prepares the transaction. No approval, no collateral, no waiting.', color: '#29C1A2' },
              { n: '2', title: 'Execute', desc: 'Your logic runs: DEX arbitrage, self-liquidation, collateral swap, leverage looping — anything you can fit in a Solana transaction.', color: '#FF9060' },
              { n: '3', title: 'Repay', desc: 'Return the borrowed amount plus a tiny fee (from 0.03%). If repayment fails, the entire transaction reverts as if nothing happened.', color: '#823FFF' },
            ].map((s, i) => (
              <div key={s.n} className="fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ background: `${s.color}08`, border: `1.5px solid ${s.color}25`, borderRadius: 20, padding: '28px 24px', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color: s.color }}>{s.n}</div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{s.title}</h3>
                  </div>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.75 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* — Built for Developers — */}
          <div className="grid-2" style={{ gap: 24, marginBottom: 64, alignItems: 'center' }}>
            <div>
              <div className="tag tag-purple" style={{ marginBottom: 14 }}>Developer Experience</div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)', marginBottom: 14 }}>Built for Developers</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 20 }}>
                VAEA Flash provides SDKs in three languages — TypeScript, Rust, and Python — so you can integrate flash loans in whatever stack you prefer. The API handles route optimization, fee estimation, and transaction building.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['TypeScript SDK', 'Rust SDK', 'Python SDK', 'REST API', 'WebSocket'].map(t => (
                  <span key={t} className="tag tag-default">{t}</span>
                ))}
              </div>
            </div>
            <div className="code-block" style={{ fontSize: '0.82rem', lineHeight: 1.8 }}>
              <div style={{ color: 'var(--text-3)', marginBottom: 4 }}>{'// Flash loan in 3 lines'}</div>
              <div><span style={{ color: '#823FFF' }}>{'const'}</span> vaea = <span style={{ color: '#823FFF' }}>{'new'}</span> <span style={{ color: '#29C1A2' }}>VaeaFlash</span>();</div>
              <div><span style={{ color: '#823FFF' }}>{'await'}</span> vaea.<span style={{ color: '#29C1A2' }}>flashLoan</span>({'{'}</div>
              <div>&nbsp;&nbsp;token: <span style={{ color: '#FF9060' }}>{"'SOL'"}</span>, amount: <span style={{ color: '#FF9060' }}>1000</span>,</div>
              <div>&nbsp;&nbsp;onFunds: <span style={{ color: '#823FFF' }}>{'async'}</span> () {'=> {'} <span style={{ color: 'var(--text-3)' }}>/* your logic */</span> {'}'}</div>
              <div>{'}'});</div>
            </div>
          </div>

          {/* — Stats Banner — */}
          <div style={{ background: 'white', borderRadius: 24, border: '1px solid var(--border)', padding: '36px 40px', marginBottom: 64 }}>
            <div className="grid-4" style={{ gap: 20, textAlign: 'center' }}>
              {[
                { value: `${tokens.length}`, label: 'Supported Tokens' },
                { value: '0.03%', label: 'Min Fee' },
                { value: '3', label: 'SDKs' },
                { value: 'Open Source', label: 'Fully Transparent' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-3)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* — SDK Features — */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="tag tag-purple" style={{ marginBottom: 14 }}>SDK Features</div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)', marginBottom: 12 }}>Everything You Need, Built In</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
              Production-grade tools for bots, liquidators, and DeFi protocols — zero external dependencies.
            </p>
          </div>

          <div className="grid-3" style={{ gap: 14, marginBottom: 64 }}>
            {[
              { icon: '⚡', title: 'Turbo Mode', desc: 'Build instructions 100% locally in ~91µs. No API call, no HTTP, no network. 2,000× faster than standard SDK round-trips.', color: '#FF9060', link: '/flash/docs/turbo-mode' },
              { icon: '🔬', title: 'Simulation', desc: 'Dry-run any flash loan without risking SOL. Get exact compute units, logs, and error details before sending.', color: '#29C1A2', link: '/flash/docs/simulation' },
              { icon: '🔗', title: 'Multi-Token Flash', desc: 'Borrow multiple tokens in a single atomic TX with nested sandwich patterns. Cross-token arbitrage made simple.', color: '#823FFF', link: '/flash/docs/multi-token-flash' },
              { icon: '📊', title: 'Profitability Check', desc: 'Estimate all costs — VAEA fee, swap fees, priority fee, Jito tip — and get a send/wait/abort recommendation before executing.', color: '#29C1A2', link: '/flash/docs/profitability-check' },
              { icon: '🔄', title: 'Smart Retry', desc: 'Automatic retry with blockhash refresh and adaptive priority fee escalation. Classifies errors to only retry transient failures.', color: '#FF718F', link: '/flash/docs/smart-retry' },
              { icon: '🛡️', title: 'Jito Bundles', desc: 'Send flash loans as private bundles via Jito Block Engine. Your TX stays invisible to MEV bots — zero mempool exposure.', color: '#8ECAE6', link: '/flash/docs/jito-bundles' },
              { icon: '🔥', title: 'Warm Cache', desc: 'Background poller keeps capacity data hot. Eliminates cold-start penalty — first call is instant for latency-critical bots.', color: '#FF9060', link: '/flash/docs/warm-cache' },
              { icon: '🚧', title: 'Fee Guard', desc: 'Set a max fee threshold with maxFeeBps. If the fee exceeds your limit, the SDK auto-rejects before sending the TX.', color: '#823FFF', link: '/flash/docs/fee-guard' },
              { icon: '🎯', title: 'Auto Slippage', desc: 'Dynamic slippage calculation per route type and price impact. Three modes: auto, aggressive, and safe — no manual tuning.', color: '#FF718F', link: '/flash/docs/auto-slippage' },
            ].map((f, i) => (
              <Link key={f.title} href={f.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card fade-in" style={{ animationDelay: `${i * 0.06}s`, border: `1.5px solid ${f.color}20`, padding: '24px 22px', height: '100%', transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = `${f.color}60`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = `${f.color}20`; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{f.title}</h3>
                  </div>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* — Coming Soon — R&D — */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', padding: '5px 14px', borderRadius: 'var(--r-full, 999px)', background: '#823FFF10', color: '#823FFF', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>R&D — Coming Soon</div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)', marginBottom: 12 }}>What&apos;s Next for VAEA Flash</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
              Two innovations in active development that will redefine flash loans on Solana.
            </p>
          </div>

          <div className="grid-2" style={{ gap: 20, marginBottom: 64 }}>
            <div style={{ background: 'linear-gradient(135deg, #823FFF06 0%, #29C1A206 100%)', border: '1.5px solid #823FFF20', borderRadius: 24, padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 16, right: 20, padding: '3px 10px', borderRadius: 999, background: '#823FFF15', color: '#823FFF', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>In Development</div>
              <div style={{ fontSize: '1.6rem', marginBottom: 12 }}>🔌</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 10 }}>Zero-CPI Integration</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.8, marginBottom: 16 }}>
                Any Solana protocol will be able to verify it&apos;s inside a VAEA flash loan <strong>without consuming any CPI depth</strong>.
                A single PDA read + instruction introspection — zero CPI calls, saving one full depth level.
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 14 }}>
                <strong style={{ color: 'var(--text)' }}>Why it matters:</strong> Solana has a hard CPI depth limit of 4.
                Classic CPI flash loans consume 1-2 levels, blocking complex operations like Jupiter swaps through nested AMMs.
                Zero-CPI saves that entire level.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="tag tag-purple">PDA Introspection</span>
                <span className="tag tag-default">Zero overhead</span>
                <span className="tag tag-default">crates.io crate</span>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #29C1A206 0%, #FF718F06 100%)', border: '1.5px solid #29C1A220', borderRadius: 24, padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 16, right: 20, padding: '3px 10px', borderRadius: 999, background: '#29C1A215', color: '#29C1A2', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Planned</div>
              <div style={{ fontSize: '1.6rem', marginBottom: 12 }}>✨</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 10 }}>vSOL — Unlimited Flash Loans</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.8, marginBottom: 16 }}>
                A fundamentally new approach: <strong>mint synthetic vSOL</strong> during a flash loan, <strong>burn at the end</strong> — net supply change = 0.
                No pool to drain, no congestion, unlimited capacity.
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 14 }}>
                <strong style={{ color: 'var(--text)' }}>Why it matters:</strong> During a market crash, pool-based flash loans drain instantly.
                With mint/burn, 200 bots can execute 10M SOL of flash loans in a single block with zero contention.
                VAEA becomes the source of liquidity, not just an aggregator.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="tag tag-emerald">Zero congestion</span>
                <span className="tag tag-default">Backwards compatible</span>
                <span className="tag tag-default">Yield-bearing LST</span>
              </div>
            </div>
          </div>

          {/* — CTA — */}
          <div style={{ textAlign: 'center', padding: '0 0 64px' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: 12 }}>Start Building with Flash Loans</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: 480, margin: '0 auto 24px' }}>
              Read the docs, explore the API, or jump straight into code. VAEA Flash is open-source and free to integrate.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/flash/docs" className="btn btn-dark">Read the Docs</Link>
              <Link href="/flash/learn" className="btn btn-ghost">What is a Flash Loan?</Link>
            </div>
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
