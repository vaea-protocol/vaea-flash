import { Code, CodeTabs } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function SmartRetry() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Smart Retry</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Automatic transaction retry with <strong>priority fee escalation</strong> (×1.5 per attempt) and intelligent error classification. Never retries program errors.</p>

    <h2 id="how" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>How It Works</h2>
    <Code code={`Attempt 1: priority 1,000 µ-lamports → Timeout
  → Classify: 'congestion' → RETRY (×1.5 escalation, wait 400ms)
Attempt 2: priority 1,500 µ-lamports → BlockhashExpired
  → Classify: 'expired' → REBUILD + RETRY (fresh blockhash)
Attempt 3: priority 2,250 µ-lamports → Success ✓`} lang="text" />

    <h2 id="code" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Code Examples</h2>
    <CodeTabs
      ts={`const sig = await flash.executeLocal({
  token: 'SOL', amount: 1000,
  onFunds: async (ixs) => [...ixs, myArbIx],
}, {
  retry: {
    maxAttempts: 3,
    strategy: 'adaptive',   // smart retry with escalation
    onRetry: (attempt, reason) => {
      console.log(\`Retry #\${attempt}: \${reason}\`);
    },
  },
  priorityMicroLamports: 1000,
});`}
      rust={`let sig = flash.execute_with_retry(
    params,
    RetryConfig {
        max_attempts: 3,
        strategy: RetryStrategy::Adaptive,
        on_retry: Some(|attempt, reason| println!("Retry {attempt}: {reason:?}")),
    },
).await?;`}
      python={`sig = await flash.execute_local(
    params,
    retry={"max_attempts": 3, "strategy": "adaptive"},
    priority_micro_lamports=1000,
)`}
    />

    <h2 id="errors" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Error Classification</h2>
    <DocTable headers={['Classified As', 'Error Patterns', 'Action', 'Retried?']} rows={[
      [<Tag>expired</Tag>, <code>Blockhash not found, expired, block height exceeded</code>, 'Rebuild TX with fresh blockhash + retry', <Tag>✅</Tag>],
      [<Tag color="orange">congestion</Tag>, 'All other errors (timeout, network)', 'Priority fee ×1.5, wait 400ms, retry', <Tag>✅</Tag>],
      [<Tag color="coral">program_error</Tag>, <code>InstructionError, Custom(...), custom program error</code>, 'Stop immediately — your logic has a bug', <Tag color="coral">❌ Never</Tag>],
    ]} />

    <h2 id="config" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Configuration</h2>
    <DocTable headers={['Option', 'Type', 'Default', 'Description']} rows={[
      [<code>maxAttempts</code>, <code>number</code>, <Tag>3</Tag>, 'Maximum number of send attempts'],
      [<code>strategy</code>, <code>{`'none' | 'adaptive'`}</code>, <Tag>adaptive</Tag>, <><code>none</code> = single attempt, <code>adaptive</code> = smart retry</>],
      [<code>onRetry</code>, <code>(attempt, reason) =&gt; void</code>, 'undefined', 'Callback fired on each retry for logging'],
    ]} />
    <Callout type="warn"><strong>Program errors</strong> (logic bugs in your instructions) are <strong>never retried</strong>. This prevents wasting SOL on transactions that will always fail.</Callout>
    <Callout type="tip">When using <a href="/flash/docs/jito-bundles" style={{color:'var(--emerald)'}}>Jito Bundles</a>, Smart Retry escalates the <strong>tip amount</strong> instead of the priority fee.</Callout>
  </>);
}
