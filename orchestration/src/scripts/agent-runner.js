/**
 * agent-runner.js - Executes agent logic for spawned agents
 * Phase 1: Foundation
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

/**
 * Run an agent with the given configuration
 */
async function runAgent(config) {
  const { type, task, agentId, orchestratorId, workspace } = config;
  
  // Generate or use provided agent ID
  const id = agentId || `${type}-${Date.now().toString(36)}`;
  
  // Determine workspace path
  const basePath = process.env.ORCHESTRATION_PATH || '/Users/clawdbot/clawd/orchestration';
  const agentWorkspace = workspace || path.join(basePath, 'agents', type, id);
  
  // Ensure workspace exists
  fs.mkdirSync(agentWorkspace, { recursive: true });
  fs.mkdirSync(path.join(agentWorkspace, 'logs'), { recursive: true });
  fs.mkdirSync(path.join(agentWorkspace, 'state'), { recursive: true });
  
  // Write agent state
  const state = {
    id,
    type,
    status: 'running',
    taskId: task?.id || null,
    orchestratorId,
    started: new Date().toISOString(),
    workspace: agentWorkspace
  };
  
  fs.writeFileSync(
    path.join(agentWorkspace, 'state', 'agent-state.json'),
    JSON.stringify(state, null, 2)
  );
  
  // Log start
  logEvent(agentWorkspace, 'agent_started', { task: task?.title || 'No task' });
  
  try {
    // Execute agent logic based on type
    const result = await executeAgentLogic(type, task, agentWorkspace);
    
    // Update state to completed
    state.status = 'completed';
    state.completed = new Date().toISOString();
    state.result = result;
    
    fs.writeFileSync(
      path.join(agentWorkspace, 'state', 'agent-state.json'),
      JSON.stringify(state, null, 2)
    );
    
    logEvent(agentWorkspace, 'agent_completed', { result });
    
    return result;
  } catch (error) {
    // Update state to failed
    state.status = 'failed';
    state.failed = new Date().toISOString();
    state.error = error.message;
    
    fs.writeFileSync(
      path.join(agentWorkspace, 'state', 'agent-state.json'),
      JSON.stringify(state, null, 2)
    );
    
    logEvent(agentWorkspace, 'agent_failed', { error: error.message });
    
    throw error;
  }
}

/**
 * Execute agent logic based on type
 */
async function executeAgentLogic(type, task, workspace) {
  console.log(`[Agent:${type}] Executing: ${task?.title || 'No task'}`);
  
  switch (type) {
    case 'researcher':
      return await executeResearcher(task, workspace);
    case 'coder':
      return await executeCoder(task, workspace);
    case 'social':
      return await executeSocial(task, workspace);
    case 'memorist':
      return await executeMemorist(task, workspace);
    case 'learner':
      return await executeLearner(task, workspace);
    default:
      return await executeGeneric(task, workspace);
  }
}

/**
 * Researcher agent logic
 */
async function executeResearcher(task, workspace) {
  console.log(`[Researcher] Researching: ${task?.description || 'No description'}`);
  
  // Phase 1: Simple implementation - just log and return
  const result = {
    agent: 'researcher',
    task: task?.title,
    findings: 'Research completed (Phase 1 placeholder)',
    timestamp: new Date().toISOString()
  };
  
  // Write findings to file
  const findingsPath = path.join(workspace, 'findings.json');
  fs.writeFileSync(findingsPath, JSON.stringify(result, null, 2));
  
  return result;
}

/**
 * Coder agent logic
 */
async function executeCoder(task, workspace) {
  console.log(`[Coder] Coding: ${task?.title || 'No title'}`);
  
  // Phase 1: Simple implementation
  const result = {
    agent: 'coder',
    task: task?.title,
    output: 'Code execution completed (Phase 1 placeholder)',
    files: [],
    timestamp: new Date().toISOString()
  };
  
  // Write output to file
  const outputPath = path.join(workspace, 'output.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  
  return result;
}

/**
 * Social agent logic
 */
async function executeSocial(task, workspace) {
  console.log(`[Social] Executing social task: ${task?.title || 'No title'}`);
  
  const result = {
    agent: 'social',
    task: task?.title,
    actions: [],
    timestamp: new Date().toISOString()
  };
  
  const outputPath = path.join(workspace, 'actions.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  
  return result;
}

/**
 * Memorist agent logic
 */
async function executeMemorist(task, workspace) {
  console.log(`[Memorist] Processing memory: ${task?.title || 'No title'}`);
  
  const result = {
    agent: 'memorist',
    task: task?.title,
    memories: [],
    timestamp: new Date().toISOString()
  };
  
  const outputPath = path.join(workspace, 'memory.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  
  return result;
}

/**
 * Learner agent logic
 */
async function executeLearner(task, workspace) {
  console.log(`[Learner] Learning: ${task?.title || 'No title'}`);
  
  const result = {
    agent: 'learner',
    task: task?.title,
    skills: [],
    timestamp: new Date().toISOString()
  };
  
  const outputPath = path.join(workspace, 'learning.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  
  return result;
}

/**
 * Generic agent logic (fallback)
 */
async function executeGeneric(task, workspace) {
  console.log(`[Generic] Executing: ${task?.title || 'No title'}`);
  
  return {
    agent: 'generic',
    task: task?.title,
    completed: true,
    timestamp: new Date().toISOString()
  };
}

/**
 * Log event to agent log
 */
function logEvent(workspace, event, data) {
  try {
    const logPath = path.join(workspace, 'logs', 'events.log');
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      data
    };
    fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
  } catch (error) {
    console.error('Failed to log event:', error.message);
  }
}

module.exports = {
  runAgent,
  executeAgentLogic
};
