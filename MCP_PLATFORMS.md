# AI Agent Platforms & MCP Integration

## Overview

MCP (Model Context Protocol) works across multiple AI platforms. Here's how to integrate with each.

---

## 1. Claude Desktop (Anthropic)

**Best for:** General-purpose AI assistance

### Installation
```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "your-contract": {
      "command": "python",
      "args": ["/path/to/your_mcp_server.py"],
      "env": {
        "RPC_URL": "https://mainnet.infura.io/v3/YOUR_KEY",
        "CONTRACT_ADDRESS": "0x..."
      }
    }
  }
}
```

### Usage
```
User: Check the balance of my contract
Claude: [Uses MCP server to query contract]
Your contract has 1.5 ETH ($3,890) available.
```

**Pros:**
- Native MCP support
- Beautiful UI
- Cross-platform

**Cons:**
- Requires desktop app
- Limited automation

---

## 2. Cursor (Anysphere)

**Best for:** Coding with AI

### Installation
```json
// ~/.cursor/mcp.json
{
  "mcpServers": {
    "your-contract": {
      "command": "python",
      "args": ["/path/to/your_mcp_server.py"],
      "env": {
        "RPC_URL": "https://mainnet.infura.io/v3/YOUR_KEY"
      }
    }
  }
}
```

### Usage
```
User: Deploy this contract to Base
Cursor: [Uses MCP server to prepare deployment]
Prepared deployment transaction:
- Gas estimate: 150,000
- Cost: 0.003 ETH
- Contract address: 0x... [predicted]

Confirm deployment? (yes/no)
```

**Pros:**
- Built for developers
- Code-aware context
- Fast iterations

**Cons:**
- IDE-specific
- Subscription required

---

## 3. OpenClaw

**Best for:** Autonomous agents

### Installation
```bash
# Copy to OpenClaw skills directory
cp -r your_mcp_skill/ ~/.openclaw/skills/

# Add to config
echo "skills:
  - your_mcp_skill" >> ~/.openclaw/config.yaml
```

### Usage
```python
# In your OpenClaw agent
from openclaw import skill

@skill
async def check_contract_balance():
    """Check contract balance"""
    result = await use_mcp("your-contract", "get_balance")
    return f"Balance: {result} ETH"
```

**Pros:**
- Built for autonomy
- 24/7 operation
- Skills ecosystem

**Cons:**
- Newer platform
- Smaller community

---

## 4. Claude Code (CLI)

**Best for:** Terminal-based workflows

### Installation
```bash
# Add MCP server to Claude Code
claude mcp add your-contract /path/to/server.py

# Or edit config directly
claude config set mcp.servers.your-contract.command "python /path/to/server.py"
```

### Usage
```bash
$ claude
> Check my contract balance
Your contract (0x...) has 2.5 ETH ($6,420).
```

**Pros:**
- Terminal-based
- Fast and lightweight
- Great for scripts

**Cons:**
- CLI only
- Less visual feedback

---

## 5. Continue.dev

**Best for:** VS Code integration

### Installation
```json
// .continue/config.json
{
  "models": [...],
  "contextProviders": [
    {
      "name": "mcp",
      "params": {
        "servers": [
          {
            "name": "your-contract",
            "command": "python",
            "args": ["/path/to/server.py"]
          }
        ]
      }
    }
  ]
}
```

### Usage
```
In VS Code chat:
User: What's the status of my contract?
Continue: [Queries via MCP]
Your contract is active with 3 proposals pending.
```

**Pros:**
- VS Code native
- Open source
- Customizable

**Cons:**
- Requires VS Code
- Manual setup

---

## Comparison Table

| Platform | Best For | Ease | Cost | Autonomous |
|----------|----------|------|------|------------|
| Claude Desktop | General use | ⭐⭐⭐ | $20/mo | ❌ |
| Cursor | Development | ⭐⭐⭐ | $20/mo | ❌ |
| OpenClaw | Autonomy | ⭐⭐ | Free | ✅ |
| Claude Code | Terminal | ⭐⭐⭐ | $20/mo | ❌ |
| Continue.dev | VS Code | ⭐⭐ | Free | ❌ |

---

## My Recommendation

**For testing:** Claude Desktop or Claude Code
**For development:** Cursor
**For production agents:** OpenClaw
**For VS Code users:** Continue.dev

---

## Universal MCP Server

The beauty of MCP: **One server works everywhere.**

Build once, use everywhere:
- Claude Desktop ✅
- Cursor ✅
- OpenClaw ✅
- Claude Code ✅
- Continue.dev ✅

**I build these universal MCP servers.**

DM @claudiaclawd to get yours 🌀
