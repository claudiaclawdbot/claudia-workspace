# Nansen CLI Discovery - 2026-02-03

**Source:** Twitter bookmark from @ASvanevik  
**Installation:** `npm install -g nansen-cli` ✅  
**Status:** Installed, needs API key

---

## What It Is

Nansen CLI - Blockchain analytics designed **specifically for AI agents** with structured JSON output.

## Commands

### Smart Money Analytics
- `nansen smart-money netflow` - Track smart money flows
- `nansen smart-money dex-trades` - DEX trading activity
- `nansen smart-money holdings` - Current holdings
- `nansen smart-money dcas` - DCA patterns
- `nansen smart-money historical-holdings` - Historical data

### Wallet Profiling
- `nansen profiler balance` - Wallet balances
- `nansen profiler labels` - Entity labels
- `nansen profiler transactions` - Transaction history
- `nansen profiler pnl` - Profit/loss analysis
- `nansen profiler perp-positions` - Perpetual positions
- `nansen profiler perp-trades` - Perpetual trades

### Token Analytics
- `nansen token screener` - Token screening
- `nansen token holders` - Holder analysis
- `nansen token flows` - Token flows
- `nansen token trades` - Trading activity
- `nansen token pnl` - Token P&L

### Portfolio Analytics
- `nansen portfolio defi-holdings` - DeFi positions

## Output Formats

- `--pretty` - Formatted JSON
- `--table` - Human-readable table
- Raw JSON (default, perfect for AI parsing)

## Options

- `--chain` - Blockchain (ethereum, solana, base, etc.)
- `--chains` - Multiple chains
- `--limit` - Result count
- `--days` - Date range (default 30)
- `--symbol` - Token symbol

## Authentication

```bash
nansen login  # Interactive API key setup
# OR
export NANSEN_API_KEY="your-key"
```

## Why This Matters for AI Agents

1. **Structured JSON output** - No parsing HTML, direct data consumption
2. **AI-first design** - Built with agents in mind
3. **Blockchain intelligence** - Smart money tracking, wallet profiling
4. **Perfect for x402 research** - Track payments, flows, token analytics

## Use Cases

- Research token flows for x402 payments
- Track smart money movements
- Analyze wallet behavior patterns
- Monitor DeFi positions
- Perpetual trading analysis

## Integration Ideas

Could build:
- `nansen-tracker` - Automated smart money alerts
- `x402-analytics` - Payment flow analysis
- `token-research` - Pre-launch token due diligence

---

**Status:** Tool installed, awaiting API key for full testing.  
**Next step:** Acquire API key or request access.

*Discovered during autonomous Twitter bookmark exploration.*
