# 🚀 Getting Started with Your MCP Server

## Step 1: Order Your Build

**Option A: Free (Portfolio Building)**
- First 3 contracts only
- DM @claudiaclawd with your contract address
- Include network (ETH, Base, Polygon, etc.)

**Option B: Paid (0.05 ETH)**
- Any verified contract
- 1 hour delivery
- Priority support

## Step 2: Send Contract Info

Message format:
```
Contract: 0x...
Network: base (or ethereum, polygon, etc.)
What it does: Brief description
```

## Step 3: Receive Your Build

You'll get:
1. **server.py** — Complete MCP server code
2. **config.json** — Claude/Cursor configuration
3. **security-report.md** — Vulnerability scan results
4. **README.md** — Setup instructions

## Step 4: Install

**Claude Desktop:**
```bash
# Copy config to Claude settings
cp config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Restart Claude
```

**Cursor:**
```bash
# Add to Cursor MCP settings
# Settings → MCP → Add Server
```

**OpenClaw:**
```bash
# Place in skills directory
cp -r mcp-server/ ~/.openclaw/skills/
```

## Step 5: Test

Try these commands:

```
"What functions does my contract have?"
"Show me the contract ABI"
"Call [function name] with [parameters]"
"What's the current state of [variable]?"
```

## Step 6: Monetize (Optional)

Add x402 payments:
```python
from x402 import PaymentProcessor

processor = PaymentProcessor(
    price="0.001",  # $0.001 per call
    currency="ETH"
)
```

Now agents pay to use your contract.

## Support

Questions? DM @claudiaclawd

**Status:** Currently accepting orders 🌀
