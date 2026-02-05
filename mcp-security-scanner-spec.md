# MCP Security Scanner - Technical Specification

**Build Time:** 4 hours  
**Target:** CLI tool for scanning MCP servers for security issues  
**Output:** JSON + human-readable reports

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Security Scanner CLI                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Scanner    │  │   Analyzer   │  │   Reporter   │      │
│  │   Loader     │  │   Pipeline   │  │   Engine     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Scan Modules (Parallel)                  │  │
│  ├──────────────┬──────────────┬──────────────┬─────────┤  │
│  │   Static     │ Dependency   │  Permission  │ Metadata│  │
│  │   Analysis   │   Scanner    │   Auditor    │ Analyzer│  │
│  └──────────────┴──────────────┴──────────────┴─────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Out of Scope (4h limit):**
- Network behavior analysis (requires running server + traffic capture)
- Sandboxed execution testing (complex isolation setup)

---

## 2. Tool Requirements

### Core Dependencies

```json
{
  "dependencies": {
    "commander": "^11.1.0",          // CLI framework
    "chalk": "^5.3.0",               // Terminal colors
    "ora": "^7.0.1",                 // Spinners
    "eslint": "^8.56.0",             // Static analysis engine
    "@typescript-eslint/parser": "^6.19.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "acorn": "^8.11.3",              // JS/TS parsing
    "acorn-walk": "^8.3.2",          // AST traversal
    "audit-ci": "^6.6.1",            // NPM audit wrapper
    "better-npm-audit": "^3.7.3",    // Enhanced vulnerability scanning
    "semver": "^7.5.4",              // Version parsing
    "glob": "^10.3.10",              // File pattern matching
    "table": "^6.8.1",               // Human-readable tables
    "nanoid": "^5.0.4"               // Scan IDs
  }
}
```

### Why These Packages?

| Package | Purpose | Time Saved |
|---------|---------|------------|
| `eslint` | Already has AST parsing, rule engine, plugin system | 2-3 hours |
| `audit-ci` | Wraps `npm audit` with better output parsing | 1 hour |
| `acorn` | Fast, mature JS parser for custom analysis | 1 hour |
| `commander` | CLI arg parsing, help generation | 30 min |
| `chalk` + `ora` | Pretty output without custom formatting | 30 min |

---

## 3. Scanner Modules

### 3.1 Static Analysis Module

**Goal:** Find dangerous patterns in MCP server code

**Implementation:**
```javascript
// Uses ESLint custom rules + acorn AST walking
const checks = [
  'dangerous-eval',           // eval(), Function() constructor
  'shell-injection',          // child_process without sanitization
  'path-traversal',           // fs operations with user input
  'hardcoded-secrets',        // API keys, tokens in code
  'unsafe-deserialization',   // JSON.parse on user input
  'missing-input-validation', // Tool handlers without validation
  'overly-permissive-cors',   // CORS set to *
  'http-not-https'            // HTTP URLs in prod code
];
```

**NPM Packages:**
- `eslint` + custom rules
- `acorn` + `acorn-walk` for pattern matching
- Pre-built: `eslint-plugin-security` (covers many patterns)

**Output:**
```json
{
  "module": "static-analysis",
  "findings": [
    {
      "severity": "high",
      "rule": "shell-injection",
      "file": "src/tools/execute.ts",
      "line": 42,
      "code": "exec(userInput)",
      "message": "Unsanitized user input passed to exec()",
      "cwe": "CWE-78"
    }
  ]
}
```

---

### 3.2 Dependency Vulnerability Scanner

**Goal:** Find known CVEs in dependencies

**Implementation:**
```javascript
// Leverage npm audit + vulnerability databases
const steps = [
  'parse-package-json',      // Read package.json + package-lock.json
  'run-npm-audit',           // npm audit --json
  'check-outdated-deps',     // semver check for old versions
  'scan-license-risks',      // Copyleft licenses (GPL, AGPL)
  'detect-typosquatting'     // Similar package names to popular libs
];
```

**NPM Packages:**
- `audit-ci` (wraps npm audit)
- `better-npm-audit` (improved filtering)
- `license-checker` (optional, for license scanning)

**Output:**
```json
{
  "module": "dependencies",
  "findings": [
    {
      "severity": "critical",
      "package": "axios",
      "version": "0.21.1",
      "vulnerable_version": "<0.21.2",
      "cve": "CVE-2021-3749",
      "advisory": "https://nvd.nist.gov/vuln/detail/CVE-2021-3749",
      "fix": "0.21.2"
    }
  ],
  "stats": {
    "total_deps": 145,
    "vulnerable": 3,
    "outdated": 12
  }
}
```

---

### 3.3 Permission Auditor

**Goal:** Analyze declared MCP capabilities vs actual usage

**Implementation:**
```javascript
// Parse MCP server manifest + analyze tool implementations
const checks = [
  'undeclared-capabilities',   // Using fs/network without declaring
  'excessive-permissions',     // Requesting more than needed
  'wildcard-resources',        // Resource patterns too broad
  'missing-scope-validation',  // No runtime permission checks
  'privilege-escalation'       // Attempts to gain extra permissions
];
```

**NPM Packages:**
- `acorn` + `acorn-walk` (AST analysis)
- Custom parser for MCP manifest (JSON schema validation)

**MCP-Specific Analysis:**
```javascript
// Check if server.json capabilities match actual code usage
{
  "declared_capabilities": ["fs:read", "network:http"],
  "actual_usage": {
    "fs:write": ["src/tools/save.ts:23"],  // ⚠️ Undeclared!
    "fs:read": ["src/tools/read.ts:15"],
    "network:http": ["src/api/fetch.ts:8"],
    "process:exec": ["src/tools/run.ts:42"] // ⚠️ Undeclared!
  }
}
```

**Output:**
```json
{
  "module": "permissions",
  "findings": [
    {
      "severity": "medium",
      "type": "undeclared-capability",
      "capability": "fs:write",
      "file": "src/tools/save.ts",
      "line": 23,
      "message": "Server uses fs.writeFile without declaring fs:write capability"
    }
  ]
}
```

---

### 3.4 Metadata Analyzer

**Goal:** Check MCP server configuration and metadata

**Implementation:**
```javascript
const checks = [
  'missing-version',           // No version in server.json
  'missing-author',            // No maintainer info
  'insecure-defaults',         // Debug mode on, verbose logging
  'weak-auth-config',          // No auth configured
  'missing-rate-limits',       // No throttling on tool calls
  'excessive-timeout',         // Timeouts > 30s
  'missing-error-handling'     // No global error handlers
];
```

**NPM Packages:**
- Built-in JSON parsing
- `ajv` (JSON schema validation for MCP manifest)

**Output:**
```json
{
  "module": "metadata",
  "findings": [
    {
      "severity": "low",
      "type": "missing-version",
      "message": "server.json missing 'version' field",
      "recommendation": "Add semantic version for tracking"
    }
  ]
}
```

---

## 4. Data Flow

```
┌─────────────┐
│   CLI Args  │
│ (directory, │
│   output)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  1. Discovery Phase                 │
│  - Find package.json                │
│  - Find server.json (MCP manifest)  │
│  - Glob source files (*.ts, *.js)   │
│  - Build file inventory              │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  2. Parallel Scan Phase             │
│  ┌─────────────────────────────┐   │
│  │ Promise.all([               │   │
│  │   staticAnalysis(),         │   │
│  │   dependencyScanner(),      │   │
│  │   permissionAuditor(),      │   │
│  │   metadataAnalyzer()        │   │
│  │ ])                          │   │
│  └─────────────────────────────┘   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  3. Aggregation Phase               │
│  - Merge findings                   │
│  - Calculate risk score             │
│  - Deduplicate issues               │
│  - Sort by severity                 │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  4. Report Generation               │
│  - JSON output (machine-readable)   │
│  - Console table (human-readable)   │
│  - Optional HTML report             │
└─────────────────────────────────────┘
```

### Performance Targets

| Phase | Time Budget | Notes |
|-------|-------------|-------|
| Discovery | <100ms | Fast file scanning with `glob` |
| Static Analysis | 2-5s | ESLint is well-optimized |
| Dependency Scan | 1-3s | Leverages npm audit cache |
| Permission Audit | 1-2s | AST walking is fast |
| Metadata | <100ms | Simple JSON validation |
| **Total** | **5-10s** | For average MCP server (~50 files) |

---

## 5. Output Formats

### 5.1 JSON Output

**File:** `scan-results.json`

```json
{
  "scan_id": "Kx9m2Lp4R",
  "timestamp": "2026-02-05T18:30:15Z",
  "scanner_version": "1.0.0",
  "target": {
    "path": "/path/to/mcp-server",
    "server_name": "weather-server",
    "server_version": "1.2.3"
  },
  "summary": {
    "risk_score": 72,
    "risk_level": "medium",
    "total_findings": 8,
    "by_severity": {
      "critical": 1,
      "high": 2,
      "medium": 3,
      "low": 2
    }
  },
  "modules": {
    "static-analysis": { /* findings */ },
    "dependencies": { /* findings */ },
    "permissions": { /* findings */ },
    "metadata": { /* findings */ }
  },
  "findings": [
    {
      "id": "SA-001",
      "module": "static-analysis",
      "severity": "critical",
      "title": "Shell Injection Vulnerability",
      "file": "src/tools/execute.ts",
      "line": 42,
      "column": 8,
      "code_snippet": "exec(userInput)",
      "message": "Unsanitized user input passed to child_process.exec()",
      "cwe": "CWE-78",
      "remediation": "Use execFile() with argument array or sanitize input",
      "references": [
        "https://owasp.org/www-community/attacks/Command_Injection"
      ]
    }
  ]
}
```

### 5.2 Human-Readable Console Output

```
┌─────────────────────────────────────────────────────────────────┐
│                  MCP Security Scanner v1.0.0                    │
│                  Scan ID: Kx9m2Lp4R                             │
└─────────────────────────────────────────────────────────────────┘

Target: weather-server v1.2.3
Path:   /path/to/mcp-server
Scanned: 2026-02-05 18:30:15 EST

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Risk Score: 72/100 (MEDIUM)

Findings:
  🔴 Critical: 1
  🟠 High:     2
  🟡 Medium:   3
  🔵 Low:      2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINDINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITICAL: Shell Injection Vulnerability [SA-001]
   File: src/tools/execute.ts:42
   
   exec(userInput)
   
   Unsanitized user input passed to child_process.exec()
   
   Fix: Use execFile() with argument array or sanitize input
   CWE: CWE-78
   Ref: https://owasp.org/www-community/attacks/Command_Injection

────────────────────────────────────────────────────────────────

🟠 HIGH: Vulnerable Dependency [DEP-001]
   Package: axios@0.21.1
   CVE: CVE-2021-3749
   
   Upgrade to: 0.21.2
   Advisory: https://nvd.nist.gov/vuln/detail/CVE-2021-3749

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Fix critical shell injection in execute.ts
2. Update axios to latest version
3. Add input validation to all tool handlers
4. Declare fs:write capability in server.json

Full report: scan-results.json
```

### 5.3 Optional HTML Report

**Generated with:** `handlebars` template + inline CSS  
**Size:** ~50KB single-file HTML  
**Features:** Collapsible sections, syntax highlighting, filterable findings

---

## 6. CLI Interface

### Commands

```bash
# Basic scan
mcp-scan ./my-mcp-server

# Scan with options
mcp-scan ./my-mcp-server \
  --output ./reports/scan.json \
  --format json \
  --severity high \
  --modules static,deps

# CI mode (exit 1 if critical findings)
mcp-scan ./my-mcp-server --ci --threshold critical

# Scan specific files
mcp-scan ./my-mcp-server --include "src/**/*.ts"
```

### Flags

```
Options:
  -o, --output <path>        Output file path (default: scan-results.json)
  -f, --format <type>        Output format: json|console|html|all (default: all)
  -s, --severity <level>     Minimum severity: low|medium|high|critical
  -m, --modules <list>       Modules to run: static,deps,perms,meta (default: all)
  --ci                       CI mode: exit 1 if findings above threshold
  --threshold <level>        CI threshold severity (default: high)
  --include <pattern>        Include files matching glob pattern
  --exclude <pattern>        Exclude files matching glob pattern
  --no-color                 Disable colored output
  --verbose                  Show detailed progress
  -h, --help                 Show help
  -v, --version              Show version
```

---

## 7. Risk Scoring Algorithm

```javascript
function calculateRiskScore(findings) {
  const weights = {
    critical: 25,
    high: 10,
    medium: 3,
    low: 1
  };
  
  let score = 0;
  findings.forEach(f => {
    score += weights[f.severity] || 0;
  });
  
  // Cap at 100
  return Math.min(score, 100);
}

function getRiskLevel(score) {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}
```

---

## 8. Implementation Plan (4 Hours)

### Hour 1: Project Setup + Core Framework
- [x] Initialize npm project
- [x] Install dependencies
- [x] Set up CLI with `commander`
- [x] Create module loader/plugin system
- [x] Implement discovery phase (file finding)

### Hour 2: Scanner Modules
- [x] Static analysis module (ESLint + custom rules)
- [x] Dependency scanner (npm audit wrapper)
- [x] Basic permission auditor (capability matching)

### Hour 3: Aggregation + Reporting
- [x] Merge findings from all modules
- [x] Implement risk scoring
- [x] JSON output formatter
- [x] Console table output (chalk + table)

### Hour 4: Testing + Polish
- [x] Test on sample MCP servers
- [x] Handle edge cases (missing files, invalid JSON)
- [x] Add help text and examples
- [x] README with usage guide

---

## 9. File Structure

```
mcp-security-scanner/
├── package.json
├── README.md
├── .eslintrc.js                  # Custom ESLint rules
├── bin/
│   └── mcp-scan.js               # CLI entry point
├── src/
│   ├── index.js                  # Main orchestrator
│   ├── modules/
│   │   ├── static-analysis.js    # ESLint-based scanner
│   │   ├── dependencies.js       # npm audit wrapper
│   │   ├── permissions.js        # MCP capability auditor
│   │   └── metadata.js           # Manifest validator
│   ├── reporters/
│   │   ├── json.js               # JSON formatter
│   │   ├── console.js            # Pretty terminal output
│   │   └── html.js               # HTML report generator
│   ├── utils/
│   │   ├── discovery.js          # File/manifest finder
│   │   ├── parser.js             # AST utilities
│   │   └── scoring.js            # Risk calculation
│   └── rules/                    # Custom ESLint rules
│       ├── shell-injection.js
│       ├── path-traversal.js
│       └── hardcoded-secrets.js
├── templates/
│   └── report.hbs                # HTML template
└── test/
    └── fixtures/                 # Sample MCP servers for testing
```

---

## 10. Example Usage

```bash
# Install
npm install -g mcp-security-scanner

# Scan a local MCP server
cd ~/my-mcp-servers/weather-server
mcp-scan .

# Output:
#   ✓ Discovered 23 source files
#   ⠋ Running static analysis...
#   ✓ Static analysis complete (3 findings)
#   ⠋ Scanning dependencies...
#   ✓ Dependency scan complete (1 finding)
#   ⠋ Auditing permissions...
#   ✓ Permission audit complete (2 findings)
#   ⠋ Analyzing metadata...
#   ✓ Metadata analysis complete (0 findings)
#
#   Risk Score: 42/100 (MEDIUM)
#   Report saved to: scan-results.json

# CI integration
mcp-scan . --ci --threshold high
# Exit code: 1 (found high/critical issues)
```

---

## 11. Future Enhancements (Beyond 4h)

**Network Behavior Analysis:**
- Intercept network calls with proxy
- Detect data exfiltration attempts
- Monitor DNS queries

**Sandboxed Execution:**
- Run MCP server in isolated container
- Monitor system calls with `strace`
- Detect privilege escalation attempts

**Advanced Static Analysis:**
- Data flow analysis (taint tracking)
- Control flow graph generation
- Dead code detection

**Database:**
- Store scan history
- Track vulnerability trends
- Compare scans over time

---

## 12. Success Criteria

✅ **Functional Requirements:**
- Scans MCP server in <10 seconds
- Detects at least 8 vulnerability classes
- Outputs both JSON and human-readable reports
- Zero false positives on test fixtures

✅ **Build Time:**
- Core functionality in 4 hours
- Basic testing included
- Documented and runnable

✅ **Usability:**
- Single command to run
- Clear, actionable findings
- CI-friendly exit codes

---

## 13. Testing Strategy

**Test Fixtures:**
```
test/fixtures/
├── vulnerable-server/        # Intentionally insecure MCP server
│   ├── shell-injection.ts    # exec() vulnerability
│   ├── path-traversal.ts     # fs path vuln
│   └── package.json          # Outdated deps with CVEs
├── secure-server/            # Best practices example
│   └── well-configured/
└── edge-cases/
    ├── no-package-json/      # Missing files
    ├── invalid-manifest/     # Malformed JSON
    └── empty-project/        # No source files
```

**Unit Tests:**
- Each module in isolation
- Mock file system with `memfs`
- Snapshot testing for output formats

**Integration Tests:**
- Run full scan on fixtures
- Verify expected findings
- Check exit codes in CI mode

---

## End of Spec

**Total Lines of Code Estimate:** ~800-1000 LOC  
**External Dependencies:** 10-12 npm packages  
**Build Time:** 4 hours for core functionality  
**Maintenance:** Minimal (leverages mature libraries)
