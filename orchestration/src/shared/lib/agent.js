/**
 * Agent.js - Base agent class for orchestration system
 * Phase 1: Foundation
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { Task, TaskStatus } = require('./task');

/**
 * Agent status enum
 */
const AgentStatus = {
  IDLE: 'idle',
  INITIALIZING: 'initializing',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
  TERMINATED: 'terminated'
};

/**
 * Agent types
 */
const AgentType = {
  ORCHESTRATOR: 'orchestrator',
  RESEARCHER: 'researcher',
  CODER: 'coder',
  SOCIAL: 'social',
  MEMORIST: 'memorist',
  LEARNER: 'learner'
};

/**
 * Base Agent class - all agents extend this
 */
class Agent {
  constructor(options = {}) {
    this.id = options.id || this.generateId();
    this.type = options.type || AgentType.ORCHESTRATOR;
    this.name = options.name || `${this.type}-${this.id}`;
    this.status = options.status || AgentStatus.IDLE;
    
    this.created = options.created || new Date().toISOString();
    this.started = options.started || null;
    this.ended = options.ended || null;
    
    this.currentTask = options.currentTask || null;
    this.taskHistory = options.taskHistory || [];
    this.subAgents = options.subAgents || [];
    
    this.workspacePath = options.workspacePath || this.getDefaultWorkspace();
    this.config = options.config || {};
    this.metadata = options.metadata || {};
    
    // Ensure workspace exists
    this.ensureWorkspace();
  }

  /**
   * Generate unique agent ID
   */
  generateId() {
    const prefix = this.type ? this.type.substring(0, 3) : 'agt';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Get default workspace path
   */
  getDefaultWorkspace() {
    const baseDir = process.env.ORCHESTRATION_PATH || '/Users/clawdbot/clawd/orchestration';
    if (this.type === AgentType.ORCHESTRATOR) {
      return path.join(baseDir, 'orchestrator');
    }
    return path.join(baseDir, 'agents', this.type, this.id);
  }

  /**
   * Ensure workspace directory exists
   */
  ensureWorkspace() {
    try {
      fs.mkdirSync(this.workspacePath, { recursive: true });
      
      // Create standard subdirectories
      const subdirs = ['logs', 'state', 'temp'];
      subdirs.forEach(dir => {
        fs.mkdirSync(path.join(this.workspacePath, dir), { recursive: true });
      });
    } catch (error) {
      console.error(`Failed to create workspace for ${this.id}:`, error.message);
    }
  }

  /**
   * Initialize the agent
   */
  async initialize() {
    this.status = AgentStatus.INITIALIZING;
    this.saveState();
    
    console.log(`[${this.name}] Initializing...`);
    
    // Override in subclasses
    return this.onInitialize();
  }

  /**
   * Hook for subclass initialization
   */
  async onInitialize() {
    // Override in subclasses
    return true;
  }

  /**
   * Start executing a task
   */
  async executeTask(task) {
    this.status = AgentStatus.RUNNING;
    this.currentTask = task.id;
    this.started = new Date().toISOString();
    task.start();
    
    this.saveState();
    console.log(`[${this.name}] Executing task: ${task.title}`);
    
    try {
      const result = await this.onExecuteTask(task);
      
      // Mark task complete
      task.complete(result);
      this.taskHistory.push({
        taskId: task.id,
        completed: new Date().toISOString(),
        result: result
      });
      
      this.currentTask = null;
      this.status = AgentStatus.COMPLETED;
      this.ended = new Date().toISOString();
      
      this.saveState();
      this.logEvent('task_completed', { taskId: task.id, result });
      
      return result;
    } catch (error) {
      task.fail(error.message);
      this.status = AgentStatus.FAILED;
      
      this.saveState();
      this.logEvent('task_failed', { taskId: task.id, error: error.message });
      
      throw error;
    }
  }

  /**
   * Hook for task execution - must be overridden
   */
  async onExecuteTask(task) {
    throw new Error('onExecuteTask must be implemented by subclass');
  }

  /**
   * Spawn a sub-agent for a sub-task
   */
  async spawnSubAgent(options) {
    const { type, task, context = {} } = options;
    
    console.log(`[${this.name}] Spawning ${type} agent for sub-task: ${task.title}`);
    
    // Generate spawn command
    const spawnCmd = this.buildSpawnCommand(type, task, context);
    
    return new Promise((resolve, reject) => {
      const child = spawn(spawnCmd.command, spawnCmd.args, {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      const subAgentId = `${type}-${Date.now()}`;
      this.subAgents.push({
        id: subAgentId,
        type,
        taskId: task.id,
        pid: child.pid,
        spawned: new Date().toISOString()
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        this.logEvent('subagent_complete', {
          subAgentId,
          exitCode: code,
          taskId: task.id
        });
        
        resolve({
          subAgentId,
          exitCode: code,
          stdout,
          stderr
        });
      });
      
      child.on('error', (error) => {
        reject(error);
      });
      
      // Don't wait for child - let it run in background
      child.unref();
    });
  }

  /**
   * Build spawn command for sub-agent
   * This uses OpenClaw's sub-agent spawning capability
   */
  buildSpawnCommand(type, task, context) {
    // Build the task description for the sub-agent
    const taskDescription = {
      id: task.id,
      type,
      title: task.title,
      description: task.description,
      deliverables: task.deliverables,
      context: { ...task.context, ...context },
      parentAgent: this.id
    };
    
    // Create a temporary file with task context
    const tempPath = path.join(this.workspacePath, 'temp', `spawn-${task.id}.json`);
    fs.writeFileSync(tempPath, JSON.stringify(taskDescription, null, 2));
    
    return {
      command: 'node',
      args: [
        path.join(__dirname, 'spawn-agent.js'),
        '--type', type,
        '--task-file', tempPath
      ]
    };
  }

  /**
   * Save agent state to disk
   */
  saveState() {
    try {
      const state = this.toJSON();
      const statePath = path.join(this.workspacePath, 'state', 'agent-state.json');
      fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
      return true;
    } catch (error) {
      console.error(`[${this.name}] Failed to save state:`, error.message);
      return false;
    }
  }

  /**
   * Load agent state from disk
   */
  loadState() {
    try {
      const statePath = path.join(this.workspacePath, 'state', 'agent-state.json');
      if (fs.existsSync(statePath)) {
        const data = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        Object.assign(this, data);
        return true;
      }
    } catch (error) {
      console.error(`[${this.name}] Failed to load state:`, error.message);
    }
    return false;
  }

  /**
   * Log event to agent log
   */
  logEvent(event, data) {
    try {
      const logPath = path.join(this.workspacePath, 'logs', 'events.log');
      const entry = {
        timestamp: new Date().toISOString(),
        agent: this.id,
        event,
        data
      };
      fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
    } catch (error) {
      console.error(`[${this.name}] Failed to log event:`, error.message);
    }
  }

  /**
   * Get agent health/status
   */
  getHealth() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      status: this.status,
      currentTask: this.currentTask,
      uptime: this.getUptime(),
      taskCount: this.taskHistory.length,
      subAgentCount: this.subAgents.length,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get uptime in milliseconds
   */
  getUptime() {
    if (!this.started) return 0;
    const end = this.ended ? new Date(this.ended) : new Date();
    return end.getTime() - new Date(this.started).getTime();
  }

  /**
   * Pause agent execution
   */
  pause() {
    if (this.status === AgentStatus.RUNNING) {
      this.status = AgentStatus.PAUSED;
      this.saveState();
      this.logEvent('paused', {});
    }
  }

  /**
   * Resume agent execution
   */
  resume() {
    if (this.status === AgentStatus.PAUSED) {
      this.status = AgentStatus.RUNNING;
      this.saveState();
      this.logEvent('resumed', {});
    }
  }

  /**
   * Terminate agent
   */
  terminate(reason = '') {
    this.status = AgentStatus.TERMINATED;
    this.ended = new Date().toISOString();
    this.saveState();
    this.logEvent('terminated', { reason });
    console.log(`[${this.name}] Terminated: ${reason}`);
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      status: this.status,
      created: this.created,
      started: this.started,
      ended: this.ended,
      currentTask: this.currentTask,
      taskHistory: this.taskHistory,
      subAgents: this.subAgents,
      workspacePath: this.workspacePath,
      config: this.config,
      metadata: this.metadata
    };
  }

  /**
   * Create Agent from plain object
   */
  static fromJSON(data) {
    return new Agent(data);
  }
}

module.exports = {
  Agent,
  AgentStatus,
  AgentType
};
