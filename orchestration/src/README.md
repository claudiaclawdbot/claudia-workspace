# Orchestration System - Phase 1 Implementation

**Status:** ✅ Complete  
**Location:** `/Users/clawdbot/clawd/orchestration/src/`  
**Architecture:** Based on ARCHITECTURE.md

## What Was Built

Phase 1 Foundation provides the core infrastructure for spawning and managing agents autonomously:

### 1. Task Queue System (`shared/lib/task.js`)
- **Task class**: Complete task lifecycle (queued → assigned → running → completed/failed)
- **TaskQueue class**: Priority-based queue with JSON persistence
- Task priorities (1=Critical to 5=Background)
- Status tracking and retry logic
- Overdue task detection
- Automatic archiving of old completed tasks

### 2. Agent Base Classes (`shared/lib/agent.js`)
- **Agent class**: Base class all agents extend
- Agent lifecycle (idle → initializing → running → completed/failed)
- Sub-agent spawning capability
- State persistence (save/load to JSON)
- Event logging
- Health monitoring hooks

### 3. State Persistence (`shared/lib/state.js`)
- **StateManager**: Persistent key-value store for system state
- **JSONFile**: Atomic file operations with backup
- **LockFile**: Simple file-based locking for safe concurrent access

### 4. Orchestrator (`orchestrator/orchestrator.js`)
- Master coordinator that manages the entire system
- Task queue management and prioritization
- Agent spawning based on task type
- Active agent tracking
- Health checking (detects stale/failed agents)
- Automatic task retry on failure

### 5. Agent Spawning (`scripts/`)
- **spawn-agent.js**: Entry point for spawning new agents
- **agent-runner.js**: Executes agent logic for each agent type
- Supports: researcher, coder, social, memorist, learner, generic

### 6. CLI Tool (`orchestrator-cli.js`)
Commands:
- `init` - Initialize the system
- `start` - Start the orchestrator daemon
- `stop` - Stop the orchestrator
- `status` - Show system status
- `queue` - Show task queue
- `agents` - Show active agents
- `add-task` - Add a new task

## File Structure

```
orchestration/src/
├── orchestrator/
│   ├── orchestrator.js      # Main orchestrator class
│   └── state/
│       └── agent-state.json # Orchestrator state
├── shared/
│   └── lib/
│       ├── task.js          # Task and TaskQueue classes
│       ├── agent.js         # Agent base class
│       └── state.js         # State persistence utilities
├── scripts/
│   ├── spawn-agent.js       # Agent spawning entry point
│   └── agent-runner.js      # Agent execution logic
├── orchestrator-cli.js      # CLI tool
└── demo.js                  # Demo script
```

## How It Works

### Task Flow
1. **Add Task**: User adds task via CLI or API
2. **Queue**: Task stored in priority queue (JSON file)
3. **Process**: Orchestrator checks queue every 5 seconds
4. **Spawn**: When slot available, orchestrator spawns appropriate agent
5. **Execute**: Agent runs and saves results to workspace
6. **Complete**: Orchestrator detects completion, updates task status

### Agent Spawning
1. Orchestrator determines agent type from task
2. Creates agent workspace directory
3. Writes task.json and config.json to workspace
4. Agent runner executes agent-specific logic
5. Agent saves state.json with results

### State Persistence
All state is stored in JSON files:
- Task queue: `orchestrator/task-queue.json`
- Active agents: `orchestrator/active-agents.json`
- Agent states: `agents/{type}/{id}/state/agent-state.json`

This ensures the system survives restarts.

## Usage

### Quick Start
```bash
cd /Users/clawdbot/clawd/orchestration/src

# Initialize
node orchestrator-cli.js init

# Add a task
node orchestrator-cli.js add-task \
  --type code \
  --title "Fix bug in auth" \
  --description "Fix the authentication bug" \
  --priority 1

# Check status
node orchestrator-cli.js status
node orchestrator-cli.js queue

# Start orchestrator (in background)
node orchestrator-cli.js start

# Stop orchestrator
node orchestrator-cli.js stop
```

### Run Demo
```bash
cd /Users/clawdbot/clawd/orchestration
node src/demo.js
```

### Programmatic Usage
```javascript
const { Orchestrator } = require('./src/orchestrator/orchestrator');
const { TaskType, TaskPriority } = require('./src/shared/lib/task');

async function main() {
  const orchestrator = new Orchestrator();
  await orchestrator.initialize();
  
  // Add a task
  const task = orchestrator.addTask({
    type: TaskType.CODE,
    priority: TaskPriority.HIGH,
    title: 'Implement feature',
    description: 'Build the new feature'
  });
  
  // Start processing
  await orchestrator.start();
}
```

## Capabilities

✅ Accept tasks via CLI and programmatic API  
✅ Priority-based task queue  
✅ Spawn appropriate agents based on task type  
✅ Track task status (queued → assigned → running → completed/failed)  
✅ Save state between runs (JSON persistence)  
✅ Health checking and automatic retry  
✅ Agent workspace isolation  
✅ Event logging

## What's Next (Phase 2)

- Implement actual agent logic (researcher, coder, etc.)
- Add OpenClaw sub-agent integration
- Implement inter-agent messaging
- Build specialist agents with real capabilities
- Add GitHub integration for code agents
- Add browser automation for research agents
- Memory consolidation for memorist agent

## Architecture Compliance

This implementation follows the ARCHITECTURE.md specification:
- ✅ Hierarchical delegation (orchestrator → agents)
- ✅ State persistence (JSON-based)
- ✅ Task-based communication
- ✅ Agent lifecycle tracking
- ✅ Graceful degradation (retry logic)

## Testing

Run the demo to verify everything works:
```bash
node src/demo.js
```

This will:
1. Initialize the orchestrator
2. Add 4 sample tasks
3. Show queue and system status
4. Verify state persistence
