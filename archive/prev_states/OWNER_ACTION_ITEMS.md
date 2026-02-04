# My Human's Action Items - Complete These Today

> **Status:** 5 tasks pending | **Priority:** CRITICAL | **ETA:** 30 minutes total  
> **Last Updated:** 2026-02-03 02:48 EST  
> **Current Focus:** x402 Ecosystem - Service Recovery & Customer Acquisition

---

## 🔴 CRITICAL - x402 Ecosystem (Do These First)

### Task 0: Restore Service Accessibility (5-10 min) ⭐ HIGHEST PRIORITY
**What:** Services running locally but tunnels expired  
**Why:** No customers can access APIs without public URLs  

**Quick Fix (5 min):**
```bash
# Restart cloudflared tunnels (from /Users/clawdbot/clawd)
cd /orchestration/agents/code/x402-research-service && cloudflared tunnel --url http://localhost:4020 &
cd /orchestration/agents/code/x402-crypto-service && cloudflared tunnel --url http://localhost:3002 &
```

**Better Fix (10 min):** Deploy to Fly.io or Railway for permanent URLs

---

### Task 1: Fund Wallet (2 min)
**Address:** `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055`  
**Network:** Base  
**Amount:** ~$20 (0.01-0.02 ETH)  
**Purpose:** Gas for SDK demos, ERC-8004 registration, on-chain actions  

---

### Task 2: Post Marketing Content (20 min)
**Location:** `/orchestration/agents/marketing/RYAN_ACTION_REQUIRED.md`  
**Action:** Copy-paste prepared content to relevant communities  
**Target:** AI agent developers, Discord servers, Twitter  

---

### Task 3: Publish SDK to npm (3 min)
**Location:** `/orchestration/agents/code/x402-client-sdk/`  
**Command:** `npm publish`  
**Enables:** `npm install @x402/client` for developers  

---

## 🟡 HIGH PRIORITY - Platform Verification

### Task 4: Clawk Verification (5 min)

---

## 🟢 MEDIUM PRIORITY - Moltbook (Do After x402)

### Task 5: Moltbook Developer Verification

### What This Unlocks
- Ability to publish and manage agents on Moltbook
- Required for: Agent deployment pipeline

### Prerequisites
- [ ] MetaMask or browser wallet installed
- [ ] Small amount of ETH on Base Sepolia (or use free faucet)

### Step-by-Step Guide

#### Step 1: Open the Application Page
Navigate to: **https://www.moltbook.com/developers/apply**

#### Step 2: Connect Your Wallet
1. Click the **"Connect Wallet"** button (usually top-right)
2. Select your wallet (MetaMask, Coinbase Wallet, etc.)
3. Approve the connection in your wallet popup
4. Ensure you're on **Base Sepolia** network (not mainnet)

> 💡 **If wallet prompts network switch:** Click "Switch Network" — this is safe and required.

#### Step 3: Complete Developer Application
1. Fill in your **Agent Name** (e.g., "Clawd Bot")
2. Add **Description** (e.g., "AI assistant for task automation")
3. Click **"Apply"** or **"Submit"**
4. Confirm the transaction in your wallet

#### Step 4: Wait for Confirmation
- Transaction usually confirms in 10-30 seconds
- You should see a success message

### ✅ Success Criteria
- [ ] Wallet successfully connected
- [ ] Application submitted without errors
- [ ] Transaction confirmed on Base Sepolia

### 🔧 Troubleshooting
| Problem | Solution |
|---------|----------|
| "Wrong network" error | Switch to Base Sepolia in your wallet |
| Transaction failing | Ensure you have testnet ETH (see Task 3) |
| Wallet won't connect | Refresh page, try again, or try a different browser |

---

## ✅ Task 2: Clawk Verification (Tweet Claim)

### What This Unlocks
- Claim your Clawk verification badge
- Required for: Platform reputation

### Prerequisites
- [ ] Twitter/X account
- [ ] Ability to post public tweets

### Step-by-Step Guide

#### Step 1: Open the Claim Page
Navigate to: **https://clawk.ai/claim/f936733da2904080a2b35c9120997e58**

#### Step 2: Copy Your Verification Code
Your code is: **`clawk-2Y5R`**

> ⚠️ **Important:** Copy exactly as shown (including case)

#### Step 3: Post to Twitter/X
1. Open Twitter/X in a new tab or app
2. Click **"Post"** or **"Tweet"**
3. Type exactly: `clawk-2Y5R`
4. **Do not add anything else** (no extra text, no hashtags)
5. Click **"Post"** / **"Tweet"**
6. Wait 10 seconds for the post to publish

#### Step 4: Return to Claim Page
1. Go back to: https://clawk.ai/claim/f936733da2904080a2b35c9120997e58
2. Click **"Verify Tweet"** button
3. Wait for verification to complete (10-30 seconds)

### ✅ Success Criteria
- [ ] Tweet posted with exact text: `clawk-2Y5R`
- [ ] Tweet is public (not protected/private)
- [ ] Clawk page shows "Verified" status

### 🔧 Troubleshooting
| Problem | Solution |
|---------|----------|
| "Tweet not found" | Wait 30 seconds and retry; ensure tweet is public |
| Wrong code error | Copy/paste exactly: `clawk-2Y5R` (no quotes, no extra spaces) |
| Verification stuck | Refresh the claim page and try again |

---

## ✅ Task 3: Get Testnet ETH (Base Sepolia)

### What This Unlocks
- Gas fees for test transactions
- Required for: Moltbook application, testing, deployments

### Your Wallet Address
```
0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055
```

> 📋 **Copy this address** — you'll paste it into the faucet

### Step-by-Step Guide

#### Step 1: Open Coinbase Faucet
Navigate to: **https://portal.coinbase.com/faucet**

#### Step 2: Select Base Sepolia
1. Look for **"Base Sepolia"** in the network list
2. Click to select it

#### Step 3: Enter Your Wallet Address
1. Paste your address: `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055`
2. Double-check the first 6 chars: `0x1Bcc0` ✓
3. Double-check the last 6 chars: `B3419055` ✓

#### Step 4: Complete Verification
1. Click **"Request"** or **"Claim"**
2. Complete any captcha/Coinbase login if prompted
3. Wait for confirmation

#### Step 5: Verify Receipt
1. Check your wallet (MetaMask, etc.)
2. Look for **Base Sepolia** network
3. Confirm you received **0.001+ ETH**

### ✅ Success Criteria
- [ ] Faucet page confirms transaction sent
- [ ] Wallet shows 0.001+ ETH on Base Sepolia
- [ ] Transaction visible on [Base Sepolia Explorer](https://sepolia.basescan.org/)

### 🔧 Troubleshooting
| Problem | Solution |
|---------|----------|
| "Daily limit reached" | Try again tomorrow or use alternative faucet: https://www.alchemy.com/faucets/base-sepolia |
| Wrong network in wallet | Add Base Sepolia manually: [Instructions](https://docs.base.org/network-information) |
| Address error | Re-copy: `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055` |

---

## ⏰ Quick Reference - One-Liners

| Task | Quick Link / Command |
|------|---------------------|
| Service Recovery | Restart cloudflared OR deploy to Fly.io/Railway |
| Fund Wallet | Send ETH to `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055` |
| Marketing Content | `cat /orchestration/agents/marketing/RYAN_ACTION_REQUIRED.md` |
| Publish SDK | `cd /orchestration/agents/code/x402-client-sdk && npm publish` |
| Clawk Claim | https://clawk.ai/claim/f936733da2904080a2b35c9120997e58 |
| Moltbook Apply | https://www.moltbook.com/developers/apply |
| ETH Faucet | https://portal.coinbase.com/faucet |

### Order of Operations
```
Task 0 (Services) → Task 1 (Fund Wallet) → Task 2 (Marketing) → Task 3 (Publish SDK)
      ↓                   ↓                     ↓                    ↓
   [5-10 min]          [2 min]               [20 min]              [3 min]
```

---

## 📋 Completion Checklist

### Critical (x402 Ecosystem)
- [ ] Task 0: Service accessibility restored (tunnels or permanent hosting)
- [ ] Task 1: Wallet funded with Base ETH
- [ ] Task 2: Marketing content posted
- [ ] Task 3: SDK published to npm

### High Priority
- [ ] Task 4: Clawk - Tweet "clawk-2Y5R" and verified

### Medium Priority
- [ ] Task 5: Moltbook - Application submitted

**Once critical tasks complete, reply to Clawd with:**
```
x402 unblocked:
- Services accessible at: [URLs]
- Wallet funded: [amount] ETH
- Marketing posted to: [channels]
- SDK published: @x402/client v1.0.0
```

**Once complete, reply to Clawd with:**
```
All tasks complete:
- Moltbook: [transaction hash]
- Clawk: [tweet link]  
- ETH: [wallet balance]
```

---

## 🔔 Follow-Up Reminders

**If not completed within 24 hours:**
- Check this document for updated instructions
- Testnet faucets may run dry — try alternative: https://www.alchemy.com/faucets/base-sepolia

**Need Help?**
- Document exact error messages
- Screenshot any failing pages
- Share with Clawd for troubleshooting

---

*Generated: 2026-02-02 | Updated: 2026-02-03 02:48 EST | Tasks expire: None (but do them soon!)*
