# CLAUDE.md

This file gives Claude Code project-specific context for working in this repository.

## Project overview

This is a React Native mobile app built with Expo and Expo Router. The app is named TikTok Live Tools and focuses on TikTok live session management, comments, channel connection, customer/order views, and auth-gated mobile workflows.

Core stack:

- Expo SDK 56
- React Native 0.85
- React 19
- Expo Router with typed routes
- TypeScript strict mode
- Zustand for state management
- MMKV and Expo SecureStore for persistence
- Axios for HTTP clients
- `react-native-sse` for live event streaming
- React Hook Form + Zod for auth forms

Entry point is `expo-router/entry` from `package.json`. Expo Router root is configured as `src` in `app.json`.

## React Native code rules

- Prefer platform-aware React Native components and Expo APIs over web-only patterns.
- Do not assume DOM, browser globals, or CSS files exist.
- Use `StyleSheet`, theme helpers, or existing style factories instead of Tailwind/web CSS.
- Keep UI logic inside screens/components; keep network, storage, and business logic in hooks/services/stores.
- Prefer Expo modules and React Native packages that already exist in `package.json` before introducing new dependencies.
- Use `ScrollView`, `FlatList`, `FlashList`, `Pressable`, `View`, `Text`, `Image`, and `TextInput` appropriately; avoid web `<div>`/`span>` patterns.
- Keep gesture, keyboard, and safe-area behavior in mind for mobile screens.
- When a feature needs platform-specific behavior, isolate it with `Platform.select` or platform-specific files instead of branching everywhere.
- Do not introduce browser-only routing or navigation patterns; keep using Expo Router.
- Do not call `fetch` or Axios directly inside screens when an API/service helper already exists.
- Keep persistence split correctly: tokens in SecureStore, app state in MMKV/Zustand, and ephemeral UI state in React state.
- Verify any UI change on device/emulator when practical, not just with typecheck.

## Common commands

- `npm start` — start Expo dev server
- `npm run ios` — run iOS app
- `npm run android` — run Android app
- `npm run web` — run Expo web
- `npm run pod` — install iOS pods
- `npm run typecheck` — run TypeScript typecheck

Before reporting a code change as complete, run `npm run typecheck` when practical. For UI or behavior changes, run the app and verify the changed flow manually.

## Directory structure

Important directories:

- `src/app/` — Expo Router routes and route layouts
- `src/features/` — feature-specific screens, hooks, services, and types when a domain is isolated enough to live under one feature
- `src/components/` — reusable and feature-specific UI components
- `src/stores/` — Zustand stores and store utilities
- `src/hooks/` — shared hooks
- `src/utils/` — storage, HTTP, formatting, style, date, comment, and helper utilities
- `src/themes/` — theme colors, typography, shadows, and theme types
- `src/constants/` — environment/config constants and static values
- `src/assets/` — images and icons
- `src/schemas/` — form validation schemas
- `src/types/` — shared TypeScript types
- `declare/` — global/project declarations imported by the root layout

If a domain is currently implemented under `src/modules/`, keep following that structure for existing code. Prefer not to mix both module- and feature-based layouts inside the same feature unless there is a clear migration plan.

Feature/module directories currently include:

- `src/modules/auth/`
- `src/modules/tiktok-live/`
- `src/modules/orders/`
- `src/modules/customers/`

## Path aliases

Use aliases instead of long relative imports when possible. Keep `babel.config.js` and `tsconfig.json` in sync if aliases change.

Current aliases:

- `@contexts/*` → `src/contexts/*`
- `@declare` and `@declare/*` → `declare/index`, `declare/*`
- `@screens/*` → `src/screens/*`
- `@stores/*` → `src/stores/*`
- `@hooks/*` → `src/hooks/*`
- `@components/*` → `src/components/*`
- `@utils/*` → `src/utils/*`
- `@app-types/*` → `src/types/*`
- `@themes` and `@themes/*` → `src/themes/index`, `src/themes/*`
- `@modules/*` → `src/modules/*`
- `@constants/*` → `src/constants/*`
- `@assets/*` → `src/assets/*`
- `@app/*` → `src/app/*`

## Routing structure

Routing is controlled by Expo Router under `src/app/`.

Main route files:

- `src/app/_layout.tsx` — root app layout
- `src/app/index.tsx` — first redirect gate
- `src/app/(auth)/_layout.tsx` — auth route guard
- `src/app/(auth)/index.tsx` — login/register screen host
- `src/app/(tabs)/_layout.tsx` — protected tab layout
- `src/app/(tabs)/index.tsx` — home tab
- `src/app/(tabs)/customers.tsx` — customers tab
- `src/app/(tabs)/shipping.tsx` — shipping tab
- `src/app/(tabs)/reports.tsx` — reports tab
- `src/app/(tabs)/settings.tsx` — settings tab
- `src/app/onboarding/index.tsx` — onboarding route
- `src/app/order-detail/index.tsx` — order detail route
- `src/app/(sheets)/` — sheet routes
- `src/app/splash/index.tsx` — splash overlay UI

Root layout responsibilities:

- imports `@declare`
- wraps the app with `SafeAreaProvider`, `KeyboardProvider`, and `BottomSheetProvider`
- manages Expo splash screen visibility
- listens for session-expired events and triggers logout via root-level alert
- declares the root Stack routes

Initial routing in `src/app/index.tsx`:

```text
if auth is loading → render null
if user exists → redirect to /(tabs)
if onboarding is not completed → redirect to /onboarding
otherwise → redirect to /(auth)
```

Protected tabs in `src/app/(tabs)/_layout.tsx` require `user`. The tab tree is wrapped with `TikTokLiveSocketProvider` so live state has a single provider instance inside the protected area.

## Auth flow

Auth is token-based and split into two persistence layers:

- access/refresh token helpers live in `src/utils/storage/secure-store.ts` and use Expo SecureStore
- user/session UI state lives in Zustand and is persisted via MMKV

Main files:

- `src/modules/auth/hooks/use-auth.ts`
- `src/modules/auth/services/api.ts`
- `src/stores/auth/auth-store.ts`
- `src/stores/auth/auth-utils.ts`
- `src/utils/http/axios.ts`
- `src/utils/http/session-event.ts`
- `src/utils/storage/secure-store.ts`

Startup auth flow:

```text
Root/layout and route guards call useAuth()
  ↓
Zustand waits for MMKV hydration
  ↓
bootstrapAuth() checks SecureStore access token
  ↓
No token → set user = null
  ↓
Has token → GET /me/bootstrap
  ↓
mapBootstrapToAuthUser()
  ↓
set user in Zustand
```

`use-auth.ts` has module-level `bootstrapInFlight` and `bootstrapDone` guards. Preserve this behavior when editing auth; it prevents duplicate bootstrap calls and avoids circular imports between store and API layers.

Login flow:

```text
Login form submits phone/password/remember
  ↓
useAuth().login()
  ↓
authStore.login()
  ↓
POST /auth/login
  ↓
extract access token from response
  ↓
secureStorage.setAccessToken(token)
  ↓
set basic user in Zustand for fast navigation
  ↓
fire-and-forget bootstrapAuth()
  ↓
GET /me/bootstrap enriches shop/license/TikTok channel data
```

Register flow:

```text
Register form
  ↓
useRegister().handleRegister()
  ↓
useAuth().register()
  ↓
POST /auth/register
  ↓
on success, alert and return to login
```

Logout flow:

```text
useAuth().logout()
  ↓
authStore.logout()
  ↓
secureStorage.clearAuth()
  ↓
set user = null
  ↓
preserve account username/phone for prefill but clear password
  ↓
route guard sends user back to auth
```

There is a `logoutApi()` helper, but the current logout flow is local-only and does not call the server logout endpoint.

Refresh behavior:

- `refreshAuth()` forces `/me/bootstrap` again and refreshes user/shop/license/TikTok channel state.
- It is not an access-token refresh flow.
- Refresh-token helpers exist, but there is currently no implemented `/auth/refresh` retry interceptor flow.

Session expiration:

- `apiClient` emits `sessionExpiredEmitter` on `401` responses except `/auth/login`.
- `src/app/_layout.tsx` shows one root Alert and calls `logout()` when the user confirms.
- Do not show duplicated session-expired alerts in feature screens.

## HTTP and network layer

Main HTTP file: `src/utils/http/axios.ts`.

There are two Axios instances:

- `apiClient` — REST/auth/bootstrap API client
- `sseClient` — SSE-related/API helper client

Both read tokens from `secureStorage` and attach:

```text
Authorization: Bearer <token>
```

`apiClient` also emits session-expired events on unauthorized responses.

Request helper file:

- `src/utils/http/request-sse.ts`

This exposes helpers such as:

- `getRequest`
- `postRequest`
- `patchRequest`
- `deleteRequest`
- `buildApiUrl`
- `ApiError`

Config values come from `src/constants/config.ts`, mostly via `EXPO_PUBLIC_*` env vars:

- `EXPO_PUBLIC_TIKTOK_SSE_API`
- `EXPO_PUBLIC_SUPABASE_URL_ENDPOINT`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_MOBILE_APP_KEY`
- `EXPO_PUBLIC_WEB_URL_ORIGIN`
- `EXPO_PUBLIC_WEB_URL_REFERER`

Do not hardcode API URLs or tokens in components.

## TikTok live flow

TikTok live domain code lives under `src/modules/tiktok-live/`.

Important files:

- `src/modules/tiktok-live/service/sse-api.ts`
- `src/modules/tiktok-live/service/live-history-api.ts`
- `src/modules/tiktok-live/hooks/use-tiktok-live-sse.ts`
- `src/modules/tiktok-live/hooks/use-tik-tok-live-session.ts`
- `src/modules/tiktok-live/hooks/use-tik-tok-comments.ts`
- `src/modules/tiktok-live/hooks/use-tiktok-live-socket.ts`
- `src/modules/tiktok-live/live-session-mapper.ts`
- `src/modules/tiktok-live/types.ts`
- `src/contexts/tiktok-live-socket.tsx`
- `src/utils/comment.ts`

High-level flow:

```text
Auth user provides TikTok username/channel info
  ↓
TikTokLiveSocketProvider creates one socket/session runtime in the tab tree
  ↓
useTikTokLiveSocket composes auth, SSE, comments, and live-session hooks
  ↓
clientId is loaded/stored locally
  ↓
connect to SSE backend
  ↓
subscribe/stop live session through backend API helpers
  ↓
SSE events update comments, current live session, duration, and history
```

Common live event types include:

- `CONNECTED`
- `PING`
- `SUBSCRIBING`
- `SUBSCRIBED`
- `LIVE_CONNECTED`
- `LIVE_DISCONNECTED`
- `LIVE_ERROR`
- `LIVE_TIME_STARTED`
- `LIVE_TIME_ENDED`
- `LIVE_TIME_STATUS`
- `COMMENT`
- `COMMENT_SAVED`
- `COMMENT_UPDATED`
- `SNAPSHOT`

When changing TikTok live behavior, preserve normalization/mapping in `src/utils/comment.ts` and `src/modules/tiktok-live/live-session-mapper.ts` so event schema handling remains consistent.

## State management and persistence

Zustand stores live in `src/stores/`.

Auth store:

- `src/stores/auth/auth-store.ts`
- keeps `user`, `accounts`, and `isRemembered`
- persists through a custom storage layer
- supports migration from old AsyncStorage keys to MMKV-backed storage

Order store:

- `src/stores/order/order-store.ts`

Storage utilities:

- `src/utils/storage/secure-store.ts` — SecureStore token helpers
- `src/utils/storage/mmkv.ts` — MMKV-backed Zustand storage
- `src/utils/storage/constants.ts` — storage keys
- `src/utils/storage/async-storage.ts` or storage index files — general local storage helpers where present

Rules:

- Store secrets/tokens only in SecureStore.
- Store UI/session cache in Zustand/MMKV.
- Do not put raw auth tokens into Zustand, AsyncStorage, logs, or component state.
- Be careful when changing persisted store shapes; update migration logic if needed.

## UI and styling conventions

Theme files:

- `src/themes/colors.ts`
- `src/themes/typography.ts`
- `src/themes/shadow.ts`
- `src/themes/type.ts`
- `src/themes/index.ts`

Theme hook:

- `src/hooks/use-theme.ts`

Style helper:

- `src/utils/createStyles.ts`

Component organization:

- Auth UI: `src/components/auth/`
- Home/live UI: `src/components/home/`
- Bottom tab UI: `src/components/bottom-tab/`
- Bottom sheet UI: `src/components/bottom-sheet/`
- Shared wrappers: `src/components/screen/`, `src/components/image/`, `src/components/icon/`, `src/components/linear-gradient/`

Prefer existing themed helpers and components over one-off inline styling. For larger screen-specific styles, follow the existing `createStyles`/`useThemes` pattern.

Use the existing design system for mobile spacing, typography, and colors instead of inventing web-style utility classes or CSS modules.

For long lists or live feeds, prefer `FlashList`/`FlatList` over manual `.map()` rendering when the list is large or frequently updated.

For forms, reuse React Hook Form and Zod patterns already present in auth and settings flows rather than introducing a second validation approach.

For local state that must survive app restarts, prefer the current MMKV/SecureStore split instead of ad hoc AsyncStorage usage.

For images and media, prefer Expo-compatible components and helpers already in the repo.

## Forms and validation

Auth forms use:

- React Hook Form
- Zod schemas from `src/schemas/auth`
- `@hookform/resolvers`

Keep validation in schema files where practical rather than duplicating validation logic in components.

## Development rules for Claude Code

Follow these rules when modifying this project:

1. Prefer editing existing files over creating new files.
2. Respect Expo Router conventions under `src/app/`; do not introduce manual navigation architecture unless explicitly requested.
3. Use project aliases instead of deep relative imports.
4. Keep `babel.config.js` and `tsconfig.json` aliases synchronized.
5. Route auth changes through `use-auth.ts`, `auth-store.ts`, `auth-utils.ts`, and `modules/auth/services/api.ts` as appropriate.
6. Do not hardcode access tokens, refresh tokens, API URLs, app keys, or user secrets.
7. Preserve SecureStore for tokens and MMKV/Zustand for user/session UI state.
8. When changing session-expired behavior, keep the root-level alert pattern and avoid duplicate feature-level alerts.
9. When changing live/SSE behavior, reuse existing services and hooks in `src/modules/tiktok-live/` and `src/utils/http/request-sse.ts`.
10. When changing route guards, verify `src/app/_layout.tsx`, `src/app/index.tsx`, `src/app/(auth)/_layout.tsx`, and `src/app/(tabs)/_layout.tsx` together.
11. When changing persisted state shapes, review migrations and old storage keys before removing compatibility logic.
12. Run `npm run typecheck` after TypeScript changes when practical.
13. For UI changes, run the app and manually verify the affected path before claiming completion.
14. Avoid broad refactors unless explicitly requested; keep changes scoped to the task.
15. Avoid comments unless they explain a non-obvious invariant, platform constraint, or workaround.

## Known architectural notes

- Login intentionally sets a basic user immediately so protected navigation can proceed quickly, then runs `/me/bootstrap` in the background to enrich user data.
- Bootstrap intentionally keeps the old persisted user on network/server failure to avoid kicking users out during temporary connectivity issues.
- Auth bootstrap lives in `use-auth.ts` instead of the store to avoid circular imports between store and API modules.
- `refreshAuth()` refreshes bootstrap/user data, not access tokens.
- Refresh-token storage helpers exist, but a full token-refresh retry flow is not currently implemented.
- `logoutApi()` exists, but the active logout behavior is local token/state cleanup only.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Tiktok-live-mobile** (1097 symbols, 2350 relationships, 85 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Tiktok-live-mobile/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Tiktok-live-mobile/clusters` | All functional areas |
| `gitnexus://repo/Tiktok-live-mobile/processes` | All execution flows |
| `gitnexus://repo/Tiktok-live-mobile/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
