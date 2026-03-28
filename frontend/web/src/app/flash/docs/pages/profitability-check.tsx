import { Code, CodeTabs } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function ProfitabilityCheck() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Profitability Check</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Estimate all costs and determine if your flash loan is profitable <strong>before sending</strong>. Uses real-time fee data from the VAEA API.</p>

    <h2 id="code" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Usage</h2>
    <CodeTabs
      ts={`const check = await flash.isProfitable({
  token: 'SOL',
  amount: 1000,
  expectedRevenue: 0.5,    // expected profit in SOL
  jitoTip: 0.01,           // Jito tip
  priorityFee: 0.001,      // priority fee
});

if (check.recommendation === 'send') {
  const sig = await flash.executeLocal(params);
  console.log('Net profit:', check.netProfit, 'SOL');
} else {
  console.log('Skip — recommendation:', check.recommendation);
}`}
      rust={`let check = flash.is_profitable(ProfitParams {
    token: "SOL".into(), amount: 1000.0,
    expected_revenue: 0.5,
    jito_tip: Some(0.01),
    ..Default::default()
}).await?;

if check.recommendation == "send" {
    flash.execute(params).await?;
}`}
      python={`check = await flash.is_profitable(
    token="SOL", amount=1000,
    expected_revenue=0.5,
    jito_tip=0.01,
)
if check.recommendation == "send":
    sig = await flash.execute_local(params)`}
    />

    <h2 id="levels" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Recommendation Levels</h2>
    <DocTable headers={['Level', 'Condition', 'Suggested Action']} rows={[
      [<Tag>send</Tag>, 'Net profit > 2× total costs', 'Execute immediately — clearly profitable'],
      [<Tag color="orange">wait</Tag>, 'Net profit > costs but < 2×', 'Marginal — consider waiting for better opportunity'],
      [<Tag color="coral">abort</Tag>, 'Total costs > expected revenue', 'Skip — you would lose money'],
    ]} />

    <h2 id="breakdown" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Cost Breakdown</h2>
    <Code code={`{
  profitable: true,
  netProfit: 0.189,            // revenue - totalCost
  breakdown: {
    revenue: 0.5,              // your expectedRevenue
    vaeFee: 0.3,               // VAEA fee (0.03% of 1000 SOL)
    swapFees: 0,               // swap_in + swap_out (0 for direct)
    networkFee: 0.000005,      // ~5000 lamports base fee
    priorityFee: 0.001,        // your priority fee
    jitoTip: 0.01,             // your Jito tip
    totalCost: 0.311005,       // sum of all costs
  },
  recommendation: 'send',     // 'send' | 'wait' | 'abort'
}`} lang="typescript" />
    <Callout type="info">For synthetic routes, swap costs are estimated based on current Jupiter/Sanctum quotes. The calculator factors in all known costs.</Callout>
  </>);
}
