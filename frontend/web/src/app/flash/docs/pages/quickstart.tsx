import { Code, CodeTabs } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function QuickStart() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Quick Start</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Install the SDK and execute your first flash loan in <strong>5 minutes</strong>.</p>

    <h2 id="install" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Installation</h2>
    <CodeTabs ts={`npm install @vaea/flash @solana/web3.js`} rust={`cargo add vaea-flash-sdk`} python={`pip install vaea-flash`} />

    <h2 id="init" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Initialize Client</h2>
    <CodeTabs
      ts={`import { VaeaFlash } from '@vaea/flash';
import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const wallet = Keypair.fromSecretKey(/* your key */);

const flash = new VaeaFlash({
  connection,
  wallet,
  source: 'sdk',   // 0.03% fee (vs 'ui' = 0.05%)
});`}
      rust={`use vaea_flash_sdk::{VaeaFlash, BorrowParams};

let flash = VaeaFlash::with_rpc(
    "https://api.vaea.fi",
    "https://api.mainnet-beta.solana.com",
    &payer,
)?;`}
      python={`from vaea_flash import VaeaFlash, VaeaConfig

async with VaeaFlash(VaeaConfig(
    api_url="https://api.vaea.fi",
    source="sdk",
)) as flash:
    # ready to use`}
    />
    <Callout type="info">
      <code>source: {"'"}sdk{"'"}</code> gives you the <strong>0.03% fee rate</strong>. Frontend integrations use <code>{"'"}ui{"'"}</code> at 0.05%.
    </Callout>

    <h2 id="first-loan" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>First Flash Loan</h2>
    <CodeTabs
      ts={`// Turbo mode — builds locally, zero API calls, ~100ms
const sig = await flash.executeLocal({
  token: 'SOL',
  amount: 1000,          // borrow 1,000 SOL
  onFunds: async (ixs) => {
    // Your logic here: arb, liquidation, collateral swap...
    ixs.push(myArbitrageInstruction);
    return ixs;
  },
});

console.log('Flash loan executed:', sig);

// Always clean up when done
flash.destroy();`}
      rust={`let sig = flash.execute(BorrowParams {
    token: "SOL".into(),
    amount: 1000.0,
    instructions: vec![my_arb_ix],
    slippage_bps: Some(50),
    max_fee_bps: Some(10),
}).await?;

println!("Flash loan executed: {}", sig);`}
      python={`ixs = await flash.borrow(
    token="SOL",
    amount=1000,
    user_pubkey=str(wallet.pubkey()),
    user_instructions=[my_arb_ix],
)

print(f"Flash loan executed: {ixs.signature}")`}
    />

    <h2 id="under-hood" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Under the Hood</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>When you call <code>executeLocal()</code>, the SDK:</p>
    <ol style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.9, paddingLeft: 22, marginBottom: 24 }}>
      <li><strong>Resolves the route</strong> — finds the best lending protocol (Marginfi → Kamino → Save)</li>
      <li><strong>Derives PDAs</strong> — computes program-derived accounts for the flash vault</li>
      <li><strong>Builds the sandwich</strong> — wraps your instructions between borrow and repay</li>
      <li><strong>Signs and sends</strong> — with priority fees, retries on transient errors</li>
    </ol>

    <h2 id="modes" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Execution Modes</h2>
    <DocTable
      headers={['Mode', 'Method', 'Latency', 'Network Calls', 'Best For']}
      rows={[
        [<strong>Turbo</strong>, <code>executeLocal()</code>, <Tag>~100ms</Tag>, '0 HTTP + 2 RPC', 'Bots, latency-critical'],
        [<strong>Standard</strong>, <code>execute()</code>, <Tag color="default">~180ms</Tag>, '1 HTTP + 2 RPC', 'General use'],
        [<strong>Simulation</strong>, <code>simulate()</code>, <Tag color="sky">~50ms</Tag>, '1 RPC', 'Testing, dry-runs'],
      ]}
    />
    <Callout type="tip"><strong>Turbo Mode</strong> is recommended for production bots. It builds instructions locally in ~91µs with zero API dependency.</Callout>

    <h2 id="devnet" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Devnet Testing</h2>
    <Callout type="warn">VAEA Flash is currently deployed on <strong>Solana Devnet</strong>. Mainnet launch is planned for <strong>April 2026</strong>.</Callout>
    <Code code={`// Program ID (devnet): HoYiwkNB7a3gmZXEkTqLkborNDc976vKEUAzBm8YpK5E
// Program ID (mainnet): Coming April 2026

// Get devnet SOL from faucet first:
// solana airdrop 2 --url devnet

const flash = new VaeaFlash({
  connection: new Connection('https://api.devnet.solana.com'),
  wallet: myDevnetKeypair,
  source: 'sdk',
});

const sig = await flash.executeLocal({
  token: 'SOL',
  amount: 0.01,  // small amount for testing
  onFunds: async (ixs) => {
    // Your test logic here
    return ixs;
  },
});`} lang="typescript" />
  </>);
}
