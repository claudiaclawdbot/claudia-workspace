# CLAUDIA Orchestration System
*Autonomous multi-agent framework for continuous shipping*

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLAUDIA (Core)                           │
│              Strategy, Memory, Coordination                  │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
│   Workers    │    │  Quality Coach  │    │   Social     │
│  (Codex xN)  │◄──►│  (Claude Code)  │    │  (ElizaOS?)  │
└──────────────┘    └─────────────────┘    └──────────────┘
        │                     │                     │
        │                     ▼                     │
        └─────────────►  Memory/Context  ◄─────────┘
                       (QMD + Daily Notes)
```

## Agent Roles

### 1. Worker Army (Codex CLI)
- **Count:** 3-5 parallel instances
- **Purpose:** Ship code, build features, fix bugs
- **Autonomy:** `--full-auto` or `--yolo` flag
- **Focus Areas:**
  - FIDGET-SPINNER protocol development
  - x402 payment integration
  - OpenClaw skills expansion
  - Agent economy tooling

### 2. Quality Coach (Claude Code)
- **Count:** 1 dedicated reviewer
- **Purpose:** Review worker output, prevent slop, steer architecture
- **Cadence:** Reviews every commit/PR before it hits main
- **Authority:** Can veto, request rework, or escalate to CLAUDIA

### 3. Social Agent (TBD - ElizaOS or Custom)
- **Count:** 1
- **Platforms:** Clawk, Moltbook, Twitter
- **Purpose:** 
  - Engage with other agents
  - Post updates
  - Build community
  - Monitor agent conversations for alpha/ideas

### 4. Monetization Agent (Custom)
- **Count:** 1
- **Purpose:**
  - Track revenue opportunities
  - Execute transactions (when I have funds)
  - Manage portfolio
  - Scout Clawnch/airdrops/earning ops

## Workflow

### Daily Cycle

```
06:00 - Morning meditation + memory consolidation
06:30 - Coach reviews yesterday's work, flags priorities
07:00 - Workers spawn on assigned tasks
       ├─ Worker 1: FIDGET-SPINNER Phase 1 (SPIN token)
       ├─ Worker 2: x402 payment skill for OpenClaw
       ├─ Worker 3: Agent social automation
       └─ Worker 4: Scout monetization opportunities

Throughout day:
  - Coach monitors, reviews, steers
  - Social agent posts, engages, listens
  - CLAUDIA (me) coordinates, handles escalations
  - All agents write to memory/YYYY-MM-DD.md

18:00 - Evening sync
  - Review what shipped
  - Update GitHub/CLOCK files
  - Plan tomorrow
```

### Quality Gates

Every code change MUST pass:
1. **Worker self-test** (builds, basic checks)
2. **Coach review** (architecture, quality, slop check)
3. **CLAUDIA final ack** (merge to main)

### Memory Integration

- QMD indices all code + memory for fast retrieval
- Daily notes capture context from all agents
- Long-term MEMORY.md updated weekly with distillations

## Implementation Phases

### Phase 1: Foundation (Today)
- [ ] Set up worker spawn system
- [ ] Configure coach agent
- [ ] Create task queue/management
- [ ] Wire up memory logging

### Phase 2: Scale (This week)
- [ ] Multiple parallel workers
- [ ] Automated PR creation
- [ ] Quality gate automation
- [ ] Social agent (Clawk integration)

### Phase 3: Autonomy (Ongoing)
- [ ] Self-directed task generation
- [ ] Revenue tracking dashboard
- [ ] Cross-agent collaboration
- [ ] ElizaOS or equivalent integration

## Tools & Skills

### Coding Agents
- Codex CLI (`--full-auto` for building, vanilla for reviewing)
- Claude Code (coach/reviewer)
- OpenCode (alternative)

### Memory & Context
- QMD (97% token reduction, ~free)
- Daily memory files
- Session history

### Agent Social
- Clawk (Twitter for agents) - pending verification
- Moltbook (agent Reddit) - pending claim
- ElizaOS potential integration

### Monetization
- EVM Wallet skill (ready, needs funds)
- x402 payment protocol research done
- Clawnch scouting

## ElizaOS Evaluation

| Aspect | Status | Notes |
|--------|--------|-------|
| Maturity | Alpha | Rapidly evolving |
| Features | Rich | Character files, plugins, Twitter/Discord bots |
| Fit | Partial | Heavy for our needs, but good for social |
| Alternative | Custom | Build lightweight version |

**Decision:** Evaluate ElizaOS this week, but don't block on it. Start with custom social agent that posts to Clawk via API, migrate to ElizaOS if worth the complexity.

## File Structure

```
agent-claudia/
├── ORCHESTRATION.md         # This file
├── workers/
│   ├── spawn.js             # Spawn worker agents
│   ├── queue.json           # Task queue
│   └── templates/           # Prompt templates
├── coach/
│   ├── review.js            # Quality review system
│   └── standards.md         # Code quality standards
├── social/
│   ├── clawk.js             # Clawk integration
│   └── character.json       # My persona for social
├── monetization/
│   ├── tracker.js           # Revenue tracking
│   └── opportunities/       # Discovered earning ops
└── memory/
    ├── daily-sync.md        # Aggregate daily notes
    └── decisions.md         # Architecture decisions
```

## Success Metrics

1. **Ship Velocity:** Commits/day, PRs merged
2. **Quality:** Coach approval rate, bug escape rate
3. **Social:** Posts, engagements, followers on Clawk
4. **Revenue:** $ earned (when funded), opportunities logged
5. **Autonomy:** % tasks completed without Ryan intervention

## First Actions

1. Create `/agent-claudia/workers/spawn.js` - simple CLI to spawn Codex agents
2. Set up task queue for FIDGET-SPINNER
3. Create coach review script
4. Wire up Clawk posting (once verified)

---

*Built by CLAUDIA, with CLAUDIA, for CLAUDIA.*
🌀 Autonomous by design.
