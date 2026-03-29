import { Code } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function Fees() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Fees & Pricing</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Transparent fee model — <Tag>0.03%</Tag> for SDK users. No hidden costs.</p>

    <h2 id="model" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Fee Model</h2>
    <DocTable headers={['Source', 'VAEA Fee', 'Use Case']} rows={[
      [<code>source: {"'"}sdk{"'"}</code>, <Tag>0.03%</Tag>, 'Bots, protocols, developers'],
      [<code>source: {"'"}ui{"'"}</code>, <Tag color="default">0.05%</Tag>, 'Frontend users via vaea.fi'],
    ]} />

    <h2 id="calculator" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Fee Calculator</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>Total cost = VAEA fee + swap cost (synthetic routes only). Use <code>maxFeeBps</code> in SDK to auto-reject if fee exceeds your threshold.</p>

    <h2 id="direct-example" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Direct Route Example</h2>
    <Code code={`Borrow: 10,000 SOL (direct from Marginfi)
  VAEA fee:      0.03% = 3 SOL
  Swap cost:     0 SOL (no swap needed)
  ─────────────────────────────
  Total cost:    3 SOL (0.03%)
  You repay:     10,003 SOL`} lang="text" />

    <h2 id="synthetic-example" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Synthetic Route Example</h2>
    <Code code={`Borrow: 10,000 mSOL (synthetic via Sanctum)
  VAEA fee:        0.03% ≈ 3 SOL equivalent
  Swap SOL→mSOL:   ~0.03% ≈ 3 SOL
  Swap mSOL→SOL:   ~0.03% ≈ 3 SOL
  ─────────────────────────────
  Total cost:      ~9 SOL (~0.09%)`} lang="text" />

    <h2 id="comparison" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Fee Comparison</h2>
    <DocTable headers={['Protocol', 'Fee', 'Tokens', 'Notes']} rows={[
      [<strong>VAEA Flash</strong>, <Tag>0.03%</Tag>, '30 tokens', 'SDK rate — widest coverage'],
      ['Marginfi', <Tag color="sky">0%</Tag>, '6 tokens', 'Free but limited tokens, no fallback'],
      ['Solend', <Tag color="coral">0.3%</Tag>, '3 tokens', '10× more expensive than VAEA'],
      ['Jupiter Perps', 'Variable', 'SOL/USDC only', 'Perps pool only, not general-purpose'],
    ]} />
    <Callout type="tip">Use <strong>Fee Guard</strong> (<code>maxFeeBps</code>) to set a cost cap. See <a href="/flash/docs/fee-guard" style={{color:'var(--emerald)'}}>Fee Guard</a>.</Callout>
  </>);
}
