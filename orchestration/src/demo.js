#!/usr/bin/env node
/**
 * demo.js - Demonstration of Phase 1 orchestration system
 * Phase 1: Foundation
 */

const path = require('path');
const { Orchestrator } = require('./orchestrator/orchestrator');
const { TaskPriority, TaskType } = require('./shared/lib/task');

const basePath = process.env.ORCHESTRATION_PATH || path.join(__dirname, '..');

async function runDemo() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     CLAUDIA Orchestration System - Phase 1 Demo           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // 1. Initialize orchestrator
  console.log('Step 1: Initializing Orchestrator...');
  const orchestrator = new Orchestrator({ basePath });
  await orchestrator.initialize();
  console.log('✓ Orchestrator initialized\n');
  
  // 2. Add some tasks
  console.log('Step 2: Adding tasks to queue...');
  
  const tasks = [
    {
      type: TaskType.RESEARCH,
      priority: TaskPriority.HIGH,
      title: 'Research AI agent frameworks',
      description: 'Find the latest AI agent frameworks released this week',
      deliverables: ['Summary report', 'Links to frameworks']
    },
    {
      type: TaskType.CODE,
      priority: TaskPriority.CRITICAL,
      title: 'Implement task queue persistence',
      description: 'Create JSON-based task queue with CRUD operations',
      deliverables: ['TaskQueue class', 'Unit tests']
    },
    {
      type: TaskType.MEMORY,
      priority: TaskPriority.NORMAL,
      title: 'Consolidate daily memories',
      description: 'Process memory files from yesterday',
      deliverables: ['Updated MEMORY.md']
    },
    {
      type: TaskType.LEARNING,
      priority: TaskPriority.LOW,
      title: 'Learn peekaboo automation',
      description: 'Explore peekaboo macOS UI automation capabilities',
      deliverables: ['Skill report', 'Example scripts']
    }
  ];
  
  for (const taskData of tasks) {
    const task = orchestrator.addTask(taskData);
    console.log(`  ✓ Added: [${task.type}] ${task.title}`);
  }
  console.log();
  
  // 3. Show queue status
  console.log('Step 3: Queue status...');
  const queueStatus = orchestrator.getQueueStatus();
  console.log(`  Total tasks: ${queueStatus.stats.total}`);
  console.log(`  Ready: ${queueStatus.ready.length}`);
  Object.entries(queueStatus.stats.byStatus || {}).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
  console.log();
  
  // 4. Show system status
  console.log('Step 4: System status...');
  const status = orchestrator.getStatus();
  console.log(`  Orchestrator: ${status.orchestrator.status}`);
  console.log(`  Active agents: ${status.agents.active}`);
  console.log(`  Capacity: ${status.agents.running}/${status.agents.max}`);
  console.log();
  
  // 5. Simulate processing (just show what would happen)
  console.log('Step 5: Task processing simulation...');
  console.log('  The orchestrator would now:');
  console.log('  1. Sort tasks by priority');
  console.log('  2. Spawn agents for ready tasks');
  console.log('  3. Monitor agent health');
  console.log('  4. Update task status as agents complete');
  console.log();
  
  // 6. Verify state persistence
  console.log('Step 6: Verifying state persistence...');
  const taskQueuePath = path.join(basePath, 'orchestrator', 'task-queue.json');
  const activeAgentsPath = path.join(basePath, 'orchestrator', 'active-agents.json');
  
  const fs = require('fs');
  if (fs.existsSync(taskQueuePath)) {
    console.log('  ✓ Task queue saved to disk');
  }
  if (fs.existsSync(activeAgentsPath)) {
    console.log('  ✓ Active agents saved to disk');
  }
  console.log();
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Phase 1 Implementation Complete!                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('Summary:');
  console.log('  ✓ Task queue system with priorities');
  console.log('  ✓ Agent base classes');
  console.log('  ✓ Agent spawning logic');
  console.log('  ✓ State persistence (JSON-based)');
  console.log('  ✓ Orchestrator coordination');
  console.log();
  
  console.log('Next steps:');
  console.log('  - Run: node src/orchestrator-cli.js init');
  console.log('  - Run: node src/orchestrator-cli.js start');
  console.log('  - Add tasks and watch the system work!');
}

runDemo().catch(error => {
  console.error('Demo failed:', error);
  process.exit(1);
});
