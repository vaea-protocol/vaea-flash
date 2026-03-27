"""
Example: Collateral Swap using VAEA Flash (Python)

Demonstrates how to swap lending collateral (mSOL → JitoSOL)
without closing your position, using a flash loan to avoid
liquidation risk during the swap.
"""

import asyncio
import os
from dotenv import load_dotenv
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.instruction import Instruction, AccountMeta
from vaea_flash import VaeaFlash, VaeaConfig


async def collateral_swap():
    load_dotenv()
    print("⚡ VAEA Flash — Collateral Swap Example (Python)\n")

    # 1. Setup wallet
    secret_key = os.getenv("WALLET_PRIVATE_KEY")
    if not secret_key:
        print("❌ WALLET_PRIVATE_KEY not set")
        return

    wallet = Keypair.from_base58_string(secret_key)
    print(f"Wallet: {wallet.pubkey()}")

    # 2. Initialize VAEA Flash
    config = VaeaConfig(
        api_url="https://api.vaea.fi",
        source="example_bot",
    )

    async with VaeaFlash(config) as flash:
        # 3. Check what's available
        capacity = await flash.get_capacity()
        for token in capacity:
            if token.symbol in ("mSOL", "JitoSOL"):
                print(f"  {token.symbol}: {token.max_amount:,.0f} available ({token.route_type})")

        # 4. Get a quote for the collateral we need
        borrow_amount = 1000  # 1,000 JitoSOL
        quote = await flash.get_quote("JitoSOL", borrow_amount)

        print(f"\nQuote for {borrow_amount} JitoSOL:")
        print(f"  Route: {quote.route_type}")
        print(f"  Source: {quote.source_protocol}")
        print(f"  Fee: {quote.fee.total_pct}%")
        print(f"  Cost: ~{borrow_amount * quote.fee.total_pct / 100:.2f} JitoSOL")

        # 5. Build collateral swap instructions
        # In production, these would be real lending protocol CPI calls:
        #   a. Deposit JitoSOL as new collateral
        #   b. Withdraw mSOL (old collateral, now safe because JitoSOL backs the loan)
        #   c. Swap mSOL → JitoSOL to repay the flash loan

        marginfi_program = Pubkey.from_string("MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA")

        deposit_ix = Instruction(
            program_id=marginfi_program,
            accounts=[],  # Populate with real accounts
            data=bytes(),
        )

        withdraw_ix = Instruction(
            program_id=marginfi_program,
            accounts=[],
            data=bytes(),
        )

        # 6. Execute flash loan
        print("\n🚀 Executing collateral swap via flash loan...")

        result = await flash.borrow(
            token="JitoSOL",
            amount=borrow_amount,
            user_pubkey=str(wallet.pubkey()),
            user_instructions=[deposit_ix, withdraw_ix],
            slippage_bps=50,
        )

        print(f"🎉 Success! TX: {result.signature}")
        print(f"🔗 https://solscan.io/tx/{result.signature}")
        print(f"\n✅ Collateral swapped: mSOL → JitoSOL")
        print(f"   Position intact, zero liquidation risk during swap")


if __name__ == "__main__":
    asyncio.run(collateral_swap())
