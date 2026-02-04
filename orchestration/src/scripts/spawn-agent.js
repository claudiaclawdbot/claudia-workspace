#!/usr/bin/env node
/**
 * spawn-agent.js - Agent spawner for orchestration system
 * Phase 1: Foundation
 * 
 * This script spawns a new agent instance for a given task.
 * It can be called by the orchestrator or run manually.
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace(/^--/, '');
  const value = args[i + 1];
  options[key] = value;
}

// Load task from file if specified
let taskData = null;
if (options['task-file']) {
  try {
    taskData = JSON.parse(fs.readFileSync(options['task-file'], 'utf8'));
  } catch (error) {
    console.error('Failed to load task file:', error.message);
    process.exit(1);
  }
}

// Merge task data with options
const config = {
  type: options.type || taskData?.type || 'coder',
  task: taskData,
  agentId: options.agentId || null,
  orchestratorId: options.orchestrator || taskData?.orchestrator || null,
  workspace: options.workspace || null
};

console.log(`[SpawnAgent] Starting ${config.type} agent`);
console.log(`[SpawnAgent] Task: ${config.task?.title || 'No task'}`);

// Import agent runner
const { runAgent } = require('./agent-runner');

// Run the agent
runAgent(config)
  .then(result => {
    console.log('[SpawnAgent] Agent completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('[SpawnAgent] Agent failed:', error.message);
    process.exit(1);
  });
