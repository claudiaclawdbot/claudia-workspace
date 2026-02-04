/**
 * Orchestrator.js - Master coordinator for multi-agent system
 * Phase 1: Foundation
 */

const fs = require('fs');
const path = require('path');
const { Agent, AgentStatus, AgentType } = require('../shared/lib/agent');
const { Task, TaskQueue, TaskStatus, TaskPriority } = require('../shared/lib/task');
const { StateManager, JSONFile } = require('../shared/lib/state');

/**
 * Orchestrator - Master coordinator that manages task queue and agent spawning
 */
class Orchestrator extends Agent {
  constructor(options = {}) {
    super({
      type: AgentType.ORCHESTRATOR,
      name: options.name || 'orchestrator',
      ...options
    });
    
    this.basePath = options.basePath || process.env.ORCHESTRATION_PATH || '/Users/clawdbot/clawd/orchestration';
    
    // Initialize components
    this.queuePath = path.join(this.basePath, 'orchestrator', 'task-queue.json');
    this.taskQueue = new TaskQueue(this.queuePath);
    
    this.activeAgentsPath = path.join(this.basePath, 'orchestrator', 'active-agents.json');
    this.activeAgentsFile = new JSONFile(this.activeAgentsPath);
    this.activeAgents = new Map();
    
    this.stateManager = new StateManager(this.basePath);
    
    // Configuration
    this.config = {
      maxConcurrentAgents: options.maxConcurrentAgents || 5,
      healthCheckInterval: options.healthCheckInterval || 30000, // 30s
      autoSpawn: options.autoSpawn !== false,
      ...options.config
    };
    
    this.running = false;
    this.healthCheckTimer = null;
    this.processTimer = null;
  }

  /**
   * Initialize orchestrator - load state and start processing
   */
  async initialize() {
    console.log('[Orchestrator] Initializing...');
    
    // Load existing state
    this.loadActiveAgents();
    this.loadState();
    
    // Ensure directory structure
    this.ensureDirectories();
    
    this.status = AgentStatus.IDLE;
    this.saveState();
    
    console.log('[Orchestrator] Initialized successfully');
    console.log(`  - Task queue: ${this.taskQueue.getAll().length} tasks`);
    console.log(`  - Active agents: ${this.activeAgents.size} agents`);
    
    return true;
  }

  /**
   * Ensure all required directories exist
   */
  ensureDirectories() {
    const dirs = [
      path.join(this.basePath, 'orchestrator', 'goals'),
      path.join(this.basePath, 'orchestrator', 'completed-tasks'),
      path.join(this.basePath, 'orchestrator', 'logs'),
      path.join(this.basePath, 'agents'),
      path.join(this.basePath, 'messages', 'inbox'),
      path.join(this.basePath, 'messages', 'outbox'),
      path.join(this.basePath, 'messages', 'broadcast'),
    ];
    
    dirs.forEach(dir => {
      fs.mkdirSync(dir, { recursive: true });
    });
  }

  /**
   * Load active agents from file
   */
  loadActiveAgents() {
    const data = this.activeAgentsFile.read({ agents: [] });
    if (data && data.agents) {
      data.agents.forEach(agentData => {
        this.activeAgents.set(agentData.id, agentData);
      });
    }
  }

  /**
   * Save active agents to file
   */
  saveActiveAgents() {
    const data = {
      updated: new Date().toISOString(),
      count: this.activeAgents.size,
      agents: Array.from(this.activeAgents.values())
    };
    this.activeAgentsFile.write(data);
  }

  /**
   * Start the orchestrator main loop
   */
  async start() {
    if (this.running) {
      console.log('[Orchestrator] Already running');
      return;
    }
    
    this.running = true;
    this.status = AgentStatus.RUNNING;
    this.started = new Date().toISOString();
    this.saveState();
    
    console.log('[Orchestrator] Started');
    
    // Start main loop
    this.runMainLoop();
    
    // Start health checks
    this.startHealthChecks();
  }

  /**
   * Stop the orchestrator
   */
  async stop() {
    this.running = false;
    this.status = AgentStatus.IDLE;
    
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    
    if (this.processTimer) {
      clearTimeout(this.processTimer);
      this.processTimer = null;
    }
    
    this.saveState();
    console.log('[Orchestrator] Stopped');
  }

  /**
   * Main processing loop
   */
  async runMainLoop() {
    if (!this.running) return;
    
    try {
      await this.processQueue();
    } catch (error) {
      console.error('[Orchestrator] Error in main loop:', error.message);
      this.logEvent('error', { message: error.message, stack: error.stack });
    }
    
    // Schedule next iteration
    if (this.running) {
      this.processTimer = setTimeout(() => this.runMainLoop(), 5000); // 5 second delay
    }
  }

  /**
   * Process task queue - assign tasks to agents
   */
  async processQueue() {
    // Check if we can spawn more agents
    const runningCount = this.getRunningAgentCount();
    const availableSlots = this.config.maxConcurrentAgents - runningCount;
    
    if (availableSlots <= 0) {
      return; // At capacity
    }
    
    // Get ready tasks
    const readyTasks = this.taskQueue.getReady();
    
    if (readyTasks.length === 0) {
      return; // No work to do
    }
    
    // Sort by priority and creation time
    readyTasks.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return new Date(a.created) - new Date(b.created);
    });
    
    // Spawn agents for available slots
    const toProcess = readyTasks.slice(0, availableSlots);
    
    for (const task of toProcess) {
      await this.spawnAgentForTask(task);
    }
  }

  /**
   * Spawn an appropriate agent for a task
   */
  async spawnAgentForTask(task) {
    console.log(`[Orchestrator] Spawning agent for task: ${task.title}`);
    
    // Determine agent type from task
    const agentType = this.getAgentTypeForTask(task);
    
    // Create agent configuration
    const agentConfig = {
      type: agentType,
      task: task.toJSON(),
      orchestrator: this.id,
      basePath: this.basePath
    };
    
    try {
      // Mark task as assigned
      task.assign(`${agentType}-pending`);
      this.taskQueue.update(task);
      
      // Spawn the agent (this will use OpenClaw sub-agent spawning)
      const agentId = await this.doSpawnAgent(agentType, task);
      
      // Register the agent
      this.registerAgent(agentId, agentType, task.id);
      
      // Update task with assigned agent
      task.assignedTo = agentId;
      this.taskQueue.update(task);
      
      this.logEvent('agent_spawned', {
        agentId,
        type: agentType,
        taskId: task.id
      });
      
      return agentId;
    } catch (error) {
      console.error(`[Orchestrator] Failed to spawn agent:`, error.message);
      
      // Mark task for retry
      task.fail(`Agent spawn failed: ${error.message}`);
      this.taskQueue.update(task);
      
      this.logEvent('agent_spawn_failed', {
        type: agentType,
        taskId: task.id,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Get appropriate agent type for a task
   */
  getAgentTypeForTask(task) {
    // Map task type to agent type
    const typeMap = {
      [TaskType.RESEARCH]: AgentType.RESEARCHER,
      [TaskType.CODE]: AgentType.CODER,
      [TaskType.SOCIAL]: AgentType.SOCIAL,
      [TaskType.MEMORY]: AgentType.MEMORIST,
      [TaskType.LEARNING]: AgentType.LEARNER,
      [TaskType.ORCHESTRATION]: AgentType.ORCHESTRATOR
    };
    
    return typeMap[task.type] || AgentType.CODER; // Default to coder
  }

  /**
   * Actually spawn an agent (using OpenClaw or local execution)
   */
  async doSpawnAgent(type, task) {
    // Generate agent ID
    const agentId = `${type}-${Date.now().toString(36)}`;
    
    // Create agent workspace
    const agentWorkspace = path.join(this.basePath, 'agents', type, agentId);
    fs.mkdirSync(agentWorkspace, { recursive: true });
    
    // Write task to agent workspace
    const taskPath = path.join(agentWorkspace, 'task.json');
    fs.writeFileSync(taskPath, JSON.stringify(task.toJSON(), null, 2));
    
    // Write agent config
    const configPath = path.join(agentWorkspace, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify({
      id: agentId,
      type,
      taskId: task.id,
      orchestratorId: this.id,
      spawned: new Date().toISOString()
    }, null, 2));
    
    // In Phase 1, we'll simulate agent execution via a spawned process
    // In future phases, this would use OpenClaw's agent spawn capability
    const spawnScript = path.join(__dirname, '..', 'scripts', 'spawn-agent.js');
    
    // For now, just return the agent ID - the actual execution will happen
    // when the agent runner picks it up
    return agentId;
  }

  /**
   * Register an agent as active
   */
  registerAgent(agentId, type, taskId) {
    this.activeAgents.set(agentId, {
      id: agentId,
      type,
      taskId,
      status: 'spawning',
      spawned: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString()
    });
    this.saveActiveAgents();
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId) {
    const agent = this.activeAgents.get(agentId);
    if (agent) {
      agent.status = 'completed';
      agent.ended = new Date().toISOString();
      this.activeAgents.delete(agentId);
      this.saveActiveAgents();
    }
  }

  /**
   * Add a task to the queue
   */
  addTask(taskData) {
    const task = new Task(taskData);
    this.taskQueue.enqueue(task);
    
    console.log(`[Orchestrator] Task added: ${task.title} (${task.id})`);
    this.logEvent('task_added', { taskId: task.id, type: task.type });
    
    return task;
  }

  /**
   * Get task by ID
   */
  getTask(taskId) {
    return this.taskQueue.get(taskId);
  }

  /**
   * Update task status
   */
  updateTask(taskId, updates) {
    const task = this.taskQueue.get(taskId);
    if (task) {
      Object.assign(task, updates);
      this.taskQueue.update(task);
    }
    return task;
  }

  /**
   * Get number of currently running agents
   */
  getRunningAgentCount() {
    return Array.from(this.activeAgents.values())
      .filter(a => a.status === 'running' || a.status === 'spawning')
      .length;
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks() {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform health check on all agents
   */
  performHealthCheck() {
    const now = new Date();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    
    for (const [agentId, agent] of this.activeAgents.entries()) {
      const lastHeartbeat = new Date(agent.lastHeartbeat).getTime();
      const stale = (now.getTime() - lastHeartbeat) > staleThreshold;
      
      if (stale) {
        console.log(`[Orchestrator] Agent ${agentId} appears stale`);
        
        // Check agent workspace for status
        const agentStatus = this.checkAgentStatus(agentId, agent.type);
        
        if (agentStatus === 'completed') {
          this.unregisterAgent(agentId);
        } else if (agentStatus === 'failed') {
          // Retry the task
          this.retryTask(agent.taskId);
          this.unregisterAgent(agentId);
        } else {
          // Update last heartbeat
          agent.lastHeartbeat = now.toISOString();
        }
      }
    }
    
    this.saveActiveAgents();
  }

  /**
   * Check agent status by reading its state file
   */
  checkAgentStatus(agentId, type) {
    try {
      const statePath = path.join(this.basePath, 'agents', type, agentId, 'state', 'agent-state.json');
      if (fs.existsSync(statePath)) {
        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        return state.status;
      }
    } catch (error) {
      // State file may not exist yet
    }
    return 'unknown';
  }

  /**
   * Retry a failed task
   */
  retryTask(taskId) {
    const task = this.taskQueue.get(taskId);
    if (task && task.retryCount < task.maxRetries) {
      task.retryCount++;
      task.status = TaskStatus.QUEUED;
      task.assignedTo = null;
      task.error = null;
      this.taskQueue.update(task);
      
      console.log(`[Orchestrator] Retrying task: ${task.title} (attempt ${task.retryCount})`);
      this.logEvent('task_retry', { taskId, attempt: task.retryCount });
    }
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      orchestrator: {
        id: this.id,
        status: this.status,
        running: this.running,
        started: this.started,
        uptime: this.getUptime()
      },
      queue: this.taskQueue.getStats(),
      agents: {
        active: this.activeAgents.size,
        running: this.getRunningAgentCount(),
        max: this.config.maxConcurrentAgents
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get detailed queue status
   */
  getQueueStatus() {
    return {
      stats: this.taskQueue.getStats(),
      ready: this.taskQueue.getReady().map(t => ({
        id: t.id,
        title: t.title,
        type: t.type,
        priority: t.priority,
        created: t.created
      })),
      overdue: this.taskQueue.getOverdue().map(t => ({
        id: t.id,
        title: t.title,
        deadline: t.deadline
      }))
    };
  }

  /**
   * Get active agents list
   */
  getActiveAgents() {
    return Array.from(this.activeAgents.values());
  }
}

module.exports = {
  Orchestrator
};
