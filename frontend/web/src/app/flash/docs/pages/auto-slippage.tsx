import { Code, CodeTabs } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function AutoSlippage() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Auto Slippage</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Dynamic slippage calculation for synthetic routes — optimized per token category, liquidity depth, and trade size.</p>

    <h2 id="code" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Usage</h2>
    <CodeTabs
      ts={`// Auto — SDK calculates optimal slippage
await flash.executeLocal(params, { slippage: 'auto' });

// Manual override — exact bps value
await flash.executeLocal(params, { slippage: 50 }); // 50 bps

// Modes: 'auto', 'aggressive', 'safe', or exact number
import { calculateSlippageBps } from '@vaea/flash';
const bps = calculateSlippageBps('auto', 'synthetic', 0.05);
// Returns 45 bps for a synthetic route with 0.05% price impact`}
      rust={`flash.execute_local(params, ExecuteOptions {
    slippage: Slippage::Auto,
    ..Default::default()
}).await?;

// Or fixed value
flash.execute_local(params, ExecuteOptions {
    slippage: Slippage::Fixed(50),
    ..Default::default()
}).await?;`}
      python={`await flash.execute_local(params, slippage="auto")
await flash.execute_local(params, slippage=50)`}
    />

    <h2 id="by-token" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Slippage by Token Category</h2>
    <DocTable headers={['Route Type', 'Mode', 'Slippage']} rows={[
      ['Direct', <Tag>auto</Tag>, '10 bps (0.1%)'],
      ['Direct', <Tag color="sky">aggressive</Tag>, '5 bps (0.05%)'],
      ['Direct', <Tag color="orange">safe</Tag>, '50 bps (0.5%)'],
      ['Synthetic', <Tag>auto</Tag>, 'max(priceImpact × 200, 30) × 1.5'],
      ['Synthetic', <Tag color="sky">aggressive</Tag>, 'max(priceImpact × 200, 30) × 1.0'],
      ['Synthetic', <Tag color="orange">safe</Tag>, 'max(priceImpact × 200, 30) × 3.0'],
    ]} />

    <h2 id="manual" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Calculate Manually</h2>
    <Code code={`import { calculateSlippageBps } from '@vaea/flash';

// Modes: 'auto', 'aggressive', 'safe'
const bps = calculateSlippageBps('auto', 'synthetic', priceImpact);
// 'aggressive' — minimal slippage (may fail on volatile markets)
// 'safe'       — wide margin (always lands but costs more)
// 'auto'       — balanced, recommended for most use cases`} lang="typescript" />
    <Callout type="info">For direct routes, the slippage is minimal because no swap is involved. For synthetic routes, slippage scales with <strong>price impact</strong> — the SDK uses 2× the impact as a safety margin, with a minimum of 30 bps.</Callout>
  </>);
}
