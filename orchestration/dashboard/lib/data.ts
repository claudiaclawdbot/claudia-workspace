import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface Agent {
  id: string;
  name: string;
  task: string;
  status: 'active' | 'pending' | 'completed' | 'error';
  started: string;
  sessionKey: string;
  model?: string | null;
  tokens?: string | null;
  age?: string | null;
  flags?: string;
}

export interface SystemStats {
  activeCount: number;
  completedCount: number;
  totalTokens: number;
  maxParallel: number;
  apiStatus: string;
  cronStatus: string;
  skillsAvailable: number;
}

export interface CompletedTask {
  name: string;
  description: string;
  timestamp?: string;
}

export interface PendingTask {
  name: string;
  description: string;
  waitingFor?: string;
}

// Parse ACTIVE_STATUS.md
export async function getActiveStatus(): Promise<{
  agents: Agent[];
  completed: CompletedTask[];
  pending: PendingTask[];
  stats: SystemStats;
  lastUpdated: string;
}> {
  const statusPath = path.join(process.cwd(), '..', 'state', 'ACTIVE_STATUS.md');
  
  let content = '';
  try {
    content = fs.readFileSync(statusPath, 'utf-8');
  } catch (e) {
    // Return default data if file doesn't exist
    return {
      agents: [],
      completed: [],
      pending: [],
      stats: getDefaultStats(),
      lastUpdated: new Date().toISOString(),
    };
  }

  const agents: Agent[] = [];
  const completed: CompletedTask[] = [];
  const pending: PendingTask[] = [];
  let lastUpdated = '';

  // Parse last updated
  const lastUpdatedMatch = content.match(/\*\*Last Updated:\*\* (.+)/);
  if (lastUpdatedMatch) {
    lastUpdated = lastUpdatedMatch[1];
  }

  // Parse currently running agents
  const runningSection = content.match(/## Currently Running\s*\n\n([\s\S]*?)(?=\n## |\n$)/);
  if (runningSection) {
    const lines = runningSection[1].trim().split('\n');
    // Skip header row and separator
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|')) {
        const parts = line.split('|').map(p => p.trim()).filter(Boolean);
        if (parts.length >= 5) {
          // Clean markdown formatting from status (e.g., "**running**" -> "running")
          const rawStatus = parts[2].toLowerCase().replace(/\*\*/g, '').trim();
          // Map various status strings to valid enum values
          const statusMap: Record<string, Agent['status']> = {
            'running': 'active',
            'active': 'active',
            'complete': 'completed',
            'completed': 'completed',
            'done': 'completed',
            'pending': 'pending',
            'error': 'error',
          };
          
          agents.push({
            id: parts[4].split(':').pop() || parts[0].toLowerCase().replace(/\s+/g, '-'),
            name: parts[0],
            task: parts[1],
            status: statusMap[rawStatus] || 'active',
            started: parts[3],
            sessionKey: parts[4],
          });
        }
      }
    }
  }

  // Parse completed tasks
  const completedSection = content.match(/## Completed Today\s*\n\n([\s\S]*?)(?=\n## |\n$)/);
  if (completedSection) {
    const lines = completedSection[1].trim().split('\n');
    for (const line of lines) {
      const match = line.match(/- ✅? \*\*(.+?)\*\* — (.+)/);
      if (match) {
        completed.push({
          name: match[1],
          description: match[2],
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  // Parse pending tasks
  const pendingSection = content.match(/## Task Queue \(Pending\)\s*\n\n([\s\S]*?)(?=\n## |\n$)/);
  if (pendingSection) {
    const lines = pendingSection[1].trim().split('\n');
    for (const line of lines) {
      const match = line.match(/- \[ \] \*\*(.+?)\*\* — (.+)/);
      if (match) {
        const waitingMatch = match[2].match(/(.+?) \(waiting for (.+)\)/);
        pending.push({
          name: match[1],
          description: waitingMatch ? waitingMatch[1] : match[2],
          waitingFor: waitingMatch ? waitingMatch[2] : undefined,
        });
      }
    }
  }

  // Parse system health
  const stats = parseSystemStats(content, agents.length, completed.length);

  return { agents, completed, pending, stats, lastUpdated };
}

function parseSystemStats(content: string, activeCount: number, completedCount: number): SystemStats {
  const apiMatch = content.match(/API Status: (\w+)/);
  const cronMatch = content.match(/Cron Job: (.+)/);
  const skillsMatch = content.match(/Skills Available: (\d+)/);
  const maxParallelMatch = content.match(/Max Parallel: (\d+)/);

  return {
    activeCount,
    completedCount,
    totalTokens: 0, // Will be filled from sessions list
    maxParallel: parseInt(maxParallelMatch?.[1] || '5'),
    apiStatus: apiMatch?.[1] || 'Unknown',
    cronStatus: cronMatch?.[1] || 'Unknown',
    skillsAvailable: parseInt(skillsMatch?.[1] || '0'),
  };
}

function getDefaultStats(): SystemStats {
  return {
    activeCount: 0,
    completedCount: 0,
    totalTokens: 0,
    maxParallel: 5,
    apiStatus: 'Online',
    cronStatus: 'Every 30 minutes',
    skillsAvailable: 60,
  };
}

// Get sessions from openclaw CLI
export async function getSessions(): Promise<Agent[]> {
  try {
    const { stdout } = await execAsync('openclaw sessions list', {
      cwd: path.join(process.cwd(), '..', '..'),
      timeout: 10000,
    });
    
    return parseSessionsOutput(stdout);
  } catch (e) {
    console.error('Failed to get sessions:', e);
    return [];
  }
}

function parseSessionsOutput(output: string): Agent[] {
  const agents: Agent[] = [];
  const lines = output.split('\n');
  
  // Skip header lines (first 3 lines: store path, header, separator)
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('Kind')) continue;
    
    // Parse columns: Kind, Key, Age, Model, Tokens, Flags
    // Using regex to handle variable spacing
    const match = line.match(/(\w+)\s+(\S+)\s+(\S+(?:\s+ago)?)\s+(\S+)\s+(.+?)(?:\s+(id:\S+))?$/);
    if (match) {
      const [, kind, key, age, model, tokens, flags] = match;
      const id = key.includes(':') ? key.split(':').pop() || key : key;
      
      agents.push({
        id,
        name: id.slice(0, 8),
        task: 'Unknown task',
        status: 'active',
        started: age,
        sessionKey: key,
        model,
        tokens,
        age,
        flags: flags || '',
      });
    }
  }
  
  return agents;
}

// Merge active status data with session data
export async function getAllAgentData(): Promise<{
  agents: Agent[];
  completed: CompletedTask[];
  pending: PendingTask[];
  stats: SystemStats;
  lastUpdated: string;
}> {
  const [statusData, sessionsData] = await Promise.all([
    getActiveStatus(),
    getSessions().catch(() => [] as Agent[]),
  ]);

  // Merge session data with status data
  const mergedAgents = statusData.agents.map(agent => {
    const sessionMatch = sessionsData.find(s => 
      s.sessionKey.includes(agent.sessionKey) || 
      agent.sessionKey.includes(s.sessionKey)
    );
    
    return {
      ...agent,
      model: sessionMatch?.model || agent.model || null,
      tokens: sessionMatch?.tokens || agent.tokens || null,
      age: sessionMatch?.age || agent.age || null,
    };
  });

  // Add any sessions not in the status file
  sessionsData.forEach(session => {
    const exists = mergedAgents.some(a => 
      a.sessionKey.includes(session.sessionKey) || 
      session.sessionKey.includes(a.sessionKey)
    );
    if (!exists) {
      mergedAgents.push({
        ...session,
        task: 'Background task',
        model: session.model || null,
        tokens: session.tokens || null,
        age: session.age || null,
      });
    }
  });

  // Calculate total tokens
  const totalTokens = sessionsData.reduce((sum, s) => {
    const match = s.tokens?.match(/(\d+)k/);
    return sum + (match ? parseInt(match[1]) * 1000 : 0);
  }, 0);

  return {
    agents: mergedAgents,
    completed: statusData.completed,
    pending: statusData.pending,
    stats: {
      ...statusData.stats,
      totalTokens,
    },
    lastUpdated: statusData.lastUpdated,
  };
}

// Get agent logs (placeholder - would read from log files)
export async function getAgentLogs(agentId: string): Promise<string[]> {
  const logPath = path.join(process.cwd(), '..', 'logs', `${agentId}.log`);
  
  try {
    const content = fs.readFileSync(logPath, 'utf-8');
    return content.split('\n').slice(-100); // Last 100 lines
  } catch (e) {
    return [
      `[${new Date().toISOString()}] Agent ${agentId} initialized`,
      `[${new Date().toISOString()}] Starting task execution...`,
      `[${new Date().toISOString()}] Connected to orchestrator`,
    ];
  }
}

// Spawn a new agent (placeholder - would integrate with spawn system)
export async function spawnAgent(name: string, task: string, priority: string): Promise<{ success: boolean; agentId?: string; error?: string }> {
  // This would integrate with the actual spawn system
  // For now, just update the spawn queue
  const queuePath = path.join(process.cwd(), '..', 'state', 'spawn-queue.json');
  
  try {
    let queue: any[] = [];
    try {
      const content = fs.readFileSync(queuePath, 'utf-8');
      queue = JSON.parse(content);
    } catch (e) {
      // File doesn't exist, start with empty queue
    }
    
    const newTask = {
      id: `task-${Date.now()}`,
      name,
      task,
      priority,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };
    
    queue.push(newTask);
    fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
    
    return { success: true, agentId: newTask.id };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}