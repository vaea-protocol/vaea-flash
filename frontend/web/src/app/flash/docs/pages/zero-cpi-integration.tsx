import { Code } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function ZeroCpiIntegration() {
  return (<>
    <div style={{ display: 'inline-flex', padding: '5px 14px', borderRadius: 'var(--r-full)', background: '#823FFF10', color: '#823FFF', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
      Coming Soon
    </div>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Zero-CPI Protocol Integration</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Allow any Solana protocol to <strong>verify it{"'"}s inside a VAEA flash loan</strong> — without consuming any CPI depth. This is unique to VAEA and solves a fundamental limitation of Solana flash loans.</p>

    <Callout type="warn">This feature is <strong>in development</strong> and not yet available. The API surface shown here is subject to change. We{"'"}re building this to give protocol developers the simplest possible flash loan integration — <strong>one crate, one function call, zero overhead</strong>.</Callout>

    <h2 id="overview" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Overview</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>Today, if a Solana protocol wants to accept flash-loaned funds, it has no way to <strong>verify</strong> that a flash loan is active. Our Zero-CPI pattern solves this by letting any program read VAEA{"'"}s <code>FlashState</code> PDA + perform instruction introspection — <strong>without a single CPI call to VAEA</strong>.</p>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>Protocol developers will simply add <code>vaea-flash-ctx</code> to their <code>Cargo.toml</code> and call one function:</p>
    <Code code={`[dependencies]
vaea-flash-ctx = "0.1"`} lang="toml" />

    <h2 id="problem" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>The Problem</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>Solana has a <strong>hard CPI depth limit of 4</strong>. When a protocol calls VAEA via CPI, it consumes precious depth:</p>
    <Code code={`Classic CPI approach — depth consumed:
  Protocol.execute()              → Level 1
    ├ CPI: VAEA.begin_flash()     → Level 2 (system_program → Level 3)
    ├ CPI: Jupiter.route()        → Level 2 (AMM.swap → Level 3, token → Level 4 ⚠)
    └ CPI: VAEA.end_flash()       → Level 2 (system_program → Level 3)

Problem: Jupiter → AMM → token_program uses 3 levels FROM the protocol.
If the protocol itself was called via CPI → depth EXCEEDED. ❌`} lang="text" />

    <h2 id="solution" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Zero-CPI Pattern</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>Instead of CPI, the protocol simply <strong>reads</strong> the VAEA FlashState PDA as a read-only account and uses instruction introspection to verify the flash loan context. <strong>Zero CPI to VAEA → full 4-level budget for the protocol{"'"}s own logic.</strong></p>
    <Code code={`// Inside your program — zero CPI to VAEA
pub fn my_self_liquidate(ctx: Context<SelfLiq>) -> Result<()> {
    // Verify flash loan context — reads PDA + sysvar, ZERO CPI
    let flash = vaea_flash_ctx::verify(
        &ctx.accounts.flash_state,
        &ctx.accounts.sysvar_ix,
    )?;

    // Access loan details:
    // flash.amount      = borrowed amount
    // flash.token_mint  = what was borrowed
    // flash.fee         = fee that will be paid

    // Your protocol keeps FULL CPI budget for its own logic:
    marginfi::cpi::repay(...)?;      // Level 1→2→3
    jupiter::cpi::route(...)?;       // Level 1→2→3→4 ← WORKS!

    Ok(())
}`} lang="rust" />

    <h2 id="cpi-budget" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>CPI Depth Comparison</h2>
    <DocTable headers={['Scenario', 'Classic CPI', 'Zero-CPI (VAEA)']} rows={[
      ['Protocol → Marginfi repay → token_program', '3 levels ✅', <Tag>3 levels ✅</Tag>],
      ['Protocol → Jupiter → AMM → token_program', <Tag color="coral">4 levels ⚠️</Tag>, <Tag>3 levels ✅</Tag>],
      ['ProtocolA → ProtocolB → Jupiter → AMM', <Tag color="coral">5 levels ❌</Tag>, <Tag>4 levels ✅</Tag>],
      ['Protocol → Sanctum → AMM → token_program', <Tag color="coral">4 levels ⚠️</Tag>, <Tag>3 levels ✅</Tag>],
    ]} />
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.88rem' }}>Our pattern saves <strong>1 full CPI level</strong> vs classic CPI, making synthetic routes and nested protocol calls viable.</p>

    <h2 id="usage" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Integration Example</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>The transaction structure with Zero-CPI:</p>
    <Code code={`TX: [
  IX 1: VAEA.begin_flash_protocol(token, amount)
  IX 2: YourProtocol.execute(flash_state_pda)  ← reads PDA, zero CPI
  IX 3: VAEA.end_flash_protocol()
]

// Your protocol's Accounts struct:
#[derive(Accounts)]
pub struct MyFlashAction<'info> {
    /// The VAEA FlashState PDA — read-only verification
    /// CHECK: verified by vaea_flash_ctx::verify()
    pub flash_state: AccountInfo<'info>,

    /// Instructions sysvar — for introspection
    pub sysvar_instructions: AccountInfo<'info>,

    // ... your other accounts
}`} lang="rust" />

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 24 }}>
      {[
        { title: 'Owner Check', desc: 'flash_state.owner == VAEA_PROGRAM_ID' },
        { title: 'PDA Derivation', desc: 'Verify seeds match [b"flash_p", payer, caller]' },
        { title: 'Forward Introspection', desc: 'end_flash_protocol exists AFTER current IX' },
        { title: 'Backward Introspection', desc: 'begin_flash_protocol exists BEFORE current IX' },
      ].map(c => (
        <div key={c.title} style={{ background: 'white', borderRadius: 16, padding: '14px 16px', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 800, fontSize: '0.82rem', marginBottom: 4, color: 'var(--emerald)' }}>✅ {c.title}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{c.desc}</div>
        </div>
      ))}
    </div>
    <Callout type="info">The <code>vaea-flash-ctx</code> crate will be published on <strong>crates.io</strong> with full documentation and example programs (self-liquidation, bridge relay). Follow our GitHub for updates.</Callout>
  </>);
}
