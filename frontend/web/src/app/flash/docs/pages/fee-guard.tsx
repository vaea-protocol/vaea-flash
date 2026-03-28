import { CodeTabs } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function FeeGuard() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Fee Guard</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Set a <strong>maximum fee limit</strong> in basis points. Transactions exceeding your threshold are automatically rejected <strong>before sending</strong> — no SOL wasted.</p>

    <h2 id="code" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Usage</h2>
    <CodeTabs
      ts={`try {
  const sig = await flash.execute({
    token: 'mSOL',
    amount: 500,
    onFunds: async (ixs) => {
      ixs.push(myIx);
      return ixs;
    },
    maxFeeBps: 15,  // reject if fee > 0.15%
  });
} catch (err) {
  if (err.code === 'FEE_TOO_HIGH') {
    console.log(\`Fee \${err.meta?.actualFeeBps} bps > max \${err.meta?.maxFeeBps} bps\`);
    // Skip this opportunity
  }
}`}
      rust={`let result = flash.execute(BorrowParams {
    token: "mSOL".into(),
    amount: 500.0,
    max_fee_bps: Some(15),
    ..Default::default()
}).await;

match result {
    Err(VaeaError::FeeTooHigh { actual_bps, .. }) => println!("Too high: {}", actual_bps),
    Ok(sig) => println!("Success: {}", sig),
    Err(e) => return Err(e),
}`}
      python={`try:
    sig = await flash.execute(
        token="mSOL", amount=500,
        max_fee_bps=15,
    )
except FeeTooHighError as e:
    print(f"Fee too high: {e.actual_bps} bps")`}
    />

    <h2 id="recommended" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Recommended Settings</h2>
    <DocTable headers={['Token Category', 'Suggested maxFeeBps', 'Reasoning']} rows={[
      ['Direct route (SOL, USDC)', <Tag>5 bps</Tag>, 'Only VAEA fee, no swap cost'],
      ['LSTs via Sanctum (mSOL, bSOL)', <Tag color="sky">10 bps</Tag>, 'Low swap cost via Sanctum'],
      ['Majors via Jupiter (TRUMP)', <Tag color="orange">15 bps</Tag>, 'Moderate swap cost'],
      ['Mid-caps via Jupiter (BONK)', <Tag color="coral">20 bps</Tag>, 'Higher swap slippage possible'],
    ]} />
    <Callout type="warn">When using <code>executeLocal()</code> (Turbo Mode), fee guard is skipped because there{"'"}s no API call. Use <code>isProfitable()</code> instead for turbo-mode cost validation.</Callout>
  </>);
}
