# Technical Debt Review

**Date:** 2026-02-03  
**Projects Reviewed:** biible-audit, x402-ecosystem, x402-gateway  
**Scope:** TODO/FIXME comments, hardcoded values, duplicate code, security issues

---

## CRITICAL SEVERITY

### 1. Hardcoded Revenue Wallet Address
**File:** `x402-gateway/server.js` (line 7)  
**Issue:** Gateway wallet address is hardcoded:
```javascript
const GATEWAY_WALLET = '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055';
```
**Impact:** Cannot change wallet without code deployment. No environment-based configuration.  
**Fix:** Move to environment variable: `process.env.GATEWAY_WALLET`

### 2. Hardcoded USDC Token Contract Address
**File:** `x402-gateway/server.js` (lines 144-145, 210-211)  
**Issue:** USDC contract address hardcoded for Base network:
```javascript
requiredToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
```
**Impact:** Cannot support other tokens or networks without code changes.  
**Fix:** Move to environment variable or config file.

### 3. Hardcoded Gateway Fee Percentage
**Files:** 
- `x402-gateway/server.js` (line 6): `const GATEWAY_FEE_PERCENT = 5;`
- `x402-gateway/client-sdk.js` (line 184): `const gatewayFee = basePrice * 0.05;`

**Issue:** Fee percentage defined in multiple places, hardcoded.  
**Impact:** Fee changes require code updates in multiple locations; SDK may show wrong pricing.  
**Fix:** Centralize in environment variable or fetch from gateway config endpoint.

### 4. No Authentication on Gateway Payment Endpoints
**File:** `x402-gateway/server.js`  
**Issue:** `/gateway/:serviceId/*` endpoints return 402 payment requirements without any authentication or rate limiting.  
**Impact:** Open to abuse/spam; could be used to enumerate services or generate payment requests without intent to pay.  
**Fix:** Add API key or basic rate limiting middleware.

---

## HIGH SEVERITY

### 5. Unimplemented Payment Signing (TODO)
**File:** `x402-gateway/client-sdk.js` (line 222)  
```javascript
// TODO: Implement actual payment signing when wallet integration is ready
```
**Issue:** SDK has stub for payment signing but no actual implementation.  
**Impact:** SDK cannot actually process payments; developers must implement themselves.  
**Fix:** Implement wallet integration or remove TODO and document as expected behavior.

### 6. Duplicate Authentication Logic
**Files:** 
- `biible-audit/app/api/twitter/post/route.ts` (lines 20-26)
- `biible-audit/app/api/twitter/engage/route.ts` (lines 18-24)
- `biible-audit/app/api/public-pages/route.ts` (lines 29-35, 128-134)
- `biible-audit/app/api/public-pages/[id]/route.ts` (lines 29-35, 73-79)

**Pattern repeated 5+ times:**
```typescript
const authHeader = request.headers.get('authorization')
const expectedToken = process.env.ADMIN_TOKEN || process.env.INTERNAL_API_TOKEN
if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Issue:** Same auth logic copy-pasted across routes.  
**Impact:** Maintenance burden; easy to miss updating all locations; inconsistent error messages possible.  
**Fix:** Extract to shared middleware or helper function in `lib/auth.ts`.

### 7. Hardcoded Fallback URLs
**Files:** Multiple files use `https://biible.net` as fallback:
- `biible-audit/app/robots.ts`
- `biible-audit/app/sitemap.ts`
- `biible-audit/app/api/public-pages/route.ts`
- `biible-audit/app/thread/[id]/page.tsx`
- `biible-audit/app/p/[slug]/page.tsx`

**Issue:** Production URL hardcoded as fallback when env var is missing.  
**Impact:** Local development or staging could inadvertently generate production URLs.  
**Fix:** Use localhost fallback or throw error when `NEXT_PUBLIC_SITE_URL` is not set in production.

### 8. Console Logging in API Routes (114 instances)
**Files:** `biible-audit/app/api/**/*.ts`  
**Issue:** Extensive `console.log` and `console.error` throughout API routes.  
**Impact:** Log noise in production; potential PII leakage; performance overhead.  
**Fix:** Replace with structured logging library (pino/winston) with log levels.

### 9. Temporary Tunnel URLs in services.json
**File:** `x402-gateway/services.json`  
**Issue:** Service URLs point to temporary Cloudflare tunnels:
```json
"url": "https://fundamentals-scuba-prerequisite-bye.trycloudflare.com"
```
**Impact:** Services will break when tunnels expire.  
**Fix:** Deploy to permanent hosting and update URLs; or make services.json dynamically updatable via API.

---

## MEDIUM SEVERITY

### 10. Unimplemented API Integrations (TODOs)
**Files:**
- `biible-audit/scripts/forum-engagement.ts` (line 79): Forum API integration stub
- `biible-audit/scripts/track-public-pages.ts` (line 58): Google Analytics API integration stub
- `biible-audit/scripts/search-console-monitor.ts` (line 58): Search Console API integration stub

**Issue:** Scripts exist but don't actually integrate with external APIs.  
**Impact:** Manual workarounds needed; scripts don't provide full value.  
**Fix:** Either implement integrations or remove TODOs and document manual process.

### 11. No Rate Limiting on x402 Gateway
**File:** `x402-gateway/server.js`  
**Issue:** No rate limiting middleware on any endpoints.  
**Impact:** Vulnerable to DDoS or brute force enumeration.  
**Fix:** Add express-rate-limit or similar middleware.

### 12. In-Memory Rate Limit Cleanup
**File:** `biible-audit/lib/rate-limit.ts` (lines 72-80)  
**Issue:** Memory store cleanup only runs every 5 minutes; could accumulate entries.  
**Impact:** Memory leak potential in high-traffic scenarios without Redis.  
**Fix:** Consider TTL-based cleanup or more frequent sweeps.

### 13. Hardcoded Default API URL
**File:** `biible-audit/lib/env.ts` (line 10)  
**Issue:** Default AI API URL points to localhost Ollama:
```typescript
AI_API_URL: z.string().url().optional().default('http://localhost:11434/api/chat')
```
**Impact:** Could accidentally try to connect to non-existent local server in production.  
**Fix:** No default in production; require explicit configuration.

---

## LOW SEVERITY

### 14. Hardcoded CORS in Gateway
**File:** `x402-gateway/server.js` (line 14)  
**Issue:** `app.use(cors())` enables all origins without restriction.  
**Impact:** Minimal for a public API, but could be more restrictive.  
**Fix:** Configure CORS with allowed origins from environment.

### 15. Hardcoded USDC Decimals Assumption
**File:** `x402-gateway/server.js` (line 147)  
```javascript
requiredAmount: Math.floor(totalPrice * 1000000).toString(), // USDC has 6 decimals
```
**Issue:** Assumes USDC (6 decimals); comment acknowledges this is hardcoded.  
**Impact:** Cannot support tokens with different decimals.  
**Fix:** Make decimals configurable per token.

### 16. JSON Stringify/Parse for Arrays in Prisma
**Files:** 
- `biible-audit/app/api/public-pages/route.ts` (lines 88, 106)
- `biible-audit/app/api/public-pages/[id]/route.ts` (lines 65, 124, 138)

**Issue:** Arrays stored as JSON strings in database:
```typescript
verseRefs: JSON.parse(page.verseRefs || '[]'),
tags: JSON.parse(page.tags || '[]'),
```
**Impact:** Cannot query by array contents at database level; potential parsing errors.  
**Fix:** Use Prisma's native JSON type or separate relation tables.

### 17. Hardcoded Port in Gateway
**File:** `x402-gateway/server.js` (line 9)  
**Issue:** `const PORT = process.env.PORT || 3003;`  
**Impact:** Minimal, but 3003 could conflict.  
**Fix:** Consider making default port configurable or using random port in development.

---

## SUMMARY BY CATEGORY

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Hardcoded Values | 3 | 2 | 1 | 3 | 9 |
| Missing Implementation | 0 | 1 | 3 | 0 | 4 |
| Duplicate Code | 0 | 1 | 0 | 0 | 1 |
| Security Issues | 1 | 1 | 1 | 0 | 3 |
| Logging/Monitoring | 0 | 1 | 0 | 0 | 1 |
| Data Storage | 0 | 0 | 0 | 1 | 1 |
| **TOTAL** | **4** | **6** | **5** | **4** | **19** |

---

## RECOMMENDED PRIORITY ORDER

### Immediate (This Sprint)
1. Move hardcoded wallet and token addresses to environment variables
2. Centralize gateway fee configuration
3. Add authentication to gateway endpoints

### Short-term (Next 2 Weeks)
4. Extract duplicate auth logic to middleware
5. Fix hardcoded fallback URLs
6. Replace console.log with structured logging
7. Add rate limiting to gateway

### Medium-term (Next Month)
8. Update services.json with permanent URLs
9. Implement or remove TODO stubs
10. Fix Prisma JSON stringification pattern

### Backlog
11. CORS configuration
12. Token decimal abstraction
13. Port configuration

---

## NOTES

- All findings focus on actual problems, not stylistic preferences
- Several TODOs are for planned features (forum API, Search Console) - not critical but should be tracked
- The x402-gateway is a prototype/MVP - many hardcoded values are expected but should be made configurable before production use
- biible-audit has good env validation in `lib/env.ts` - similar pattern should be applied to gateway
