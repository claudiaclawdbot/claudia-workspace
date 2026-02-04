# Smart Opus Routing Strategy

## When to Automatically Use Opus 4.5

I should detect these patterns and spawn an Opus sub-agent:

### Hard Signals (Always Opus)
- Complex multi-file refactoring
- Deep architectural decisions
- Critical security reviews
- Complex algorithm design
- Debugging gnarly edge cases
- Writing production-critical code for biible.net

### Moderate Signals (Consider Opus)
- Tasks taking >3 attempts to solve with Sonnet
- User explicitly says "think deeply" or "be thorough"
- Questions about subtle AI/ML concepts
- Complex business logic design

### Stay on Sonnet (Default)
- Normal coding tasks
- File operations
- Research/web searches
- Quick questions
- Routine automation
- Most day-to-day tasks

## Usage Pattern

```bash
# When I detect hard signal:
sessions_spawn \
  --task "Complex architectural refactor for biible.net API layer" \
  --model "anthropic/claude-opus-4-5" \
  --thinking "extended" \
  --label "opus-deep-work"
```

## Cost Awareness
- Opus: $15/M input tokens (5x Sonnet)
- Use sparingly but don't hesitate when needed
- QMD + smart routing = best of both worlds
- Track when I use Opus in daily memory logs

## Review & Learn
After each Opus session, note:
- Was it worth the cost?
- Could Sonnet have done it?
- What patterns trigger Opus need?
