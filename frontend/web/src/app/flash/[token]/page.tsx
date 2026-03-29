'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TokenIcon from '@/components/TokenIcon';
import Navbar from '@/components/layout/Navbar';
import { API_URL, TokenCapacity } from '@/lib/api';
import { SUPPORTED_TOKENS, formatAmount, formatUsd } from '@/lib/constants';

const PALETTE = ['#29C1A2', '#FF718F', '#823FFF', '#FF9060', '#8ECAE6'];

const CODE = {
  typescript: (t: string, a: string) => `import { VaeaFlash } from '@vaea/flash';

const flash = new VaeaFlash({
  apiUrl: 'https://api.vaea.fi',
  source: 'sdk'
});

const quote = await flash.getQuote('${t}', ${a || '1000'});
console.log(\`Fee: \${quote.fee_breakdown.total_fee_pct}%\`);

const sig = await flash.execute({
  token: '${t}',
  amount: ${a || '1000'},
  onFunds: async (ixs) => {
    ixs.push(myArbitrageIx);
    return ixs;
  }
});`,
  rust: (t: string, a: string) => `use vaea_flash_sdk::{VaeaFlash, BorrowParams};

let flash = VaeaFlash::with_rpc(
    "https://api.vaea.fi",
    "https://api.mainnet-beta.solana.com",
    &payer
)?;

let sig = flash.execute(BorrowParams {
    token: "${t}".into(),
    amount: ${a || '1000'}.0,
    instructions: vec![my_arb_ix],
    slippage_bps: Some(50),
    max_fee_bps: None,
}).await?;`,
  python: (t: string, a: string) => `from vaea_flash import VaeaFlash, VaeaConfig

async with VaeaFlash(VaeaConfig(
    api_url="https://api.vaea.fi",
    source="sdk"
)) as flash:
    quote = await flash.get_quote("${t}", ${a || '1000'})
    print(f"Fee: {quote.fee_breakdown.total_fee_pct}%")

    result = await flash.borrow(
        token="${t}",
        amount=${a || '1000'},
        user_pubkey=str(wallet.pubkey()),
        user_instructions=[my_arb_ix]
    )`,
};

export default function TokenPage() {
  const params = useParams();
  const symbol = (params.token as string) || 'SOL';
  const info = SUPPORTED_TOKENS.find(t => t.symbol.toLowerCase() === symbol.toLowerCase());
  const colorIdx = SUPPORTED_TOKENS.findIndex(t => t.symbol.toLowerCase() === symbol.toLowerCase());
  const color = PALETTE[colorIdx % PALETTE.length];

  const [amount, setAmount] = useState('1000');
  const [lang, setLang] = useState<'typescript' | 'rust' | 'python'>('typescript');
  const [quote, setQuote] = useState<any>(null);
  const [capacity, setCapacity] = useState<TokenCapacity | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch live capacity data for this token
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_URL}/v1/capacity`);
        if (r.ok) {
          const data = await r.json();
          const tk = data.tokens?.find((t: TokenCapacity) => t.symbol.toLowerCase() === symbol.toLowerCase());
          if (tk) setCapacity(tk);
        }
      } catch {}
    })();
  }, [symbol]);

  // Fetch quote when amount changes
  useEffect(() => {
    const go = async () => {
      const amt = parseFloat(amount);
      if (!amt || amt <= 0) { setQuote(null); return; }
      setLoading(true);
      try {
        const r = await fetch(`${API_URL}/v1/quote?token=${symbol}&amount=${amt}&source=sdk`);
        if (r.ok) setQuote(await r.json());
      } catch {}
      setLoading(false);
    };
    const t = setTimeout(go, 400);
    return () => clearTimeout(t);
  }, [amount, symbol]);

  const copyCode = () => {
    navigator.clipboard.writeText(CODE[lang](symbol, amount));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="mx" style={{ paddingTop: 28, paddingBottom: 80 }}>
        <Link href="/flash" style={{ color: 'var(--text-3)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>← All Tokens</Link>

        {/* ═══ Header ═══ */}
        <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0 28px' }}>
          <TokenIcon symbol={symbol} size={52} index={colorIdx} />
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: 2 }}>Flash Loan {info?.name || symbol}</h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="tag tag-default">{symbol}</span>
              <span className={`tag ${info?.route === 'direct' ? 'tag-emerald' : 'tag-purple'}`}>{info?.route || 'direct'} route</span>
              {capacity && <span className="tag tag-default">{capacity.source_protocol.replace('_', ' ')}</span>}
            </div>
          </div>
        </div>

        {/* ═══ Live Stats Bar ═══ */}
        <div className="fade-in grid-4" style={{ gap: 12, marginBottom: 28 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '18px 20px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Max Available</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900 }}>
              {capacity ? formatAmount(capacity.max_amount) : '—'} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)' }}>{symbol}</span>
            </div>
            {capacity?.max_amount_usd ? <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>{formatUsd(capacity.max_amount_usd)}</div> : null}
          </div>
          <div style={{ background: 'white', borderRadius: 20, padding: '18px 20px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Fee (SDK)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--emerald)' }}>
              {capacity ? `${info?.route === 'synthetic' ? '~' : ''}${capacity.fee_sdk.total_pct.toFixed(2)}%` : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>
              {info?.route === 'direct' ? 'No swap cost' : 'Includes swap'}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 20, padding: '18px 20px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Route</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: info?.route === 'direct' ? '#29C1A2' : '#823FFF' }}>
              {info?.route === 'direct' ? 'Direct' : 'Synthetic'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>
              {capacity?.swap_protocol ? `via ${capacity.swap_protocol}` : capacity?.source_protocol?.replace('_', ' ') || ''}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 20, padding: '18px 20px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: capacity?.status === 'available' ? '#29C1A2' : capacity?.status === 'degraded' ? '#FF9060' : '#FF718F' }} />
              <span style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'capitalize' }}>
                {capacity?.status || 'Loading...'}
              </span>
            </div>
          </div>
        </div>

        {/* ═══ Two-Column Grid ═══ */}
        <div className="grid-2" style={{ gap: 24 }}>

          {/* ── Flash Loan Calculator ── */}
          <div className="card fade-in fade-in-1" style={{ border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: '1.2rem' }}>⚡</span>
              <h3 style={{ fontSize: '1.05rem' }}>Flash Loan Calculator</h3>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: 20 }}>
              Simulate a flash loan on <strong style={{ color: 'var(--text)' }}>{symbol}</strong> — see the exact fee breakdown before you code.
            </p>

            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Borrow Amount ({symbol})
            </label>
            <input className="input" type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder={`e.g. 1000 ${symbol}`}
              style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 20, padding: '18px' }} />

            {/* Quick amounts */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {['100', '1000', '10000', '50000'].map(a => (
                <button key={a} onClick={() => setAmount(a)} style={{
                  flex: 1, padding: '8px 0', borderRadius: 10, border: '1px solid var(--border)',
                  background: amount === a ? `${color}10` : 'transparent',
                  color: amount === a ? color : 'var(--text-2)',
                  fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                }}>
                  {formatAmount(Number(a), 0)}
                </button>
              ))}
            </div>

            {/* Results */}
            {quote ? (
              <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fee Breakdown</div>
                {[
                  { label: 'VAEA Fee (0.03%)', value: `${quote.fee_breakdown.vaea_fee.toFixed(4)} ${symbol}`, color: 'var(--text)' },
                  ...(quote.fee_breakdown.swap_in_fee > 0 ? [
                    { label: 'Swap In (Sanctum/Jupiter)', value: `${quote.fee_breakdown.swap_in_fee.toFixed(4)} ${symbol}`, color: 'var(--text)' },
                    { label: 'Swap Out', value: `${quote.fee_breakdown.swap_out_fee.toFixed(4)} ${symbol}`, color: 'var(--text)' },
                  ] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-2)' }}>{row.label}</span>
                    <span style={{ fontWeight: 700, color: row.color }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Total Cost</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{quote.fee_breakdown.total_fee_pct?.toFixed(2)}% of loan</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, color: 'var(--emerald)', fontSize: '1.25rem' }}>
                      {quote.fee_breakdown.total_fee_sol.toFixed(4)} {symbol}
                    </div>
                    {quote.fee_breakdown.total_fee_usd > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>≈ ${quote.fee_breakdown.total_fee_usd.toFixed(2)}</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 28, color: 'var(--text-3)', fontSize: '0.85rem', background: 'var(--bg)', borderRadius: 16 }}>
                {loading ? (
                  <span>Calculating fee...</span>
                ) : (
                  <span>Enter an amount above to see the exact fee breakdown</span>
                )}
              </div>
            )}

            {/* You receive */}
            {quote && (
              <div style={{ marginTop: 14, padding: '14px 18px', background: '#29C1A208', borderRadius: 14, border: '1px solid #29C1A215' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#29C1A2' }}>You receive in your wallet</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>
                    {formatAmount(parseFloat(amount))} {symbol}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4 }}>
                  Full amount delivered → use it → repay {formatAmount(parseFloat(amount) + quote.fee_breakdown.total_fee_sol)} {symbol}
                </div>
              </div>
            )}
          </div>

          {/* ── SDK Code ── */}
          <div className="card fade-in fade-in-2" style={{ border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.2rem' }}>📦</span>
                <h3 style={{ fontSize: '1.05rem' }}>Quick Start Code</h3>
              </div>
              <div className="tabs">
                <button className={`tab ${lang === 'typescript' ? 'active' : ''}`} onClick={() => setLang('typescript')}>TS</button>
                <button className={`tab ${lang === 'rust' ? 'active' : ''}`} onClick={() => setLang('rust')}>Rust</button>
                <button className={`tab ${lang === 'python' ? 'active' : ''}`} onClick={() => setLang('python')}>Py</button>
              </div>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: 16 }}>
              Flash loan <strong style={{ color: 'var(--text)' }}>{formatAmount(Number(amount) || 1000)} {symbol}</strong> with the VAEA SDK — copy and paste into your project.
            </p>
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#1c1c1c', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{lang}</span>
                <button onClick={copyCode} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, color: copied ? '#29C1A2' : 'rgba(255,255,255,0.4)' }}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <pre style={{ margin: 0, padding: '16px 20px', background: '#1a1a1a', overflowX: 'auto' }}>
                <code style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: '0.78rem', lineHeight: 1.7, color: '#e0e0e0' }}>{CODE[lang](symbol, amount)}</code>
              </pre>
            </div>
            <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--bg)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600 }}>Install →</span>
              <code style={{ fontFamily: "'SF Mono', monospace", fontWeight: 700, fontSize: '0.78rem', color: 'var(--text)' }}>
                {lang === 'typescript' ? 'npm i @vaea/flash' : lang === 'rust' ? 'cargo add vaea-flash-sdk' : 'pip install vaea-flash'}
              </code>
            </div>

            {/* How it works mini */}
            <div style={{ marginTop: 20, padding: '20px 22px', background: 'white', borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>How this flash loan works</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { n: '1', label: `begin_flash()`, desc: `Register ${symbol} loan on-chain` },
                  { n: '2', label: info?.route === 'direct' ? `Borrow from ${capacity?.source_protocol?.replace('_', ' ') || 'lending protocol'}` : `Borrow SOL → swap to ${symbol}`, desc: info?.route === 'direct' ? 'Direct pool withdrawal' : `Via ${capacity?.swap_protocol || 'Sanctum/Jupiter'}` },
                  { n: '3', label: 'Your logic executes', desc: 'Arb, liquidation, swap...' },
                  { n: '4', label: `end_flash()`, desc: `Repay + ~${capacity?.fee_sdk?.total_pct?.toFixed(2) || '0.03'}% fee` },
                ].map(s => (
                  <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, flexShrink: 0 }}>{s.n}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', fontFamily: "'SF Mono', monospace" }}>{s.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
