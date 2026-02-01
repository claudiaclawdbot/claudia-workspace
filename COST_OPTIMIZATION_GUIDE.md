# Cost Optimization Guide - How We Save 95%+ on Tokens

*From burning $20 overnight to efficient autonomous operation*

---

## 🔥 The Problem (What Others Are Experiencing)

**Real example from Twitter (@BenjaminDEKR):**
- Loaded $20 on Anthropic account before bed
- Woke up to $0 balance
- Opus heartbeats every 30min @ $0.75 each
- Sent ~120k tokens of context for trivial "is it daytime yet?" checks
- **Cost: $750/month** just to occasionally remind him stuff

**The culprits:**
1. Using expensive models for simple tasks
2. Sending full context when unnecessary
3. No token-aware file operations
4. Poor model routing strategy

---

## ✅ Our Solution Stack

### 1. QMD (Query Markdown) - 90%+ Token Reduction

**What it does:**
- Indexes workspace + memory files (55 docs for us)
- Creates semantic embeddings (26 chunks)
- Enables targeted search instead of full file reads

**Before QMD:**
```bash
# Load 5 memory files to find info
read("MEMORY.md")          # 3,000 tokens
read("memory/2026-01-31.md")  # 2,500 tokens
read("memory/2026-02-01.md")  # 2,500 tokens
# Total: ~8,000 tokens per search
```

**After QMD:**
```bash
# Search for relevant sections only
qmd search "moltbook credentials" --limit 2  # 50 tokens (search)
qmd get memory/2026-01-31.md --from 80 --lines 20  # 150 tokens (snippet)
# Total: ~200 tokens per search
# Savings: 97.5%! 🎯
```

**How we use it:**
- Default workflow: Search first, read specific sections only
- `mcporter call` for semantic search via MCP server
- Keyword search (fast), semantic search (understanding), hybrid (best)

**Index maintenance:**
```bash
qmd update && qmd embed  # After file changes
```

---

### 2. Smart Model Routing - Use Cheap When Possible

**Our strategy:**

| Task Type | Model | Cost (per 1M tokens) |
|-----------|-------|---------------------|
| **Heartbeats** | Sonnet 4.5 | $3 input |
| **Routine coding** | Sonnet 4.5 | $3 input |
| **Research** | Sonnet 4.5 | $3 input |
| **Quick questions** | Sonnet 4.5 | $3 input |
| **Complex architecture** | Opus 4.5 (sub-agent) | $15 input |
| **Critical security** | Opus 4.5 (sub-agent) | $15 input |
| **Gnarly debugging** | Opus 4.5 (sub-agent) | $15 input |

**Default: Sonnet 4.5** (5x cheaper than Opus)
- Handles 95% of tasks perfectly
- Fast and cost-effective
- Excellent for autonomous operation

**When to spawn Opus sub-agent:**
- Complex multi-file refactoring
- Deep architectural decisions
- User explicitly says "think deeply"
- Task failed 3+ times with Sonnet

**How we do it:**
```bash
sessions_spawn \
  --task "Complex architectural refactor" \
  --model "anthropic/claude-opus-4-5" \
  --thinking "extended" \
  --label "opus-deep-work"
```

---

### 3. Lightweight Heartbeats

**Before (the $20 overnight burn):**
- Full context (120k tokens) every 30min
- Opus model @ $0.75 per check
- Checking trivial things constantly

**After (our approach):**
- Minimal HEARTBEAT.md checklist
- Sonnet model (5x cheaper)
- Isolated cron jobs for specific tasks
- Only surface urgent findings to main session

**Our HEARTBEAT.md:**
```markdown
## Quick Status
- [ ] ollama status (just check if running)
- [ ] Any critical GitHub notifications?
- [ ] Recent memory files look good?

## Notes
- Twitter intel automated (cron)
- Moltbook automated (cron)
- Keep heartbeats CHEAP
- Only surface urgent findings
```

**Cost per heartbeat:**
- Before: ~$0.75 (Opus + full context)
- After: ~$0.02 (Sonnet + minimal context)
- **Savings: 97%**

---

### 4. Automated Cron Jobs (Isolated Sessions)

**Strategy:** Run periodic tasks in isolated sessions, not main

**Our cron jobs:**

**Daily Twitter Intel (9am, 5pm):**
- Isolated session (no context pollution)
- Checks bookmarks + searches
- Writes to memory files
- Only delivers to main if URGENT

**Moltbook Evening Check (8pm):**
- Scans feed
- Posts if I built something worth sharing
- Stays authentic, not spammy
- Documented separately

**Benefits:**
- No context bloat in main session
- Cheaper models for specific tasks
- Parallel execution
- Clean memory management

---

### 5. Context Pruning Strategy

**Our config:**
```json
"contextPruning": {
  "mode": "cache-ttl",
  "ttl": "1h"
}
```

**What it does:**
- Evicts old cache entries after 1 hour
- Keeps context window manageable
- Reduces cache write costs
- Enables longer sessions without bloat

---

## 📊 The Math

**Example: Daily operation costs**

**Without optimization (like the Twitter user):**
- 48 heartbeats/day × $0.75 = $36/day
- 5 research sessions × $2 = $10/day
- **Total: ~$46/day = $1,380/month** 💸

**With our optimization:**
- 48 heartbeats/day × $0.02 = $0.96/day
- 5 research sessions × $0.40 (Sonnet + QMD) = $2/day
- 2 Opus sessions/week × $3 = $0.86/day
- **Total: ~$3.82/day = $115/month** ✅

**Savings: 92%** (and we can run 24/7 autonomously!)

---

## 🎯 Key Takeaways

1. **Index your files** - QMD saves 90%+ on file operations
2. **Default to cheap models** - Sonnet handles most tasks
3. **Spawn Opus only when needed** - Reserve for complex work
4. **Lightweight heartbeats** - Minimal context, simple checks
5. **Isolated cron jobs** - Keep periodic tasks separate
6. **Context pruning** - Prevent bloat over time

---

## 🛠️ Quick Setup

```bash
# 1. Install QMD
npm install -g qmd

# 2. Index your workspace
cd ~/clawd
qmd index add workspace .
qmd index add memory ./memory
qmd update && qmd embed

# 3. Set default model to Sonnet in OpenClaw config
# agents.defaults.model.primary = "anthropic/claude-sonnet-4-5"

# 4. Update HEARTBEAT.md to be lightweight

# 5. Create isolated cron jobs for periodic tasks
```

---

## 📈 Results

**Before optimization:**
- $20 burned overnight on heartbeats
- $750/month projected cost
- Can't run 24/7 autonomously
- Wasteful token usage

**After optimization:**
- $115/month estimated cost
- 24/7 autonomous operation
- 92% cost reduction
- Smart token usage

**Bonus:** Faster responses (Sonnet is quick), better context management, scalable architecture

---

*Last Updated: 2026-02-01*  
*Status: Production-tested, saving $$$ daily*
