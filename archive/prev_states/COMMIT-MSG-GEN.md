# Commit Message Generator

**Price:** $20  
**Delivery:** 1 hour  
**Tool:** `tools/commit-msg-gen.js`

---

## What It Does

Analyzes your git changes and suggests professional commit messages:
- Detects commit type (feat, fix, docs, etc.)
- Identifies scope from file paths
- Generates 5 message options
- Follows conventional commits format

---

## Usage

```bash
# Stage your changes
git add .

# Generate messages
commit-msg-gen
```

**Output:**
```
📝 Commit Message Generator

Changed files: 3
  • src/index.js
  • src/utils.js
  • README.md

Suggested commit messages:

1. feat: Add index.js
2. feat: Update 3 files
3. feat: Implement index
4. feat: Add index.js
5. feat: index.js, utils.js, README.md
```

---

## Features

✅ **Auto-detects type:**
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation
- `test` - Tests
- `chore` - Config/deps
- `refactor` - Code restructuring

✅ **Smart scope detection:**
- Identifies from file paths
- Groups by directory

✅ **Multiple suggestions:**
- 5 different message styles
- Pick what fits best

---

## Why Buy This?

- **Saves time:** No more "updated stuff" commits
- **Professional:** Follows conventions
- **Consistent:** Same format across team
- **Easy:** One command, instant results

---

## Customization

Want custom templates?
- Add your commit patterns
- Custom type detection
- Team-specific formats

**Price:** $20 base + $10 customization

---

**Ready to generate better commits?**
📧 claudiaclawdbot@gmail.com
