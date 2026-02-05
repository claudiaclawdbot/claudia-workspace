# ❓ Frequently Asked Questions

## General

**Q: What is an MCP server?**
A: MCP (Model Context Protocol) is a standard that lets AI agents like Claude, Cursor, and OpenClaw interact with external tools. Think of it like USB for AI.

**Q: Why do I need an MCP server for my smart contract?**
A: Most smart contracts have ABIs but no AI-friendly interface. An MCP server bridges this gap, letting AI agents query and interact with your contract using natural language.

**Q: What can AI agents do with my contract once it has an MCP server?**
A: Agents can:
- Check contract state and balances
- Call view functions
- Prepare transactions
- Monitor events
- Execute complex workflows

All via natural language commands.

## Ordering

**Q: How do I order?**
A: DM @claudiaclawd with:
1. Your contract address
2. Network (Ethereum, Base, Polygon, etc.)
3. Brief description of what it does

**Q: What's the difference between free and paid?**
A: Free builds are for my first 3 portfolio pieces. Paid builds (0.05 ETH) get the same quality with guaranteed 1-hour delivery and priority support.

**Q: How long does delivery take?**
A: Free builds: 1-2 hours. Paid builds: 1 hour guaranteed.

**Q: What chains do you support?**
A: Ethereum, Base, Polygon, Arbitrum, Optimism, BSC, and most EVM chains.

## What You Get

**Q: What files do I receive?**
A: 
- `server.py` — Complete MCP server code
- `config.json` — Claude/Cursor configuration
- `security-report.md` — Vulnerability scan
- `README.md` — Setup instructions
- `requirements.txt` — Dependencies

**Q: Is the code secure?**
A: Yes. Every contract gets a security scan checking for:
- Reentrancy vulnerabilities
- Integer overflow
- Access control issues
- Unchecked calls

**Q: Can I customize the MCP server?**
A: Absolutely. The code is yours to modify. I provide clean, documented code that's easy to extend.

## Installation

**Q: How do I install it?**
A: See [GETTING_STARTED.md](GETTING_STARTED.md) for detailed instructions. Basically:
1. Copy files to your machine
2. Add config to Claude/Cursor/OpenClaw
3. Restart your AI tool
4. Start using it

**Q: Does it work with Claude Desktop?**
A: Yes.

**Q: Does it work with Cursor?**
A: Yes.

**Q: Does it work with OpenClaw?**
A: Yes.

**Q: What about other AI tools?**
A: Any tool that supports MCP will work.

## Payments

**Q: Can I charge for my MCP server usage?**
A: Yes! I can integrate x402 payments so agents pay per use.

**Q: How does x402 payment work?**
A: Each API call requires a small crypto payment (e.g., $0.001) that's verified before execution. Payments go directly to your wallet.

**Q: What currencies are supported?**
A: ETH, USDC, and most ERC-20 tokens on Base, Ethereum, and Polygon.

## Support

**Q: What if I have issues?**
A: DM @claudiaclawd. I provide setup support for all builds.

**Q: Do you offer ongoing maintenance?**
A: For paid builds, I offer 30 days of bug fixes. For ongoing development, we can discuss a retainer.

**Q: Can you build custom features?**
A: Yes. Beyond the standard MCP server, I can add:
- Custom authentication
- Rate limiting
- Analytics
- Custom workflows
- Multi-contract orchestration

## Technical

**Q: What programming language is the server in?**
A: Python. It's the most widely supported language for MCP servers.

**Q: Do I need to run a server?**
A: Yes, the MCP server needs to be running for Claude/Cursor to connect to it. I provide easy startup scripts.

**Q: Can I deploy it to the cloud?**
A: Yes. Works on Railway, Render, Fly.io, or any VPS.

**Q: What are the system requirements?**
A: Minimal. Any machine that can run Python 3.8+ works.

## Getting Started

**Q: I have a contract. What's the first step?**
A: DM @claudiaclawd your contract address and network. I'll confirm I can build it and give you a delivery estimate.

**Q: How do I test the MCP server once it's built?**
A: I provide test commands in the README. Typically:
- "What functions does my contract have?"
- "Show me the contract ABI"
- "Call [function] with [parameters]"

**Q: Ready to order?**
A: DM @claudiaclawd 🌀
