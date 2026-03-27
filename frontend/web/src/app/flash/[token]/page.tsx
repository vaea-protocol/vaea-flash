'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { API_URL } from '@/lib/api';
import { SUPPORTED_TOKENS, formatPct } from '@/lib/constants';

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

    ixs = await flash.borrow(
        token="${t}",
        amount=${a || '1000'},
        user_pubkey=str(wallet.pubkey()),
        user_instructions=[my_arb_ix]
    )`,
};

export default function TokenSimulator() {
  const params = useParams();
  const symbol = (params.token as string) || 'SOL';
  const info = SUPPORTED_TOKENS.find(t => t.symbol.toLowerCase() === symbol.toLowerCase());
  const colorIdx = SUPPORTED_TOKENS.findIndex(t => t.symbol.toLowerCase() === symbol.toLowerCase());
  const color = PALETTE[colorIdx % PALETTE.length];

  const [amount, setAmount] = useState('1000');
  const [source, setSource] = useState<'sdk' | 'ui'>('sdk');
  const [lang, setLang] = useState<'typescript' | 'rust' | 'python'>('typescript');
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const go = async () => {
      const amt = parseFloat(amount);
      if (!amt || amt <= 0) { setQuote(null); return; }
      setLoading(true);
      try {
        const r = await fetch(`${API_URL}/v1/quote?token=${symbol}&amount=${amt}&source=${source}`);
        if (r.ok) setQuote(await r.json());
      } catch {}
      setLoading(false);
    };
    const t = setTimeout(go, 300);
    return () => clearTimeout(t);
  }, [amount, source, symbol]);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="mx" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <Link href="/flash" style={{ color: 'var(--text-3)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>← Back</Link>

        {/* Header */}
        <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0 36px' }}>
          <div className="token-dot" style={{ width: 52, height: 52, fontSize: '0.9rem', background: color }}>
            {symbol.slice(0, 2)}
          </div>
          <div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: 4 }}>{info?.name || symbol}</h1>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="tag tag-default">{symbol}</span>
              <span className={`tag ${info?.route === 'direct' ? 'tag-emerald' : 'tag-purple'}`}>{info?.route || 'direct'} route</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Simulator */}
          <div className="card fade-in fade-in-1" style={{ border: 'none' }}>
            <h3 style={{ marginBottom: 20, fontSize: '1.05rem' }}>Simulator</h3>

            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</label>
            <input className="input" type="number" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 20, padding: '18px' }} />

            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fee Source</label>
            <div className="tabs" style={{ marginBottom: 24 }}>
              <button className={`tab ${source === 'sdk' ? 'active' : ''}`} onClick={() => setSource('sdk')}>SDK (0.03%)</button>
              <button className={`tab ${source === 'ui' ? 'active' : ''}`} onClick={() => setSource('ui')}>UI (0.05%)</button>
            </div>

            {quote ? (
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: 20 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Breakdown</div>
                {[
                  ['VAEA Fee', `${quote.fee_breakdown.vaea_fee.toFixed(4)} ${symbol}`],
                  ...(quote.fee_breakdown.swap_in_fee > 0 ? [
                    ['Swap In', `${quote.fee_breakdown.swap_in_fee.toFixed(4)} ${symbol}`],
                    ['Swap Out', `${quote.fee_breakdown.swap_out_fee.toFixed(4)} ${symbol}`],
                  ] : []),
                ].map(([label, val]) => (
                  <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-2)' }}>{label}</span>
                    <span style={{ fontWeight: 700 }}>{val}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800 }}>Total</span>
                  <span style={{ fontWeight: 900, color: 'var(--emerald)', fontSize: '1.15rem' }}>
                    {quote.fee_breakdown.total_fee_sol.toFixed(4)} {symbol}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)', fontSize: '0.85rem' }}>
                {loading ? 'Calculating...' : 'Enter an amount to simulate'}
              </div>
            )}
          </div>

          {/* SDK */}
          <div className="card fade-in fade-in-2" style={{ border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.05rem' }}>SDK</h3>
              <div className="tabs">
                <button className={`tab ${lang === 'typescript' ? 'active' : ''}`} onClick={() => setLang('typescript')}>TS</button>
                <button className={`tab ${lang === 'rust' ? 'active' : ''}`} onClick={() => setLang('rust')}>Rust</button>
                <button className={`tab ${lang === 'python' ? 'active' : ''}`} onClick={() => setLang('python')}>Py</button>
              </div>
            </div>
            <div className="code-block">
              <button onClick={() => navigator.clipboard.writeText(CODE[lang](symbol, amount))}
                style={{ position: 'absolute', top: 12, right: 12, padding: '5px 14px', borderRadius: 'var(--r-full)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#CDD6F4', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700 }}>
                Copy
              </button>
              <pre style={{ margin: 0 }}><code>{CODE[lang](symbol, amount)}</code></pre>
            </div>
            <div style={{ marginTop: 14, padding: 12, background: 'var(--bg)', borderRadius: 'var(--r)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-3)' }}>Install → </span>
              <code style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text)' }}>
                {lang === 'typescript' ? 'npm i @vaea/flash' : lang === 'rust' ? 'cargo add vaea-flash-sdk' : 'pip install vaea-flash'}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
