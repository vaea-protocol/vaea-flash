"""
VAEA Flash — Universal Flash Loan SDK for Solana (Python)

Example:
    >>> from vaea_flash import VaeaFlash, VaeaConfig
    >>> flash = VaeaFlash(VaeaConfig(api_url="https://api.vaea.fi"))
    >>> capacity = await flash.get_capacity()
    >>> quote = await flash.get_quote("mSOL", 1000)
    >>> print(f"Fee: {quote.fee_breakdown.total_fee_pct}%")
"""

import base64
from typing import List, Optional, Dict, Any

import httpx
from solders.instruction import Instruction, AccountMeta
from solders.pubkey import Pubkey
from solders.keypair import Keypair
from solders.transaction import VersionedTransaction
from solders.message import MessageV0

from .types import (
    VaeaConfig,
    VaeaError,
    VaeaErrorCode,
    CapacityResponse,
    QuoteResponse,
    BuildRequest,
    BuildResponse,
    HealthResponse,
    ApiInstructionData,
    TokenCapacity,
    SUPPORTED_TOKENS,
)


class VaeaFlash:
    """
    VAEA Flash — Universal Flash Loan SDK for Solana.

    Supports 22 SPL tokens including SOL, USDC, LSTs (mSOL, JitoSOL, bSOL, INF),
    majors (cbBTC, wETH), and mid-caps (BONK, WIF, PYTH, RAY, HNT, RNDR, JITO, KMNO).

    Example:
        ```python
        flash = VaeaFlash(VaeaConfig(api_url="https://api.vaea.fi"))

        # Check capacity
        capacity = await flash.get_capacity()
        for token in capacity.tokens:
            print(f"{token.symbol}: {token.max_amount} available")

        # Get quote
        quote = await flash.get_quote("SOL", 1000)
        print(f"Fee: {quote.fee_breakdown.total_fee_pct}%")

        # Build flash loan
        ixs = await flash.borrow("mSOL", 1000, user_instructions=[my_ix])
        ```
    """

    def __init__(self, config: Optional[VaeaConfig] = None):
        self.config = config or VaeaConfig()
        self.api_url = self.config.api_url
        self.source = self.config.source
        self._client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        """Close the HTTP client."""
        await self._client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self.close()

    # ═══════════════════════════════════════════════════════════
    #  GET /v1/capacity
    # ═══════════════════════════════════════════════════════════

    async def get_capacity(self) -> CapacityResponse:
        """
        Get real-time flash loan capacity for all 22 supported tokens.
        Data refreshes every 2 seconds from on-chain liquidity scanning.
        """
        data = await self._get("/v1/capacity")
        return CapacityResponse(**data)

    async def get_token_capacity(self, token: str) -> TokenCapacity:
        """
        Get capacity for a single token.

        Args:
            token: Token symbol (e.g. "mSOL") or mint address

        Raises:
            VaeaError: TOKEN_NOT_SUPPORTED if token is not found
        """
        capacity = await self.get_capacity()
        for t in capacity.tokens:
            if t.symbol.lower() == token.lower() or t.mint == token:
                return t
        raise VaeaError(
            VaeaErrorCode.TOKEN_NOT_SUPPORTED,
            f"Token '{token}' is not supported",
            {"supported": SUPPORTED_TOKENS},
        )

    # ═══════════════════════════════════════════════════════════
    #  GET /v1/quote
    # ═══════════════════════════════════════════════════════════

    async def get_quote(self, token: str, amount: float) -> QuoteResponse:
        """
        Get a real-time quote with exact fee breakdown.

        Args:
            token: Token symbol ("mSOL") or mint address
            amount: Amount in human-readable units (e.g. 1000 for 1000 mSOL)

        Returns:
            Detailed quote with fee breakdown, route info, and validity window

        Raises:
            VaeaError: INVALID_AMOUNT if amount <= 0
        """
        if amount <= 0:
            raise VaeaError(
                VaeaErrorCode.INVALID_AMOUNT,
                "Amount must be greater than 0",
                {"amount": amount},
            )
        data = await self._get(
            "/v1/quote",
            params={"token": token, "amount": amount, "source": self.source},
        )
        return QuoteResponse(**data)

    # ═══════════════════════════════════════════════════════════
    #  POST /v1/build
    # ═══════════════════════════════════════════════════════════

    async def build(self, request: BuildRequest) -> BuildResponse:
        """
        Build the prefix (begin_flash + borrow) and suffix (repay + end_flash) instructions.
        """
        payload = request.model_dump(exclude_none=True)
        if "source" not in payload:
            payload["source"] = self.source
        data = await self._post("/v1/build", json=payload)
        return BuildResponse(**data)

    # ═══════════════════════════════════════════════════════════
    #  GET /v1/health
    # ═══════════════════════════════════════════════════════════

    async def get_health(self) -> HealthResponse:
        """Check the health of all VAEA Flash components."""
        data = await self._get("/v1/health")
        return HealthResponse(**data)

    # ═══════════════════════════════════════════════════════════
    #  High-level: borrow()
    # ═══════════════════════════════════════════════════════════

    async def borrow(
        self,
        token: str,
        amount: float,
        user_pubkey: str,
        user_instructions: List[Instruction],
        slippage_bps: int = 50,
        max_fee_bps: Optional[int] = None,
    ) -> List[Instruction]:
        """
        Build a complete flash loan instruction list with your logic sandwiched
        between begin_flash and end_flash.

        Args:
            token: Token symbol ("mSOL") or mint address
            amount: Amount in human-readable units
            user_pubkey: Your wallet public key (base58)
            user_instructions: Your instructions to insert between borrow and repay
            slippage_bps: Max slippage in bps (default: 50 = 0.5%)
            max_fee_bps: Revert if total fee exceeds this (in bps)

        Returns:
            List of all instructions: prefix + user + suffix

        Raises:
            VaeaError: FEE_TOO_HIGH if fee exceeds max_fee_bps
        """
        # Fee guard
        if max_fee_bps is not None:
            quote = await self.get_quote(token, amount)
            actual_bps = int(quote.fee_breakdown.total_fee_pct * 100)
            if actual_bps > max_fee_bps:
                raise VaeaError(
                    VaeaErrorCode.FEE_TOO_HIGH,
                    f"Fee {actual_bps} bps exceeds max {max_fee_bps} bps",
                    {"actual_fee_bps": actual_bps, "max_fee_bps": max_fee_bps},
                )

        build_response = await self.build(BuildRequest(
            token=token,
            amount=amount,
            user_pubkey=user_pubkey,
            source=self.source,
            slippage_bps=slippage_bps,
            max_fee_bps=max_fee_bps,
        ))

        prefix = [self._parse_instruction(ix) for ix in build_response.prefix_instructions]
        suffix = [self._parse_instruction(ix) for ix in build_response.suffix_instructions]

        return prefix + list(user_instructions) + suffix

    # ═══════════════════════════════════════════════════════════
    #  borrow_multi() — Multi-Token Atomic Flash Loans
    # ═══════════════════════════════════════════════════════════

    async def borrow_multi(
        self,
        loans: List[Dict[str, Any]],
        user_pubkey: str,
        user_instructions: List[Instruction],
        slippage_bps: int = 50,
        max_fee_bps: Optional[int] = None,
    ) -> List[Instruction]:
        """
        Build a multi-token atomic flash loan with nested sandwich pattern:
          prefix_A → prefix_B → [user IXs] → suffix_B → suffix_A

        Args:
            loans: List of dicts with 'token' and 'amount' keys
            user_pubkey: Your wallet public key (base58)
            user_instructions: Your instructions to insert
            slippage_bps: Max slippage in bps (default: 50)
            max_fee_bps: Revert if total fee exceeds this

        Returns:
            List of all instructions: all prefixes + user + reversed suffixes
        """
        builds = []
        for loan in loans:
            build_response = await self.build(BuildRequest(
                token=loan["token"],
                amount=loan["amount"],
                user_pubkey=user_pubkey,
                source=self.source,
                slippage_bps=slippage_bps,
                max_fee_bps=max_fee_bps,
            ))
            builds.append(build_response)

        all_ixs = []

        # All prefixes in order
        for b in builds:
            all_ixs.extend(self._parse_instruction(ix) for ix in b.prefix_instructions)

        # User instructions
        all_ixs.extend(user_instructions)

        # All suffixes in reverse order (nested sandwich)
        for b in reversed(builds):
            all_ixs.extend(self._parse_instruction(ix) for ix in b.suffix_instructions)

        return all_ixs

    # ═══════════════════════════════════════════════════════════
    #  is_profitable() — Profitability Check
    # ═══════════════════════════════════════════════════════════

    async def is_profitable(
        self,
        token: str,
        amount: float,
        expected_revenue: float,
        jito_tip: float = 0.0,
        priority_fee: float = 0.0,
    ) -> "ProfitabilityResult":
        """
        Check if a flash loan strategy is profitable after all fees.

        Args:
            token: Token symbol or mint
            amount: Borrow amount in human units
            expected_revenue: Expected gross profit from strategy in SOL
            jito_tip: Optional Jito tip in SOL
            priority_fee: Optional priority fee in SOL

        Returns:
            ProfitabilityResult with net_profit, breakdown, and recommendation
        """
        from .profitability import calculate_profitability, ProfitabilityParams

        quote = await self.get_quote(token, amount)
        params = ProfitabilityParams(
            token=token,
            amount=amount,
            expected_revenue=expected_revenue,
            jito_tip=jito_tip,
            priority_fee=priority_fee,
        )
        return calculate_profitability(quote, params)

    # ═══════════════════════════════════════════════════════════
    #  Helpers
    # ═══════════════════════════════════════════════════════════

    @staticmethod
    def _parse_instruction(ix: ApiInstructionData) -> Instruction:
        """Convert API instruction data to a Solders Instruction."""
        accounts = [
            AccountMeta(
                pubkey=Pubkey.from_string(acc.pubkey),
                is_signer=acc.is_signer,
                is_writable=acc.is_writable,
            )
            for acc in ix.accounts
        ]
        return Instruction(
            program_id=Pubkey.from_string(ix.program_id),
            data=base64.b64decode(ix.data),
            accounts=accounts,
        )

    async def _get(self, path: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Make an authenticated GET request to the VAEA API."""
        try:
            response = await self._client.get(
                f"{self.api_url}{path}",
                params=params,
            )
            if response.status_code >= 400:
                self._handle_error(response)
            return response.json()
        except httpx.HTTPError as e:
            raise VaeaError(VaeaErrorCode.NETWORK_ERROR, f"Failed to reach VAEA API: {e}")

    async def _post(self, path: str, json: Dict[str, Any]) -> Dict[str, Any]:
        """Make an authenticated POST request to the VAEA API."""
        try:
            response = await self._client.post(
                f"{self.api_url}{path}",
                json=json,
            )
            if response.status_code >= 400:
                self._handle_error(response)
            return response.json()
        except httpx.HTTPError as e:
            raise VaeaError(VaeaErrorCode.NETWORK_ERROR, f"Failed to reach VAEA API: {e}")

    @staticmethod
    def _handle_error(response: httpx.Response) -> None:
        """Parse API error response and raise VaeaError."""
        try:
            body = response.json()
            error_code = body.get("error", "API_ERROR")
            message = body.get("message", f"API returned {response.status_code}")
            code = VaeaErrorCode(error_code) if error_code in VaeaErrorCode.__members__ else VaeaErrorCode.API_ERROR
            raise VaeaError(code, message, body)
        except (ValueError, KeyError):
            raise VaeaError(
                VaeaErrorCode.API_ERROR,
                f"API returned {response.status_code}: {response.text}",
            )
