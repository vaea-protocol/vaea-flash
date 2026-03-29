import { Code, CodeTabs } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function SdkUtilities() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>SDK Utilities</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Helper methods available on the <code>VaeaFlash</code> client for monitoring and debugging.</p>

    <h2 id="token-capacity" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>getTokenCapacity()</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>Get capacity for a <strong>single token</strong> without loading all 26 tokens. Throws <code>TOKEN_NOT_SUPPORTED</code> if not found.</p>
    <CodeTabs
      ts={`const msol = await flash.getTokenCapacity('mSOL');
console.log(msol.max_amount);      // 12000
console.log(msol.route_type);      // 'synthetic'
console.log(msol.source_protocol); // 'Marginfi'
console.log(msol.swap_protocol);   // 'Sanctum'
console.log(msol.status);          // 'available' | 'degraded' | 'offline'

// Also works with mint address:
const sol = await flash.getTokenCapacity('So11111111111111111111111111111111111111112');`}
      rust={`let msol = flash.get_token_capacity("mSOL").await?;
println!("Available: {} mSOL", msol.max_amount);`}
      python={`msol = await flash.get_token_capacity("mSOL")
print(f"Available: {msol.max_amount} mSOL")`}
    />
    <DocTable headers={['Field', 'Type', 'Description']} rows={[
      [<code>symbol</code>, <code>string</code>, 'Token symbol (e.g. "mSOL")'],
      [<code>mint</code>, <code>string</code>, 'Token mint address'],
      [<code>decimals</code>, <code>number</code>, 'Token decimals'],
      [<code>max_amount</code>, <code>number</code>, 'Maximum borrowable amount (in token units)'],
      [<code>route_type</code>, <><code>direct</code> | <code>synthetic</code></>, 'How the token is sourced'],
      [<code>source_protocol</code>, <code>string</code>, 'Lending protocol providing the liquidity'],
      [<code>swap_protocol</code>, <code>string | null</code>, 'Swap provider (null for direct routes)'],
      [<code>status</code>, <><code>available</code> | <code>degraded</code> | <code>offline</code></>, 'Current availability status'],
    ]} />

    <h2 id="health" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>getHealth()</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>Check the health of all VAEA Flash infrastructure components. Useful for monitoring dashboards and alerting.</p>
    <CodeTabs
      ts={`const health = await flash.getHealth();

console.log(health.status);                    // 'ok'
console.log(health.components.redis.status);   // 'ok'
console.log(health.components.scanner.status); // 'ok'
console.log(health.components.scanner.cache_age_ms); // 1200
console.log(health.components.program.program_id);   // 'HoYiwk...'

// Source availability:
for (const [name, src] of Object.entries(health.sources)) {
  console.log(\`\${name}: \${src.status} — \${src.available_sol ?? 0} SOL\`);
}`}
      rust={`let health = flash.get_health().await?;
println!("Status: {}", health.status);`}
      python={`health = await flash.get_health()
print(f"Status: {health.status}")`}
    />
    <DocTable headers={['Component', 'Fields', 'Description']} rows={[
      [<code>components.redis</code>, <code>status</code>, 'Cache layer health'],
      [<code>components.scanner</code>, <><code>status</code>, <code>cache_age_ms</code></>, 'Liquidity scanner freshness'],
      [<code>components.program</code>, <code>program_id</code>, 'On-chain program ID'],
      [<code>sources</code>, <><code>status</code>, <code>available_sol</code></>, 'Per-protocol availability'],
    ]} />
    <Callout type="tip">Use <code>getHealth()</code> in your monitoring system to detect degraded sources. If a source goes <code>offline</code>, the SDK automatically falls back to the next available protocol.</Callout>
  </>);
}
