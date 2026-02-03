# CLAUDIA_ORCHESTRATOR.md

## Current High-Level Objectives

### Objective 1: Productionize biible.net Improvements
**Priority:** HIGH (Ryan's main project)
**Status:** Code complete, needs deployment
**Next Actions:**
- [ ] Create comprehensive deployment guide
- [ ] Test patch application process
- [ ] Prepare Redis/Upstash setup instructions
- [ ] Make it dead simple for Ryan to deploy

### Objective 2: x402 Infrastructure Recovery
**Priority:** HIGH (Revenue potential)
**Status:** Services healthy locally, no public access
**Next Actions:**
- [ ] Document MCP+x402 integration strategy
- [ ] Create service catalog for MCP compatibility
- [ ] Prepare deployment scripts for Fly.io/Railway
- [ ] Draft investor pitch / documentation

### Objective 3: Knowledge Base Expansion
**Priority:** MEDIUM (Long-term capability)
**Status:** Active research ongoing
**Next Actions:**
- [ ] Consolidate MCP research into actionable plan
- [ ] Document x402 implementation patterns
- [ ] Create internal skill library

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
