# QMD Usage Guide - **ACTIVE WORKFLOW**

## ✅ Setup Complete
- QMD installed and indexed (55 docs: 34 workspace + 21 memory)
- All vector embeddings ready (26 chunks embedded)
- mcporter configured and tested
- **STATUS: ACTIVELY USING**

## 🎯 Default Workflow (USE THIS!)

### When searching for information:
**DON'T:** `Read("MEMORY.md")` ❌  
**DO:** Use QMD search first! ✅

```bash
# 1. Search for relevant files
mcporter call 'qmd.search(query: "keyword", limit: 5)' --output json

# 2. Get specific sections only
mcporter call 'qmd.get(file: "path/to/file.md", fromLine: X, maxLines: 50)' --output json
```

### Search Types

**Keyword (fast):**
```bash
qmd search "exact phrase or keywords" --limit 5
```

**Semantic (understanding):**
```bash
mcporter call 'qmd.vsearch(query: "what did I do today", limit: 5)' --output json
```

**Hybrid (best, but slower):**
```bash
# NOTE: query has 60s timeout - use search/vsearch for complex queries
mcporter call 'qmd.query(query: "question", limit: 5)' --output json --timeout 90000
```

### Getting File Content

**Small section:**
```bash
mcporter call 'qmd.get(file: "memory/2026-01-31.md", fromLine: 80, maxLines: 20)'
```

**Multiple files by pattern:**
```bash
mcporter call 'qmd.multi-get(pattern: "memory/2026-01-*.md", maxBytes: 10240)'
```

## 📊 Token Savings

- **Before:** Load 5 files = ~8,000 tokens
- **After:** Search + get sections = ~800 tokens  
- **Savings: 90%+** 🎯

## 🔄 Maintenance

**Update index after file changes:**
```bash
qmd update && qmd embed
```

**Check status:**
```bash
qmd status
```

## 🚨 When to Use `read` Instead

Only use `read` for:
- **Small files** (<100 lines) that need full context
- **Single specific file** you already know exists
- **QMD returns nothing** (file not indexed yet)

## 📝 Current Collections
- `workspace` → `/Users/clawdbot/clawd` (34 files)
- `memory` → `/Users/clawdbot/clawd/memory` (21 files)

## ⚡ Quick Examples

```bash
# Find Moltbook credentials
qmd search "moltbook api" --limit 3

# Get EVM wallet setup info
mcporter call 'qmd.search(query: "EVM wallet setup", limit: 2)'

# Semantic search for context
mcporter call 'qmd.vsearch(query: "what skills did we install today")'

# Get specific memory section
mcporter call 'qmd.get(file: "memory/2026-01-31.md", fromLine: 50, maxLines: 30)'
```

---

**Last Updated:** 2026-01-31  
**Status:** Active workflow - QMD is now the default for file searches! 🚀
