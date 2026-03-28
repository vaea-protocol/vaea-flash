import { Code } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function RestApi() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>REST API</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>Direct HTTP integration for custom integrations or languages without an SDK.</p>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}><strong>Base URL:</strong> <code>https://api.vaea.fi</code></p>
    <Callout type="info">If you{"'"}re using the TypeScript, Rust, or Python SDK, you <strong>don{"'"}t need the REST API</strong> — the SDK handles everything. Use the API for custom integrations or unsupported languages.</Callout>

    <h2 id="capacity" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>GET /v1/capacity</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>Returns real-time borrowing capacity for all 27 supported tokens.</p>
    <Code code={`curl https://api.vaea.fi/v1/capacity

// Response:
{
  "updated_at": "2026-03-28T20:00:00Z",
  "tokens": [
    {
      "symbol": "SOL",
      "mint": "So11111111111111111111111111111111111111112",
      "decimals": 9,
      "max_amount": 50000,
      "route_type": "direct",
      "source_protocol": "Marginfi",
      "swap_protocol": null,
      "status": "available"
    },
    {
      "symbol": "mSOL",
      "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
      "decimals": 9,
      "max_amount": 12000,
      "route_type": "synthetic",
      "source_protocol": "Marginfi",
      "swap_protocol": "Sanctum",
      "status": "available"
    }
  ]
}`} lang="bash" />

    <h2 id="quote" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>GET /v1/quote</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>Get a fee quote with full cost breakdown.</p>
    <Code code={`curl "https://api.vaea.fi/v1/quote?token=SOL&amount=1000&source=sdk"

// Response:
{
  "token": "SOL",
  "amount": 1000,
  "route_type": "direct",
  "source_protocol": "Marginfi",
  "fee_breakdown": {
    "source_fee": 0,
    "swap_in_fee": 0,
    "swap_out_fee": 0,
    "vaea_fee": 0.3,
    "total_fee_sol": 0.3,
    "total_fee_usd": 24.9,
    "total_fee_pct": 0.03
  }
}`} lang="bash" />

    <h2 id="build" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>POST /v1/build</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>Build flash loan instructions server-side. Returns base64-encoded instructions.</p>
    <Code code={`curl -X POST https://api.vaea.fi/v1/build \\
  -H "Content-Type: application/json" \\
  -d '{"token":"SOL","amount":1000,"payer":"YOUR_PUBKEY","source":"sdk"}'

// Response:
{
  "prefix_instructions": [
    {
      "program_id": "HoYiwkNB7a3gmZXEkTqLkborNDc976vKEUAzBm8YpK5E",
      "data": "BASE64_ENCODED...",
      "accounts": [
        { "pubkey": "...", "is_signer": true, "is_writable": true }
      ]
    }
  ],
  "suffix_instructions": [ ... ],
  "lookup_tables": ["DjncKSi9KqtnFx6hFYa7ARmwJ7B4Y7UH3XpR2XEuXNJr"],
  "estimated_fee_lamports": 300000
}`} lang="bash" />

    <h2 id="parse" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>parseApiInstruction()</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>SDK helper to convert API response instructions into native <code>TransactionInstruction</code>:</p>
    <Code code={`import { parseApiInstruction } from '@vaea/flash';

// Convert /v1/build response to native instructions
const buildResponse = await fetch('https://api.vaea.fi/v1/build', { ... });
const data = await buildResponse.json();

const prefixIxs = data.prefix_instructions.map(parseApiInstruction);
const suffixIxs = data.suffix_instructions.map(parseApiInstruction);

// Sandwich: prefix + your logic + suffix
const allIxs = [...prefixIxs, myArbIx, ...suffixIxs];`} lang="typescript" />

    <h2 id="health" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>GET /v1/health</h2>
    <Code code={`curl https://api.vaea.fi/v1/health

// Response:
{
  "status": "ok",
  "components": {
    "redis": { "status": "ok" },
    "scanner": { "status": "ok", "cache_age_ms": 1200 },
    "program": { "program_id": "HoYiwkNB7a3gmZXEkTqLkborNDc976vKEUAzBm8YpK5E" }
  },
  "sources": {
    "Marginfi": { "status": "available", "available_sol": 50000 },
    "Kamino": { "status": "available", "available_sol": 30000 }
  }
}`} lang="bash" />

    <h2 id="limits" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Rate Limits</h2>
    <DocTable headers={['Plan', 'Requests/min', 'Burst']} rows={[
      [<strong>Free</strong>, '100', '10/sec'],
      [<strong>Pro</strong>, '1,000', '50/sec'],
      [<strong>Enterprise</strong>, 'Unlimited', 'Unlimited'],
    ]} />
    <Callout type="tip">For 100+ req/min, use <code>executeLocal()</code> in <a href="/flash/docs/turbo-mode" style={{color:'var(--emerald)'}}>Turbo Mode</a> — it doesn{"'"}t call the API at all, so no rate limit applies.</Callout>
  </>);
}
