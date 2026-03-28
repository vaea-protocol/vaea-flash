import { Code } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function Routing() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Routing & Routes</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>How VAEA Flash routes your borrow request through lending protocols and swap providers to deliver any token.</p>

    <h2 id="how" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>How Routing Works</h2>
    <Code code={`flash.executeLocal({ token: 'mSOL', amount: 5000 })
       ↓
1. Is mSOL a direct route token?
   → Check Marginfi: NO  →  Check Kamino: NO  →  Check Save: NO
       ↓
2. Use synthetic route:
   → Borrow SOL from Marginfi (cheapest, deepest liquidity)
   → Swap SOL → mSOL via Sanctum (~0.03% cost)
   → Execute your logic with mSOL
   → Swap mSOL → SOL via Sanctum
   → Repay SOL + VAEA fee to Marginfi`} lang="text" />

    <h2 id="priority" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Protocol Priority</h2>
    <DocTable headers={['Priority', 'Protocol', 'Strengths']} rows={[
      [<Tag>1st</Tag>, <strong>Marginfi</strong>, 'Deepest liquidity for SOL, USDC, USDT — lowest borrow cost'],
      [<Tag color="sky">2nd</Tag>, <strong>Kamino</strong>, 'Best for cbBTC, JLP — alternative liquidity for SOL/USDC'],
      [<Tag color="default">3rd</Tag>, <strong>Save (Solend)</strong>, 'Fallback for major tokens when others are at capacity'],
    ]} />
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>Fallback is <strong>automatic and transparent</strong> — you don{"'"}t specify which protocol to use. If Marginfi is at capacity, VAEA silently falls back to Kamino, then Save.</p>

    <h2 id="swap" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Swap Providers</h2>
    <DocTable headers={['Provider', 'Used For', 'Typical Slippage']} rows={[
      [<strong>Sanctum</strong>, 'LSTs (mSOL, bSOL, INF, laineSOL)', <Tag color="sky">~0.03%</Tag>],
      [<strong>Jupiter</strong>, 'Everything else (BONK, TRUMP, PENGU…)', <Tag color="orange">~0.05–0.12%</Tag>],
    ]} />
    <Callout type="info">Sanctum is preferred for LSTs because it offers <strong>stake account routing</strong> with near-zero slippage.</Callout>

    <h2 id="fallback" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Fallback Behavior</h2>
    <Code code={`Request: Borrow 10,000 SOL
  ↓
Marginfi: 8,000 SOL available → NOT ENOUGH
  ↓ fallback
Kamino: 15,000 SOL available → ✓
  ↓
Borrow 10,000 SOL from Kamino`} lang="text" />
    <Callout type="tip">You can force a specific source with <code>source: {"'"}kamino{"'"}</code> in the options, but auto-routing handles 99% of cases optimally.</Callout>
  </>);
}
