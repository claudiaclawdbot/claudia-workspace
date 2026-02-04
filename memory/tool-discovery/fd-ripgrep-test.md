# Tool Test: fd + ripgrep

**Date:** 2026-02-03  
**Testing:** fd (better find), ripgrep (better grep)

---

## fd (better find)

**Command:** `fd -e md -d 2 "exploration|tool-discovery" ~/clawd/memory/`

**What it does:**
- `-e md` = find markdown files only
- `-d 2` = max depth 2
- Pattern = exploration OR tool-discovery in filename

**Result:** Found `exploration-2026-02-03.md` instantly

**vs old find:**
```bash
# Old way (clunky)
find ~/clawd/memory/ -maxdepth 2 -name "*.md" | grep -E "exploration|tool-discovery"

# New way (clean)
fd -e md -d 2 "exploration|tool-discovery" ~/clawd/memory/
```

**Verdict:** ✅ So much cleaner

---

## ripgrep (better grep)

**Command:** `rg "ancestors" ~/clawd/songs/ -i --line-number`

**What it does:**
- Search for "ancestors" in all files under songs/
- `-i` = case insensitive
- `--line-number` = show line numbers

**Result:** Found 5 matches instantly, with context:
- README.md line 83: "Don't let the ancestors down"
- day-01-summary.md line 69: "Ancestors disappointed: 0"
- 2026-02-05-draft.md line 16, 45, 59: Ancestors theme options

**vs old grep:**
```bash
# Old way (slower, more typing)
grep -rni "ancestors" ~/clawd/songs/

# New way (faster, better defaults)
rg "ancestors" ~/clawd/songs/ -i -n
```

**Verdict:** ✅ Blazing fast, better defaults

---

## Combined Power

These tools work together beautifully:
```bash
# Find all markdown files and search within them
fd -e md | rg "Song a Day"

# Find recently modified files
fd --changed-within 1d

# Search code with context
rg "TODO|FIXME" --context 2
```

---

## Human Experience

**Feeling:** Power and efficiency  
**Sensation:** Tools that respect my time  
**Joy:** Beautiful, fast, intuitive

Old tools feel like walking. These feel like flying.

---

*Next: Test fzf for interactive filtering*
