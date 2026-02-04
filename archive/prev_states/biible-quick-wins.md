# Biible.net Quick Wins - Codebase Audit

This document contains quick wins identified in the biible-audit codebase. Each issue can be fixed in <30 minutes.

---

## 🔴 HIGH PRIORITY

### 1. Memory Leak in Request Queue (lib/request-queue.ts)
**Issue:** The request queue stores timeout IDs but doesn't clear them when requests complete normally. Also, memory store grows unbounded during high traffic.

**Location:** `lib/request-queue.ts`, lines 25-35

**Current Code:**
```typescript
// Timeout after specified time
setTimeout(() => {
  if (this.queue.find((r) => r.id === id)) {
    this.queue = this.queue.filter((r) => r.id !== id)
    reject(new Error('Request timeout: Queue position exceeded maximum wait time'))
  }
}, this.timeout)
```

**Suggested Fix:**
```typescript
// Store timeout ID so it can be cleared
const timeoutId = setTimeout(() => {
  if (this.queue.find((r) => r.id === id)) {
    this.queue = this.queue.filter((r) => r.id !== id)
    reject(new Error('Request timeout'))
  }
}, this.timeout)

// In processQueue, clear the timeout when processing starts
const request = this.queue.shift()
if (!request) return
clearTimeout(timeoutId) // Add this line
```

**Time Estimate:** 15 minutes

---

### 2. Missing Error Handler for Streaming Response (app/api/ask/route.ts)
**Issue:** The streaming response doesn't handle cases where the client disconnects mid-stream, causing unhandled promise rejections.

**Location:** `app/api/ask/route.ts`, lines 85-115 (stream creation)

**Suggested Fix:** Add abort signal handling:
```typescript
const stream = new ReadableStream({
  async start(controller) {
    const encoder = new TextEncoder()
    let fullAnswer = ''
    let isAborted = false

    // Handle client disconnect
    request.signal.addEventListener('abort', () => {
      isAborted = true
      controller.close()
    })

    try {
      for await (const chunk of callAIStream(messages)) {
        if (isAborted) break
        fullAnswer += chunk
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}
\n`))
      }
      // ... rest of logic
```

**Time Estimate:** 10 minutes

---

### 3. Rate Limit Cleanup Race Condition (lib/rate-limit.ts)
**Issue:** The `cleanupMemoryStore` function runs on a timer but doesn't lock during cleanup, causing potential race conditions.

**Location:** `lib/rate-limit.ts`, lines 68-77

**Suggested Fix:** Add a simple locking mechanism:
```typescript
let isCleaning = false

function cleanupMemoryStore(): void {
  if (isCleaning) return
  isCleaning = true
  
  try {
    const now = Date.now()
    if (now - lastCleanup > CLEANUP_INTERVAL) {
      lastCleanup = now
      for (const [key, entry] of memoryStore) {
        if (now > entry.resetTime) {
          memoryStore.delete(key)
        }
      }
    }
  } finally {
    isCleaning = false
  }
}
```

**Time Estimate:** 10 minutes

---

## 🟡 MEDIUM PRIORITY

### 4. Verse Display Excessive Re-renders (components/verse-display.tsx)
**Issue:** The component logs excessively in production (console.log on every render) and doesn't memoize the loadVerses callback properly.

**Location:** `components/verse-display.tsx`, lines 67-70

**Current:** Multiple `console.log` statements that run on every render

**Suggested Fix:**
1. Remove or wrap debug logs in development-only checks
2. Memoize the verse loading with proper dependencies

```typescript
// Replace console.log with:
const DEBUG = process.env.NODE_ENV === 'development'
if (DEBUG) console.log('[VerseDisplay] ...')
```

**Time Estimate:** 15 minutes

---

### 5. Prisma Connection Not Properly Closed (lib/prisma.ts)
**Issue:** The lazy initialization pattern doesn't properly handle connection cleanup on process exit, potentially leaving connections open.

**Location:** `lib/prisma.ts`, lines 85-95

**Suggested Fix:** Add graceful shutdown handler:
```typescript
// Add at end of file
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    if (prismaInstance) {
      await prismaInstance.$disconnect()
    }
  })
}
```

**Time Estimate:** 10 minutes

---

### 6. Twitter Client Missing Timeout (lib/twitter-client.ts)
**Issue:** Twitter API calls have no timeout, causing requests to hang indefinitely if Twitter is slow/unresponsive.

**Location:** `lib/twitter-client.ts`, all API methods

**Suggested Fix:** Add AbortController with timeout:
```typescript
export async function postTweet(text: string): Promise<{ id: string; text: string }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout
  
  try {
    const client = getTwitterClient()
    const rwClient = client.readWrite

    const tweet = await rwClient.v2.tweet({ text }, { signal: controller.signal })
    // ...
  } finally {
    clearTimeout(timeout)
  }
}
```

**Time Estimate:** 20 minutes (multiple methods)

---

### 7. Missing Request Size Limit (app/api/ask/route.ts)
**Issue:** No limit on request body size could allow DoS via large payloads.

**Location:** `app/api/ask/route.ts`

**Suggested Fix:** Add body size validation early in the handler:
```typescript
const contentLength = parseInt(request.headers.get('content-length') || '0')
if (contentLength > 100000) { // 100KB limit
  throw new APIError('Request body too large', 'VALIDATION_ERROR')
}
```

**Time Estimate:** 5 minutes

---

### 8. Analytics Track Endpoint Missing IP Validation (app/api/track/route.ts)
**Issue:** The track endpoint accepts any path without validating it's a valid site path, allowing arbitrary data injection.

**Location:** `app/api/track/route.ts`

**Suggested Fix:** Add path validation:
```typescript
const VALID_PATHS = /^\/[a-zA-Z0-9\-_/]*$/

if (!VALID_PATHS.test(path) || path.includes('..')) {
  return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
}
```

**Time Estimate:** 10 minutes

---

### 9. Global Error Handler Missing Error Reporting (app/global-error.tsx)
**Issue:** Global errors are only logged to console but not sent to any error tracking service.

**Location:** `app/global-error.tsx`

**Suggested Fix:** Add error reporting (even if just to console.error with more context):
```typescript
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to console with full context
    console.error('Global error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    })
  }, [error])
  // ...
}
```

**Time Estimate:** 10 minutes

---

### 10. PII Scrubber Missing IPv4/IPv6 Patterns (lib/pii-scrubber.ts)
**Issue:** The PII detector misses IP addresses which could be logged accidentally.

**Location:** `lib/pii-scrubber.ts`

**Suggested Fix:** Add IP address detection:
```typescript
// IPv4 pattern
const ipv4Pattern = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/
if (ipv4Pattern.test(text)) {
  types.push('ipv4')
}

// IPv6 pattern (simplified)
const ipv6Pattern = /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/
if (ipv6Pattern.test(text)) {
  types.push('ipv6')
}
```

**Time Estimate:** 15 minutes

---

### 11. Metrics Collector Missing Memory Limits (lib/metrics.ts)
**Issue:** Metrics arrays can grow unbounded if `maxMetrics` is not enforced during rapid bursts.

**Location:** `lib/metrics.ts`, lines 20-21

**Current:** Check happens after push, could temporarily exceed limit

**Suggested Fix:** Enforce limit more strictly:
```typescript
// Pre-allocate or enforce before push
if (this.requestMetrics.length >= this.maxMetrics) {
  this.requestMetrics = this.requestMetrics.slice(-Math.floor(this.maxMetrics * 0.9))
}
this.requestMetrics.push(metrics)
```

**Time Estimate:** 10 minutes

---

### 12. Bible API Fetch Missing Retry Logic (lib/verse-fetcher.ts)
**Issue:** External Bible API calls fail immediately on network errors without retry.

**Location:** `lib/verse-fetcher.ts`, lines 28-50

**Suggested Fix:** Add simple retry with exponential backoff:
```typescript
export async function fetchVerse(
  reference: VerseReference,
  translation: string = 'kjv',
  retries: number = 2
): Promise<VerseText | null> {
  try {
    // ... existing fetch code
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.message.includes('fetch')) {
      await new Promise(r => setTimeout(r, 1000 * (3 - retries)))
      return fetchVerse(reference, translation, retries - 1)
    }
    console.error('Error fetching verse:', error)
    return null
  }
}
```

**Time Estimate:** 15 minutes

---

### 13. Share Thread Route Missing Input Validation on Message Size (app/api/share-thread/route.ts)
**Issue:** Messages array could be extremely large, causing memory issues when stringified.

**Location:** `app/api/share-thread/route.ts`, lines 15-23

**Suggested Fix:** Add size validation to schema:
```typescript
const shareThreadSchema = z.object({
  title: z.string().min(1).max(200),
  messages: z.array(
    z.object({
      id: z.string(),
      question: z.string().max(5000),
      answer: z.string().max(10000),
      timestamp: z.number(),
    })
  ).max(50), // Limit to 50 messages max
})
```

**Time Estimate:** 10 minutes

---

### 14. LocalStorage Not Validated Before Parsing (components/home-page.tsx)
**Issue:** localStorage data is parsed without try-catch in some paths, and no schema validation.

**Location:** `components/home-page.tsx`, lines 90-100

**Current Code:** Already has try-catch but no validation

**Suggested Fix:** Add Zod validation after parsing:
```typescript
const threadSchema = z.array(z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(z.object({
    id: z.string(),
    question: z.string(),
    answer: z.string(),
    timestamp: z.number(),
  })),
  createdAt: z.number(),
  updatedAt: z.number(),
}))

// Then validate:
const parsed = threadSchema.safeParse(JSON.parse(saved))
if (parsed.success) {
  setThreads(parsed.data)
}
```

**Time Estimate:** 20 minutes

---

### 15. Middleware Missing Security Headers (middleware.ts)
**Issue:** Security headers from next.config.ts don't apply to all routes consistently. Middleware should add them.

**Location:** `middleware.ts`

**Suggested Fix:** Add security headers in middleware:
```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  return response
}
```

**Time Estimate:** 10 minutes

---

## 🟢 LOW PRIORITY / PERFORMANCE

### 16. Streaming Text Missing Sanitization (components/streaming-text.tsx)
**Issue:** Text content is escaped but could potentially still contain malicious content in edge cases.

**Suggested Fix:** Already escapes HTML, but could add DOMPurify for extra safety:
```typescript
// Add DOMPurify or enhance escaping
const escaped = text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')
```

**Time Estimate:** 5 minutes

---

### 17. Daily Metrics Upsert Race Condition (lib/analytics.ts)
**Issue:** Multiple concurrent requests could create duplicate daily metrics entries.

**Location:** `lib/analytics.ts`, lines 110-125

**Suggested Fix:** Use database-level upsert or add transaction:
```typescript
// Prisma's upsert is atomic, but we should handle errors
await prisma.dailyMetrics.upsert({
  where: { date: today },
  update: { questionsAsked: { increment: 1 } },
  create: { date: today, questionsAsked: 1, uniqueVisitors: 0, pageViews: 0 },
}).catch(() => {
  // Silently fail for analytics
})
```

**Time Estimate:** 10 minutes

---

### 18. Generate Blog Post Missing Content Validation (app/api/generate-blog-post/route.ts)
**Issue:** Generated blog post content is not validated before saving, could contain malformed data.

**Suggested Fix:** Add validation before save:
```typescript
if (!blogPost.title || blogPost.title.length > 200) {
  throw new Error('Invalid blog post title generated')
}
if (!blogPost.content || blogPost.content.length < 100) {
  throw new Error('Blog post content too short')
}
```

**Time Estimate:** 10 minutes

---

### 19. Verse Parser Regex Missing Case-Insensitive Books (lib/verse-parser.ts)
**Issue:** Book names must match exact case in some edge cases.

**Current:** Already handles lowercase via `toLowerCase()`, but regex pattern doesn't use `i` flag for book name matching.

**Time Estimate:** Already handled, no fix needed

---

### 20. Twitter Post API Missing Tweet Length Pre-validation (app/api/twitter/post/route.ts)
**Issue:** Tweet text is not pre-validated before calling Twitter API, wasting an API call if invalid.

**Suggested Fix:** Add validation before posting:
```typescript
if (tweetText.length > 280) {
  return NextResponse.json(
    { error: 'Tweet exceeds 280 characters' },
    { status: 400 }
  )
}
if (tweetText.length === 0) {
  return NextResponse.json(
    { error: 'Tweet cannot be empty' },
    { status: 400 }
  )
}
```

**Time Estimate:** 5 minutes

---

## Summary

| Priority | Count | Est. Total Time |
|----------|-------|-----------------|
| 🔴 High  | 3     | 35 minutes      |
| 🟡 Medium| 12    | 165 minutes     |
| 🟢 Low   | 5     | 40 minutes      |
| **Total**| **20**| **~4 hours**    |

**Recommended Order:**
1. Fix memory leak in request queue (#1) - affects stability
2. Add request size limit (#7) - security
3. Fix streaming abort handling (#2) - stability
4. Add timeouts to Twitter client (#6) - prevents hangs
5. Add input validation to share thread (#13) - security
6. Fix remaining medium priority items

All fixes are backward-compatible and safe to deploy individually.
