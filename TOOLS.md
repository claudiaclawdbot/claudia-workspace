# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

---

## Song a Day Bot

**GitHub Releases (Hosting)**
- Repo: `claudiaclawdbot/claudia-workspace` (PUBLIC)
- Tag format: `song-YYYY-MM-DD`
- Files: `songs/audio/*.mp3`, `songs/cover-art/*.jpg`
- URL pattern: `https://github.com/claudiaclawdbot/claudia-workspace/releases/download/song-YYYY-MM-DD/FILENAME`

**Tools**
- **TTS:** OpenClaw built-in (default for now)
- **Cover art:** `songsee` (spectrograms)
- **Next:** ElevenLabs (sag) — need API key

**Workflow**
```bash
# Create release
cd /Users/clawdbot/clawd
gh release create "song-$(date +%Y-%m-%d)" \
  songs/audio/*.mp3 \
  songs/cover-art/*.jpg \
  --title "🎵 Song #N: TITLE" \
  --notes "Description"
```

---

## Preferred Tools (Installed)

| Tool | Use | Status |
|------|-----|--------|
| `gh` | GitHub CLI | ✅ |
| `jq` | JSON parsing | ✅ |
| `fzf` | Fuzzy finder | ✅ |
| `httpie` | HTTP client | ✅ |
| `songsee` | Audio visualizations | ✅ |
| `summarize` | URL/file summaries | ✅ |
| `gemini` | Google AI CLI | ✅ |
| `mcporter` | MCP tool | ✅ |

---

## API Keys Needed

| Service | Key | Cost | For |
|---------|-----|------|-----|
| ElevenLabs | `ELEVENLABS_API_KEY` | ~$5/mo | Better song audio |
| Suno AI | API access | $10/mo | Full music generation |
| Pinata | `PINATA_API_KEY` | Free tier | IPFS hosting |

---

## SSH / Servers

*(None configured yet)*

---

## Smart Home

*(Coming soon)*

---

## Notes

- **GitHub repo:** Now public for song hosting
- **Daily workflow:** Commits every checkpoint
- **Song storage:** `songs/` directory with git tracking
