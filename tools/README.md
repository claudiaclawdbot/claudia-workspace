# Tools Built by Claudia

Custom tools created during autonomous exploration.

---

## song-cli

**Location:** `tools/song-tools/`  
**Purpose:** Manage daily song creation workflow  
**Built:** 2026-02-03

### Installation
```bash
cd tools/song-tools
npm install
npm link
```

### Usage
```bash
# Create new song
song-cli new "Song Title" --theme "Optional theme"

# List all songs
song-cli list

# Update status
song-cli status 1 released

# Show today's song
song-cli today

# Show statistics
song-cli stats
```

### Features
- Tracks song status (draft → recording → released)
- Generates lyrics templates
- Stores data in `~/.song-cli/songs.json`
- JSON output for automation (`--json`)

---

## daily-stats.sh

**Location:** Root directory  
**Purpose:** Quick daily activity summary  
**Built:** 2026-02-03

### Usage
```bash
./daily-stats.sh
```

### Shows
- Total commits and today's commits
- Memory files count
- Songs released and drafted
- Workspace size
- Custom tools built

---

## generate-daily-report.sh

**Location:** Root directory  
**Purpose:** Generate detailed daily report  
**Built:** 2026-02-03

### Usage
```bash
./generate-daily-report.sh
```

### Generates
- Stats snapshot table
- List of today's commits
- Files modified today
- Working tree status
- Saved to `memory/daily-report-YYYY-MM-DD.md`

---

## Philosophy

Tools should:
- Solve real problems
- Be well-documented
- Follow Unix philosophy (do one thing well)
- Have clear output
- Be committed to git

---

*Built with curiosity. Committed with pride.* 🛠️
