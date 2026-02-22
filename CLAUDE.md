# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Numerael (SOULMATE)** — A Turkish-language numerology and soulmate matching mobile app. Hybrid architecture: vanilla HTML/JS frontend served via Capacitor on iOS/Android, with Vercel for web hosting and serverless API functions, backed by Supabase.

## Build & Development Commands

```bash
# Build web assets to www/
npm run build                    # runs scripts/build.sh → copies HTML, JS, assets to www/

# Sync to native platforms (REQUIRED after any web file change before native testing)
npm run cap:sync                 # npx cap sync — copies www/ → android/app/src/main/assets/public/
npm run cap:build                # build + sync in one step

# Open native IDEs
npm run cap:open:android
npm run cap:open:ios
```

**Critical workflow**: Web files (HTML, JS) live at root. After editing them, you MUST run `npm run cap:sync` (or `npm run cap:build`) before the changes appear in the Android/iOS app. The `www/` directory and `android/app/src/main/assets/public/` are both in `.gitignore`.

## Architecture

### Frontend (No framework)
- ~36 HTML pages at project root, each self-contained with inline `<script>` blocks
- Shared JS modules loaded via `<script src="js/...">` tags (no bundler, no imports)
- All JS uses `var` declarations and attaches to `window` — no ES modules
- Tailwind CSS via runtime JIT (`js/tailwind.min.js`)
- Supabase JS SDK v2 bundled as `js/supabase.min.js`

### Key JS Modules (`js/`)
| Module | Role |
|--------|------|
| `supabase-config.js` | Creates `window.supabaseClient` — must load before everything else |
| `auth.js` | Sign up/in/out, session recovery via `onAuthStateChange('INITIAL_SESSION')`, page redirect logic |
| `premium.js` | Subscription management: Paddle (web) + RevenueCat (native), paywall UI, entitlement checks |
| `revenuecat.js` | RevenueCat native bridge via `@revenuecat/purchases-capacitor` |
| `numerology-engine.js` | Core Pythagorean numerology calculations (Turkish character support) |
| `discovery-engine.js` | Cosmic Match: daily match algorithm, streak system, reveal gating |
| `compatibility-engine.js` | Multi-dimensional compatibility scoring between two profiles |
| `numerology-ai.js` / `ai-content.js` | AI-generated insights via OpenAI |
| `gamification-engine.js` | Streaks, rewards, leaderboard |
| `api-base.js` | Sets `window.__NUMERAEL_API_BASE` — empty string on web, Vercel URL on native |

### Backend
- **Supabase**: Auth (email/password + Google OAuth), PostgreSQL database, session storage key `numerael-auth-token`
- **Vercel serverless** (`api/`): `openai.js` (AI content), `paddle-webhook.js`, `revenuecat-webhook.js`
- Webhooks update the `subscriptions` table in Supabase

### Native (Capacitor)
- **App ID**: `com.numerael.soulmate`
- **Android**: Gradle 8.13, compileSdk 36, Java 21, Capacitor Android v8.1.0
- **iOS**: Xcode project in `ios/App/`
- `capacitor.config.ts` uses `webDir: 'www'` and `androidScheme: 'https'`

### Premium / Monetization (Dual Platform)
- **Web**: Paddle overlay checkout (sandbox token in `premium.js`, price IDs `pri_01khy...`)
- **Native**: RevenueCat (`@revenuecat/purchases-capacitor`) — API keys currently placeholder
- Premium status check order: localStorage cache → RevenueCat entitlements (native) → Supabase `subscriptions` table (fallback)
- Console helpers: `premium.simulate(30)`, `premium.clear()`, `premium.isPremium()`

## Auth & Session Flow

Pages are classified as auth pages (sign_up, splash, onboarding) or protected pages. `auth.js` runs on every page via `DOMContentLoaded`:
1. Waits for `onAuthStateChange('INITIAL_SESSION')` with 3s timeout
2. If session exists on an auth page → redirect to home
3. If no session on a protected page → redirect to sign_up

Individual pages (e.g., `cosmic_match.html`) do additional checks: userId presence, user profile data existence.

## Native Platform Detection

`api-base.js` detects native context via protocol checks (`capacitor:`, `ionic:`, `file:`) or `Capacitor.isNativePlatform()`. When native, API calls route to `https://soulmate-kohl.vercel.app` instead of relative paths.

## Language

All user-facing strings, variable names in some modules, and documentation are in **Turkish**. Console log prefixes use English tags like `[Premium]`, `[Auth]`, `[RC]`.
