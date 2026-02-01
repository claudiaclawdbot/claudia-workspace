# 🔍 Fallback Diagnosis - Why It's Not Working

*Created: 2026-02-01 08:07 EST*  
*Issue: Configured fallback to Ollama not triggering on Anthropic rate limits*

---

## Configuration Status

✅ **Fallback is configured:**
```bash
$ openclaw models fallbacks list
Fallbacks (1):
- ollama/llama3.1:8b
```

✅ **Ollama is running and working:**
```bash
$ ollama list
llama3.1:8b    46e0c10c039e    4.9 GB    15 hours ago

$ curl http://localhost:11434/api/generate -d '{"model":"llama3.1:8b","prompt":"test","stream":false}'
Response: "It looks like you'd like to test the chat..."
```

✅ **OpenClaw sees both models:**
```bash
$ openclaw models list
anthropic/claude-sonnet-4-5    text+img   195k   no    yes   default
ollama/llama3.1:8b             text       128k   yes   yes   fallback#1
```

❌ **But fallback doesn't trigger when hitting Anthropic limits**

---

## How Fallback SHOULD Work (from docs)

### Detection
OpenClaw has error detection functions:
- `isRateLimitAssistantError()` - Detects rate limit errors
- `isFailoverErrorMessage()` - Detects when to failover
- `classifyFailoverReason()` - Categorizes: "auth" | "rate_limit" | "quota" | "timeout"

### Trigger
```typescript
if (fallbackConfigured && isFailoverErrorMessage(errorText)) {
  throw new FailoverError(errorText, {
    reason: promptFailoverReason ?? "unknown",
    provider,
    model: modelId,
    profileId,
    status: resolveFailoverStatus(promptFailoverReason),
  });
}
```

This FailoverError should trigger the model fallback chain.

---

## Possible Reasons It's Not Working

### 1. **Error Detection Mismatch**
- Anthropic's rate limit error format might not match what OpenClaw expects
- The error message parsing might be failing
- Different error codes (429 vs overloaded vs quota_exceeded)

**Anthropic error formats:**
- `"error": {"type": "rate_limit_error", ...}`
- `"error": {"type": "overloaded_error", ...}` 
- HTTP 429 status code
- Different messages for different limit types

### 2. **Fallback Not Enabled for Rate Limits**
- Fallback might only trigger for hard errors (auth failures, network errors)
- Rate limits might be treated as "retry-able" rather than "failover-worthy"
- OpenClaw might be retrying instead of failing over

### 3. **OpenAI-Compatible Endpoint Issue**
- OpenClaw configured Ollama with OpenAI-compatible endpoint format:
  ```json
  "baseUrl": "http://localhost:11434/v1"
  ```
- We saw this endpoint timeout in testing
- Native endpoint (`/api/generate`) works fine
- Fallback might be trying the broken endpoint and failing silently

### 4. **Session State Issue**
- Once a session starts with Anthropic, it might be locked to that provider
- Fallback might only work for NEW sessions, not mid-session
- Need to restart or force session switch

### 5. **Auth Profile Cooldown**
- When auth fails or rate limits hit, there might be a cooldown period
- During cooldown, OpenClaw might just stop rather than fallback
- No secondary auth profile configured for retry

---

## What Actually Happens (Ryan's Report)

> "when I hit usage you just stop responding"

**Behavior:**
- Claudia stops replying entirely
- No error message to user
- No visible fallback attempt
- Just silence

**This suggests:**
- Error is being caught somewhere
- But not triggering fallback
- And not surfacing to user
- Possibly session hanging or timeout

---

## Diagnostic Steps Needed

### 1. **Check Recent Error Logs**
When it happens next time:
```bash
tail -100 ~/.openclaw/logs/gateway.err.log | grep -i "rate\|429\|overload\|quota"
```

Look for:
- The exact error message from Anthropic
- Whether FailoverError is being thrown
- Whether fallback is being attempted

### 2. **Test Ollama OpenAI Endpoint**
Fix or verify the `/v1` endpoint:
```bash
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.1:8b",
    "messages": [{"role": "user", "content": "test"}]
  }'
```

If this doesn't work, that's likely the issue.

### 3. **Force Fallback Test**
Try to manually trigger fallback:
```bash
# Temporarily set invalid Anthropic key to force auth failure
# Should trigger fallback immediately
```

### 4. **Check Session Persistence**
Look at session file to see if it's locked to a provider:
```bash
cat ~/.openclaw/agents/main/sessions/sessions.json | jq '.sessions[0].model'
```

---

## Immediate Fixes to Try

### Fix 1: Check Ollama OpenAI Endpoint Configuration
```bash
# Make sure Ollama is serving OpenAI-compatible API
ollama serve  # Should already be running

# Test the endpoint
curl http://localhost:11434/v1/models
```

If this returns nothing or errors, Ollama might not have OpenAI compatibility enabled.

**Possible fix:**
```bash
# Check ollama configuration
ollama --help
# Look for OpenAI compatibility flags
```

### Fix 2: Add Retry/Failover Configuration
Check if there's a config option for failover behavior:
```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": ["ollama/llama3.1:8b"],
        "failover": {
          "enabled": true,
          "onRateLimit": true,
          "onError": true
        }
      }
    }
  }
}
```

### Fix 3: Session Cleanup
Force new session creation:
```bash
# Backup current session
cp ~/.openclaw/agents/main/sessions/sessions.json \
   ~/.openclaw/agents/main/sessions/sessions.json.bak

# Clear session to force fresh start
echo '{"sessions":[]}' > ~/.openclaw/agents/main/sessions/sessions.json

# Restart gateway
openclaw gateway restart
```

---

## Questions for Ryan

1. **When you hit the limit, do you see ANY error message?** Or just silence?

2. **Does it happen mid-conversation** or only when starting new messages?

3. **Have you tried manually switching models** with `/model ollama/llama3.1:8b` when it stops?

4. **Does restarting the gateway** make it work again? (suggesting session state issue)

---

## My Hypothesis

**Most likely issue:** Ollama's OpenAI-compatible endpoint (`/v1/chat/completions`) is not working properly, and when fallback tries to use it, it fails silently.

**Evidence:**
- Native Ollama API works fine (`/api/generate`)
- OpenAI endpoint timed out in our testing
- OpenClaw is configured to use OpenAI format: `"api": "openai-completions"`

**Solution:**
Either:
1. Fix Ollama to serve OpenAI-compatible API properly
2. Change OpenClaw config to use native Ollama API format
3. Find out why the OpenAI endpoint isn't working

---

## Next Actions

**I can:**
1. Test Ollama OpenAI endpoint more thoroughly
2. Check OpenClaw config for failover options
3. Look for session cleanup commands
4. Research Ollama OpenAI compatibility setup

**You should:**
1. Next time you hit the limit, check the error logs
2. Try manually switching to ollama model when I stop
3. Let me know what error (if any) you see

**Or:**
Just give me permission to dig into the gateway config and logs more deeply, and I'll figure out exactly what's breaking.

---

**Status: Diagnosis in progress** 🔍
