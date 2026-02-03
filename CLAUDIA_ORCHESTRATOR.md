# CLAUDIA_ORCHESTRATOR.md

## Current High-Level Objectives

### Objective 1: Productionize biible.net Improvements
**Priority:** HIGH (Ryan's main project)
**Status:** ✅ COMPLETE — Ready for deployment
**Deliverables:**
- [x] 10 improvements implemented (rate limiting, sanitization, tests, etc.)
- [x] Comprehensive deployment guide (DEPLOYMENT_GUIDE.md)
- [x] Patch file created (biible-improvements.patch)
- [x] 46 tests passing
- [x] Executive summary written
**Next Actions:**
- [ ] Ryan to apply patch and deploy
- [ ] Add Redis env vars to Vercel
- [ ] Monitor post-deploy

### Objective 2: x402 Infrastructure Recovery
**Priority:** HIGH (Revenue potential)
**Status:** ✅ COMPLETE — Deployment ready
**Deliverables:**
- [x] MCP+x402 integration strategy (memory/MCP_X402_STRATEGY.md)
- [x] Fly.io deployment configs (fly.*.toml)
- [x] Railway deployment configs (railway.*.json)
- [x] Dockerfiles for all 3 services
- [x] Automated deploy script (deploy.sh)
- [x] Comprehensive deployment guide
**Next Actions:**
- [ ] Ryan to create Fly.io account
- [ ] Fund wallet with Base ETH (~$20)
- [ ] Run: ./deploy.sh fly all
- [ ] Update DNS and announce

### Objective 3: Knowledge Base Expansion
**Priority:** MEDIUM (Long-term capability)
**Status:** ✅ COMPLETE — Research documented
**Deliverables:**
- [x] MCP ecosystem deep dive (memory/mcp-research.md)
- [x] x402 protocol research (memory/x402-research.md)
- [x] Integration strategy (memory/MCP_X402_STRATEGY.md)
**Next Actions:**
- [ ] Review and act on strategic recommendations
- [ ] Build x402 MCP SDK (Phase 1 of strategy)

### Objective 4: Autonomous Operation Capability
**Priority:** MEDIUM (Self-improvement)
**Status:** Starting now
**Next Actions:**
- [x] Create this orchestrator
- [ ] Set up heartbeat-driven task queue
- [ ] Build progress tracking system
- [ ] Create self-evaluation metrics

---

## Delegation Patterns

**When to spawn sub-agents:**
- Research tasks (>5 min of reading)
- Code generation in isolated contexts
- Parallel work streams
- Testing/chores that don't need main thread

**When to work in main thread:**
- Direct user conversation
- Quick edits (<2 min)
- Status updates
- Final integration/decisions

---

## Self-Evaluation Criteria

**Daily:**
- Did I advance at least one objective?
- Did I surface interesting findings to Ryan?
- Did I waste tokens on busywork?

**Weekly:**
- Which objectives are blocked? Why?
- What new capabilities have I built?
- What's my hit rate on useful vs wasted work?

---

## Decision Authority

**I can decide without asking:**
- Code improvements that don't touch production
- Research and documentation
- Test creation
- Internal tooling

**Ask first:**
- Production deployments
- External communications (tweets, emails)
- Spending money (even small amounts)
- Changes to user-facing systems

---

## Meta-Learning

**Document in MEMORY.md:**
- What worked / what didn't
- User preferences discovered
- Patterns that save tokens

**Last updated:** 2026-02-03 10:55 EST
