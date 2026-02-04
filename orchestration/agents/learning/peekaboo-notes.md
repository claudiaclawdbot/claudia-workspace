# Peekaboo Skill Notes - macOS UI Automation

**Date Learned:** 2026-02-02  
**Version:** 3.0.0-beta3  
**Location:** /opt/homebrew/bin/peekaboo

## Overview

Peekaboo is a comprehensive macOS UI automation CLI tool. It combines screen capture, UI element inspection, mouse/keyboard control, and application/window management into a single cohesive tool.

## Key Capabilities

### 1. Vision & Capture
- **Screenshots**: Full screen, specific windows, regions, or application windows
- **Live capture**: Motion-aware video capture with active/idle FPS settings
- **Annotated UI maps**: `see --annotate` generates screenshots with element IDs overlaid
- **Analysis**: Can analyze captured images with AI prompts

### 2. UI Element Detection
- Creates "snapshots" of the UI with identifiable elements (B1, T2, etc.)
- Element IDs persist across commands for reliable targeting
- Supports fuzzy matching by text content
- Works across apps, windows, and even background apps

### 3. Input Simulation
- **Click**: By element ID, coordinates, or text query (supports double-click, right-click)
- **Type**: Text input with human-like delays, WPM control, special keys
- **Hotkeys**: Modifier combinations (cmd+shift+t, etc.)
- **Drag & Drop**: Between elements or coordinates
- **Scroll**: Directional scrolling with smooth animation
- **Move**: Cursor positioning with optional human-like smoothing

### 4. Application Management
- Launch, quit, hide, unhide, switch apps
- Enhanced `open` command with app targeting
- Dock interactions (launch, right-click, hide/show)

### 5. Window Management
- Focus, minimize, maximize, close
- Move and resize with set-bounds
- List all windows with metadata
- Works across Spaces (virtual desktops)

### 6. Menu Automation
- Click menu items by path (e.g., "Format > Font > Show Fonts")
- Menu bar extras (WiFi, battery, etc.)
- System dialog interaction

### 7. Clipboard
- Read/write text, images, and files
- Automated paste workflow (set → paste → restore)

## Permission Requirements

⚠️ **CRITICAL**: Requires two macOS permissions:
1. **Screen Recording** - To capture the screen and see UI elements
2. **Accessibility** - To control mouse/keyboard and interact with apps

Grant in: System Settings > Privacy & Security > Screen Recording / Accessibility

## Command Structure

All commands follow pattern: `peekaboo <command> [options]`

Common flags across commands:
- `--json` / `-j`: Machine-readable JSON output
- `--verbose` / `-v`: Detailed logging
- `--app <name>`: Target specific application
- `--window-title <title>`: Target specific window
- `--snapshot <id>`: Reference a specific UI snapshot

## Key Commands Reference

| Command | Purpose |
|---------|---------|
| `peekaboo see` | Capture UI snapshot with element IDs |
| `peekaboo click --on B1` | Click element by ID from snapshot |
| `peekaboo type "text"` | Type text into focused element |
| `peekaboo hotkey --keys "cmd,t"` | Press keyboard shortcut |
| `peekaboo app launch "Safari"` | Launch application |
| `peekaboo window focus --app Safari` | Focus window |
| `peekaboo list apps --json` | List running applications |
| `peekaboo list windows --json` | List all windows |
| `peekaboo menu click --app Safari --item "New Window"` | Click menu item |
| `peekaboo image --mode screen --path shot.png` | Screenshot |

## Best Practices

1. **Always start with `see`** - Capture the UI state to get element IDs
2. **Use `--annotate`** when learning - Generates image with IDs overlaid
3. **Reference snapshot IDs** - Makes automation reliable across UI changes
4. **Use JSON output** for scripting - `--json` enables machine-readable output
5. **Target by element ID** - More reliable than coordinates or text queries

## Tool Architecture

- **30+ tools** available via MCP (Model Context Protocol)
- Tools designed for agent/AI use with JSON contracts
- Snapshot cache for efficient repeated operations
- Can run `.peekaboo.json` scripts for complex workflows

## Limitations

- macOS only (Darwin)
- Requires permissions (can't function without them)
- Beta software (3.0.0-beta3)
- Some features require Peekaboo Bridge host for remote execution

## Installation

```bash
brew install steipete/tap/peekaboo
```

## Testing Status

❌ **NOT TESTED**: Permissions not granted during learning session.  
To test, user must grant Screen Recording and Accessibility permissions in System Settings.
