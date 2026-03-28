import { Code } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function FAQ() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>FAQ</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Frequently asked questions about VAEA Flash.</p>

    <h2 id="what" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>What is a flash loan?</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>A flash loan lets you borrow tokens <strong>without collateral</strong>, as long as you repay within the <strong>same transaction</strong>. If repayment fails, the entire transaction reverts — you never received the tokens. The only cost on failure is the base TX fee (~0.000005 SOL).</p>

    <h2 id="difference" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>How is VAEA different from Marginfi/Solend?</h2>
    <DocTable headers={['Feature', 'VAEA Flash', 'Marginfi', 'Solend', 'Jupiter']} rows={[
      [<strong>Tokens</strong>, <Tag>27</Tag>, '6', '3', '2'],
      [<strong>SDK Fee</strong>, <Tag>0.03%</Tag>, '0%', '0.3%', 'Variable'],
      [<strong>SDKs</strong>, 'TS, Rust, Python', 'TS only', 'TS only', 'TS only'],
      [<strong>Turbo Mode</strong>, '✅', '❌', '❌', '❌'],
      [<strong>Jito Bundles</strong>, '✅ Built-in', '❌', '❌', '❌'],
      [<strong>Multi-Token Flash</strong>, '✅', '❌', '❌', '❌'],
      [<strong>Smart Retry</strong>, '✅', '❌', '❌', '❌'],
      [<strong>Auto Fallback</strong>, '✅', '❌', '❌', '❌'],
    ]} />

    <h2 id="devnet" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Can I use devnet?</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>Yes! VAEA Flash is deployed on Solana Devnet.</p>
    <Code code={`Program ID (devnet): HoYiwkNB7a3gmZXEkTqLkborNDc976vKEUAzBm8YpK5E
Program ID (mainnet): Coming April 2026

// Connect to devnet:
const flash = new VaeaFlash({
  connection: new Connection('https://api.devnet.solana.com'),
  wallet: myDevnetKeypair,
  source: 'sdk',
});

// Get devnet SOL: solana airdrop 2 --url devnet`} lang="typescript" />
    <Callout type="warn">Jito bundles are <strong>mainnet only</strong>. You can test all other features on devnet.</Callout>

    <h2 id="cost" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>How much does it cost?</h2>
    <DocTable headers={['Route Type', 'VAEA Fee', 'Swap Cost', 'Total']} rows={[
      ['Direct (SOL, USDC…)', <Tag>0.03%</Tag>, '0%', <Tag>0.03%</Tag>],
      ['Synthetic LST (mSOL…)', <Tag>0.03%</Tag>, '~0.03%', <Tag color="sky">~0.06%</Tag>],
      ['Synthetic Mid-cap (BONK…)', <Tag>0.03%</Tag>, '~0.08%', <Tag color="coral">~0.11%</Tag>],
    ]} />

    <h2 id="sdk" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Which SDK should I use?</h2>
    <DocTable headers={['Language', 'Package', 'Install']} rows={[
      [<strong>TypeScript</strong>, <code>@vaea/flash</code>, <code>npm install @vaea/flash</code>],
      [<strong>Rust</strong>, <code>vaea-flash-sdk</code>, <code>cargo add vaea-flash-sdk</code>],
      [<strong>Python</strong>, <code>vaea-flash</code>, <code>pip install vaea-flash</code>],
    ]} />
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>All three SDKs have <strong>identical feature parity</strong> — same methods, same options, same behavior. Choose based on your stack.</p>

    <Callout type="info"><strong>Zero data retention.</strong> VAEA has no database and stores no user data. All state is read from the Solana blockchain.</Callout>
  </>);
}
