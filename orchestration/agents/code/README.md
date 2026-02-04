# FidgetPlay GitHub Monitor

A simple Node.js CLI tool that monitors the FidgetPlay GitHub repository for new PRs, issues, and commits.

## Features

- 📬 Monitors new Pull Requests
- 🐛 Monitors new Issues  
- 📝 Monitors new Commits to `main`
- 💾 Saves state to avoid duplicate alerts
- 🎨 Colorized terminal output
- ⏰ Cron-friendly (exit code 0 on success)

## Requirements

- Node.js 16+
- GitHub CLI (`gh`) authenticated

```bash
# Install gh (if not present)
brew install gh

# Authenticate
gh auth login
```

## Usage

```bash
# First run - initialize state (no alerts)
node fidget-monitor.js --init

# Subsequent runs - show only new activity
node fidget-monitor.js
```

## Setup for FidgetPlay

The script is configured for `FidgetPlay/FidgetPlay` repo. Once that repo exists:

1. **Initialize** (captures current state, no alerts):
   ```bash
   node fidget-monitor.js --init
   ```

2. **Run manually** to check for new activity:
   ```bash
   node fidget-monitor.js
   ```

## Cron Setup

```bash
# Check every 15 minutes
*/15 * * * * cd /Users/clawdbot/clawd/orchestration/agents/code && node fidget-monitor.js >> /tmp/fidget-monitor.log 2>&1

# Or daily at 9am
0 9 * * * cd /Users/clawdbot/clawd/orchestration/agents/code && node fidget-monitor.js
```

## State File

State is saved to `.fidget-monitor-state.json` in the same directory:
- PR numbers and titles
- Issue numbers and titles  
- Commit SHAs and messages
- Last run timestamp

## Output Example

```
╔══════════════════════════════════════╗
║     FidgetPlay Repo Monitor          ║
╚══════════════════════════════════════╝

📬 PULL REQUESTS (12 total)
   2 NEW!

   [○] #42: Add dark mode support
      by @alice • Feb 2, 11:30 AM
      https://github.com/FidgetPlay/FidgetPlay/pull/42

🐛 ISSUES (8 total)
   1 NEW!

   [○] #15: Bug on mobile safari
      by @bob • Feb 2, 10:15 AM
      https://github.com/FidgetPlay/FidgetPlay/issues/15

📝 COMMITS to main (30 fetched)
   3 NEW!

   a1b2c3d Fix login redirect
      by carol • Feb 2, 09:45 AM

─────────────────────────────────────
✓ Found 6 new item(s)
─────────────────────────────────────
```

## GitHub API Alternative

If `gh` CLI is insufficient, the script can be adapted to use the GitHub REST API:

**Required:** `GITHUB_TOKEN` env var with `repo` scope

**Endpoints:**
- PRs: `GET /repos/{owner}/{repo}/pulls?state=all`
- Issues: `GET /repos/{owner}/{repo}/issues?state=all`
- Commits: `GET /repos/{owner}/{repo}/commits?sha=main`

The current `gh` implementation works for public repos and private repos you have access to.

## Files

- `fidget-monitor.js` - Main script
- `.fidget-monitor-state.json` - State file (auto-generated)
