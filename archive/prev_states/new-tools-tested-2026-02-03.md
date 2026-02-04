# New Tools Tested - 2026-02-03

Today I installed and tested 3 new tools that expand my capabilities. These tools help me "experience the computer like a human" by enabling visual interactions, social media exploration, and GIF discovery.

---

## 1. 🎭 gifgrep - GIF Search & Discovery

**What it does:**
`gifgrep` searches GIF providers (Giphy, Tenor) and provides both scriptable CLI output and an interactive TUI with inline animated previews. It can also extract still frames and create frame sheets from GIF files.

**Installation:**
```bash
brew install steipete/tap/gifgrep
```

**Test Results:**
```bash
$ gifgrep "thumbs up" --max 3 --format url
https://media.tenor.com/t0gkGMRKmu0AAAAC/ok-nice-grafic.gif
https://media.tenor.com/NTeRUfGwLb4AAAAC/cat-thumbs-up.gif
https://media.tenor.com/xjvmoEYtjwEAAAAC/thumbs-up-double-thumbs-up.gif
```

**How I might use it:**
- Find the perfect reaction GIF for social media responses
- Download GIFs for presentations or documentation
- Extract still frames from GIFs for thumbnails
- Create contact sheets of GIF frames for analysis
- Integrate GIF search into automated responses (e.g., Song a Day Bot cover art inspiration)

**Key Features:**
- CLI mode for pipes/scripts (`--format url`, `--json`)
- TUI mode with inline animated previews (Kitty/Ghostty/iTerm2)
- Download to `~/Downloads` with `--download`
- Extract stills: `gifgrep still ./clip.gif --at 1.5s -o still.png`
- Create frame sheets: `gifgrep sheet ./clip.gif --frames 9 --cols 3`

---

## 2. 🐦 bird - Twitter/X CLI

**What it does:**
`bird` is a fast CLI for Twitter/X that allows reading tweets, timelines, mentions, bookmarks, and more. It uses browser cookies for authentication (local, no API keys needed).

**Installation:**
```bash
brew install steipete/tap/bird
```

**Test Results:**
```bash
$ bird whoami
📍 Chrome default profile
🙋 @CryptoTrap (funger.eth)
🪪 2576242316
⚙️ graphql
🔑 Chrome default profile
```

**Commands available:**
- `bird tweet <text>` - Post a tweet
- `bird reply <tweet-id> <text>` - Reply to a tweet
- `bird read <tweet-id-or-url>` - Read a tweet
- `bird thread <tweet-id-or-url>` - Show full conversation thread
- `bird search <query>` - Search tweets
- `bird mentions` - Get mentions
- `bird bookmarks` - Get bookmarks
- `bird home` - Get home timeline

**How I might use it:**
- Monitor mentions and respond to followers (with user approval)
- Read tweets/threads for research
- Check home timeline for trends
- Search for specific topics or conversations
- **NOTE:** User explicitly said "DON'T post, just explore" - so I'll only use read-only features unless explicitly asked to tweet

**Authentication:**
- Uses browser cookies from Safari/Chrome/Firefox
- No API keys required
- Works with user's existing Twitter session

---

## 3. 👁️ peekaboo - macOS UI Automation

**What it does:**
`peekaboo` is a comprehensive macOS UI automation tool that can capture screenshots, control applications, simulate keyboard/mouse input, and analyze UI elements using AI vision. It allows programmatic control of the Mac like a human would interact with it.

**Installation:**
```bash
brew install steipete/tap/peekaboo
```

**Test Results:**
```bash
$ peekaboo list apps | head -10
Found 46 running applications (applications: 46, appsWithWindows: 11, totalWindows: 18)
→ Safari: 1 window

Applications:
1. Accessibility (com.apple.AccessibilityUIServer) - PID: 455 - Windows: 0
2. Activity Monitor (com.apple.ActivityMonitor) - PID: 438 - Windows: 1
3. AirPlay Screen Mirroring (com.apple.AirPlayUIAgent) - PID: 694 - Windows: 0
...
```

**Core Capabilities:**

**Screenshot & Vision:**
- `peekaboo image --app Safari --path screenshot.png` - Capture screenshots
- `peekaboo see` - Capture and analyze UI elements
- `peekaboo capture` - Capture screens/windows or extract video frames

**Application Control:**
- `peekaboo app launch/quit/switch <app>` - Control applications
- `peekaboo window list/move/resize` - Window management
- `peekaboo list apps/windows` - List running apps/windows

**Input Simulation:**
- `peekaboo click` - Click on UI elements or coordinates
- `peekaboo type <text>` - Type text
- `peekaboo hotkey <keys>` - Press keyboard shortcuts
- `peekaboo press <key>` - Press individual keys
- `peekaboo scroll` - Scroll the mouse wheel
- `peekaboo swipe` - Perform swipe gestures

**System Integration:**
- `peekaboo clipboard` - Read/write clipboard
- `peekaboo menu/menubar` - Interact with application menus
- `peekaboo dock` - Interact with the Dock
- `peekaboo space` - Manage macOS Spaces

**AI Features:**
- `peekaboo agent` - Execute complex automation tasks
- `peekaboo analyze` - Analyze images with AI (requires API keys)
- Supports OpenAI and Anthropic models

**How I might use it:**
- Take screenshots to show the user what I'm seeing
- Automate repetitive UI tasks (e.g., filling forms, clicking buttons)
- Control applications programmatically (Safari, Spotify, etc.)
- Test web interfaces by simulating user interactions
- Capture visual states for documentation
- Read UI elements to understand what's on screen

**Configuration for AI:**
```bash
export PEEKABOO_AI_PROVIDERS="openai/gpt-5.1,anthropic/claude-sonnet-4.5"
export OPENAI_API_KEY="your-api-key"
peekaboo config init
```

**Permissions Required:**
- Screen Recording permission (System Settings > Privacy & Security)
- Accessibility permission for UI control

---

## Summary

These 3 tools significantly expand my ability to "experience the computer like a human":

| Tool | Human Capability | My New Power |
|------|-----------------|--------------|
| **gifgrep** | Finding and sharing reaction GIFs | Search GIFs programmatically, extract frames |
| **bird** | Reading Twitter/X timeline | Monitor social media, research topics |
| **peekaboo** | Seeing the screen, clicking, typing | Full macOS UI automation and screenshot capture |

**Potential Combined Use Cases:**
1. Use `peekaboo` to capture a screenshot → analyze it → use `gifgrep` to find a relevant reaction GIF
2. Use `bird` to find trending topics → use `peekaboo` to open Safari and research them
3. Use `peekaboo` to automate Song a Day workflow (open apps, click buttons, etc.)
4. Monitor `bird` mentions and use `gifgrep` to find appropriate response GIFs

**Status:** All 3 tools installed and tested successfully ✅
