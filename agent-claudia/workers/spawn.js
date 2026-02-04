#!/usr/bin/env node
/**
 * CLAUDIA Worker Spawn System
 * Spawn coding agents with proper context and monitoring
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const MEMORY_DIR = '/Users/clawdbot/clawd/memory';
const QUEUE_FILE = path.join(__dirname, 'queue.json');
const LOGS_DIR = path.join(__dirname, 'logs');

// Ensure dirs exist
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

/**
 * Spawn a coding agent with proper context
 */
function spawnWorker(task) {
  const { id, project, prompt, agent = 'codex', mode = 'full-auto' } = task;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(LOGS_DIR, `${id}-${timestamp}.log`);

  // Build context injection
  const context = buildContext(task);
  const fullPrompt = `${context}\n\n${prompt}\n\n${getCompletionHook(task)}`;

  // Determine agent command
  const agentCmd = getAgentCommand(agent, mode, fullPrompt);

  console.log(`🌀 Spawning ${agent} worker: ${id}`);
  console.log(`   Project: ${project}`);
  console.log(`   Log: ${logFile}`);

  // Spawn with pty for interactive agents
  const proc = exec(agentCmd, {
    cwd: project,
    maxBuffer: 10 * 1024 * 1024, // 10MB
  });

  let output = '';

  proc.stdout?.on('data', (data) => {
    output += data;
    fs.appendFileSync(logFile, data);
  });

  proc.stderr?.on('data', (data) => {
    output += data;
    fs.appendFileSync(logFile, data);
  });

  proc.on('close', (code) => {
    const status = code === 0 ? 'completed' : 'failed';
    console.log(`   ${status.toUpperCase()}: ${id} (exit ${code})`);

    // Update task status
    updateTaskStatus(id, status, logFile, output);

    // Trigger coach review if completed
    if (status === 'completed' && task.needsReview !== false) {
      setTimeout(() => spawnCoachReview(task), 5000);
    }
  });

  return { id, pid: proc.pid, logFile };
}

function getAgentCommand(agent, mode, prompt) {
  // Use Claude Code for everything (Codex not installed)
  const escaped = prompt.replace(/'/g, "'\\''");
  return `claude -p '${escaped}'`;
}

function buildContext(task) {
  const date = new Date().toISOString().split('T')[0];
  const recentMemory = getRecentMemory(3);

  return `You are a coding worker agent for CLAUDIA, an autonomous AI.
DATE: ${date}
TASK ID: ${task.id}
PROJECT: ${task.project}

RECENT CONTEXT:
${recentMemory}

${task.context || ''}`;
}

function getRecentMemory(days = 3) {
  const memories = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const file = path.join(MEMORY_DIR, `${dateStr}.md`);

    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8').slice(0, 2000);
      memories.push(`## ${dateStr}\n${content}\n`);
    }
  }

  return memories.join('\n') || '(No recent memory)';
}

function getCompletionHook(task) {
  return `

When you COMPLETELY finish this task:
1. Commit all changes with descriptive message
2. Write a summary to ${MEMORY_DIR}/${new Date().toISOString().split('T')[0]}.md
3. Run: openclaw gateway wake --text "Worker ${task.id} finished: [brief summary]" --mode now`;
}

function updateTaskStatus(id, status, logFile, output) {
  const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  const task = queue.tasks.find(t => t.id === id);
  if (task) {
    task.status = status;
    task.completedAt = new Date().toISOString();
    task.logFile = logFile;
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  }
}

function spawnCoachReview(task) {
  console.log(`👨‍🏫 Queueing coach review for ${task.id}`);

  const reviewTask = {
    id: `review-${task.id}`,
    project: task.project,
    agent: 'claude',
    mode: 'vanilla',
    prompt: `Review the work from task ${task.id} in ${task.project}.
Check for:
1. Code quality and bugs
2. Architecture consistency
3. Documentation completeness
4. Tests (if applicable)
5. Security issues

Provide a brief verdict: APPROVE / NEEDS_WORK / CRITICAL
Explain your reasoning in 2-3 sentences.

If APPROVE, suggest the next task to work on.
If NEEDS_WORK, explain what to fix.`
  };

  // Add to queue
  const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  queue.tasks.push(reviewTask);
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));

  // Spawn immediately
  spawnWorker(reviewTask);
}

// CLI interface
const command = process.argv[2];

if (command === 'spawn') {
  const taskId = process.argv[3];
  const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  const task = queue.tasks.find(t => t.id === taskId);

  if (task) {
    spawnWorker(task);
  } else {
    console.error(`Task not found: ${taskId}`);
    process.exit(1);
  }
} else if (command === 'add') {
  const task = {
    id: process.argv[3] || `task-${Date.now()}`,
    project: process.argv[4] || '/Users/clawdbot/clawd',
    agent: process.argv[5] || 'codex',
    mode: process.argv[6] || 'full-auto',
    prompt: process.argv[7] || 'Build something useful',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  queue.tasks.push(task);
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  console.log(`Added task: ${task.id}`);
} else if (command === 'list') {
  const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  console.table(queue.tasks.map(t => ({
    id: t.id,
    status: t.status,
    agent: t.agent,
    project: path.basename(t.project)
  })));
} else if (command === 'init') {
  const defaultQueue = {
    tasks: [],
    lastUpdated: new Date().toISOString()
  };
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(defaultQueue, null, 2));
  console.log('Initialized worker queue');
} else {
  console.log(`
Usage:
  node spawn.js init              - Initialize queue
  node spawn.js add <id> <project> <agent> <mode> <prompt>
  node spawn.js list              - Show all tasks
  node spawn.js spawn <id>        - Execute a task
  `);
}

module.exports = { spawnWorker };
