# Frontend Code Analysis - leverage.fun

## Executive Summary
**Status:** Partially Working - NOT Production Ready
**Main Issue:** Architecture mismatch between old custom program and new pump.fun integration

---

## What's WORKING ✅

### 1. Token Creation on Pump.fun
- **File:** `app/create/page.tsx`
- **Status:** ✅ Working on mainnet
- **Features:**
  - Image upload to IPFS (Pinata)
  - Metadata upload to IPFS
  - Token creation via pump.fun SDK
  - Saves to shared API + localStorage

### 2. Wallet Connection
- **File:** `components/wallet-provider.tsx`
- **Status:** ✅ Working
- **Features:**
  - Phantom wallet integration
  - Solana wallet adapter

### 3. Basic UI Components
- **Files:** `components/ui/*`
- **Status:** ✅ Working
- **Features:**
  - All shadcn/ui components functional
  - Theme provider
  - Toast notifications

### 4. Token Display (Partial)
- **Files:** `components/live-board.tsx`, `components/king-of-the-hill.tsx`
- **Status:** ⚠️ Partially working
- **Issues:** Shows tokens but with $0 market cap (no real data)

---

## What's BROKEN ❌

### 1. OLD CUSTOM PROGRAM CODE (USELESS)
These files reference the old custom Solana program that's no longer used:

| File | Issue | Action |
|------|-------|--------|
| `lib/idl.ts` | Old program IDL | **DELETE** |
| `hooks/use-program.ts` | Uses old IDL | **DELETE** |
| `hooks/use-trade.ts` | Uses old program for trading | **DELETE or Rewrite** |
| `hooks/use-referral.ts` | Uses old program | **DELETE or Rewrite** |
| `components/program-example.tsx` | Example using old program | **DELETE** |
| `lib/program-utils.ts` | Utilities for old program | **DELETE** |
| `test-program.ts` | Test file for old program | **DELETE** |
| `app/create/pump-deploy.ts` | Old deployment logic | **DELETE** |
| `app/create/pump-sdk-deploy.ts` | Old SDK deployment | **DELETE** |
| `app/create/test-pump/page.tsx` | Test page | **DELETE** |

### 2. TRADING (COMPLETELY BROKEN)
- **File:** `components/trade-panel.tsx`
- **Status:** ❌ Mock UI only
- **Problem:** 
  - Buy/Sell buttons don't do anything
  - No pump.fun trading integration
  - Shows fake balance (12.4 SOL)
  - No real transaction handling

### 3. REAL-TIME DATA (BROKEN)
- **File:** `components/trades-ticker.tsx`
- **Status:** ❌ Not working
- **Problem:**
  - Tries to fetch from old program
  - Shows "Waiting for trades..."
  - Should fetch from pump.fun

### 4. TOKEN DATA (PARTIALLY BROKEN)
- **Files:** `hooks/use-tokens.ts`, `app/token/[id]/page.tsx`
- **Status:** ⚠️ Partially working
- **Problems:**
  - Market cap shows $0 (not fetched from pump.fun)
  - Progress shows 0% (not calculated)
  - No real price data
  - Token detail page shows limited info

### 5. KING OF THE HILL (WRONG DATA)
- **File:** `components/king-of-the-hill.tsx`
- **Status:** ⚠️ Shows token but wrong data
- **Problem:** Shows $0 market cap, should show real data

---

## What You NEED for Production

### MUST HAVE (Critical)

#### 1. Working Trading Integration
**Priority:** CRITICAL
**Options:**
- **Option A:** Integrate pump.fun SDK for buy/sell
- **Option B:** Link to pump.fun website for trading
- **Option C:** Remove trading panel entirely

**Recommendation:** Option B (quickest) - Add "Trade on Pump.fun" button

#### 2. Real Token Data from Pump.fun
**Priority:** CRITICAL
**Need:**
- Fetch bonding curve state from pump.fun
- Calculate real market cap
- Show real progress to graduation
- Get real price data

**Implementation:** Use pump.fun API or SDK to fetch token data

#### 3. Clean Up Old Code
**Priority:** HIGH
**Files to Delete:**
- `lib/idl.ts`
- `hooks/use-program.ts`
- `hooks/use-trade.ts`
- `hooks/use-referral.ts`
- `lib/program-utils.ts`
- `test-program.ts`
- `app/create/pump-deploy.ts`
- `app/create/pump-sdk-deploy.ts`
- `app/create/test-pump/page.tsx`
- `components/program-example.tsx`

#### 4. Fix Token Detail Page
**Priority:** HIGH
**File:** `app/token/[id]/page.tsx`
**Need:**
- Fetch real token data from pump.fun
- Show real market cap, price, progress
- Working trade history (or remove)

### NICE TO HAVE

#### 5. Live Trades Ticker
**Priority:** MEDIUM
**File:** `components/trades-ticker.tsx`
**Need:** Fetch real trades from pump.fun

#### 6. Price Charts
**Priority:** MEDIUM
**File:** `components/token-chart.tsx`
**Need:** Real price history from pump.fun or API

#### 7. Database for Token Storage
**Priority:** MEDIUM
**Current:** In-memory API (resets on deploy)
**Need:** Persistent database (Supabase, MongoDB, etc.)

---

## Quick Fix Plan (2-3 Hours)

### Step 1: Clean Up (30 min)
Delete all old program files listed above

### Step 2: Fix Trading (30 min)
Replace trade panel with "Trade on Pump.fun" button

### Step 3: Fix Token Data (1 hour)
- Update `use-tokens.ts` to fetch from pump.fun API
- Update token detail page
- Fix King of the Hill

### Step 4: Test (30 min)
- Create token
- Verify it shows correctly
- Check all pages

---

## Architecture Decision

You have 2 options:

### Option A: Pump.fun Wrapper (Recommended)
- Your UI is a "skin" over pump.fun
- Trading happens on pump.fun
- You add leverage metadata
- Pros: Quick, reliable, less code
- Cons: Less control

### Option B: Full Integration
- Full pump.fun SDK integration
- Trading in your UI
- More complex
- Pros: Full control
- Cons: More bugs, more maintenance

**Recommendation:** Option A for MVP

---

## Files Status Summary

| File | Status | Action |
|------|--------|--------|
| `app/create/page.tsx` | ✅ Working | Keep |
| `app/page.tsx` | ⚠️ Partial | Update |
| `app/token/[id]/page.tsx` | ⚠️ Partial | Update |
| `app/api/tokens/route.ts` | ✅ Working | Keep (add DB later) |
| `hooks/use-tokens.ts` | ⚠️ Partial | Update |
| `components/live-board.tsx` | ✅ Working | Keep |
| `components/king-of-the-hill.tsx` | ✅ Working | Keep |
| `components/trade-panel.tsx` | ❌ Broken | Fix or Replace |
| `components/trades-ticker.tsx` | ❌ Broken | Fix or Remove |
| `components/token-chart.tsx` | ⚠️ Mock | Fix or Remove |
| `lib/idl.ts` | ❌ Useless | Delete |
| `hooks/use-program.ts` | ❌ Useless | Delete |
| `hooks/use-trade.ts` | ❌ Useless | Delete |
| `hooks/use-referral.ts` | ❌ Useless | Delete |
| `lib/program-utils.ts` | ❌ Useless | Delete |
