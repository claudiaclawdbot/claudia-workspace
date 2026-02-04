#!/usr/bin/env node
/**
 * orchestrator-cli.js - CLI for the orchestration system
 * Phase 1: Foundation
 */

const fs = require('fs');
const path = require('path');
const { Orchestrator } = require('./orchestrator/orchestrator');
const { Task, TaskPriority, TaskType } = require('./shared/lib/task');

const command = process.argv[2];
const args = process.argv.slice(3);

const basePath = process.env.ORCHESTRATION_PATH || '/Users/clawdbot/clawd/orchestration';

async function main() {
  switch (command) {
    case 'start':
      await startOrchestrator();
      break;
    case 'stop':
      await stopOrchestrator();
      break;
    case 'status':
      await showStatus();
      break;
    case 'queue':
      await showQueue();
      break;
    case 'add-task':
      await addTask(args);
      break;
    case 'agents':
      await showAgents();
      break;
    case 'init':
      await initializeSystem();
      break;
    case 'help':
    default:
      showHelp();
  }
}

async function startOrchestrator() {
  console.log('Starting orchestrator...');
  
  const orchestrator = new Orchestrator({ basePath });
  await orchestrator.initialize();
  
  // Save orchestrator state for later retrieval
  const statePath = path.join(basePath, '.orchestrator.state.json');
  fs.writeFileSync(statePath, JSON.stringify({
    id: orchestrator.id,
    pid: process.pid,
    started: new Date().toISOString(),
    status: 'running'
  }, null, 2));
  
  await orchestrator.start();
  
  // Keep process alive
  console.log('Orchestrator is running. Press Ctrl+C to stop.');
  
  // Handle shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await orchestrator.stop();
    process.exit(0);
  });
  
  // Keep running
  setInterval(() => {}, 1000);
}

async function stopOrchestrator() {
  const statePath = path.join(basePath, '.orchestrator.state.json');
  
  if (fs.existsSync(statePath)) {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    
    if (state.pid) {
      try {
        process.kill(state.pid, 'SIGINT');
        console.log('Sent stop signal to orchestrator');
      } catch (error) {
        console.log('Orchestrator not running');
      }
    }
    
    fs.unlinkSync(statePath);
  } else {
    console.log('Orchestrator is not running');
  }
}

async function showStatus() {
  const orchestrator = new Orchestrator({ basePath });
  await orchestrator.initialize();
  
  const status = orchestrator.getStatus();
  
  console.log('\n=== Orchestrator Status ===');
  console.log(`ID: ${status.orchestrator.id}`);
  console.log(`Status: ${status.orchestrator.status}`);
  console.log(`Running: ${status.orchestrator.running}`);
  console.log(`Uptime: ${status.orchestrator.uptime}ms`);
  
  console.log('\n=== Task Queue ===');
  console.log(`Total tasks: ${status.queue.total}`);
  Object.entries(status.queue.byStatus || {}).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
  
  console.log('\n=== Active Agents ===');
  console.log(`Active: ${status.agents.active}`);
  console.log(`Running: ${status.agents.running}/${status.agents.max}`);
}

async function showQueue() {
  const orchestrator = new Orchestrator({ basePath });
  await orchestrator.initialize();
  
  const status = orchestrator.getQueueStatus();
  
  console.log('\n=== Queue Statistics ===');
  console.log(`Total: ${status.stats.total}`);
  Object.entries(status.stats.byStatus || {}).forEach(([s, count]) => {
    console.log(`  ${s}: ${count}`);
  });
  
  console.log('\n=== Ready Tasks ===');
  status.ready.forEach(task => {
    console.log(`  [${task.priority}] ${task.title} (${task.id})`);
    console.log(`    Created: ${task.created}`);
  });
  
  if (status.overdue.length > 0) {
    console.log('\n=== Overdue Tasks ===');
    status.overdue.forEach(task => {
      console.log(`  [OVERDUE] ${task.title} (deadline: ${task.deadline})`);
    });
  }
}

async function addTask(args) {
  // Parse task from args
  // Format: add-task --type code --title "Task Title" --description "Description"
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    options[key] = value;
  }
  
  const orchestrator = new Orchestrator({ basePath });
  await orchestrator.initialize();
  
  const task = orchestrator.addTask({
    type: options.type || TaskType.CODE,
    priority: parseInt(options.priority) || TaskPriority.NORMAL,
    title: options.title || 'Untitled Task',
    description: options.description || '',
    deliverables: options.deliverables ? options.deliverables.split(',') : []
  });
  
  console.log(`Task added: ${task.id}`);
  console.log(`  Title: ${task.title}`);
  console.log(`  Type: ${task.type}`);
  console.log(`  Priority: ${task.priority}`);
}

async function showAgents() {
  const orchestrator = new Orchestrator({ basePath });
  await orchestrator.initialize();
  
  const agents = orchestrator.getActiveAgents();
  
  console.log('\n=== Active Agents ===');
  console.log(`Total: ${agents.length}`);
  
  agents.forEach(agent => {
    console.log(`  ${agent.id}`);
    console.log(`    Type: ${agent.type}`);
    console.log(`    Status: ${agent.status}`);
    console.log(`    Task: ${agent.taskId}`);
    console.log(`    Spawned: ${agent.spawned}`);
  });
}

async function initializeSystem() {
  console.log('Initializing orchestration system...');
  
  const orchestrator = new Orchestrator({ basePath });
  await orchestrator.initialize();
  
  console.log('System initialized successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Add tasks: node orchestrator-cli.js add-task --type code --title "My Task"');
  console.log('  2. Start orchestrator: node orchestrator-cli.js start');
  console.log('  3. Check status: node orchestrator-cli.js status');
}

function showHelp() {
  console.log(`
Orchestrator CLI - Multi-Agent Orchestration System

Commands:
  init                    Initialize the orchestration system
  start                   Start the orchestrator daemon
  stop                    Stop the orchestrator daemon
  status                  Show system status
  queue                   Show task queue status
  agents                  Show active agents
  add-task [options]      Add a new task to the queue

Add Task Options:
  --type <type>           Task type (research|code|social|memory|learning)
  --title <title>         Task title
  --description <desc>    Task description
  --priority <1-5>        Task priority (1=highest, 5=lowest)
  --deliverables <list>   Comma-separated list of deliverables

Examples:
  node orchestrator-cli.js init
  node orchestrator-cli.js start
  node orchestrator-cli.js add-task --type code --title "Fix bug" --priority 1
  node orchestrator-cli.js status
`);
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
