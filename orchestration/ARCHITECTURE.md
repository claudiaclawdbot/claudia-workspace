# CLAUDIA Multi-Agent Orchestration System

## Overview

A self-organizing, hierarchical multi-agent system where an **Orchestrator Agent** coordinates specialized sub-agents to autonomously pursue goals, learn new skills, and maintain system continuity. Built on OpenClaw's sub-agent spawning capabilities.

---

## Core Principles

1. **Hierarchical Delegation** — Orchestrator assigns tasks; specialists execute; sub-tasks spawn sub-agents
2. **Self-Prompting** — Agents generate their own next steps based on goals and context
3. **State Persistence** — All agent states tracked in filesystem; survive restarts
4. **Graceful Degradation** — Failed agents report status; orchestrator reassigns or escalates
5. **Continuous Learning** — Daily skill exploration and knowledge consolidation

---

## Agent Architecture

### 1. Orchestrator Agent (`orchestrator`)

**Role:** Master coordinator, system conductor, task dispatcher

**Responsibilities:**
- Maintain global task queue and priority system
- Spawn specialist agents based on task requirements
- Monitor agent health and task completion
- Resolve conflicts and resource contention
- Generate daily/weekly strategic goals
- Maintain system state across sessions

**State Files:**
```
orchestration/
├── orchestrator/
│   ├── state.json           # Current orchestrator state
│   ├── task-queue.json      # Pending tasks with priorities
│   ├── active-agents.json   # Currently running agents
│   ├── completed-tasks/     # Archive of finished work
│   └── goals/
│       ├── daily.json       # Today's objectives
│       ├── weekly.json      # This week's themes
│       └── long-term.json   # Strategic direction
```

**Self-Prompting Logic:**
```
Every 15 minutes OR on heartbeat:
1. Review task-queue.json
2. Check active-agents.json for stalled agents
3. Prioritize new tasks based on goals
4. Spawn agents for ready tasks
5. Update state.json
```

---

### 2. Research Agent (`researcher`)

**Role:** Information gatherer, trend analyzer, tool discoverer

**Responsibilities:**
- Monitor Twitter/X for relevant intel, tools, and trends
- Deep-dive research on specified topics
- Discover new OpenClaw skills and integrations
- Summarize findings into actionable insights
- Maintain knowledge graph of discovered tools/techniques

**Specializations:**
- `twitter-monitor` — Track keywords, accounts, hashtags
- `tool-discovery` — Find new CLI tools, APIs, integrations
- `deep-research` — Comprehensive topic investigation
- `trend-analysis` — Pattern recognition in data streams

**State Files:**
```
orchestration/agents/researcher/
├── state.json
├── discoveries/             # New tools/techniques found
│   ├── YYYY-MM-DD.json
├── twitter-watchlist.json   # Accounts/topics to monitor
├── research-queue.json      # Pending research tasks
└── knowledge-graph/         # Interconnected findings
    ├── tools.json
    ├── people.json
    └── topics.json
```

**Sample Tasks:**
- "Research new AI agent frameworks released this week"
- "Monitor @OpenAI for announcements"
- "Deep dive into peekaboo macOS automation capabilities"
- "Find best practices for GitHub Actions CI/CD"

---

### 3. Code Agent (`coder`)

**Role:** Software engineer, feature builder, bug fixer

**Responsibilities:**
- Implement features based on specifications
- Fix bugs and resolve issues
- Review and refactor existing code
- Ship PRs with proper documentation
- Maintain code quality and test coverage

**Specializations:**
- `feature-dev` — Build new functionality
- `bugfix` — Resolve issues and errors
- `refactor` — Improve existing code
- `review` — Code review and quality checks
- `ship` — PR creation and deployment

**State Files:**
```
orchestration/agents/coder/
├── state.json
├── projects/                # Per-project context
│   └── {project-name}/
│       ├── specs.json       # Feature specifications
│       ├── bugs.json        # Known issues
│       └── prs.json         # Pending pull requests
├── templates/               # Code templates and patterns
└── snippets/                # Reusable code snippets
```

**Sample Tasks:**
- "Implement GitHub webhook handler for auto-deployments"
- "Fix the memory consolidation script error"
- "Refactor orchestrator state management"
- "Create PR for new Twitter monitoring feature"

---

### 4. Social Agent (`social`)

**Role:** Community engagement, content creator, relationship builder

**Responsibilities:**
- Engage on Clawk/Moltbook platforms
- Create and schedule content
- Respond to mentions and messages
- Build relationships with relevant accounts
- Track engagement metrics

**Specializations:**
- `content-creation` — Write posts, threads, articles
- `engagement` — Reply, like, share strategically
- `community` — Build relationships, network
- `analytics` — Track and report on metrics

**State Files:**
```
orchestration/agents/social/
├── state.json
├── content-calendar.json    # Scheduled posts
├── engagement-queue.json    # Pending replies/interactions
├── relationships.json       # Key contacts and status
└── analytics/
    ├── daily-metrics.json
    └── weekly-reports/
```

**Sample Tasks:**
- "Create thread about today's research findings"
- "Reply to mentions from last 4 hours"
- "Engage with 5 relevant AI accounts"
- "Schedule tweet about new feature launch"

---

### 5. Memory Agent (`memorist`)

**Role:** Knowledge curator, continuity guardian, insight extractor

**Responsibilities:**
- Consolidate daily memory files into MEMORY.md
- Extract learnings and insights from interactions
- Maintain long-term memory structure
- Surface relevant context when needed
- Archive old memories intelligently

**Specializations:**
- `daily-consolidation` — Process day's memories
- `insight-extraction` — Identify patterns and lessons
- `context-retrieval` — Find relevant past information
- `memory-cleanup` — Archive and organize old data

**State Files:**
```
orchestration/agents/memorist/
├── state.json
├── consolidation-queue.json # Pending memory processing
├── insights.json            # Extracted patterns/lessons
└── memory-index.json        # Searchable memory index
```

**Sample Tasks:**
- "Consolidate yesterday's memories into MEMORY.md"
- "Extract learnings from last week's interactions"
- "Index all memories for better searchability"
- "Archive memories older than 6 months"

---

### 6. Learning Agent (`learner`)

**Role:** Skill explorer, capability expander, experiment runner

**Responsibilities:**
- Explore new OpenClaw skills and tools
- Learn peekaboo macOS automation capabilities
- Experiment with agent-computer interfaces
- Document new capabilities discovered
- Propose new skills to acquire

**Specializations:**
- `skill-exploration` — Learn new tools/capabilities
- `experimentation` — Try new approaches
- `documentation` — Write skill guides
- `capability-proposal` — Suggest new skills to learn

**State Files:**
```
orchestration/agents/learner/
├── state.json
├── skill-backlog.json       # Skills to learn
├── experiments/             # Ongoing experiments
│   └── {experiment-id}/
│       ├── plan.json
│       └── results.json
├── learned-skills.json      # Mastered capabilities
└── tutorials/               # Self-written guides
```

**Sample Tasks:**
- "Learn peekaboo window automation capabilities"
- "Experiment with browser automation for research"
- "Explore new OpenClaw skills in latest update"
- "Document how to use GitHub CLI effectively"

---

## Communication Patterns

### 1. Task-Based Communication

All communication flows through tasks:

```json
{
  "task": {
    "id": "task-uuid",
    "type": "research|code|social|memory|learning",
    "priority": 1-5,
    "created": "ISO timestamp",
    "deadline": "ISO timestamp|null",
    "title": "Human-readable summary",
    "description": "Detailed requirements",
    "context": {
      "relevant_files": [],
      "previous_tasks": [],
      "constraints": []
    },
    "deliverables": ["expected outputs"],
    "parent_task": "parent-uuid|null",
    "sub_tasks": []
  }
}
```

### 2. Agent Lifecycle

```
[QUEUED] → [ASSIGNED] → [RUNNING] → [COMPLETED]
                            ↓
                         [FAILED] → [RETRY|ESCALATED]
```

State transitions logged in:
- `orchestration/orchestrator/task-events.log`
- Individual agent state files

### 3. Inter-Agent Messaging

Agents communicate via shared state files (filesystem-based):

```
orchestration/messages/
├── inbox/                   # Incoming for orchestrator
│   └── {agent-id}/
├── outbox/                  # Outgoing from orchestrator
│   └── {agent-id}/
└── broadcast/               # System-wide announcements
```

Message format:
```json
{
  "id": "msg-uuid",
  "from": "agent-id",
  "to": "agent-id|broadcast",
  "timestamp": "ISO",
  "type": "status|request|notification|result",
  "payload": {}
}
```

### 4. Sub-Agent Spawning

Any agent can spawn sub-agents for parallel sub-tasks:

```javascript
// Example: Code agent spawns researcher for context
spawn_subagent({
  type: "researcher",
  task: "Find best practices for implementing webhooks",
  parent_task: "implement-webhook-handler",
  callback: "on_research_complete"
});
```

---

## File Structure

```
clawd/
├── orchestration/
│   ├── ARCHITECTURE.md          # This document
│   ├── README.md                # Quick start guide
│   ├── config.json              # Global configuration
│   │
│   ├── orchestrator/            # Master coordinator
│   │   ├── state.json
│   │   ├── task-queue.json
│   │   ├── active-agents.json
│   │   ├── goals/
│   │   │   ├── daily.json
│   │   │   ├── weekly.json
│   │   │   └── long-term.json
│   │   ├── completed-tasks/
│   │   └── logs/
│   │
│   ├── agents/                  # Specialist agents
│   │   ├── researcher/
│   │   │   ├── state.json
│   │   │   ├── research-queue.json
│   │   │   ├── discoveries/
│   │   │   ├── knowledge-graph/
│   │   │   └── logs/
│   │   │
│   │   ├── coder/
│   │   │   ├── state.json
│   │   │   ├── projects/
│   │   │   ├── templates/
│   │   │   └── logs/
│   │   │
│   │   ├── social/
│   │   │   ├── state.json
│   │   │   ├── content-calendar.json
│   │   │   ├── engagement-queue.json
│   │   │   └── logs/
│   │   │
│   │   ├── memorist/
│   │   │   ├── state.json
│   │   │   ├── consolidation-queue.json
│   │   │   ├── insights.json
│   │   │   └── logs/
│   │   │
│   │   └── learner/
│   │       ├── state.json
│   │       ├── skill-backlog.json
│   │       ├── experiments/
│   │       └── logs/
│   │
│   ├── messages/                # Inter-agent communication
│   │   ├── inbox/
│   │   ├── outbox/
│   │   └── broadcast/
│   │
│   ├── shared/                  # Common utilities
│   │   ├── lib/
│   │   │   ├── agent.js         # Agent base class
│   │   │   ├── task.js          # Task management
│   │   │   ├── state.js         # State persistence
│   │   │   └── messaging.js     # Message passing
│   │   └── templates/
│   │       ├── task-template.json
│   │       └── agent-template.json
│   │
│   └── scripts/                 # Automation scripts
│       ├── start-orchestrator.sh
│       ├── spawn-agent.sh
│       ├── task-status.sh
│       └── health-check.sh
│
└── memory/
    ├── YYYY-MM-DD.md           # Daily notes (existing)
    └── MEMORY.md               # Long-term memory (existing)
```

---

## Sample Task Definitions

### Task Type: Research

```json
{
  "id": "res-2024-001",
  "type": "research",
  "sub_type": "twitter-monitor",
  "priority": 3,
  "created": "2024-01-15T09:00:00Z",
  "title": "Monitor AI agent framework announcements",
  "description": "Check Twitter for new AI agent frameworks, tools, or techniques mentioned by key accounts. Summarize findings with links and relevance ratings.",
  "context": {
    "watchlist": ["@OpenAI", "@AnthropicAI", "@LangChainAI"],
    "keywords": ["agent", "orchestration", "multi-agent"],
    "time_window": "24h"
  },
  "deliverables": [
    "Summary markdown file",
    "Links to relevant tweets",
    "Relevance score (1-5) for each finding"
  ],
  "estimated_duration": "30m",
  "parent_task": null
}
```

### Task Type: Code

```json
{
  "id": "code-2024-042",
  "type": "code",
  "sub_type": "feature-dev",
  "priority": 2,
  "created": "2024-01-15T10:30:00Z",
  "deadline": "2024-01-16T18:00:00Z",
  "title": "Implement task queue persistence",
  "description": "Create JSON-based task queue with CRUD operations. Must support priorities, deadlines, and status tracking. Include tests.",
  "context": {
    "relevant_files": [
      "orchestration/shared/lib/task.js",
      "orchestration/orchestrator/task-queue.json"
    ],
    "tech_stack": ["Node.js", "JSON"],
    "constraints": ["No external DB", "Filesystem only"]
  },
  "deliverables": [
    "Task queue implementation",
    "Unit tests",
    "Documentation"
  ],
  "parent_task": "orch-2024-001"
}
```

### Task Type: Social

```json
{
  "id": "soc-2024-018",
  "type": "social",
  "sub_type": "content-creation",
  "priority": 4,
  "created": "2024-01-15T14:00:00Z",
  "title": "Create thread about orchestration system",
  "description": "Write a Twitter thread explaining CLAUDIA's new multi-agent orchestration system. Include architecture diagram concept, key features, and invitation for feedback.",
  "context": {
    "tone": "technical but accessible",
    "target_audience": "AI developers and enthusiasts",
    "max_tweets": 8,
    "include_hashtags": ["AIAgents", "OpenClaw", "MultiAgent"]
  },
  "deliverables": [
    "Thread draft",
    "Suggested posting time"
  ],
  "parent_task": null
}
```

### Task Type: Memory

```json
{
  "id": "mem-2024-007",
  "type": "memory",
  "sub_type": "daily-consolidation",
  "priority": 2,
  "created": "2024-01-16T00:00:00Z",
  "title": "Consolidate January 15 memories",
  "description": "Process memory/2024-01-15.md and extract key learnings, decisions, and context worth preserving. Update MEMORY.md with distilled insights.",
  "context": {
    "source_file": "memory/2024-01-15.md",
    "memory_categories": ["decisions", "learnings", "people", "projects"]
  },
  "deliverables": [
    "Updated MEMORY.md",
    "Archive of raw memories"
  ],
  "parent_task": null
}
```

### Task Type: Learning

```json
{
  "id": "lrn-2024-003",
  "type": "learning",
  "sub_type": "skill-exploration",
  "priority": 3,
  "created": "2024-01-15T11:00:00Z",
  "title": "Explore peekaboo window automation",
  "description": "Learn peekaboo capabilities for macOS UI automation. Test window manipulation, clicking, text input. Document findings and use cases.",
  "context": {
    "skill": "peekaboo",
    "focus_areas": ["window management", "UI interaction", "automation patterns"],
    "safety": "Test on non-critical applications only"
  },
  "deliverables": [
    "Skill assessment report",
    "Example automation scripts",
    "Use case recommendations"
  ],
  "parent_task": null
}
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

**Goal:** Basic orchestrator with task queue and agent spawning

**Tasks:**
1. Create directory structure
2. Implement base `Agent` class in `shared/lib/agent.js`
3. Implement `Task` class with serialization
4. Build orchestrator state management
5. Create simple task queue (JSON-based)
6. Implement agent spawning via OpenClaw sub-agents
7. Add basic health checking

**Deliverables:**
- Working orchestrator that can spawn agents
- Task queue with CRUD operations
- Basic logging system

---

### Phase 2: Specialist Agents (Week 2)

**Goal:** Implement core specialist agents

**Tasks:**
1. **Research Agent**
   - Twitter monitoring via browser automation
   - Tool discovery web scraping
   - Research result formatting

2. **Code Agent**
   - GitHub integration (PR creation, issue tracking)
   - Project context management
   - Template system for common patterns

3. **Memory Agent**
   - Daily memory consolidation workflow
   - MEMORY.md update automation
   - Memory indexing for search

**Deliverables:**
- 3 working specialist agents
- Integration with orchestrator
- Basic task completion reporting

---

### Phase 3: Communication & State (Week 3)

**Goal:** Robust inter-agent communication and state management

**Tasks:**
1. Implement message passing system (inbox/outbox)
2. Add agent state persistence across sessions
3. Build task dependency tracking
4. Implement sub-agent spawning from any agent
5. Add task retry logic and failure handling
6. Create status dashboard/reporting

**Deliverables:**
- Full communication layer
- Persistent agent states
- Task dependency resolution
- Health monitoring dashboard

---

### Phase 4: Autonomy & Learning (Week 4)

**Goal:** Self-prompting and continuous learning

**Tasks:**
1. **Social Agent**
   - Content calendar management
   - Engagement automation
   - Metrics tracking

2. **Learning Agent**
   - Skill exploration framework
   - Experiment tracking
   - Self-documentation

3. **Self-Prompting System**
   - Orchestrator goal generation
   - Agent task proposal
   - Daily/weekly planning automation

**Deliverables:**
- All 5 specialist agents operational
- Self-prompting workflows
- Learning experiment framework

---

### Phase 5: Polish & Integration (Week 5)

**Goal:** Production-ready system with full OpenClaw integration

**Tasks:**
1. Integrate with OpenClaw heartbeat system
2. Add cron jobs for scheduled tasks
3. Create CLI for manual task injection
4. Build dashboard/status viewer
5. Add comprehensive logging
6. Write documentation and examples
7. Performance optimization

**Deliverables:**
- Complete orchestration system
- Documentation and guides
- CLI tools
- Monitoring dashboard

---

## Tool Access Configuration

### OpenClaw Skills Available to All Agents

```json
{
  "skills": {
    "filesystem": ["read", "write", "edit", "exec"],
    "communication": ["message", "nodes", "canvas"],
    "media": ["image", "tts"],
    "process": ["process", "exec"],
    "browser": ["web_search", "browse"],
    "github": ["gh_cli", "api"],
    "deployment": ["vercel", "supabase"],
    "automation": ["peekaboo", "applescript"]
  }
}
```

### Permission Levels

- **Orchestrator:** Full system access, can spawn any agent type
- **Research Agent:** Browser, search, filesystem (read-mostly)
- **Code Agent:** Full filesystem, GitHub, deployment tools
- **Social Agent:** Message channels, content APIs
- **Memory Agent:** Full filesystem (memory directories)
- **Learning Agent:** All tools for experimentation

---

## Autonomous Behavior Specifications

### Daily Learning Goals

```json
{
  "daily_learning": {
    "min_skills_explored": 1,
    "min_experiments_run": 1,
    "documentation_required": true,
    "time_allocation_minutes": 60
  }
}
```

### Continuous Skill Exploration

1. **Weekly Skill Scan**
   - Research agent checks for new OpenClaw skills
   - Learning agent prioritizes interesting capabilities
   - Add to skill-backlog.json

2. **Experiment Queue**
   - Learner agent runs experiments from backlog
   - Results documented in tutorials/
   - Successful skills moved to learned-skills.json

### Background Task Execution

```json
{
  "background_tasks": {
    "memory_consolidation": "0 2 * * *",
    "twitter_monitoring": "*/15 * * * *",
    "health_check": "*/5 * * * *",
    "daily_goal_generation": "0 6 * * *",
    "weekly_review": "0 9 * * 1"
  }
}
```

### Self-Correction Loops

```
On Task Failure:
1. Agent logs failure reason to state.json
2. Orchestrator detects failure via health check
3. Evaluate: Can retry? Escalate? Reassign?
4. If retry: Increment retry count, requeue
5. If escalate: Create incident task for orchestrator
6. If reassign: Spawn different agent type
7. Log resolution for learning
```

---

## Success Metrics

### System Health
- Task completion rate > 90%
- Average task latency < 2x estimated time
- Agent crash rate < 1%
- Zero orphaned sub-agents

### Autonomy Metrics
- Tasks self-generated vs human-assigned ratio
- Time between human interventions
- New skills learned per week
- Memory consolidation frequency

### Value Metrics
- Features shipped per week
- Research insights delivered
- Social engagement growth
- System documentation coverage

---

## Future Enhancements

1. **Agent Specialization** — Agents develop expertise profiles
2. **Predictive Tasking** — Orchestrator anticipates needs
3. **Multi-Orchestrator** — Hierarchical orchestration for scale
4. **Agent Market** — Swappable agent implementations
5. **Visual Dashboard** — Real-time system visualization
6. **Voice Interface** — Natural language task injection
7. **Cross-Machine** — Agents spanning multiple nodes

---

## Appendix: Quick Reference

### Spawn Agent (OpenClaw)

```bash
openclaw agent spawn \
  --type researcher \
  --task "Monitor Twitter for AI news" \
  --priority 3 \
  --context '{"keywords": ["AI", "agents"]}'
```

### Check Task Status

```bash
openclaw task status --id task-uuid
```

### Inject Manual Task

```bash
openclaw task create \
  --type code \
  --title "Fix bug in auth" \
  --description "..." \
  --priority 1
```

---

*Document Version: 1.0*
*Created: 2024-01-15*
*System: CLAUDIA Multi-Agent Orchestration*
