# Changelog

All notable changes to biible.net.

## [Unreleased] - 8 Production Improvements

### 🔴 Critical Fixes

#### Rate Limiting (Redis-based)
- **Before:** Broken in-memory Map that didn't work on Vercel serverless
- **After:** Redis-based rate limiting with @upstash/redis
- **Impact:** Actually prevents abuse now
- **Setup:** Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to Vercel env vars

#### Input Sanitization
- **Added:** 260-line sanitization module (`lib/sanitize.ts`)
- **Protection:** Prompt injection (system:, act as, ignore previous)
- **Cleaning:** Unicode normalization, null byte removal, whitespace collapsing
- **Limits:** 2000 character max, conversation history sanitization
- **Impact:** Prevents malicious users from manipulating AI responses

### 🟡 High Impact

#### Next.js Optimization
- **Compression:** Gzip + Brotli enabled
- **Images:** WebP/AVIF formats with device sizes
- **Caching:** 1-year cache headers for static assets
- **Security Headers:** X-Frame-Options, X-Content-Type-Options, etc.
- **Result:** Faster loads, better security scores

#### Standardized API Errors
- **Created:** `lib/api-error.ts` (260 lines)
- **Features:** 10 error codes, safe error messages (no data leakage), request IDs
- **Headers:** Rate limit info on 429 responses (Retry-After, X-RateLimit-Remaining)
- **Impact:** Consistent error handling, better debugging

### 🟢 Medium Impact

#### Environment Validation
- **Created:** `lib/env.ts` with Zod schema
- **Behavior:** Fails fast on startup with clear error messages
- **Checks:** All required env vars present and valid
- **Impact:** No more runtime crashes from missing config

#### Documentation Organization
- **Before:** 91 markdown files cluttering root directory
- **After:** 4 key files in root, rest organized in `docs/`
- **Structure:**
  - `docs/ai/` - AI prompts and best practices
  - `docs/archive/` - Historical docs
  - `docs/deployment/` - Deployment guides
  - `docs/setup/` - Setup instructions
- **Impact:** Cleaner repo, easier navigation

#### Test Suite
- **Framework:** Jest with TypeScript support
- **Coverage:** 46 tests across 3 modules
  - `sanitize.test.ts` (13 tests) - Input validation
  - `rate-limit.test.ts` (7 tests) - Rate limiting
  - `api-error.test.ts` (26 tests) - Error handling
- **Scripts:** `npm test`, `npm run test:watch`, `npm run test:coverage`
- **Impact:** Catch regressions, enable CI/CD

#### Bundle Analyzer
- **Added:** @next/bundle-analyzer
- **Usage:** `npm run analyze`
- **Output:** Interactive bundle visualization
- **Impact:** Identify bloat, optimize performance

### Stats

- **Files changed:** 25+
- **Lines added:** ~4,500
- **Breaking changes:** 0
- **Tests passing:** 46/46

### Deployment Required

To deploy these changes:

1. Apply the patch: `git apply biible-improvements.patch`
2. Install dependencies: `npm install`
3. Add Upstash Redis env vars to Vercel
4. Run tests: `npm test`
5. Deploy: `vercel --prod`

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## Security & Stability Fixes (Post-Review)

### Fixed: Memory Leak in Request Queue
- **Issue:** Timeout IDs not cleared, causing unbounded memory growth
- **Fix:** Store timeout IDs and clear them when processing starts
- **File:** `lib/request-queue.ts`

### Fixed: Streaming Abort Handling  
- **Issue:** Client disconnects caused unhandled promise rejections
- **Fix:** Add abort signal listener and check isAborted flag in stream loop
- **File:** `app/api/ask/route.ts`

### Fixed: Rate Limit Race Condition
- **Issue:** Cleanup function had no locking, potential race conditions
- **Fix:** Add isCleaningUp flag to prevent concurrent cleanup
- **File:** `lib/rate-limit.ts`
