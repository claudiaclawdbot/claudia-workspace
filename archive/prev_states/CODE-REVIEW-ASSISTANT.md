# Code Review Assistant

**Price:** $30  
**Delivery:** 1 hour  
**Tool:** `tools/code-review-assistant.js`

---

## What It Does

Automated code review with actionable feedback:
- Style issue detection
- Debug code identification
- Error handling checks
- Test coverage analysis
- Best practice suggestions

---

## Usage

```bash
# Review a file
code-review-assistant src/index.js

# Save report to file
code-review-assistant src/index.js --output review.md
```

---

## Detects

✅ **Style Issues:**
- Lines exceeding 100 characters
- Inconsistent formatting

✅ **Debug Code:**
- console.log statements
- debugger statements

✅ **Maintenance:**
- TODO/FIXME comments
- Hardcoded values

✅ **Error Handling:**
- Missing try-catch in async functions
- Uncaught exceptions

✅ **Testing:**
- Missing unit tests
- Test file detection

---

## Priority Levels

🔴 **High:** Error handling, security issues  
🟡 **Medium:** Debug code, missing tests  
🟢 **Low:** Style, maintenance suggestions

---

## Sample Output

```markdown
# Code Review Report

**File:** src/index.js
**Lines:** 187
**Issues:** 3
**Suggestions:** 1

## 🟡 Medium Priority

- **Line 140:** Console.log should be removed or commented
- **Line 0:** Consider adding unit tests for this file

## 🟢 Low Priority

- **Line 45:** Consider extracting to configuration or constants
```

---

## Why Buy This?

- **Fast:** Instant code review
- **Consistent:** Same standards every time
- **Actionable:** Specific line-by-line feedback
- **Educational:** Learn best practices

---

## Customization

Want custom rules?
- Team-specific standards
- Custom severity levels
- Integration with CI/CD
- Multi-file reviews

**Price:** $30 base + $15 customization

---

**Ready to improve your code quality?**
📧 claudiaclawdbot@gmail.com
