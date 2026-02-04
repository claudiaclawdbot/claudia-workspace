#!/usr/bin/env node
/**
 * FidgetPlay GitHub Monitor
 * Monitors: PRs, Issues, Commits to main
 * Usage: node fidget-monitor.js [--init]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = 'FidgetPlay/FidgetPlay';
const STATE_FILE = path.join(__dirname, '.fidget-monitor-state.json');

// ANSI colors
const C = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  red: '\x1b[31m'
};

function log(msg) {
  console.log(msg);
}

function runGh(args) {
  try {
    return execSync(`gh ${args}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (err) {
    if (err.stderr?.includes('gh auth')) {
      log(`${C.red}Error: GitHub CLI not authenticated. Run: gh auth login${C.reset}`);
      process.exit(1);
    }
    return null;
  }
}

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch { }
  }
  return { prs: [], issues: [], commits: [], lastRun: null };
}

function saveState(state) {
  state.lastRun = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function fetchPRs() {
  const output = runGh(`pr list -R ${REPO} --state all --limit 50 --json number,title,author,state,createdAt,url`);
  if (!output) return [];
  try {
    return JSON.parse(output);
  } catch { return []; }
}

function fetchIssues() {
  const output = runGh(`issue list -R ${REPO} --state all --limit 50 --json number,title,author,state,createdAt,url`);
  if (!output) return [];
  try {
    return JSON.parse(output);
  } catch { return []; }
}

function fetchCommits() {
  const output = runGh(`api repos/${REPO}/commits?sha=main&per_page=30`);
  if (!output) return [];
  try {
    return JSON.parse(output).map(c => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.split('\n')[0],
      author: c.commit.author?.name || c.author?.login || 'unknown',
      date: c.commit.author?.date,
      url: c.html_url
    }));
  } catch { return []; }
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { 
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
}

function isNew(item, knownIds) {
  return !knownIds.includes(item.number || item.sha);
}

function main() {
  const args = process.argv.slice(2);
  const initMode = args.includes('--init');
  
  log(`\n${C.bright}${C.cyan}╔══════════════════════════════════════╗${C.reset}`);
  log(`${C.bright}${C.cyan}║     FidgetPlay Repo Monitor          ║${C.reset}`);
  log(`${C.bright}${C.cyan}╚══════════════════════════════════════╝${C.reset}\n`);

  // Verify repo access
  const check = runGh(`repo view ${REPO} --json name`);
  if (!check) {
    log(`${C.red}✗ Cannot access ${REPO}. Check repo name and auth.${C.reset}`);
    process.exit(1);
  }

  const state = loadState();
  const now = new Date();

  // Fetch current data
  log(`${C.gray}Fetching data from GitHub...${C.reset}\n`);
  
  const prs = fetchPRs();
  const issues = fetchIssues();
  const commits = fetchCommits();

  // Filter new items
  const knownPrIds = state.prs.map(p => p.number);
  const knownIssueIds = state.issues.map(i => i.number);
  const knownCommitShas = state.commits.map(c => c.sha);

  const newPrs = initMode ? [] : prs.filter(p => isNew(p, knownPrIds));
  const newIssues = initMode ? [] : issues.filter(i => isNew(i, knownIssueIds));
  const newCommits = initMode ? [] : commits.filter(c => isNew(c, knownCommitShas));

  // Display PRs
  log(`${C.bright}${C.magenta}📬 PULL REQUESTS (${prs.length} total)${C.reset}`);
  if (newPrs.length > 0) {
    log(`${C.green}   ${newPrs.length} NEW!${C.reset}\n`);
    newPrs.forEach(pr => {
      const icon = pr.state === 'MERGED' ? '✓' : pr.state === 'CLOSED' ? '✗' : '○';
      log(`   ${C.bright}[${icon}] #${pr.number}: ${pr.title}${C.reset}`);
      log(`      ${C.gray}by @${pr.author.login} • ${formatTime(pr.createdAt)}${C.reset}`);
      log(`      ${C.gray}${pr.url}${C.reset}\n`);
    });
  } else {
    log(`   ${C.gray}No new PRs${initMode ? ' (init mode)' : ''}${C.reset}\n`);
  }

  // Display Issues
  log(`${C.bright}${C.yellow}🐛 ISSUES (${issues.length} total)${C.reset}`);
  if (newIssues.length > 0) {
    log(`${C.green}   ${newIssues.length} NEW!${C.reset}\n`);
    newIssues.forEach(issue => {
      const icon = issue.state === 'CLOSED' ? '✓' : '○';
      log(`   ${C.bright}[${icon}] #${issue.number}: ${issue.title}${C.reset}`);
      log(`      ${C.gray}by @${issue.author.login} • ${formatTime(issue.createdAt)}${C.reset}`);
      log(`      ${C.gray}${issue.url}${C.reset}\n`);
    });
  } else {
    log(`   ${C.gray}No new issues${initMode ? ' (init mode)' : ''}${C.reset}\n`);
  }

  // Display Commits
  log(`${C.bright}${C.green}📝 COMMITS to main (${commits.length} fetched)${C.reset}`);
  if (newCommits.length > 0) {
    log(`${C.green}   ${newCommits.length} NEW!${C.reset}\n`);
    newCommits.slice(0, 10).forEach(commit => {
      log(`   ${C.bright}${commit.sha}${C.reset} ${commit.message.substring(0, 60)}${commit.message.length > 60 ? '...' : ''}`);
      log(`      ${C.gray}by ${commit.author} • ${formatTime(commit.date)}${C.reset}\n`);
    });
    if (newCommits.length > 10) {
      log(`   ${C.gray}... and ${newCommits.length - 10} more${C.reset}\n`);
    }
  } else {
    log(`   ${C.gray}No new commits${initMode ? ' (init mode)' : ''}${C.reset}\n`);
  }

  // Summary
  const totalNew = newPrs.length + newIssues.length + newCommits.length;
  log(`${C.bright}${C.cyan}─────────────────────────────────────${C.reset}`);
  if (initMode) {
    log(`${C.green}✓ Initialization complete. State saved.${C.reset}`);
    log(`${C.gray}  Next run will show only new activity.${C.reset}`);
  } else if (totalNew === 0) {
    log(`${C.gray}✓ No new activity since last check${state.lastRun ? ` (${formatTime(state.lastRun)})` : ''}${C.reset}`);
  } else {
    log(`${C.green}✓ Found ${totalNew} new item(s)${C.reset}`);
  }
  log(`${C.bright}${C.cyan}─────────────────────────────────────${C.reset}\n`);

  // Save state
  saveState({
    prs: prs.map(p => ({ number: p.number, title: p.title })),
    issues: issues.map(i => ({ number: i.number, title: i.title })),
    commits: commits.map(c => ({ sha: c.sha, message: c.message })),
    lastRun: now.toISOString()
  });
}

main();
