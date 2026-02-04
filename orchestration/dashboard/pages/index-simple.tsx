import { useState, useEffect } from 'react';
import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import { 
  Activity, 
  Plus, 
  RefreshCw, 
  Server, 
  CheckCircle2, 
  Clock, 
  Cpu,
  Zap,
  Terminal,
  LayoutDashboard,
  Play,
  AlertCircle
} from 'lucide-react';
import { getAllAgentData, Agent, SystemStats as Stats, CompletedTask, PendingTask } from '../lib/data';

interface DashboardProps {
  initialData: {
    agents: Agent[];
    completed: CompletedTask[];
    pending: PendingTask[];
    stats: Stats;
    lastUpdated: string;
  };
}

export default function Dashboard({ initialData }: DashboardProps) {
  const [agents, setAgents] = useState<Agent[]>(initialData.agents || []);
  const [stats, setStats] = useState<Stats | null>(initialData.stats || null);
  const [lastUpdated, setLastUpdated] = useState<string>(initialData.lastUpdated || '');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data.agents || []);
      setStats(data.stats || null);
      setLastUpdated(data.lastUpdated || '');
    } catch (e) {
      console.error('Failed to fetch data:', e);
    }
  };

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const activeAgents = agents.filter(a => a.status === 'active');
  const completedAgents = agents.filter(a => a.status === 'completed');

  const formatTokens = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
    return num.toString();
  };

  return (
    <>
      <Head>
        <title>Claudia's Agent Dashboard</title>
        <link rel="stylesheet" href="/human-friendly.css" />
      </Head>

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div className="logo-text">
              <h1>Agent Dashboard</h1>
              <p>Claudia's AI Agent Control Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="btn btn-secondary"
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} style={{animationDuration: '3s'}} />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            <button className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Spawn Agent
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Currently Running</span>
              <div className="stat-icon success">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="stat-value">{stats?.activeCount || 0}</div>
            <p className="stat-subtext">
              {stats?.activeCount === 0 ? 'All agents idle' : 
               stats?.activeCount === stats?.maxParallel ? 'At full capacity' : 
               `${(stats?.maxParallel || 5) - (stats?.activeCount || 0)} slots free`}
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Completed Today</span>
              <div className="stat-icon primary">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="stat-value">{stats?.completedCount || 0}</div>
            <p className="stat-subtext">Tasks finished successfully</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Token Usage</span>
              <div className="stat-icon accent">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="stat-value">{formatTokens(stats?.totalTokens || 0)}</div>
            <p className="stat-subtext">Total tokens consumed</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">System Status</span>
              <div className="stat-icon warning">
                <Server className="w-5 h-5" />
              </div>
            </div>
            <div className="stat-value" style={{fontSize: '24px', color: 'var(--success)'}}>
              Online
            </div>
            <p className="stat-subtext">All services operational</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Agents */}
          <div className="lg:col-span-2">
            <div className="section-header">
              <h2 className="section-title">
                <Play className="w-5 h-5" />
                Active Agents
              </h2>
              <span className="text-sm text-slate-400">
                Last updated: {lastUpdated || 'Just now'}
              </span>
            </div>

            {activeAgents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Activity className="w-8 h-8 text-slate-400" />
                </div>
                <h3>No active agents</h3>
                <p>All agents are currently idle. Spawn a new agent to get started.</p>
                <button className="btn btn-primary">
                  <Plus className="w-4 h-4" />
                  Spawn Agent
                </button>
              </div>
            ) : (
              <div className="agent-list">
                {activeAgents.map((agent, i) => (
                  <div key={agent.id} className="agent-card">
                    <div className="agent-avatar">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="agent-info">
                      <div className="agent-name">{agent.name}</div>
                      <div className="agent-task">{agent.task}</div>
                    </div>
                    <span className="agent-status active">
                      <span className="status-dot active"></span>
                      Active
                    </span>
                    <div className="agent-meta">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {agent.started}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Agents */}
            {completedAgents.length > 0 && (
              <>
                <div className="section-header" style={{marginTop: '32px'}}>
                  <h2 className="section-title">
                    <CheckCircle2 className="w-5 h-5" />
                    Recently Completed
                  </h2>
                </div>
                <div className="agent-list">
                  {completedAgents.slice(0, 5).map((agent) => (
                    <div key={agent.id} className="agent-card" style={{opacity: 0.7}}>
                      <div className="agent-avatar" style={{background: '#64748b'}}>
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="agent-info">
                        <div className="agent-name">{agent.name}</div>
                        <div className="agent-task">{agent.task}</div>
                      </div>
                      <span className="agent-status completed">
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </span>
                      <div className="agent-meta">{agent.started}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-list">
                <button className="action-btn">
                  <Terminal className="w-4 h-4 text-blue-500" />
                  View System Logs
                </button>
                <button className="action-btn">
                  <LayoutDashboard className="w-4 h-4 text-purple-500" />
                  Architecture Diagram
                </button>
                <button className="action-btn">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Check Health Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const data = await getAllAgentData();
    return {
      props: {
        initialData: data,
      },
    };
  } catch (error) {
    return {
      props: {
        initialData: {
          agents: [],
          completed: [],
          pending: [],
          stats: {
            activeCount: 0,
            completedCount: 0,
            totalTokens: 0,
            maxParallel: 5,
            apiStatus: 'Error',
            cronStatus: 'Error',
            skillsAvailable: 0,
          },
          lastUpdated: new Date().toISOString(),
        },
      },
    };
  }
};
