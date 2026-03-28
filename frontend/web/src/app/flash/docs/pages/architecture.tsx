import { Code } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function Architecture() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Architecture</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>How VAEA Flash works under the hood — the sandwich pattern, program accounts, multi-protocol routing, and security guarantees.</p>

    <h2 id="sandwich" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Sandwich Pattern</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>Every VAEA Flash loan is a <strong>single atomic Solana transaction</strong>. Your instructions are sandwiched between a <code>begin_flash</code> (borrow) and <code>end_flash</code> (repay) instruction.</p>
    <Code code={`┌──────────────────────────────────────────────────┐
│                Solana Transaction                 │
│                                                   │
│  IX 1:  begin_flash(SOL, 1000)                    │
│         → Transfer 1000 SOL from vault to wallet  │
│                                                   │
│  IX 2:  your_arbitrage_ix()                       │
│  IX 3:  your_swap_ix()                            │
│  IX 4:  ... (any number of instructions)          │
│                                                   │
│  IX N:  end_flash(SOL)                            │
│         → Transfer SOL + 0.03% fee back to vault  │
│         → If insufficient balance → TX REVERTS    │
└──────────────────────────────────────────────────┘`} lang="text" />
    <Callout type="info">The <strong>atomicity guarantee</strong> means you can never end up in a state where you borrowed tokens but failed to repay. Either everything succeeds, or nothing happens. You only lose the base TX fee (~0.000005 SOL) on failure.</Callout>

    <h2 id="pdas" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Program Accounts (PDAs)</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>The on-chain program uses Program Derived Addresses (PDAs) to manage state:</p>
    <DocTable headers={['Account', 'PDA Seeds', 'Purpose']} rows={[
      [<strong>Flash Vault</strong>, <code>[&quot;flash&quot;, token_mint]</code>, 'Holds borrowed tokens during the transaction'],
      [<strong>User State</strong>, <code>[&quot;flash&quot;, payer, token_mint]</code>, 'Tracks the active loan for a specific user/token pair'],
      [<strong>Config</strong>, <code>[&quot;config&quot;]</code>, 'Global protocol configuration (fee rates, authority)'],
    ]} />
    <Callout type="tip">The SDK derives all PDAs automatically. You never need to compute them manually — <code>executeLocal()</code> handles everything.</Callout>

    <h2 id="routing" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Multi-Protocol Routing</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>VAEA Flash <strong>doesn{"'"}t hold any liquidity</strong>. It routes borrows through existing lending protocols with automatic fallback:</p>
    <Code code={`Your Request: "Borrow 1000 mSOL"
       ↓
VAEA Router:
  1. Check Marginfi   → has mSOL?  → NO
  2. Check Kamino     → has mSOL?  → NO
  3. Check Save       → has mSOL?  → NO
  4. No direct route  → Synthetic:
     → Borrow SOL from Marginfi (deepest pool)
     → Swap SOL → mSOL via Sanctum (~0.03% slippage)
     → You get mSOL ✓`} lang="text" />
    <DocTable headers={['Protocol', 'Role', 'Tokens Served']} rows={[
      [<strong>Marginfi</strong>, 'Primary lender', 'SOL, USDC, USDT, JupSOL, JitoSOL, JUP'],
      [<strong>Kamino</strong>, 'Fallback', 'SOL, USDC, cbBTC, JLP'],
      [<strong>Save (Solend)</strong>, 'Third fallback', 'SOL, USDC, USDT'],
    ]} />

    <h2 id="alt" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Address Lookup Tables</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>VAEA uses a pre-deployed <strong>Address Lookup Table (ALT)</strong> to compress transactions — saving <Tag color="purple">~124 bytes</Tag> per TX. Since Solana transactions are limited to 1232 bytes, this leaves maximum room for your instructions.</p>
    <Code code={`import { VAEA_LOOKUP_TABLE } from '@vaea/flash';
// DjncKSi9KqtnFx6hFYa7ARmwJ7B4Y7UH3XpR2XEuXNJr

// The ALT contains 4 fixed accounts:
// [0] Config PDA           — 27qrSQk6xUGtdMQmMobsQWCSts67jtXqA2gZzPK1wubQ
// [1] Fee Vault PDA        — BQNpRH1kahoFqxu5tiZaQYuKb7p41o3cmyXrFWsDmYPn
// [2] Sysvar Instructions  — Sysvar1nstructions1111111111111111111111111
// [3] System Program       — 11111111111111111111111111111111

// Auto-used by execute() / executeLocal() — zero config
// Fetched once and cached for the lifetime of the VaeaFlash instance`} lang="typescript" />

    <h2 id="security" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Security Model</h2>
    <DocTable headers={['Security Feature', 'Detail']} rows={[
      [<strong>Instruction introspection</strong>, <><code>begin_flash</code> ↔ <code>end_flash</code> pairing verified within the same TX via sysvar</>],
      [<strong>Atomicity</strong>, 'If repay fails, entire TX reverts — no partial execution possible'],
      [<strong>Non-custodial</strong>, 'Tokens flow: lending protocol → you → lending protocol. VAEA never holds funds'],
      [<strong>Permissionless</strong>, 'Anyone can use — no KYC, no registration, no approval needed'],
      [<strong>Fee floor</strong>, 'Minimum 1 lamport fee prevents micro-loan evasion'],
      [<strong>Cross-token isolation</strong>, 'PDA seeds include token_mint — prevents collisions in multi-token flash'],
      [<strong>Zero data retention</strong>, 'No database. On-chain state reads only. Zero user data stored'],
    ]} />
  </>);
}
