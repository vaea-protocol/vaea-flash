<p align="center">
  <img src="frontend/web/public/Logo_noire.png" alt="VAEA" height="60" />
</p>

<h1 align="center">VAEA Flash</h1>

<p align="center">
  <strong>The universal flash loan layer for Solana.</strong>
</p>

<p align="center">
  <a href="https://vaea.fi/flash"><img alt="App" src="https://img.shields.io/badge/app-vaea.fi-29C1A2?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@vaea/flash"><img alt="npm" src="https://img.shields.io/npm/v/@vaea/flash?style=flat-square&color=29C1A2" /></a>
  <a href="https://crates.io/crates/vaea-flash-sdk"><img alt="crates.io" src="https://img.shields.io/crates/v/vaea-flash-sdk?style=flat-square&color=FF718F" /></a>
  <a href="https://pypi.org/project/vaea-flash/"><img alt="PyPI" src="https://img.shields.io/pypi/v/vaea-flash?style=flat-square&color=823FFF" /></a>
  <a href="LICENSE"><img alt="License: BSL-1.1" src="https://img.shields.io/badge/license-BSL--1.1-blue?style=flat-square" /></a>
</p>

<p align="center">
  <a href="https://vaea.fi/flash/docs">Documentation</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="examples/">Examples</a> ·
  <a href="https://discord.gg/vaea">Discord</a> ·
  <a href="https://twitter.com/vaboratory">Twitter</a>
</p>

<p align="center">
  <img alt="Network" src="https://img.shields.io/badge/network-devnet-orange?style=flat-square" />
  <img alt="Mainnet" src="https://img.shields.io/badge/mainnet-April%202026-29C1A2?style=flat-square" />
</p>

> **⚠️ Status:** VAEA Flash est actuellement déployé sur **Solana Devnet**. Le lancement sur **Mainnet arrive très prochainement courant avril 2026**. Les SDKs, l'API et la documentation sont production-ready — seul le programme on-chain n'est pas encore live sur mainnet.

---

## What is VAEA Flash?

VAEA Flash lets you **borrow any SPL token** — SOL, stablecoins, LSTs, mid-caps — in a **single atomic transaction**, with no collateral required.

One SDK call. Any token. From **0.03%** fee. ~**100ms** latency.

```typescript
const sig = await flash.executeLocal({
  token: 'mSOL',
  amount: 5000,
  onFunds: async () => [myArbitrageInstruction],
});
```

### Why VAEA Flash

| Problem | VAEA Solution |
|---|---|
| Existing flash loans only cover SOL, USDC, USDT | **30 tokens** including LSTs, majors, and mid-caps |
| Each protocol has its own incompatible SDK | **One SDK**, one line of code, any token |
| No flash loans for mSOL, JitoSOL, BONK, TRUMP... | **Synthetic routing** via Sanctum & Jupiter |
| If a source is full, there's no fallback | **Automatic multi-protocol fallback** |
| Building TX requires RPC lookups (~300ms) | **Turbo Mode**: local build in ~91µs, zero HTTP |

---

## Supported Tokens (27)

### Direct Route (0.03% fee)

| Token | Source | Fallback |
|---|---|---|
| SOL | Marginfi | Kamino → Save |
| USDC | Marginfi | Kamino → Save |
| USDT | Marginfi | Save |
| cbBTC | Kamino | — |
| JupSOL | Marginfi | — |
| JitoSOL | Marginfi | — |
| JUP | Marginfi | — |
| JLP | Kamino | — |

### Synthetic Route (via swap, ~0.06–0.16%)

**LSTs via Sanctum** (~0.03% swap): mSOL · bSOL · INF · laineSOL

**Majors via Jupiter**: TRUMP · PENGU · VIRTUAL

**Mid-caps via Jupiter**: BONK · WIF · RAY · HNT · RNDR · JITO · KMNO

**Stablecoins via Jupiter**: PYUSD · USDS · USD1 · USDG · EURC

---

## Quick Start

### TypeScript

```bash
npm install @vaea/flash @solana/web3.js
```

```typescript
import { VaeaFlash } from '@vaea/flash';
import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const wallet = Keypair.fromSecretKey(/* your key */);

const flash = new VaeaFlash({
  connection,
  wallet,
  source: 'sdk',   // 0.03% fee (vs 'ui' = 0.05%)
});

// Turbo mode (~100ms) — builds instructions locally, zero API calls
const sig = await flash.executeLocal({
  token: 'SOL',
  amount: 1000,
  onFunds: async (ixs) => {
    ixs.push(myArbitrageInstruction);
    return ixs;
  },
});

console.log('Flash loan executed:', sig);

// Always clean up when done
flash.destroy();
```

### Rust

```bash
cargo add vaea-flash-sdk
```

```rust
use vaea_flash_sdk::{VaeaFlash, BorrowParams};

let flash = VaeaFlash::with_rpc(
    "https://api.vaea.fi",
    "https://api.mainnet-beta.solana.com",
    &payer,
)?;

let sig = flash.execute(BorrowParams {
    token: "SOL".into(),
    amount: 1000.0,
    instructions: vec![my_arb_ix],
    max_fee_bps: Some(10),
    ..Default::default()
}).await?;

println!("Flash loan executed: {}", sig);
```

### Python

```bash
pip install vaea-flash
```

```python
from vaea_flash import VaeaFlash, VaeaConfig

async with VaeaFlash(VaeaConfig(
    api_url="https://api.vaea.fi",
    source="sdk",
)) as flash:
    ixs = await flash.borrow(
        token="SOL",
        amount=1000,
        user_pubkey=str(wallet.pubkey()),
        user_instructions=[my_arb_ix],
    )
```

> See the [examples/](examples/) directory for complete, runnable scripts.

---

## Devnet Testing

VAEA Flash is currently deployed on **Solana Devnet only**. Mainnet deployment is coming in **April 2026**.

```
Program ID (devnet): HoYiwkNB7a3gmZXEkTqLkborNDc976vKEUAzBm8YpK5E
Program ID (mainnet): Coming April 2026
```

```typescript
const flash = new VaeaFlash({
  connection: new Connection('https://api.devnet.solana.com'),
  wallet: myDevnetKeypair,
  source: 'sdk',
});

// Request devnet SOL from faucet first:
// solana airdrop 2 --url devnet

const sig = await flash.executeLocal({
  token: 'SOL',
  amount: 0.01,  // small amount for testing
  onFunds: async (ixs) => {
    // Your test logic here
    return ixs;
  },
});
```

---

## Error Handling

All SDK errors use the `VaeaError` class with typed error codes:

```typescript
import { VaeaFlash, VaeaError } from '@vaea/flash';

try {
  const sig = await flash.executeLocal({
    token: 'SOL',
    amount: 1000,
    maxFeeBps: 5,
    onFunds: async (ixs) => {
      ixs.push(myArbIx);
      return ixs;
    },
  });
} catch (err) {
  if (err instanceof VaeaError) {
    switch (err.code) {
      case 'FEE_TOO_HIGH':
        console.log(`Fee ${err.meta?.actualFeeBps} bps > max ${err.meta?.maxFeeBps} bps`);
        break;
      case 'TOKEN_NOT_SUPPORTED':
        console.log('Token not in VAEA registry');
        break;
      case 'API_ERROR':
        console.log('Wallet or connection missing');
        break;
      default:
        console.log(`VAEA Error [${err.code}]: ${err.message}`);
    }
  } else {
    throw err;  // Not a VAEA error — rethrow
  }
}
```

---

## SDK Features

### 🚀 Turbo Mode — Local Instruction Builder

Build flash loan instructions **100% locally** — no API call, no HTTP, no network. The SDK replicates the backend's instruction builder with a hardcoded token registry.

```typescript
import { localBuild, TOKEN_REGISTRY } from '@vaea/flash';

// ~0.09ms — builds begin_flash + end_flash instructions locally
const { beginFlash, endFlash } = localBuild({
  payer: wallet.publicKey,
  token: 'SOL',
  amount: 1000,
});

// Use in your own transaction
const tx = new Transaction().add(beginFlash, myArbIx, endFlash);
```

**Why it matters for bots**: Standard SDKs need 2–4 RPC calls before you can even sign the transaction. VAEA's local builder does it in **91 microseconds** — 10,000x faster than an HTTP round-trip.

You can also use `localBuild()` directly to retain full control over transaction construction:

```typescript
import { localBuild } from '@vaea/flash';
import { TransactionMessage, VersionedTransaction } from '@solana/web3.js';

const { beginFlash, endFlash, expectedFeeNative } = localBuild({
  payer: wallet.publicKey,
  token: 'SOL',
  amount: 1000,
});

// Build a VersionedTransaction (Solana best practice)
const { blockhash } = await connection.getLatestBlockhash();
const message = new TransactionMessage({
  payerKey: wallet.publicKey,
  recentBlockhash: blockhash,
  instructions: [beginFlash, myArbIx, endFlash],
}).compileToV0Message(lookupTables);

const tx = new VersionedTransaction(message);
tx.sign([wallet]);
const sig = await connection.sendTransaction(tx, { skipPreflight: true });
```

---

### 🔬 Simulation — Dry-Run Before Sending

Test your flash loan transaction without risking any SOL. Uses Solana's `simulateTransaction` with `sigVerify: false`.

```typescript
const result = await flash.simulate({
  token: 'SOL',
  amount: 1000,
  instructions: [myArbIx],  // TransactionInstruction[]
});

console.log(result.success);       // true/false
console.log(result.computeUnits);  // exact CU consumed
console.log(result.logs);          // full program logs
```

**Why it matters**: Catch errors before they cost you transaction fees. Essential for testing new strategies.

---

### ⚡ Multi-Token Flash Loans

Borrow **multiple tokens atomically** in a single transaction using a nested sandwich pattern:

```
begin_flash(SOL) → begin_flash(USDC) → [your logic] → end_flash(USDC) → end_flash(SOL)
```

```typescript
const ixs = await flash.borrowMulti({
  loans: [
    { token: 'SOL', amount: 1000 },
    { token: 'USDC', amount: 50000 },
  ],
  onFunds: async () => [myComplexArbIx],
});
```

**Why it matters**: Enables cross-token arbitrage strategies that need capital in multiple assets simultaneously — all with zero upfront capital.

---

### 📊 Profitability Calculator

Check if your strategy is profitable **before** sending the transaction. Uses real-time fee data from the VAEA API.

```typescript
const result = await flash.isProfitable({
  token: 'SOL',
  amount: 1000,
  expectedRevenue: 0.5,    // expected profit in SOL
  jitoTip: 0.01,           // Jito tip
  priorityFee: 0.001,      // priority fee
});

console.log(result.profitable);      // true
console.log(result.netProfit);       // 0.189 SOL
console.log(result.recommendation);  // 'send' | 'wait' | 'abort'
```

**Why it matters**: Stop losing money on unprofitable transactions. The calculator factors in VAEA fees, swap fees, network fees, priority fees, and Jito tips.

---

### 🎯 Auto Slippage

Calculate optimal slippage based on route type and price impact:

```typescript
import { calculateSlippageBps } from '@vaea/flash';

const bps = calculateSlippageBps('auto', 'synthetic', 0.05);
// Returns 45 bps for a synthetic route with 0.05% price impact

// Modes: 'auto' (balanced), 'aggressive' (minimal), 'safe' (wide), or exact number
```

---

### 🔄 Smart Retry

Automatic transaction retry with blockhash refresh and escalating priority fees:

```typescript
const sig = await flash.execute({
  token: 'SOL',
  amount: 1000,
  onFunds: async () => [myArbIx],
}, {
  retry: {
    maxAttempts: 3,
    strategy: 'adaptive',  // priority fee x1.5 each retry
  },
  priorityMicroLamports: 1000,
});
```

The retry logic classifies errors:
- **Blockhash expired** → rebuild TX with fresh blockhash
- **Congestion** → escalate priority fee
- **Program error** → never retried (your logic has a bug)
---

### 🔗 Jito Bundle Integration

Send flash loans via [Jito Block Engine](https://jito.wtf) for **bundle privacy** (not in public mempool) and atomic execution. Add 2 lines to any `executeLocal()` call:

```typescript
const sig = await flash.executeLocal({
  token: 'SOL',
  amount: 1000,
  onFunds: async (ixs) => {
    ixs.push(myArbitrageInstruction);
    return ixs;
  },
}, {
  sendVia: 'jito',
  jito: {
    tip: 'competitive',   // auto-calculated tip
    region: 'amsterdam',  // nearest Block Engine
  },
});
```

**Tip Strategies:**

| Strategy | Tip Amount | Use Case |
|:--|:--|:--|
| `'min'` | ~1–5K lamports | Low-value opportunities, testing |
| `'competitive'` | ~10–50K lamports | Recommended for most bots |
| `'aggressive'` | 100K+ lamports | High-value liquidations, critical arbs |
| `number` | Exact lamports | Full manual control |

**What this gives you:**
- ✅ Bundle privacy — your TX is not in the public mempool
- ✅ Auto-calculated tip based on Jito tip floor
- ✅ Smart retry works with Jito (escalates tip on failure)
- ✅ Zero new npm dependencies — pure `fetch()` to Block Engine

**What this does NOT guarantee:**
- ❌ Landing in X blocks — tip is competitive, not a guarantee
- ❌ Full MEV protection — bundles are private, but not invulnerable

---

### 🔥 Warm Cache — Background Pre-Warming

Keep capacity data hot with a background poller:

```typescript
const flash = new VaeaFlash({
  apiUrl: 'https://api.vaea.fi',
  connection,
  wallet,
  preWarm: true,  // polls /v1/capacity every 2s
});

// First getCapacity() is instant — data already cached
const capacity = await flash.getCapacity();
```

**Why it matters**: Eliminates the cold-start penalty on your first call. Useful for bots that need to react instantly to market opportunities.

---

### 🛡️ Fee Guard

Automatically reject transactions where the fee exceeds your threshold:

```typescript
const sig = await flash.execute({
  token: 'mSOL',
  amount: 500,
  onFunds: async (ixs) => {
    ixs.push(myIx);
    return ixs;
  },
  maxFeeBps: 15,  // reject if fee > 0.15%
});
// Throws VaeaError('FEE_TOO_HIGH') if fee exceeds 15 bps
```

> **Note:** When using `executeLocal()`, fee guard is skipped (no API call needed). Use the `isProfitable()` method instead for turbo-mode cost validation.

---

## Architecture

```
┌──────────────────────────────────────────────┐
│         Your App / Bot                       │
│  SDK: TypeScript · Rust · Python             │
│  ┌────────────────────────────────────────┐  │
│  │ Turbo: localBuild() — zero API calls   │  │
│  └────────────────────────────────────────┘  │
└──────────────┬───────────────────────────────┘
               │ (only if using standard mode)
               ▼
┌──────────────────────────────────────────────┐
│       VAEA Flash Backend API                 │
│  Route Calculator · Liquidity Scanner        │
│  Pure CPU: 0 RPC calls during /v1/build      │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│    VAEA Flash On-Chain Program               │
│  begin_flash → your logic → end_flash        │
│  Instruction introspection via sysvar        │
└──────────┬───────────┬───────────────────────┘
           │           │
           ▼           ▼
   ┌──────────┐  ┌──────────────┐
   │  Direct  │  │  Synthetic   │
   │  Sources │  │  (via Swap)  │
   └──────────┘  └──────────────┘
```

VAEA Flash **owns no liquidity**. It routes borrows to existing lending protocols (Marginfi, Kamino, Save) and applies a transparent fee layer.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/v1/capacity` | Real-time borrowing capacity for all 30 tokens |
| `GET` | `/v1/quote?token=SOL&amount=1000` | Fee quote with breakdown |
| `POST` | `/v1/build` | Build flash loan instructions (prefix + suffix) |
| `GET` | `/v1/health` | System health and protocol status |

Base URL: `https://api.vaea.fi`

Full documentation: [vaea.fi/flash/docs](https://vaea.fi/flash/docs)

---

## Fee Model

| Route | Fee | Breakdown |
|---|---|---|
| **Direct** | **0.03%** | Source (0%) + VAEA (0.03%) |
| **Synthetic** | **~0.06–0.16%** | Source (0%) + Swap (variable) + VAEA (0.03%) |

Use `maxFeeBps` in SDK calls to auto-reject transactions exceeding your threshold.

---

## Performance

| Metric | Value |
|---|---|
| **Turbo Mode latency** | **~100ms** (local build + 2 RPC) |
| **Standard Mode latency** | **~180ms** (1 HTTP + 2 RPC) |
| **Local instruction build** | **~91µs** (0.09ms, zero network) |
| **TX overhead** | **36 bytes** (4 accounts via ALT compression) |
| **Compute Units** | ~23,000 CU (1.6% of TX budget) |
| **Program size** | 235 KB |
| **API latency** | <5ms (cached, no RPC during build) |

```typescript
import { VAEA_LOOKUP_TABLE } from '@vaea/flash';
// DjncKSi9KqtnFx6hFYa7ARmwJ7B4Y7UH3XpR2XEuXNJr
// Auto-used in execute() / executeLocal() — zero config needed
```

---

## Complete Example — Arbitrage Bot

A minimal but complete, runnable TypeScript bot:

```typescript
import { VaeaFlash, VaeaError, localBuild } from '@vaea/flash';
import { Connection, Keypair, SystemProgram } from '@solana/web3.js';
import fs from 'fs';

async function main() {
  // 1. Setup
  const wallet = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('~/.config/solana/id.json', 'utf-8')))
  );
  const flash = new VaeaFlash({
    connection: new Connection('https://api.devnet.solana.com'),
    wallet,
    preWarm: true,  // background capacity polling
  });

  try {
    // 2. Check profitability
    const profit = await flash.isProfitable({
      token: 'SOL',
      amount: 100,
      expectedRevenue: 0.1,  // expected profit in SOL
      jitoTip: 0.001,
    });

    if (profit.recommendation === 'abort') {
      console.log(`Unprofitable: net=${profit.netProfit} SOL`);
      return;
    }

    // 3. Execute flash loan (Turbo mode — ~100ms)
    const sig = await flash.executeLocal({
      token: 'SOL',
      amount: 100,
      onFunds: async (ixs) => {
        // Your arbitrage logic here
        ixs.push(SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey,
          lamports: 0,
        }));
        return ixs;
      },
    }, {
      retry: { maxAttempts: 3, strategy: 'adaptive' },
      priorityMicroLamports: 1000,
    });

    console.log('✅ Flash loan executed:', sig);

  } catch (err) {
    if (err instanceof VaeaError) {
      console.error(`VAEA Error [${err.code}]: ${err.message}`);
    } else {
      throw err;
    }
  } finally {
    flash.destroy();  // Clean up background poller
  }
}

main();
```

---

## Security

- **Instruction introspection** verifies `begin_flash` ↔ `end_flash` pairing within the same TX
- All transactions are **atomic** — if repayment fails, the entire transaction reverts
- **Zero database, zero data retention** — VAEA reads on-chain state only
- **Deployer-restricted initialization** — only the protocol deployer can init the Config PDA
- **Fee floor protection** — minimum 1 lamport fee prevents micro-loan evasion
- **Strict authority checks** — `require!` enforced on all admin operations
- PDA seeds include `token_mint` — prevents cross-token PDA collisions in multi-flash
---

## Roadmap

| Phase | Status | Description |
|---|---|---|
| **V1 Beta** | ✅ Live (Devnet) | Flash loans via protocol aggregation — 30 tokens, 3 SDKs, REST API, dashboard |
| **Mainnet Launch** | 🔜 April 2026 | Production deployment, audit, public launch |
| **Zero-CPI Integration** | 🔬 In Development | Protocol-level flash loan verification without CPI overhead |
| **vSOL V2** | 📋 Planned | Unlimited flash loans via synthetic mint/burn — zero congestion |

---

## Coming Soon

### 🔌 Zero-CPI Protocol Integration

A new pattern that allows any Solana protocol to **verify it's inside a VAEA flash loan without consuming any CPI depth**. Protocols simply read the VAEA `FlashState` PDA + perform instruction introspection — zero CPI calls to VAEA.

**Why it matters:** Solana has a hard CPI depth limit of 4. Classic CPI flash loans consume 1-2 levels, leaving protocols unable to perform complex operations (Jupiter swaps through AMMs). Our Zero-CPI pattern saves **1 full CPI level**, making synthetic routes and nested protocol calls viable.

```rust
// Inside your protocol — zero CPI to VAEA
let flash = vaea_flash_ctx::verify(&ctx.accounts.flash_state, &ctx.accounts.sysvar_ix)?;
// flash.amount, flash.token_mint, flash.fee — all verified, zero overhead
```

A `vaea-flash-ctx` crate will be published on **crates.io** for easy integration.

### ✨ vSOL — Unlimited Flash Loans

A fundamentally new approach that eliminates congestion and removes dependence on third-party lending protocols. Instead of borrowing from pools, VAEA will **mint synthetic vSOL** during a flash loan and **burn it at the end** — net supply change = 0.

**Why it matters:** During a market crash, pool-based flash loans drain instantly. With mint/burn, every transaction creates its own tokens — **200 bots can execute 10M SOL of flash loans in a single block** with zero contention.

| | Pool-based (V1) | Mint/Burn (V2) |
|---|---|---|
| **Capacity** | Limited by pool size | Unlimited ($100M cap/TX) |
| **Congestion** | Drains under load | Zero — each TX independent |
| **Dependencies** | Marginfi, Kamino, Save | None — VAEA is the source |
| **Security** | Atomic repayment | Atomic burn + same-slot enforcement |

vSOL will also be a **yield-bearing LST** via Sanctum, listed on Jupiter, usable as collateral — giving holders staking yield + flash loan fee share.

> **Note:** vSOL V2 will be **backwards compatible**. The SDK API stays the same — `executeLocal()` will automatically use the vSOL path when available. No code changes needed.

---

## Repository Structure

```
vaea-flash/
├── sdk/
│   ├── typescript/        # @vaea/flash — npm package
│   ├── rust/              # vaea-flash-sdk — crates.io
│   └── python/            # vaea-flash — PyPI
├── frontend/
│   └── web/               # Next.js dashboard — vaea.fi/flash
├── examples/
│   ├── typescript/        # TS example scripts
│   ├── rust/              # Rust example scripts
│   └── python/            # Python example scripts
└── LICENSE                # BSL-1.1
```

> **Note:** The on-chain program and backend service are maintained in a [separate private repository](https://github.com/vaea-protocol/vaea-core) for security.

---

## Contributing

We welcome contributions to the SDKs, frontend, and examples. Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

---

## Community

- 🌐 **Website:** [vaea.fi](https://vaea.fi)
- 📖 **Docs:** [vaea.fi/flash/docs](https://vaea.fi/flash/docs)
- 🐦 **Twitter:** [@vaboratory](https://twitter.com/vaboratory)
- 💬 **Discord:** [discord.gg/vaea](https://discord.gg/vaea)

---

## License

VAEA Flash is licensed under the [Business Source License 1.1](LICENSE).

The Licensed Work is the VAEA Flash Protocol. The Change Date is March 27, 2030. On the Change Date, the Licensed Work will convert to the Apache License, Version 2.0.

**Usage Grants:** You may use, copy, and modify the Licensed Work for any purpose except for operating a production service that competes with VAEA Flash. Integration and SDK usage are always permitted.
