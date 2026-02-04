import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  ArrowLeft,
  Cpu,
  Activity,
  Clock,
  MessageSquare,
  Terminal,
  Pause,
  Play,
  Square,
  Zap,
  RefreshCw,
  Send,
  Copy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  task: string;
  status: 'active' | 'pending' | 'completed' | 'error';
  started: string;
  sessionKey: string;
  model?: string;
  tokens?: string;
  age?: string;
  flags?: string;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export default function AgentDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [messages, setMessages] = useState<{text: string, sender: 'user' | 'agent', timestamp: string}[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'messages'>('overview');
  const [copied, setCopied] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchAgentData = async () => {
    if (!id) return;
    
    try {
      const [agentRes, logsRes] = await Promise.all([
        fetch(`/api/agents/${id}`),
        fetch(`/api/agents/${id}/logs`),
      ]);
      
      if (agentRes.ok) {
        const agentData = await agentRes.json();
        setAgent(agentData);
      }
      
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }
    } catch (e) {
      console.error('Failed to fetch agent data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
    const interval = setInterval(fetchAgentData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const message = {
      text: newMessage,
      sender: 'user' as const,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: `Agent ${agent?.name} received: "${message.text}"`,
        sender: 'agent',
        timestamp: new Date().toISOString(),
      }]);
    }, 1000);
  };

  const handleCopyId = () => {
    if (agent?.id) {
      navigator.clipboard.writeText(agent.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'pending': return 'text-warning';
      case 'completed': return 'text-primary';
      case 'error': return 'text-error';
      default: return 'text-textMuted';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'completed': return 'bg-primary';
      case 'error': return 'bg-error';
      default: return 'bg-textMuted';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-textMuted">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <h1 className="text-xl font-bold text-text mb-2">Agent Not Found</h1>
          <p className="text-textMuted mb-4">The agent you're looking for doesn't exist.</p>
          <Link href="/" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>{agent.name} | Agent Dashboard</title>
      </Head>

      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="p-2 rounded-lg bg-surfaceHover text-textMuted hover:text-text transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-surfaceHover flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-primary" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface ${getStatusBg(agent.status)} status-dot`} />
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-text">{agent.name}</h1>
                    <button
                      onClick={handleCopyId}
                      className="text-xs text-textMuted hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          {agent.id.slice(0, 8)}...
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-textMuted truncate max-w-md">{agent.task}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 text-sm ${getStatusColor(agent.status)}`}>
                <span className={`w-2 h-2 rounded-full ${getStatusBg(agent.status)}`} />
                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
              </span>
              
              {agent.status === 'active' && (
                <button className="btn btn-secondary px-3 py-1.5 text-sm">
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              )}
              
              <button className="btn btn-secondary px-3 py-1.5 text-sm hover:bg-error/20 hover:text-error hover:border-error/50">
                <Square className="w-4 h-4" />
                Stop
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {(['overview', 'logs', 'messages'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-textMuted hover:text-text'
                }`}
              >
                {tab === 'overview' && <Activity className="w-4 h-4" />}
                {tab === 'logs' && <Terminal className="w-4 h-4" />}
                {tab === 'messages' && <MessageSquare className="w-4 h-4" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agent Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-text mb-4">Task Details</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-textMuted leading-relaxed">{agent.task}</p>
                </div>
              </div>

              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-text mb-4">Session Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-surfaceHover/50">
                    <p className="text-xs text-textMuted mb-1">Session Key</p>
                    <p className="text-sm text-text font-mono truncate">{agent.sessionKey}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-surfaceHover/50">
                    <p className="text-xs text-textMuted mb-1">Started</p>
                    <p className="text-sm text-text">{agent.started || agent.age || 'Unknown'}</p>
                  </div>
                  {agent.model && (
                    <div className="p-3 rounded-lg bg-surfaceHover/50">
                      <p className="text-xs text-textMuted mb-1">Model</p>
                      <p className="text-sm text-text">{agent.model}</p>
                    </div>
                  )}
                  {agent.tokens && (
                    <div className="p-3 rounded-lg bg-surfaceHover/50">
                      <p className="text-xs text-textMuted mb-1">Token Usage</p>
                      <p className="text-sm text-text">{agent.tokens}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="glass-card p-5">
                <h3 className="font-semibold text-text mb-4">Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-textMuted">Progress</span>
                      <span className="text-text">65%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surfaceHover overflow-hidden">
                      <div className="h-full w-[65%] bg-gradient-to-r from-primary to-accent1 rounded-full" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surfaceHover/50">
                    <span className="text-sm text-textMuted">Runtime</span>
                    <span className="text-sm text-text flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {agent.age || agent.started || 'N/A'}
                    </span>
                  </div>
                  
                  {agent.tokens && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surfaceHover/50">
                      <span className="text-sm text-textMuted">Tokens</span>
                      <span className="text-sm text-text flex items-center gap-1">
                        <Zap className="w-4 h-4 text-accent2" />
                        {agent.tokens}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-semibold text-text mb-4">Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('logs')}
                    className="w-full p-3 rounded-lg bg-surfaceHover hover:bg-surfaceHover/80 transition-colors flex items-center gap-3 text-sm text-text text-left"
                  >
                    <Terminal className="w-4 h-4 text-primary" />
                    View Logs
                  </button>
                  <button 
                    onClick={() => setActiveTab('messages')}
                    className="w-full p-3 rounded-lg bg-surfaceHover hover:bg-surfaceHover/80 transition-colors flex items-center gap-3 text-sm text-text text-left"
                  >
                    <MessageSquare className="w-4 h-4 text-accent1" />
                    Send Message
                  </button>
                  <button className="w-full p-3 rounded-lg bg-surfaceHover hover:bg-surfaceHover/80 transition-colors flex items-center gap-3 text-sm text-text text-left">
                    <RefreshCw className="w-4 h-4 text-warning" />
                    Restart Agent
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="glass-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                Agent Logs
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => fetchAgentData()}
                  className="p-2 rounded-lg bg-surfaceHover text-textMuted hover:text-text transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="terminal max-h-[600px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-textMuted italic">No logs available...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="terminal-line text-sm">
                    {log.includes('[') ? (
                      <>
                        <span className="timestamp">{log.match(/\[([^\]]+)\]/)?.[1] || ''}</span>
                        {' '}
                        <span className={
                          log.includes('error') ? 'level-error' :
                          log.includes('warn') ? 'level-warn' :
                          'level-info'
                        }>
                          {log.replace(/\[[^\]]+\]\s*/, '')}
                        </span>
                      </>
                    ) : (
                      log
                    )}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="glass-card flex flex-col h-[600px]">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent1" />
                Agent Messages
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-textMuted">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Send a message to start communicating with this agent</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-surfaceHover text-text rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'user' ? 'text-white/70' : 'text-textMuted'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-border">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}