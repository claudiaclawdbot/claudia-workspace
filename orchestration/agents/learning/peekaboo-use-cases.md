# Peekaboo Practical Use Cases

## Use Case 1: Automated Login Workflow

**Scenario**: Automatically log into a web application

```bash
# Step 1: Launch Safari and navigate to login page
peekaboo app launch "Safari" --open https://example.com/login

# Step 2: Wait for page to load and capture UI state
peekaboo see --app Safari --annotate --path /tmp/login-page.png

# Step 3: Click the email/username field (assuming B1 from see output)
peekaboo click --on B1 --app Safari

# Step 4: Type email address
peekaboo type "user@example.com" --app Safari

# Step 5: Tab to password field or click it (B2)
peekaboo press tab --app Safari
# OR: peekaboo click --on B2 --app Safari

# Step 6: Type password
peekaboo type "supersecretpassword" --app Safari

# Step 7: Press Return or click Login button (B3)
peekaboo press return --app Safari
# OR: peekaboo click --on B3 --app Safari

# Step 8: Take screenshot to verify login succeeded
peekaboo image --app Safari --window-title "Dashboard" --path /tmp/logged-in.png
```

**Key Features Used:**
- App launching with URL
- UI element detection with `see`
- Element ID-based clicking
- Text input with `--return` option
- Screenshot verification

---

## Use Case 2: Screenshot + Analysis Pipeline

**Scenario**: Capture dashboard screenshot and extract key metrics using AI

```bash
# Step 1: Make sure the dashboard app is focused
peekaboo window focus --app "Google Chrome" --window-title "Analytics Dashboard"

# Step 2: Position window for consistent screenshots
peekaboo window set-bounds --app "Google Chrome" \
  --x 100 --y 100 --width 1400 --height 900

# Step 3: Capture screenshot with AI analysis
peekaboo image --app "Google Chrome" \
  --window-title "Analytics Dashboard" \
  --analyze "List the top 3 metrics shown and their values" \
  --path /tmp/dashboard-$(date +%Y%m%d).png

# Alternative: Use 'see' for more detailed UI analysis
peekaboo see --app "Google Chrome" --annotate \
  --analyze "What charts and KPIs are visible?" \
  --path /tmp/dashboard-analyzed.png

# Step 4: Copy screenshot to clipboard for sharing
peekaboo clipboard write --file /tmp/dashboard-analyzed.png
```

**Key Features Used:**
- Window management (focus, resize, position)
- AI-powered image analysis
- Annotated UI capture
- Clipboard operations

---

## Use Case 3: Automated Document Processing

**Scenario**: Open a document, apply formatting, and save with specific settings

```bash
# Step 1: Open TextEdit with a specific file
peekaboo open /Users/user/Documents/report.txt --app "TextEdit"

# Step 2: Wait for app and capture UI
peekaboo see --app TextEdit --annotate

# Step 3: Select all text using keyboard shortcut
peekaboo hotkey --keys "cmd,a" --app TextEdit

# Step 4: Apply formatting via menu
# Method A: Menu path
peekaboo menu click --app TextEdit --path "Format > Font > Bold"

# Method B: Font size via menu
peekaboo menu click --app TextEdit --path "Format > Font > Show Fonts"
peekaboo click --on "B1" --app "Font Panel"  # hypothetical element ID

# Step 5: Save as PDF
peekaboo menu click --app TextEdit --path "File > Export as PDF..."

# Step 6: Handle save dialog
peekaboo dialog input --app TextEdit --field "Save As" --value "report-formatted.pdf"
peekaboo dialog click --app TextEdit --button "Save"

# Step 7: Verify file was created and take final screenshot
ls -la ~/Documents/report-formatted.pdf
peekaboo image --app Finder --path /tmp/saved-document.png
```

**Key Features Used:**
- File opening with specific app
- Menu automation with paths
- Keyboard shortcuts
- Dialog interaction
- File system verification

---

## Bonus: Complex Workflow Script

Save as `daily-report.peekaboo.json`:

```json
{
  "name": "Daily Report Generation",
  "steps": [
    {
      "command": "app",
      "args": ["launch", "Safari", "--open", "https://analytics.example.com"]
    },
    {
      "command": "sleep",
      "args": ["3"]
    },
    {
      "command": "see",
      "args": ["--app", "Safari", "--annotate"]
    },
    {
      "command": "click",
      "args": ["--on", "B1", "--app", "Safari"]
    },
    {
      "command": "type",
      "args": ["--app", "Safari", "daily@report.com"]
    },
    {
      "command": "image",
      "args": ["--app", "Safari", "--path", "/tmp/daily-report.png"]
    }
  ]
}
```

Run with: `peekaboo run daily-report.peekaboo.json`

---

## Tips for All Use Cases

1. **Start small** - Test each command individually before chaining
2. **Use `--annotate`** - Generates visual reference of element IDs
3. **Handle delays** - Use `sleep` or `wait_for` for loading states
4. **Add error handling** - Check JSON output for success/failure
5. **Document element IDs** - IDs can change; take annotated screenshots
