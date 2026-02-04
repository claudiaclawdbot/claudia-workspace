# 🔧 Model Fallback Solution

*Created: 2026-02-01 08:12 EST*  
*Goal: Make Anthropic → Ollama fallback work seamlessly*

---

## How It SHOULD Work (Code Analysis Complete)

### 1. Error Detection ✅
File: `/opt/homebrew/lib/node_modules/openclaw/dist/agents/pi-embedded-helpers/errors.js`

Rate limit patterns detected:
```typescript
ERROR_PATTERNS.rateLimit = [
  /rate[_ ]limit|too many requests|429/,
  "exceeded your current quota",
  "resource has been exhausted",
  "quota exceeded",
  "resource_exhausted",
  "usage limit",
]
```

**This SHOULD catch Anthropic rate limits.**

### 2. Error Conversion ✅  
File: `/opt/homebrew/lib/node_modules/openclaw/dist/agents/failover-error.js`

```typescript
if (status === 429) {
  return "rate_limit";  // HTTP 429 → rate_limit reason
}
```

Converts HTTP 429 errors to `FailoverError` with reason "rate_limit".

### 3. FailoverError Throw ✅
File: `/opt/homebrew/lib/node_modules/openclaw/dist/agents/pi-embedded-runner/run.js` (line 412)

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

When rate limit detected AND fallbacks configured → throws FailoverError.

### 4. Model Fallback Loop ✅
File: `/opt/homebrew/lib/node_modules/openclaw/dist/agents/model-fallback.js`

```typescript
export async function runWithModelFallback(params) {
  const candidates = resolveFallbackCandidates({...});  // [anthropic/sonnet, ollama/llama3.1]
  
  for (let i = 0; i < candidates.length; i += 1) {
    try {
      const result = await params.run(candidate.provider, candidate.model);
      return { result, provider, model, attempts };
    }
    catch (err) {
      // Convert to FailoverError
      const normalized = coerceToFailoverError(err, {...});
      
      if (!isFailoverError(normalized)) {
        throw err;  // Not a failover error → stop
      }
      
      // Log attempt and continue to NEXT model
      attempts.push({...});
      await params.onError?.({...});
      // Loop continues to next candidate (ollama)
    }
  }
}
```

**This loops through primary → fallback, switching on FailoverError.**

---

## Your Configuration ✅

```bash
$ openclaw models fallbacks list
Fallbacks (1):
- ollama/llama3.1:8b

$ openclaw models list
anthropic/claude-sonnet-4-5    default
ollama/llama3.1:8b             fallback#1
```

**Configuration is correct.**

---

## Why It's Not Working 🔍

### Theory 1: Session Already Started with Anthropic
**Problem:** Once a conversation starts with a specific model, the session might be locked.

**Test:** Start a NEW conversation when hitting limits.

**Fix if true:** Force session to allow mid-conversation model switches.

### Theory 2: Error Not Propagating to runWithModelFallback
**Problem:** Some intermediate layer might be catching/handling the error before it reaches the fallback logic.

**Evidence:** Ryan sees silence (no error, no fallback).

**Fix if true:** Need to trace where error is being swallowed.

### Theory 3: Auth Profile Cooldown
**Problem:** When Anthropic rate limits, the auth profile goes into cooldown. Fallback logic sees "provider in cooldown" and skips WITHOUT trying Ollama.

**Evidence from code:**
```typescript
if (profileIds.length > 0 && !isAnyProfileAvailable) {
  // All profiles for this provider are in cooldown; skip without attempting
  attempts.push({
    provider: candidate.provider,
    model: candidate.model,
    error: `Provider ${candidate.provider} is in cooldown`,
    reason: "rate_limit",
  });
  continue;  // THIS SKIPS TO NEXT, BUT...
}
```

**Critical question:** Does it ACTUALLY continue to Ollama, or does it stop?

### Theory 4: Gateway Swallowing Error Silently
**Problem:** Gateway layer catches error and stops responding without surfacing it to user or triggering retry.

**Evidence:** Complete silence when hitting limits.

**Fix:** Enable better error reporting or logging.

---

## Diagnostic Test Plan

### Test 1: Force Auth Failure (Not Rate Limit)
Temporarily break Anthropic auth → should immediately failover to Ollama.

```bash
# Set invalid API key
ANTHROPIC_API_KEY="invalid" openclaw agent --message "test"
```

**Expected:** Fails over to Ollama immediately.  
**If this works:** Rate limit handling is different from auth failure handling.

### Test 2: Check Current Session State
```bash
cat ~/.openclaw/agents/main/sessions/sessions.json | jq '.sessions'
```

**Look for:** Any model/provider locking in session.

### Test 3: Monitor Logs During Rate Limit
Next time you hit limits:
```bash
tail -f ~/.openclaw/logs/gateway.err.log
```

**Look for:**
- The exact Anthropic error message
- Whether FailoverError is mentioned
- Whether Ollama is attempted
- Where the process stops

### Test 4: Manual Model Switch
When it stops responding:
```bash
/model ollama/llama3.1:8b
```

**If this works:** Session is just stuck on Anthropic, not broken.

---

## Potential Fixes

### Fix 1: Enable More Verbose Failover Logging
Check if there's a config option:
```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": ["ollama/llama3.1:8b"],
        "failover": {
          "logVerbose": true,
          "retryOnRateLimit": true
        }
      }
    }
  }
}
```

### Fix 2: Clear Auth Cooldown on Fallback
If cooldown is the issue, force it to try Ollama anyway:
```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": ["ollama/llama3.1:8b"],
        "ignoreCooldown": true
      }
    }
  }
}
```

### Fix 3: Session-Level Fallback
Allow mid-session model switches:
```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": ["ollama/llama3.1:8b"],
        "allowMidSessionSwitch": true
      }
    }
  }
}
```

### Fix 4: Gateway Restart on Rate Limit
Nuclear option - restart gateway to clear state:
```bash
# In gateway config
"failover": {
  "restartOnRateLimit": true
}
```

---

## What I'll Do Next

1. **Check if any of those config options exist** in the schema
2. **Test manual model switch** when it stops (to see if it's stuck)
3. **Add logging** to see exactly where the failure happens
4. **Potentially patch** the fallback logic if needed

---

## Expected Behavior After Fix

**When Anthropic rate limits:**
1. OpenClaw detects 429 error
2. Converts to FailoverError with reason "rate_limit"
3. runWithModelFallback catches it
4. Logs attempt: "anthropic/claude-sonnet-4-5 failed (rate_limit)"
5. Continues to next candidate: ollama/llama3.1:8b
6. Runs with Ollama successfully
7. **You see a response from me** (maybe slightly lower quality)
8. **Session memory is preserved**
9. Conversation continues seamlessly

**After Anthropic cooldown ends:**
- Next NEW conversation could use Anthropic again
- OR manually switch back with `/model anthropic/claude-sonnet-4-5`

---

## Ready to Test

Want me to:
1. Try the diagnostic tests above?
2. Check for additional config options?
3. Enable verbose logging and catch the next failure?

Just say go. 🔧

---

**Update 2026-02-01:** See **FALLBACK_FIX_2026-02-01.md** for:
- Verified: Ollama `/v1/chat/completions` works; config and fallback path are correct.
- Most likely cause: Anthropic rate-limit error isn’t recognized (no 429 or matching message), so it’s never coerced to FailoverError and Ollama is never tried.
- Diagnostic: Run `./test_fallback.sh` (or `ANTHROPIC_API_KEY=invalid openclaw agent --message "Reply with only: FALLBACK_OK" --timeout 45`) — if you get a reply, fallback works and the issue is rate-limit error format.
