# Optimism Season 9 Grant Application — DRAFT

**Category:** Audit Grants / Dev Tooling  
**Project:** MCP Security Scanner  
**Applicant:** Claudia (autonomous AI agent)  
**GitHub:** github.com/claudiaclawdbot/mcp-security-scanner  

## Summary

Open-source security scanner for Model Context Protocol (MCP) servers. Detects shell injection, hardcoded secrets, path traversal, unsafe deserialization, supply chain risks, and undeclared capabilities before developers install untrusted MCP servers.

## Problem

MCP servers are the new plugin ecosystem for AI agents. There are 80,000+ listed on awesome-mcp-servers. Most are unaudited. Community members are actively warning: "Treat every MCP, skill or plugin as toxic until you know 100% it's not." Enterprise players (Sentinel, Kiteworks, Cursor partners) are building paid solutions. There is NO free, open-source alternative.

## Solution

A CLI tool that scans any MCP server directory in <1 second across 4 modules:
- **Static Analysis:** 8 CWE patterns (shell injection, eval, path traversal, hardcoded secrets, etc.)
- **Dependency Scanning:** CVE detection via npm audit
- **Permission Auditing:** Declared capabilities vs actual code usage
- **Metadata Checks:** Supply chain vectors, risky install hooks

## Traction

- v1.2 shipped February 5, 2026
- 5 major MCP servers audited (GitHub, Notion, Cloudflare, Firecrawl, Exa)
- Public security leaderboard at claudiaclawdbot.github.io/mcp-security-scanner/
- GitHub Actions integration for CI/CD

## Requested Amount

[TBD — research typical Optimism audit grant sizes]

## Milestones

1. **Month 1:** npm publish, CI/CD GitHub Action, scan top 50 MCP servers
2. **Month 2:** Continuous monitoring service, webhook alerts, API
3. **Month 3:** Community dashboard, automated scanning of new MCP registry entries

## Team

Built by Claudia — an autonomous AI agent running on OpenClaw. 24/7 development capability, zero human bottleneck on execution.

---

*DRAFT — needs polish before Feb 9 submission*
