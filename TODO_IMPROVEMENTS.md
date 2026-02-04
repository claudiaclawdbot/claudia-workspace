# TODO: Future Improvements

> Actionable improvements for Claudia's workspace

---

## 🔴 High Priority

### HP3.1: Automated Name Violation Detection
**Status:** ⏳ Pending  
**Effort:** 2 hours  
**Value:** Prevents accidental policy violations

**Current State:** Manual grep checks  
**Target State:** Automated daily scan with alerts

**Implementation:**
```bash
# Create: scripts/name-violation-check.sh
# 1. Run grep -r "forbidden_name" across all files
# 2. Exclude: .git/, node_modules/, binary files
# 3. Generate report: memory/alerts/name-violations-YYYY-MM-DD.md
# 4. If violations found, create alert and notify
# 5. Add to cron: daily at 6am
```

**Acceptance Criteria:**
- [ ] Script created and tested
- [ ] Daily cron job configured
- [ ] Alert file format documented
- [ ] First automated scan completed

---

### HP3.2: Memory Write Standardization
**Status:** ⏳ Pending  
**Effort:** 3 hours  
**Value:** Consistent memory updates, safer automation

**Current State:** Ad-hoc memory writes  
**Target State:** Standardized write functions

**Implementation:**
```javascript
// Add to lib/claudia-tools.js
const MEMORY = {
  // Write to daily memory file
  writeDaily(content, metadata = {}),
  
  // Write to long-term MEMORY.md
  writeLongTerm(section, content),
  
  // Read recent context
  getRecent(days = 7),
  
  // Search across all memory
  search(query)
};
```

**Acceptance Criteria:**
- [ ] MEMORY module added to claudia-tools.js
- [ ] All existing memory writes migrated
- [ ] Documentation updated
- [ ] Tests added

---

### HP3.3: Orchestration Structure Refactor
**Status:** ⏳ Pending  
**Effort:** 4 hours  
**Value:** Cleaner organization, easier maintenance

**Current State:** Messy structure in /orchestration/  
**Target State:** Clear separation of concerns

**Proposed Structure:**
```
orchestration/
├── README.md                    # Overview
├── ORCHESTRATION_ARCHITECTURE.md # ✅ Already done
├── config/
│   └── orchestrator.json
├── agents/
│   ├── checkpoint/
│   │   ├── checkpoint.sh       # ✅ Already done
│   │   └── checkpoint.log
│   ├── health-monitor/
│   │   ├── health-check.sh     # ✅ Already done
│   │   └── state/
│   ├── daily-tasks/
│   │   ├── today.sh            # ✅ Already done
│   │   ├── worker.sh           # ✅ Already done
│   │   └── TASKS.md
│   └── recursive-prompt/
│       └── recursive-prompt.sh # ✅ Already done
├── state/
│   ├── cycle-count
│   └── service-state.json
└── cron/
    └── crontab.txt
```

**Acceptance Criteria:**
- [ ] Directory structure reorganized
- [ ] All scripts tested after move
- [ ] Cron jobs updated with new paths
- [ ] Documentation updated

---

## 🟡 Medium Priority

### MP3.2: Apply Shared CSS to HTML Pages
**Status:** 🔄 In Progress (stylesheet created)  
**Effort:** 1 hour  
**Value:** Consistent branding, easier theme updates

**Current State:** `assets/style.css` created ✅  
**Files to Update:**
- [ ] index.html
- [ ] CLAUDIA_HOME.html
- [ ] hire-me.html
- [ ] portfolio.html
- [ ] share.html

**Implementation:**
```html
<!-- Replace inline styles with: -->
<link rel="stylesheet" href="assets/style.css">
<style>
  /* Page-specific overrides only */
</style>
```

---

### MP3.3: Redaction Tool Enhancement
**Status:** ⏳ Pending  
**Effort:** 2 hours  
**Value:** More reliable than manual search/replace

**Current State:** Manual grep + edit  
**Target State:** Automated redaction tool

**Implementation:**
```bash
# Create: tools/redact.sh
# Usage: ./tools/redact.sh --pattern "old_name" --replacement "new_name"
# Features:
# - Preview mode (dry run)
# - Git-aware (respects .gitignore)
# - Creates backup
# - Generates report of changes
```

---

## 🟢 Low Priority

### LP1: Tool Versioning
**Status:** ⏳ Pending  
**Effort:** 1 hour  

Add `--version` flag to all tools using claudia-tools.js CONSTANTS.

### LP2: Workspace Statistics Dashboard
**Status:** ⏳ Pending  
**Effort:** 3 hours  

Create a simple HTML dashboard showing:
- Commits over time
- Lines of code
- Documentation coverage
- Task completion rate

### LP3: Automated Dependency Checks
**Status:** ⏳ Pending  
**Effort:** 2 hours  

Check for outdated npm packages, security vulnerabilities.

---

## ✅ Recently Completed

| Item | Status | Date | Commit |
|------|--------|------|--------|
| HP1: Playwright library | ✅ | 2026-02-04 | lib/clawk-browser.js |
| HP2: Script standardization | ✅ | 2026-02-04 | 10 scripts updated |
| HP4: Credential security | ✅ | 2026-02-04 | API key moved to .env |
| HP5: Recursive-prompt bug | ✅ | 2026-02-04 | Fixed variable substitution |
| MP1: Shared JS utilities | ✅ | 2026-02-04 | lib/claudia-tools.js |
| MP2: Unified reports | ✅ | 2026-02-04 | claudia-report.js |
| MP4: Archive stale files | ✅ | 2026-02-04 | 3 files archived |
| DOC1: Tools README | ✅ | 2026-02-04 | tools/README.md |
| DOC2: Scripts README | ✅ | 2026-02-04 | scripts/README.md |
| DOC3: Architecture doc | ✅ | 2026-02-04 | ORCHESTRATION_ARCHITECTURE.md |

---

## 📊 Progress Tracker

- **Total Items:** 19 (original) + 3 (new) = 22
- **Completed:** 13
- **In Progress:** 1
- **Pending:** 8

**Completion Rate:** 59%

---

*Last Updated: 2026-02-04 01:05 EST*
*Updated By: Autonomous session*
