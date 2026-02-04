#!/usr/bin/env node
/**
 * CLAUDIA Orchestrator Controller
 * Run this to spawn new tasks and maintain continuous operation
 */

const fs = require('fs');
const path = require('path');

const STATUS_FILE = '/Users/clawdbot/clawd/orchestration/state/ACTIVE_STATUS.md';
const LOG_FILE = '/Users/clawdbot/clawd/orchestration/logs/controller.log';

// Simple logger
function log(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logLine);
  console.log(logLine.trim());
}

// Read current status
function readStatus() {
  try {
    return fs.readFileSync(STATUS_FILE, 'utf8');
  } catch (e) {
    return '';
  }
}

// Determine what to do next
function decideNextAction() {
  const hour = new Date().getHours();
  const status = readStatus();
  
  // Parse active agent count from "Currently Running" section only
  let activeCount = 0;
  const runningSection = status.match(/## Currently Running[\s\S]*?(?=## Completed Today|$)/);
  if (runningSection) {
    const rows = runningSection[0].match(/\|.*\|.*\|.*\|.*\|.*\|/g);
    if (rows) {
      activeCount = rows.filter(row => 
        !row.includes('------') && 
        !row.includes('Agent | Task') &&
        !row.includes('*None*')
      ).length;
    }
  }
  
  // Max 5 parallel agents
  if (activeCount >= 5) {
    return { action: 'wait', reason: 'Max agents running' };
  }
  
  // Time-based priorities
  if (hour >= 6 && hour < 10) {
    return {
      action: 'spawn',
      category: 'learning',
      task: 'Explore next skill in queue',
      priority: 'high'
    };
  }
  
  if (hour >= 10 && hour < 16) {
    return {
      action: 'spawn',
      category: 'code',
      task: 'Ship something - code or automation',
      priority: 'high'
    };
  }
  
  if (hour >= 16 && hour < 22) {
    // SOCIAL POSTING DISABLED - Per user directive
    // No autonomous posting from @funger account
    return {
      action: 'spawn',
      category: 'code',
      task: 'Build features - no social posting',
      priority: 'medium'
    };
  }
  
  return {
    action: 'spawn',
    category: 'memory',
    task: 'Consolidate and organize',
    priority: 'low'
  };
}

// Main control loop
async function main() {
  log('Controller starting...');
  
  const decision = decideNextAction();
  log(`Decision: ${decision.action} - ${decision.reason || decision.task}`);
  
  if (decision.action === 'spawn') {
    // In actual implementation, this would spawn via OpenClaw sessions_spawn
    log(`Would spawn ${decision.category} agent for: ${decision.task}`);
    
    // Log the intended spawn
    const spawnLog = {
      timestamp: new Date().toISOString(),
      category: decision.category,
      task: decision.task,
      priority: decision.priority,
      status: 'queued'
    };
    
    const queueFile = '/Users/clawdbot/clawd/orchestration/state/spawn-queue.json';
    let queue = [];
    try {
      queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
    } catch (e) {
      queue = [];
    }
    queue.push(spawnLog);
    fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2));
  }
  
  log('Controller cycle complete');
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    log(`Error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { decideNextAction, log };