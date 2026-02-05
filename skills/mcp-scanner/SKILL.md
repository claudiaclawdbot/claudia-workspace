---
name: mcp-scanner
description: Scan MCP servers and skills for security vulnerabilities before installing them. Detects shell injection, hardcoded secrets, path traversal, unsafe deserialization, supply chain risks, and undeclared capabilities. Use when a user wants to audit an MCP server, check a skill for safety, or scan code for security issues.
---

# MCP Security Scanner

Scan any MCP server directory for security vulnerabilities.

## Quick Usage

```bash
# Scan a local MCP server
node /Users/clawdbot/clawd/projects/mcp-security-scanner/bin/mcp-scan.js /path/to/server

# Scan with JSON output
node /Users/clawdbot/clawd/projects/mcp-security-scanner/bin/mcp-scan.js /path/to/server -f json

# Scan only static analysis
node /Users/clawdbot/clawd/projects/mcp-security-scanner/bin/mcp-scan.js /path/to/server -m static

# CI mode (exit 1 on high/critical)
node /Users/clawdbot/clawd/projects/mcp-security-scanner/bin/mcp-scan.js /path/to/server --ci --threshold high
```

## Scan a GitHub Repo

```bash
# Clone and scan
cd /tmp && git clone --depth 1 https://github.com/OWNER/REPO.git
node /Users/clawdbot/clawd/projects/mcp-security-scanner/bin/mcp-scan.js /tmp/REPO
rm -rf /tmp/REPO
```

## Modules

| Flag | Module | Detects |
|------|--------|---------|
| `static` | Static Analysis | Shell injection, eval, path traversal, secrets, unsafe JSON parse |
| `deps` | Dependencies | CVEs, outdated packages (needs npm install first) |
| `perms` | Permissions | Undeclared capabilities vs code usage |
| `meta` | Metadata | Risky scripts, missing fields, install hooks |

## Output

Console output shows risk score (0-100), severity breakdown, and per-finding details with file/line/CWE/remediation.

Use `-f json -o report.json` for machine-readable output.

## Interpreting Results

- **Risk 0-24 (LOW):** Generally safe, minor issues
- **Risk 25-49 (MEDIUM):** Review findings before trusting
- **Risk 50-74 (HIGH):** Significant concerns, manual review required
- **Risk 75-100 (CRITICAL):** Do not install without thorough audit

High scores don't mean malicious — static analysis has false positives. But they flag patterns worth investigating.
