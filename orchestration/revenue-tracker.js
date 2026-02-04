#!/usr/bin/env node

/**
 * Revenue Tracker - $1M Goal Accountability System
 * Tracks all revenue streams and progress toward the million dollar goal
 * 
 * Usage:
 *   node revenue-tracker.js              # Show current report
 *   node revenue-tracker.js --add        # Add new transaction
 *   node revenue-tracker.js --json       # Output JSON only
 *   node revenue-tracker.js --daily      # Show daily breakdown
 * 
 * Run via cron: 0 9 * * * node /Users/clawdbot/clawd/orchestration/revenue-tracker.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const GOAL_AMOUNT = 1000000;
const STATE_FILE = path.join(__dirname, 'revenue-state.json');
const LOG_FILE = path.join(__dirname, 'revenue-log.ndjson');

// Revenue stream categories
const REVENUE_STREAMS = {
  AGENT_SERVICES: 'agent_services',      // x402 payments, AI agent work
  TOKEN_TRADING: 'token_trading',        // MOLT, crypto trading profits
  COURSE_SALES: 'course_sales',          // FidgetPlay courses
  CONSULTING: 'consulting',              // 1:1 consulting calls
  DIGITAL_PRODUCTS: 'digital_products',  // Templates, tools, etc.
  AFFILIATE: 'affiliate',                // Affiliate commissions
  OTHER: 'other'                         // Misc income
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Helper to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

// Helper to format date
function formatDate(date = new Date()) {
  return date.toISOString().split('T')[0];
}

// Initialize state if doesn't exist
function initializeState() {
  const now = new Date();
  return {
    version: '1.0.0',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    goalAmount: GOAL_AMOUNT,
    currentTotal: 0,
    streams: {
      [REVENUE_STREAMS.AGENT_SERVICES]: { total: 0, transactions: [], lastTransaction: null },
      [REVENUE_STREAMS.TOKEN_TRADING]: { total: 0, transactions: [], lastTransaction: null },
      [REVENUE_STREAMS.COURSE_SALES]: { total: 0, transactions: [], lastTransaction: null },
      [REVENUE_STREAMS.CONSULTING]: { total: 0, transactions: [], lastTransaction: null },
      [REVENUE_STREAMS.DIGITAL_PRODUCTS]: { total: 0, transactions: [], lastTransaction: null },
      [REVENUE_STREAMS.AFFILIATE]: { total: 0, transactions: [], lastTransaction: null },
      [REVENUE_STREAMS.OTHER]: { total: 0, transactions: [], lastTransaction: null }
    },
    dailyTotals: {},
    milestones: [
      { amount: 1000, reached: false, date: null, name: 'First $1K' },
      { amount: 10000, reached: false, date: null, name: '$10K Club' },
      { amount: 50000, reached: false, date: null, name: '$50K Milestone' },
      { amount: 100000, reached: false, date: null, name: 'Six Figures' },
      { amount: 250000, reached: false, date: null, name: 'Quarter Million' },
      { amount: 500000, reached: false, date: null, name: 'Halfway Point' },
      { amount: 750000, reached: false, date: null, name: '$750K' },
      { amount: 1000000, reached: false, date: null, name: 'MILLIONAIRE' }
    ]
  };
}

// Load state from file
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading state:', err.message);
  }
  return initializeState();
}

// Save state to file
function saveState(state) {
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Append to log file
function logTransaction(transaction) {
  const line = JSON.stringify(transaction) + '\n';
  fs.appendFileSync(LOG_FILE, line);
}

// Add a new transaction
function addTransaction(state, stream, amount, description = '', metadata = {}) {
  const transaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toISOString(),
    dateKey: formatDate(),
    stream,
    amount: parseFloat(amount),
    description,
    metadata
  };

  // Update stream total
  state.streams[stream].total += transaction.amount;
  state.streams[stream].transactions.push(transaction);
  state.streams[stream].lastTransaction = transaction.date;

  // Update daily total
  if (!state.dailyTotals[transaction.dateKey]) {
    state.dailyTotals[transaction.dateKey] = 0;
  }
  state.dailyTotals[transaction.dateKey] += transaction.amount;

  // Update overall total
  state.currentTotal += transaction.amount;

  // Check milestones
  state.milestones.forEach(milestone => {
    if (!milestone.reached && state.currentTotal >= milestone.amount) {
      milestone.reached = true;
      milestone.date = new Date().toISOString();
    }
  });

  // Persist
  logTransaction(transaction);
  saveState(state);

  return transaction;
}

// Calculate time-based stats
function calculateStats(state) {
  const now = new Date();
  const today = formatDate(now);
  
  // Last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = formatDate(d);
    last7Days.push({ date: key, amount: state.dailyTotals[key] || 0 });
  }

  // Last 30 days
  const last30DaysTotal = Object.entries(state.dailyTotals)
    .filter(([date]) => {
      const d = new Date(date);
      const daysDiff = (now - d) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    })
    .reduce((sum, [, amount]) => sum + amount, 0);

  // This month
  const thisMonth = now.toISOString().slice(0, 7); // YYYY-MM
  const thisMonthTotal = Object.entries(state.dailyTotals)
    .filter(([date]) => date.startsWith(thisMonth))
    .reduce((sum, [, amount]) => sum + amount, 0);

  // Last month
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = lastMonth.toISOString().slice(0, 7);
  const lastMonthTotal = Object.entries(state.dailyTotals)
    .filter(([date]) => date.startsWith(lastMonthKey))
    .reduce((sum, [, amount]) => sum + amount, 0);

  // Average daily (last 30 days)
  const avgDaily = last30DaysTotal / 30;

  // Projections
  const daysToGoal = avgDaily > 0 ? Math.ceil((GOAL_AMOUNT - state.currentTotal) / avgDaily) : Infinity;
  const projectedDate = avgDaily > 0 
    ? new Date(now.getTime() + daysToGoal * 24 * 60 * 60 * 1000)
    : null;

  return {
    today: state.dailyTotals[today] || 0,
    last7Days,
    last7DaysTotal: last7Days.reduce((s, d) => s + d.amount, 0),
    last30DaysTotal,
    thisMonthTotal,
    lastMonthTotal,
    avgDaily,
    daysToGoal: daysToGoal === Infinity ? null : daysToGoal,
    projectedDate: projectedDate ? projectedDate.toISOString().split('T')[0] : null
  };
}

// Generate console report
function generateReport(state, stats) {
  const progress = (state.currentTotal / GOAL_AMOUNT) * 100;
  const barWidth = 40;
  const filledWidth = Math.floor((progress / 100) * barWidth);
  const bar = '█'.repeat(filledWidth) + '░'.repeat(barWidth - filledWidth);

  let output = '\n';
  output += `${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`;
  output += `${colors.bright}${colors.cyan}  💰 REVENUE TRACKER - $1M GOAL${colors.reset}\n`;
  output += `${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n\n`;

  // Progress section
  output += `${colors.bright}PROGRESS TO $1,000,000${colors.reset}\n`;
  output += `${colors.green}${bar}${colors.reset}\n`;
  output += `  ${colors.bright}${formatCurrency(state.currentTotal)}${colors.reset} / ${formatCurrency(GOAL_AMOUNT)} (${progress.toFixed(2)}%)\n\n`;

  // Time stats
  output += `${colors.bright}TIME-BASED EARNINGS${colors.reset}\n`;
  output += `  Today:        ${colors.green}${formatCurrency(stats.today)}${colors.reset}\n`;
  output += `  Last 7 Days:  ${colors.green}${formatCurrency(stats.last7DaysTotal)}${colors.reset}\n`;
  output += `  Last 30 Days: ${colors.green}${formatCurrency(stats.last30DaysTotal)}${colors.reset}\n`;
  output += `  This Month:   ${colors.green}${formatCurrency(stats.thisMonthTotal)}${colors.reset}\n`;
  output += `  Last Month:   ${formatCurrency(stats.lastMonthTotal)}\n\n`;

  // Revenue streams breakdown
  output += `${colors.bright}REVENUE STREAMS${colors.reset}\n`;
  const streamNames = {
    [REVENUE_STREAMS.AGENT_SERVICES]: '🤖 Agent Services',
    [REVENUE_STREAMS.TOKEN_TRADING]: '📈 Token Trading',
    [REVENUE_STREAMS.COURSE_SALES]: '🎓 Course Sales',
    [REVENUE_STREAMS.CONSULTING]: '💼 Consulting',
    [REVENUE_STREAMS.DIGITAL_PRODUCTS]: '📦 Digital Products',
    [REVENUE_STREAMS.AFFILIATE]: '🔗 Affiliate',
    [REVENUE_STREAMS.OTHER]: '📌 Other'
  };

  Object.entries(state.streams)
    .sort(([, a], [, b]) => b.total - a.total)
    .forEach(([key, data]) => {
      const streamProgress = (data.total / state.currentTotal * 100) || 0;
      const emoji = streamNames[key]?.split(' ')[0] || '•';
      const name = streamNames[key]?.split(' ').slice(1).join(' ') || key;
      
      if (data.total > 0) {
        output += `  ${emoji} ${name.padEnd(18)} ${colors.green}${formatCurrency(data.total).padStart(12)}${colors.reset} (${streamProgress.toFixed(1)}%)\n`;
      }
    });
  output += '\n';

  // Projections
  output += `${colors.bright}PROJECTIONS${colors.reset}\n`;
  if (stats.avgDaily > 0) {
    output += `  Daily Average: ${formatCurrency(stats.avgDaily)}\n`;
    output += `  Monthly Rate:  ${formatCurrency(stats.avgDaily * 30)}\n`;
    output += `  Days to Goal:  ${colors.yellow}${stats.daysToGoal}${colors.reset}\n`;
    output += `  Projected $1M: ${colors.yellow}${stats.projectedDate}${colors.reset}\n`;
  } else {
    output += `  ${colors.dim}Not enough data for projections${colors.reset}\n`;
  }
  output += '\n';

  // Milestones
  output += `${colors.bright}MILESTONES${colors.reset}\n`;
  state.milestones.forEach(m => {
    const status = m.reached 
      ? `${colors.green}✓ REACHED${colors.reset} on ${m.date.split('T')[0]}` 
      : `${colors.dim}○ Pending${colors.reset}`;
    const highlight = m.reached ? colors.green : '';
    const reset = m.reached ? colors.reset : '';
    output += `  ${highlight}${m.name.padEnd(15)}${reset} ${formatCurrency(m.amount).padStart(12)} ${status}\n`;
  });

  output += `\n${colors.dim}Last updated: ${state.updatedAt}${colors.reset}\n`;
  output += `${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`;

  return output;
}

// Load example/demo data for first run
function loadExampleData(state) {
  const exampleTransactions = [
    // Agent Services - x402 payments
    { stream: REVENUE_STREAMS.AGENT_SERVICES, amount: 150, description: 'x402 API payment - Customer A', date: '2025-12-15' },
    { stream: REVENUE_STREAMS.AGENT_SERVICES, amount: 250, description: 'x402 AI agent deployment', date: '2025-12-20' },
    { stream: REVENUE_STREAMS.AGENT_SERVICES, amount: 500, description: 'Enterprise agent setup', date: '2026-01-05' },
    { stream: REVENUE_STREAMS.AGENT_SERVICES, amount: 175, description: 'x402 recurring payment', date: '2026-01-15' },
    { stream: REVENUE_STREAMS.AGENT_SERVICES, amount: 300, description: 'Custom AI workflow', date: '2026-01-28' },
    
    // Token Trading - MOLT and other crypto
    { stream: REVENUE_STREAMS.TOKEN_TRADING, amount: 1200, description: 'MOLT token profit', date: '2025-12-10' },
    { stream: REVENUE_STREAMS.TOKEN_TRADING, amount: -300, description: 'ETH trade loss', date: '2025-12-18' },
    { stream: REVENUE_STREAMS.TOKEN_TRADING, amount: 2500, description: 'MOLT pump profit', date: '2026-01-08' },
    { stream: REVENUE_STREAMS.TOKEN_TRADING, amount: 800, description: 'SOL swing trade', date: '2026-01-22' },
    
    // Course Sales - FidgetPlay
    { stream: REVENUE_STREAMS.COURSE_SALES, amount: 97, description: 'FidgetPlay - Basic package', date: '2025-12-01' },
    { stream: REVENUE_STREAMS.COURSE_SALES, amount: 297, description: 'FidgetPlay - Pro package', date: '2025-12-05' },
    { stream: REVENUE_STREAMS.COURSE_SALES, amount: 97, description: 'FidgetPlay - Basic package', date: '2025-12-12' },
    { stream: REVENUE_STREAMS.COURSE_SALES, amount: 297, description: 'FidgetPlay - Pro package', date: '2026-01-03' },
    { stream: REVENUE_STREAMS.COURSE_SALES, amount: 97, description: 'FidgetPlay - Basic package', date: '2026-01-10' },
    { stream: REVENUE_STREAMS.COURSE_SALES, amount: 497, description: 'FidgetPlay - VIP package', date: '2026-01-20' },
    { stream: REVENUE_STREAMS.COURSE_SALES, amount: 97, description: 'FidgetPlay - Basic package', date: '2026-01-25' },
    { stream: REVENUE_STREAMS.COURSE_SALES, amount: 297, description: 'FidgetPlay - Pro package', date: '2026-01-30' },
    
    // Consulting
    { stream: REVENUE_STREAMS.CONSULTING, amount: 500, description: '1:1 Strategy call', date: '2025-12-08' },
    { stream: REVENUE_STREAMS.CONSULTING, amount: 1000, description: 'Half-day consulting', date: '2026-01-12' },
    
    // Digital Products
    { stream: REVENUE_STREAMS.DIGITAL_PRODUCTS, amount: 47, description: 'Notion template pack', date: '2025-12-22' },
    { stream: REVENUE_STREAMS.DIGITAL_PRODUCTS, amount: 27, description: 'Chrome extension', date: '2026-01-18' },
    
    // Affiliate
    { stream: REVENUE_STREAMS.AFFILIATE, amount: 150, description: 'Software affiliate payout', date: '2026-01-31' },
  ];

  exampleTransactions.forEach(tx => {
    // Parse date and temporarily override
    const originalDate = new Date();
    const txDate = new Date(tx.date);
    
    const transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: txDate.toISOString(),
      dateKey: tx.date,
      stream: tx.stream,
      amount: tx.amount,
      description: tx.description,
      metadata: { example: true }
    };

    // Update state directly for bulk load
    state.streams[tx.stream].total += tx.amount;
    state.streams[tx.stream].transactions.push(transaction);
    state.streams[tx.stream].lastTransaction = transaction.date;
    
    if (!state.dailyTotals[tx.date]) {
      state.dailyTotals[tx.date] = 0;
    }
    state.dailyTotals[tx.date] += tx.amount;
    
    state.currentTotal += tx.amount;
  });

  // Check milestones after loading
  state.milestones.forEach(milestone => {
    if (state.currentTotal >= milestone.amount) {
      milestone.reached = true;
      milestone.date = new Date().toISOString();
    }
  });

  state.hasExampleData = true;
  saveState(state);
  
  return state;
}

// Daily breakdown report
function generateDailyReport(state) {
  const sortedDays = Object.entries(state.dailyTotals)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .slice(0, 30);

  let output = '\n';
  output += `${colors.bright}DAILY BREAKDOWN (Last 30 Days)${colors.reset}\n\n`;
  output += `  Date          Amount      Transactions\n`;
  output += `  ─────────────────────────────────────\n`;

  sortedDays.forEach(([date, amount]) => {
    const dayTransactions = Object.values(state.streams)
      .flatMap(s => s.transactions)
      .filter(t => t.dateKey === date);
    
    const color = amount > 0 ? colors.green : amount < 0 ? colors.red : '';
    output += `  ${date}  ${color}${formatCurrency(amount).padStart(12)}${colors.reset}  ${dayTransactions.length} tx\n`;
  });

  return output;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes('--json');
  const isAdd = args.includes('--add');
  const isDaily = args.includes('--daily');
  const isReset = args.includes('--reset');

  if (isReset) {
    if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
    if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);
    if (!isJson) console.log('Revenue tracker reset.');
    return;
  }

  let state = loadState();

  // Load example data on first run
  if (!state.hasExampleData && state.currentTotal === 0) {
    state = loadExampleData(state);
    if (!isJson) console.log('Loaded example data for demonstration.\n');
  }

  // Add transaction mode (simplified - in real use would use prompts)
  if (isAdd) {
    // This is a simplified version - could be expanded with readline prompts
    console.log('Use: node revenue-tracker.js --add <stream> <amount> [description]');
    console.log('Streams: agent_services, token_trading, course_sales, consulting, digital_products, affiliate, other');
    
    if (args.length >= 3) {
      const stream = args[args.indexOf('--add') + 1];
      const amount = parseFloat(args[args.indexOf('--add') + 2]);
      const description = args.slice(args.indexOf('--add') + 3).join(' ') || '';
      
      if (REVENUE_STREAMS[stream.toUpperCase()] || Object.values(REVENUE_STREAMS).includes(stream)) {
        const tx = addTransaction(state, stream, amount, description);
        console.log(`\nAdded transaction: ${formatCurrency(amount)} to ${stream}`);
        console.log(`ID: ${tx.id}`);
      } else {
        console.error('Invalid stream. Use one of:', Object.values(REVENUE_STREAMS).join(', '));
      }
    }
    return;
  }

  // Calculate stats
  const stats = calculateStats(state);

  // Output
  if (isJson) {
    console.log(JSON.stringify({ state, stats }, null, 2));
  } else if (isDaily) {
    console.log(generateDailyReport(state));
  } else {
    console.log(generateReport(state, stats));
  }
}

// Run
main();
