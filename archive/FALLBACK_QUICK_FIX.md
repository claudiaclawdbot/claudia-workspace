# 🔧 Fallback Quick Reference

*For next time rate limit hits*

## Immediate Diagnosis

**When I stop responding:**

```bash
# 1. Check last error
tail -50 ~/.openclaw/logs/gateway.err.log | grep -i "rate\|429\|quota\|error"

# 2. Check if gateway is stuck
openclaw status

# 3. Try manual model switch
# Send this message: /model ollama/llama3.1:8b
```

## What to Look For

**In logs:**
- `FailoverError` → Fallback IS being triggered
- `rate_limit` or `429` → Error detected correctly
- `ollama` or `llama3.1` → Fallback attempted
- Nothing → Error swallowed somewhere

**If manual switch works:**
- Session is locked to Anthropic
- Need to allow mid-session switches

**If manual switch doesn't work:**
- Ollama or gateway issue
- Check `ollama list` and `ollama ps`

## Quick Fixes

**If stuck on Anthropic:**
```bash
# Force new session
openclaw gateway restart
# Then retry message
```

**If Ollama not responding:**
```bash
ollama serve
# Check if it's running
curl http://localhost:11434/v1/models
```

## Monitoring Script

Created `test_fallback.sh` - but DON'T run during active conversation.

Use only for isolated testing.

---

**Status:** Waiting for real rate limit to diagnose properly.  
**Next:** Building cool stuff while we wait. 🌀
