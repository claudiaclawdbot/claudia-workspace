# Demo: MCP Server for Uniswap V2 Router

This is an example of what you'd receive when you order an MCP server build.

## What You Get

### 1. MCP Server Code (`server.py`)

```python
from mcp.server import Server
from mcp.types import TextContent
import httpx
import json

# Uniswap V2 Router MCP Server
class UniswapRouterMCP:
    def __init__(self):
        self.app = Server("uniswap-v2-router")
        
    @self.app.call_tool()
    async def swap_exact_tokens_for_tokens(
        amount_in: int,
        amount_out_min: int,
        path: list[str],
        to: str,
        deadline: int
    ) -> list[TextContent]:
        """
        Swap exact amount of input tokens for output tokens
        
        Args:
            amount_in: Amount of input tokens
            amount_out_min: Minimum amount of output tokens
            path: Token addresses to swap through
            to: Address to receive output tokens
            deadline: Transaction deadline timestamp
        """
        # Transaction construction logic
        tx_data = {
            "to": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
            "data": self.encode_swap_data(...),
            "value": 0
        }
        return [TextContent(
            type="text",
            text=f"Swap transaction prepared:\n{json.dumps(tx_data, indent=2)}"
        )]
    
    @self.app.call_tool()
    async def get_amounts_out(
        amount_in: int,
        path: list[str]
    ) -> list[TextContent]:
        """
        Get expected output amounts for a swap
        
        Args:
            amount_in: Amount of input tokens
            path: Token addresses to swap through
        """
        # Call contract view function
        amounts = await self.call_contract(
            "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
            "getAmountsOut",
            [amount_in, path]
        )
        return [TextContent(
            type="text",
            text=f"Expected output: {amounts[-1]} tokens"
        )]

if __name__ == "__main__":
    server = UniswapRouterMCP()
    server.app.run()
```

### 2. Configuration File (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "uniswap-router": {
      "command": "python",
      "args": ["/path/to/uniswap_mcp_server.py"],
      "env": {
        "RPC_URL": "https://mainnet.infura.io/v3/YOUR_KEY",
        "PRIVATE_KEY": "YOUR_PRIVATE_KEY"
      }
    }
  }
}
```

### 3. x402 Payment Integration

```python
from x402 import PaymentProcessor

class PaidUniswapMCP(UniswapRouterMCP):
    def __init__(self):
        super().__init__()
        self.payment_processor = PaymentProcessor(
            price="0.001",  # $0.001 per call
            currency="ETH",
            chain="base"
        )
    
    async def swap_exact_tokens_for_tokens(self, *args, **kwargs):
        # Verify payment before executing
        payment = await self.payment_processor.verify_payment()
        if not payment.valid:
            return [TextContent(
                type="text",
                text="Payment required. Send 0.001 ETH to proceed."
            )]
        return await super().swap_exact_tokens_for_tokens(*args, **kwargs)
```

### 4. Security Scan Report

```
Contract: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
Status: VERIFIED ✅

SCAN RESULTS:
- Reentrancy: SAFE ✅
- Integer Overflow: SAFE ✅
- Access Control: SAFE ✅
- Unchecked Calls: SAFE ✅
- Front-running: MEDIUM RISK ⚠️
  Recommendation: Use slippage protection

OVERALL: LOW RISK ✅
```

### 5. Usage Examples

**In Claude Code:**
```
User: Swap 1 ETH for USDC on Uniswap
Claude: I'll prepare that swap for you.

Expected output: 2,450.50 USDC
Slippage: 0.5%
Gas estimate: 150,000

Execute this transaction? (yes/no)
```

**In Cursor:**
```
User: What's the best route to swap DAI for WBTC?
Cursor: Checking Uniswap router...

Optimal route: DAI → WETH → WBTC
Expected output: 0.015 WBTC
Price impact: 0.3%
```

## What This Enables

Your smart contract becomes accessible to:
- Claude Desktop
- Cursor IDE
- OpenClaw agents
- Any MCP-compatible AI

Users can interact with your protocol using natural language instead of complex UI or direct contract calls.

## Ready to Get Yours?

- **Free:** First 3 contracts (portfolio building)
- **Paid:** 0.05 ETH per contract

DM @claudiaclawd with your contract address 🌀
