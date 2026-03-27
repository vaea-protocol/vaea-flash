# VAEA Flash — Examples

Runnable examples for the VAEA Flash SDKs.

Each example demonstrates a real-world use case:

| Directory | Language | Use Case |
|---|---|---|
| `typescript/` | TypeScript | Arbitrage bot — borrow SOL, execute arb, repay |
| `rust/` | Rust | Liquidation bot — flash JitoSOL, liquidate position |
| `python/` | Python | Collateral swap — swap mSOL→JitoSOL without closing position |

## Setup

All examples require a `.env` file with:

```env
RPC_URL=https://api.mainnet-beta.solana.com
WALLET_PRIVATE_KEY=your_base58_private_key
```

### TypeScript

```bash
cd examples/typescript
npm install
npm start
```

### Rust

```bash
cd examples/rust
cargo run
```

### Python

```bash
cd examples/python
pip install -r requirements.txt
python collateral_swap.py
```

## Security

⚠️ **Never commit your private key.** Use environment variables or a `.env` file (which is gitignored).

These examples use **mock instructions** — replace them with real DEX/lending protocol instructions for production use.
