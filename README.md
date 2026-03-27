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

---

## What is VAEA Flash?

VAEA Flash lets you **borrow any SPL token** — SOL, stablecoins, LSTs, mid-caps — in a **single atomic transaction**, with no collateral required.

One SDK call. Any token. From **0.03%** fee.

```typescript
const sig = await flash.execute({
  token: 'mSOL',
  amount: 5000,
  onFunds: async (ixs) => {
    ixs.push(myArbitrageInstruction);
    return ixs;
  },
});
```

### Why VAEA Flash

| Problem | VAEA Solution |
|---|---|
| Existing flash loans only cover SOL, USDC, USDT | **21+ tokens** including LSTs and mid-caps |
| Each protocol has its own incompatible SDK | **One SDK**, one line of code, any token |
| No flash loans for mSOL, JitoSOL, BONK... | **Synthetic routing** via Sanctum & Jupiter |
| If a source is full, there's no fallback | **Automatic multi-protocol fallback** |

---

## Supported Tokens

### Direct Route (0.03% fee)

| Token | Source | Fallback |
|---|---|---|
| SOL | Jupiter Lend | Marginfi → Kamino → Save |
| USDC | Jupiter Lend | Marginfi → Kamino → Save |
| USDT | Jupiter Lend | Marginfi → Save |
| cbBTC | Jupiter Lend | Kamino |
| JupSOL | Jupiter Lend | — |
| JitoSOL | Jupiter Lend | Marginfi |
| JUP | Jupiter Lend | — |
| JLP | Jupiter Lend | — |

### Synthetic Route (via swap, ~0.09% fee)

mSOL · bSOL · INF · laineSOL · BONK · WIF · PYTH · RAY · HNT · RNDR · JITO · KMNO · wETH

---

## Quick Start

### TypeScript

```bash
npm install @vaea/flash @solana/web3.js
```

```typescript
import { VaeaFlash } from '@vaea/flash';
import { Connection, Keypair } from '@solana/web3.js';

const flash = new VaeaFlash({
  apiUrl: 'https://api.vaea.fi',
  connection: new Connection('https://api.mainnet-beta.solana.com'),
  wallet: myKeypair,
});

const sig = await flash.execute({
  token: 'SOL',
  amount: 1000,
  onFunds: async (ixs) => {
    ixs.push(myInstruction);
    return ixs;
  },
  maxFeeBps: 10,
});
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
```

### Python

```bash
pip install vaea-flash
```

```python
from vaea_flash import VaeaFlash, VaeaConfig

async with VaeaFlash(VaeaConfig(
    api_url="https://api.vaea.fi"
)) as flash:
    result = await flash.borrow(
        token="SOL",
        amount=1000,
        user_pubkey=str(wallet.pubkey()),
        user_instructions=[my_arb_ix],
    )
```

> See the [examples/](examples/) directory for complete, runnable scripts.

---

## Architecture

```
┌──────────────────────────────────────┐
│         Your App / Bot               │
│      SDK: TypeScript · Rust · Python │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│       VAEA Flash Backend API         │
│  Route Calculator · Liquidity Scanner│
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│    VAEA Flash On-Chain Program       │
│  begin_flash → your logic → end_flash│
└──────────┬───────────┬───────────────┘
           │           │
           ▼           ▼
   ┌──────────┐  ┌──────────────┐
   │  Direct  │  │  Synthetic   │
   │  Sources │  │  (via Swap)  │
   └──────────┘  └──────────────┘
```

VAEA Flash **owns no liquidity**. It routes borrows to existing lending protocols (Jupiter Lend, Marginfi, Kamino, Save) and applies a transparent fee layer.

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

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/v1/capacity` | Real-time borrowing capacity for all tokens |
| `GET` | `/v1/quote?token=SOL&amount=1000` | Fee quote with breakdown |
| `POST` | `/v1/build` | Build flash loan transaction |
| `GET` | `/v1/health` | System health and protocol status |

Base URL: `https://api.vaea.fi`

Full documentation: [vaea.fi/flash/docs](https://vaea.fi/flash/docs)

---

## Fee Model

| Route | Fee | Breakdown |
|---|---|---|
| **Direct** | **0.03%** | Source (0%) + VAEA (0.03%) |
| **Synthetic** | **~0.09%** | Source (0%) + Swap (~0.06%) + VAEA (0.03%) |

Use `maxFeeBps` in SDK calls to auto-reject transactions exceeding your threshold.

---

## Security

- The on-chain program uses **instruction introspection** to verify repayment within the same transaction
- All transactions are **atomic** — if repayment fails, the entire transaction reverts
- **Zero database, zero data retention** — VAEA reads on-chain state only
- The program will be audited before mainnet launch

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
