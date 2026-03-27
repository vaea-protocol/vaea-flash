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

const FALLBACK_TOKENS: TokenCapacity[] = SUPPORTED_TOKENS.map(t => ({
  symbol: t.symbol, mint: '', name: t.name, decimals: t.decimals,
  route_type: t.route === 'direct' ? 'direct' as const : 'synthetic' as const,
  source_protocol: t.route === 'direct' ? 'marginfi' : 'marginfi',
  swap_protocol: t.route === 'synthetic' ? (['mSOL','bSOL','INF','laineSOL'].includes(t.symbol) ? 'sanctum' : 'jupiter') : undefined,
  max_amount: 0, max_amount_usd: 0,
  fee_sdk: { bps: 3, pct: 0.03, total_pct: t.route === 'direct' ? 0.03 : 0.09 },
  fee_ui: { bps: 5, pct: 0.05, total_pct: t.route === 'direct' ? 0.05 : 0.15 },
  status: 'available' as const, updated_at: Date.now()/1000,
}));

const FEATURED = ['SOL', 'USDC', 'TRUMP', 'JitoSOL', 'cbBTC'];

// CoinGecko IDs for free price API (no key needed)
const COINGECKO_MAP: Record<string, string> = {
  SOL: 'solana', USDC: 'usd-coin', USDT: 'tether',
  JitoSOL: 'jito-staked-sol', JupSOL: 'jupSOL',
  JUP: 'jupiter-exchange-solana', JLP: 'jupiter-perpetuals-liquidity-provider-token',
  cbBTC: 'coinbase-wrapped-btc', mSOL: 'msol', bSOL: 'blazestake-staked-sol',
  INF: 'infinity-by-sanctum', laineSOL: 'lainesol',
  TRUMP: 'official-trump', VIRTUAL: 'virtual-protocol',
  PENGU: 'pudgy-penguins', BONK: 'bonk',
  WIF: 'dogwifhat', RAY: 'raydium',
  HNT: 'helium', RNDR: 'render-token',
  JITO: 'jito-governance-token', KMNO: 'kamino',
  PYUSD: 'paypal-usd', USDS: 'usds',
  USD1: 'usd1', USDG: 'usdg',
  EURC: 'euro-coin',
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

  const featured = tokens.filter(t => FEATURED.includes(t.symbol));
  const directCount = tokens.filter(t => t.route_type === 'direct').length;
  const synthCount = tokens.filter(t => t.route_type === 'synthetic').length;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ═══ Hero ═══ */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="mx" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', minHeight: 520 }}>
          <div className="fade-in">
            <div className="tag tag-emerald" style={{ marginBottom: 16 }}>Universal Flash Loans on Solana</div>
            <h1 style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4rem)', marginBottom: 16 }}>
              Flash any<br />token, instantly
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', maxWidth: 400, marginBottom: 28, lineHeight: 1.7 }}>
              Borrow <strong style={{ color: 'var(--text)' }}>{tokens.length} tokens</strong> and
              repay in the same transaction. From <strong style={{ color: 'var(--emerald)' }}>0.03%</strong>.
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <Link href="/flash/docs" className="btn btn-dark">Get Started</Link>
              <Link href="#tokens" className="btn btn-ghost">Explore Tokens ↓</Link>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: '0.82rem', color: 'var(--text-3)' }}>
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

      {/* ═══ Featured ═══ */}
      <section style={{ padding: '32px 0 40px' }}>
        <div className="mx">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Featured</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${featured.length}, 1fr)`, gap: 14 }}>
            {featured.map((t, i) => (
              <Link key={t.symbol} href={`/flash/${t.symbol}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <TokenIcon symbol={t.symbol} size={36} index={i} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{t.symbol}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{t.name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)' }}>{formatPct(t.fee_sdk.total_pct)}</span>
                    <span className={`tag ${t.route_type === 'direct' ? 'tag-emerald' : 'tag-purple'}`}>{t.route_type}</span>
                  </div>
                </div>
              </Link>
            ))}
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
              <input className="input-pill" placeholder="Search token..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260, paddingLeft: 42 }} />
            </div>
          </div>

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
                  <td><span className="tag tag-emerald">{formatPct(t.fee_sdk.total_pct)}</span></td>
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
