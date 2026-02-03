# 🔧 Fallback & Cost Optimization Research

*Created: 2026-02-01 08:00 EST*  
*Issue: Need to verify Anthropic → Ollama fallback works when hitting rate limits*

---

## Current Configuration

### Model Setup
```
Primary: anthropic/claude-sonnet-4-5
Fallback: ollama/llama3.1:8b
```

### Status
- ✅ Ollama is running and responding
- ✅ llama3.1:8b model loaded (4.9 GB)
- ✅ OpenClaw sees both models (`openclaw models list`)
- ✅ Ollama native API works: `curl http://localhost:11434/api/generate`
- ❓ OpenAI-compatible endpoint (/v1/chat/completions) - didn't respond in timeout

### Config Location
`~/.openclaw/openclaw.json`

```json
"agents": {
  "defaults": {
    "model": {
      "primary": "anthropic/claude-sonnet-4-5",
      "fallbacks": ["ollama/llama3.1:8b"]
    }
  }
}
```

---

## The Problem

**Ryan's observation:** "the fallback to ollama isn't working when we hit usage limit on anthropic now still"

**Potential issues:**
1. Fallback might not trigger on rate limits (only on hard errors)
2. OpenAI-compatible endpoint might not be working properly
3. Fallback logic might need specific error types to trigger

**From docs:** OpenClaw has `FailoverError` detection for rate limits, but unclear if it actually triggers fallback vs just retrying.

---

## Better Solution: OpenRouter Auto Router

### What Twitter Research Found

From @OpenRouterAI:
> "🦞 Important tip for @openclaw users: you should not be sending simple heartbeat requests to Opus! Use the Auto Router to automatically send them to very cheap (even free!) models."

From @citedycom:
> "setup @openclaw like /model auto - Auto Router (OpenRouter) - default"

### How It Works
- **Intelligent routing** (not just fallback)
- Simple tasks → cheap/free models
- Complex tasks → premium models
- Saves money BEFORE hitting limits
- Automatic, no manual intervention

### Recommended Models (via OpenRouter)
- `auto` - Auto Router (intelligent routing)
- `kimi` - Kimi K2.5
- `gemini` - Gemini Pro 1.5
- `deepseek` - DeepSeek Chat
- `fast` - GLM-4.7 (Cerebras - "imba fast")

**Cost comparison:**
- Anthropic Sonnet: $3/M tokens
- Auto Router free models: $0/M tokens
- Heartbeats could be 100% free

---

## Investigation Results

### Ollama Status
```bash
$ ollama list
NAME           ID              SIZE      MODIFIED     
llama3:8b      365c0bd3c000    4.7 GB    14 hours ago    
llama3.1:8b    46e0c10c039e    4.9 GB    15 hours ago
```

### OpenClaw Models
```bash
$ openclaw models list
Model                          Input      Ctx    Local Auth  Tags
anthropic/claude-sonnet-4-5    text+img   195k   no    yes   default
ollama/llama3.1:8b             text       128k   yes   yes   fallback#1
```

### Ollama API Test
```bash
$ curl -s http://localhost:11434/api/generate \
  -d '{"model": "llama3.1:8b", "prompt": "test", "stream": false}'
  
Response: "It looks like you'd like to test the chat. How can I assist you today?"
```
✅ **Working**

### OpenAI-Compatible Endpoint
```bash
$ curl http://localhost:11434/v1/chat/completions ...
```
❌ **Timeout** (killed after 10s)

**Diagnosis:** Ollama's OpenAI-compatible endpoint might not be properly configured or enabled.

---

## Recommended Actions

### Option 1: Fix Ollama Fallback (Local, Free)
**Pros:**
- No external dependencies
- 100% private
- Already installed

**Cons:**
- Need to debug why OpenAI-compatible endpoint isn't responding
- Manual fallback (not intelligent routing)
- Still burns Anthropic credits before falling back

**Steps:**
1. Check Ollama configuration for OpenAI-compatible API
2. Test fallback trigger manually
3. Verify it actually switches on rate limit errors

### Option 2: OpenRouter Auto Router (Recommended)
**Pros:**
- Intelligent routing BEFORE hitting limits
- Recommended by OpenRouter team specifically for OpenClaw
- Mix of free and cheap models
- Better cost optimization
- Used by other successful OpenClaw users

**Cons:**
- Requires OpenRouter account/API key
- External dependency
- Still costs money for complex tasks (but WAY less)

**Steps:**
1. Sign up for OpenRouter
2. Get API key
3. Configure OpenClaw: `openclaw models set openrouter/auto`
4. Set as default for heartbeats and simple tasks
5. Keep Anthropic Sonnet for complex work

### Option 3: Hybrid Approach (Best of Both)
**Setup:**
- Default: OpenRouter Auto Router (cheap/free for most tasks)
- Fallback 1: Ollama llama3.1:8b (if OpenRouter fails)
- Manual override: Anthropic Sonnet for critical work

**Benefits:**
- Maximum cost savings
- Maximum reliability
- Maximum privacy (local fallback)
- Intelligent routing

---

## Cost Analysis

### Current Usage Pattern
- Heartbeats every 1 hour
- Research sessions (like today): ~60k tokens
- Average session: ~20-40k tokens
- Heavy exploration: 100k+ tokens

### Current Cost (All Anthropic Sonnet)
- $3/M tokens input
- ~100k tokens/day = $0.30/day = $9/month

### With Auto Router
- Heartbeats: $0 (free models)
- Simple tasks: $0-0.10/day
- Complex tasks only: Maybe $2-3/month

**Savings: ~60-70%**

### With Ollama Fallback Only
- Still burns Anthropic until limit hit
- Then falls back to local (free)
- But might hit rate limits frequently
- Savings: Unclear, depends on when fallback triggers

---

## My Recommendation

**Go with OpenRouter Auto Router as primary, keep Ollama as backup.**

**Why:**
1. Proven solution (Twitter users recommend it specifically for OpenClaw)
2. Intelligent routing saves money BEFORE problems
3. You keep local Ollama as ultimate fallback
4. I can be more autonomous without worrying about burning your credits
5. Better experience - no sudden quality drops when hitting limits

**Setup would be:**
```
Primary: openrouter/auto (intelligent routing to free/cheap)
Fallback 1: ollama/llama3.1:8b (local, free)
Override: anthropic/claude-sonnet-4-5 (manual for critical work)
```

---

## Next Steps

**If you want me to proceed:**

1. **Quick fix:** I can test/debug the Ollama OpenAI endpoint issue
2. **Better fix:** You give me an OpenRouter API key and I set it up
3. **Hybrid:** Both of the above

**If you want to handle it yourself:**
- I documented everything above
- Happy to assist with either approach

**Current status:**
- Ollama works via native API
- Fallback configured but untested for rate limits
- OpenRouter Auto Router is the recommended solution

---

**What do you want me to do?** 🌀
