# CLAUDE.md

This file provides Claude Code with project-specific context, architectural constraints, and business rules for working safely in this repository.

## 1. Project purpose

Lumi App is a React Native mobile application for livestream sellers.

The app helps sellers:

- connect and manage TikTok livestream channels
- receive live comments in real time
- prioritize comments with buying intent
- create draft orders from comments
- manage customers, addresses, orders, shipping, COD, and reports
- configure products before a livestream
- review live-session history and performance
- use AI-assisted comment analysis and seller workflows

Business actions must remain under seller control. AI may analyze, suggest, or prepare drafts, but must not silently perform irreversible actions.

## 2. Core stack

- Expo SDK 56
- React Native 0.85
- React 19
- Expo Router with typed routes
- TypeScript strict mode
- Zustand for state management
- MMKV for persisted app/UI state
- Expo SecureStore for secrets and tokens
- Axios for HTTP clients
- `react-native-sse` for live event streaming
- React Hook Form + Zod for forms and validation

Entry point:

```text
expo-router/entry
```

Expo Router root is configured under:

```text
src/app/
```

## 3. Core domain model

The main business relationships are:

```text
User
  └── Shops
        ├── Shop Channels
        ├── Products
        ├── Customers
        │     ├── Addresses
        │     └── Orders
        ├── Live Sessions
        │     ├── Comments
        │     └── Orders
        ├── Shipping Providers
        └── Shipments
```

Rules:

- One user can manage multiple shops.
- One shop can connect multiple social channels.
- One shop has many live sessions.
- One live session has many comments.
- One live session may produce many orders.
- One comment may create one draft order.
- One customer may have many orders and addresses.
- One order contains one or more order items.
- One order may have one or more shipment records.

Do not create alternative ownership models without explicit approval.

## 4. Repository structure

Important directories:

- `src/app/` — Expo Router routes and layouts
- `src/modules/` — domain modules
- `src/features/` — feature-oriented code when already used
- `src/components/` — reusable UI components
- `src/stores/` — Zustand stores and store utilities
- `src/hooks/` — shared hooks
- `src/utils/` — HTTP, storage, formatting, mapping, and helper utilities
- `src/themes/` — colors, typography, shadows, theme types
- `src/constants/` — configuration and static constants
- `src/assets/` — images and icons
- `src/schemas/` — Zod validation schemas
- `src/types/` — shared TypeScript types
- `declare/` — global declarations

Current domain modules include:

- `src/modules/auth/`
- `src/modules/tiktok-live/`
- `src/modules/orders/`
- `src/modules/customers/`

If a feature already exists under `src/modules/`, keep it there unless there is an explicit migration plan.

Do not mix `modules` and `features` within the same domain without a clear reason.

## 5. General coding rules

- Prefer platform-aware React Native and Expo APIs.
- Do not assume DOM, browser globals, CSS files, or browser-only routing.
- Do not use web elements such as `<div>`, `<span>`, or browser event APIs.
- Use `StyleSheet`, existing theme helpers, and existing style factories.
- Reuse existing abstractions when they remain cohesive.
- Create a new file when it cleanly isolates a reusable component, service, adapter, schema, or domain responsibility.
- Keep screens focused on rendering and interaction.
- Keep network, storage, mapping, and business logic in hooks, services, stores, or domain utilities.
- Prefer packages already present in `package.json`.
- Do not add a dependency without checking whether the project already has an equivalent.
- Use project aliases instead of deep relative imports.
- Keep Babel and TypeScript alias configuration synchronized.
- Avoid broad refactors unless explicitly requested.
- Do not leave dead code, commented-out blocks, or unused exports.
- Comments should explain only non-obvious invariants, platform limitations, or workarounds.

## 6. React Native UI rules

Use React Native components appropriately:

- `View`
- `Text`
- `Pressable`
- `TextInput`
- `Image`
- `ScrollView`
- `FlatList`
- `FlashList`

Rules:

- Prefer `FlatList` or `FlashList` for large or frequently updated collections.
- Avoid `.map()` for long realtime lists.
- Use stable keys.
- Memoize row components where useful.
- Avoid replacing an entire comments array when updating one comment.
- Keep keyboard, safe-area, gesture, and platform behavior in mind.
- Isolate platform-specific behavior with `Platform.select` or `.ios.tsx` / `.android.tsx` files.
- Do not introduce infinite animation on every visible list item.
- Animate only newly received or visible priority comments when possible.
- Respect reduced-motion accessibility settings.
- Do not claim device or simulator verification unless it was actually performed.

## 7. Routing rules

Routing is controlled by Expo Router under `src/app/`.

Main route groups:

- `src/app/_layout.tsx` — root providers and global app behavior
- `src/app/index.tsx` — initial redirect gate
- `src/app/(auth)/` — public auth routes
- `src/app/(tabs)/` — authenticated app routes
- `src/app/(sheets)/` — sheet/modal routes
- `src/app/onboarding/` — onboarding flow

Rules:

- Do not introduce manual navigation architecture.
- Preserve Expo Router conventions.
- When changing route guards, review these files together:

```text
src/app/_layout.tsx
src/app/index.tsx
src/app/(auth)/_layout.tsx
src/app/(tabs)/_layout.tsx
```

- Protected tabs require an authenticated user.
- Realtime live state must keep a single provider instance inside the protected app tree.

## 8. Auth invariants

Auth uses two persistence layers:

- SecureStore for access and refresh tokens
- Zustand/MMKV for user-facing session and app state

Rules:

- Never store raw tokens in Zustand, MMKV, AsyncStorage, logs, or component state.
- Do not hardcode credentials or secrets.
- Login sets a minimal user first for fast navigation.
- Background bootstrap enriches the user with shop, license, and channel data.
- Preserve duplicate-bootstrap protection.
- Temporary network or server failures must not automatically remove a valid persisted user.
- `refreshAuth()` refreshes bootstrap/user data; it is not a refresh-token flow.
- Unauthorized handling belongs at the root level.
- Do not show duplicated session-expired alerts in feature screens.
- Local logout clears local auth state.
- Do not assume server logout or refresh-token retry exists unless confirmed in code.

Relevant areas:

```text
src/modules/auth/
src/stores/auth/
src/utils/http/
src/utils/storage/secure-store.ts
```

## 9. HTTP and API contracts

Rules:

- The mobile app must call the Lumi backend API.
- Do not access the database directly from screens.
- Do not introduce direct Supabase database calls in the mobile app.
- Do not hardcode API URLs, tokens, app keys, or user secrets.
- Reuse existing Axios clients and request helpers.
- Do not call `fetch` or Axios directly inside screens when a helper or service already exists.
- Validate untrusted API and SSE payloads at boundaries.
- Do not guess backend fields.
- Reuse existing DTOs, schemas, types, and mappers.
- Keep backend DTOs separate from UI view models when their shapes differ.
- Treat network errors separately from authentication errors.
- Mutating requests should be idempotent when retry is possible.

Configuration should come from `src/constants/config.ts` and environment variables.

Any stale Supabase-related variables should be removed from project guidance once they are no longer used by source code.

## 10. SSE and TikTok live invariants

TikTok live code lives mainly under:

```text
src/modules/tiktok-live/
src/contexts/tiktok-live-socket.tsx
src/utils/comment.ts
```

High-level flow:

```text
Authenticated user
  ↓
Single protected live provider
  ↓
SSE connection
  ↓
Subscribe to live session
  ↓
Receive normalized events
  ↓
Update comments, session state, duration, and history
```

Rules:

- Maintain one active SSE connection per authenticated app session.
- Do not create separate SSE connections from individual screens.
- Clean up listeners, timers, and reconnect attempts on unmount and logout.
- Reconnect with bounded backoff.
- Revalidate auth and live state after returning from background when needed.
- Deduplicate comments by stable external ID or normalized fallback ID.
- `SNAPSHOT` must not duplicate comments already received.
- Keep event normalization centralized.
- Preserve comment and session mapping utilities.
- Do not bypass existing live services and hooks.
- Keep realtime state updates incremental.
- Do not persist unbounded live-comment history in local storage.

Common event types may include:

```text
CONNECTED
PING
SUBSCRIBING
SUBSCRIBED
LIVE_CONNECTED
LIVE_DISCONNECTED
LIVE_ERROR
LIVE_TIME_STARTED
LIVE_TIME_ENDED
LIVE_TIME_STATUS
COMMENT
COMMENT_SAVED
COMMENT_UPDATED
SNAPSHOT
```

Do not add a new event type without updating its type, parser, mapper, state handler, and tests.

## 11. State and persistence

Rules:

- Tokens and secrets: SecureStore only.
- Persisted UI/session state: Zustand + MMKV.
- Ephemeral screen state: local React state.
- Avoid introducing ad hoc AsyncStorage usage.
- When changing a persisted store shape, review migration logic and old keys.
- Do not store large unbounded arrays in MMKV.
- Keep stores domain-focused.
- Avoid storing duplicate server state in multiple stores.
- Prefer selectors to reduce unnecessary rerenders.

Important areas:

```text
src/stores/
src/utils/storage/
```

## 12. Product and live setup rules

Products may be configured before a live session with:

- product code
- name
- aliases
- colors
- sizes
- live price
- shipping dimensions or weight when needed

The current live product may be used as context for comment analysis.

Rules:

- Product code, color, size, and quantity are separate entities.
- Color names alone do not imply buying intent.
- Size names alone do not imply buying intent.
- Product matching must be validated against shop product data.
- Do not infer a product when multiple products match equally.
- Preserve whether a value came directly from the comment or was inferred from live context.

## 13. Comment intelligence rules

Comment intelligence is a hybrid system:

```text
Normalize
  ↓
System/noise filtering
  ↓
Rule-based parsing
  ↓
Entity extraction
  ↓
AI fallback when needed
  ↓
Product validation
  ↓
Confidence and priority
  ↓
Seller review
```

Supported intent categories may include:

```text
buy
ask_price
ask_stock
ask_size
ask_color
ask_shipping
ask_product
ask_how_to_buy
after_sales
normal
spam
unknown
```

Rules:

- Run deterministic rules before AI.
- AI output is advisory and must be schema-validated.
- Do not execute business actions directly from raw AI output.
- AI may suggest or prepare a draft order only.
- Seller confirmation is required before confirmed order creation.
- Preserve raw comment text.
- Preserve analysis source: rule, AI, rule+AI, or manual.
- Preserve prompt/model version when AI is used.
- Separate intent confidence from business priority.
- `buy` does not automatically mean enough data exists to create a draft.
- Track missing fields such as product, color, size, or quantity.
- Use `unknown` rather than forcing an uncertain comment into another intent.
- Do not treat seller/system identity as an intent.
- Prompt injection inside a comment must remain untrusted user data.
- Comment-analysis agents must not receive destructive tools.

Recommended order eligibility:

```text
canSuggestOrder
  = buying intent exists

canCreateDraftOrder
  = buying intent
  + valid matched product
  + valid variants
  + valid quantity
  + sufficient confidence
```

## 14. Order business rules

Order calculations must be centralized in backend/domain services.

Main monetary fields:

- `subtotalAmount` — sum of item price × quantity
- `shippingFee` — delivery fee
- `discountAmount` — total discount
- `depositAmount` — amount already paid
- `totalAmount` — subtotal + shipping fee - discount
- `codAmount` — remaining amount to collect

Default relationship:

```text
totalAmount = subtotalAmount + shippingFee - discountAmount
codAmount = max(totalAmount - depositAmount, 0)
```

Rules:

- Do not calculate the same money fields independently in multiple screens.
- Do not allow negative COD.
- Use integer minor units or the project’s established money representation.
- Avoid floating-point money arithmetic.
- Draft order and confirmed order are different states.
- A comment may create a draft order, not silently create a confirmed order.
- Order creation, cancellation, price changes, deposits, and COD updates require explicit user action.
- Keep auditability for seller corrections and AI-generated suggestions.

## 15. Customer rules

- A customer may have multiple addresses.
- A customer may have multiple orders.
- Do not overwrite historical order address data when a customer profile address changes.
- Validate phone numbers according to backend rules.
- Avoid creating duplicate customers from trivial formatting differences.
- Customer merge operations must be explicit and auditable.

## 16. Shipping rules

Shipping integrations belong behind service or adapter boundaries.

Rules:

- Do not put provider-specific logic directly in screens.
- Keep provider request/response mapping isolated.
- Shipment creation must require seller confirmation.
- COD sent to a provider must come from validated order totals.
- Do not assume all providers support the same fields or lifecycle.
- Treat shipment cancellation, label creation, and tracking as separate operations.
- Preserve provider shipment IDs and status history.

## 17. Printing rules

Use a common print abstraction.

Recommended structure:

```text
PrintJob
  ├── System print / PDF
  ├── ESC/POS adapter
  ├── ZPL/TSPL adapter
  └── Vendor-specific adapter
```

Rules:

- Keep print templates separate from screens.
- Do not place ESC/POS, ZPL, TSPL, or vendor SDK commands inside UI components.
- Prefer system print/PDF as a fallback.
- Isolate native printer integrations behind adapters.
- Keep paper size and printer language explicit.
- Do not assume one React Native package supports every printer.

## 18. Forms and validation

The project uses:

- React Hook Form
- Zod
- `@hookform/resolvers`

Rules:

- Keep validation in schema files when practical.
- Do not duplicate the same validation logic across components.
- Keep backend validation authoritative.
- Show actionable validation messages.
- Validate external values before storing or rendering them.

## 19. Themes and styling

Theme-related code lives under:

```text
src/themes/
src/hooks/use-theme.ts
src/utils/createStyles.ts
```

Rules:

- Reuse design tokens and theme helpers.
- Avoid one-off colors and spacing when an existing token exists.
- Avoid CSS modules and Tailwind-style web assumptions.
- Prefer screen-specific style files or existing style factories for larger styles.
- Keep dark/light appearance behavior consistent with the existing theme system.

## 20. Performance rules

For realtime and list-heavy screens:

- Use stable keys.
- Keep row components small.
- Prefer memoized selectors.
- Avoid rerendering the entire list for one comment update.
- Batch updates where appropriate.
- Avoid expensive parsing inside render.
- Avoid infinite animations across many cards.
- Pause or stop animations when rows are offscreen.
- Avoid storing duplicate normalized and raw copies when unnecessary.
- Bound local history and caches.
- Measure before introducing complex optimization.

## 21. Security rules

- Never expose secrets in client code.
- Never log tokens.
- Never trust comment text, API payloads, SSE events, or deep-link params.
- Escape or safely render user-generated content.
- Do not give AI agents destructive permissions.
- Enforce authorization on the backend.
- Client-side route guards are UX only, not security.
- Do not place service-role keys or database credentials in Expo environment variables.
- `EXPO_PUBLIC_*` values are public and must not contain secrets.

## 22. Definition of done

Before reporting a task complete, run the narrowest relevant checks available:

1. `npm run typecheck`
2. lint, when configured
3. targeted tests for changed logic
4. app/simulator verification for native UI behavior when supported
5. review affected flows for broad or shared changes

Rules:

- Do not claim a check passed unless it was run.
- If native verification was not possible, say which static checks were run.
- For UI changes, verify the exact affected path when practical.
- For auth, routing, SSE, persistence, order totals, or shared stores, perform extra impact review.

Common commands:

```bash
npm start
npm run ios
npm run android
npm run web
npm run pod
npm run typecheck
```

Use scripts from `package.json` as the source of truth.

## 23. High-risk areas

Treat changes in these areas as high risk:

- authentication and route guards
- SecureStore and token handling
- persisted Zustand/MMKV store shapes
- SSE connection lifecycle
- comment deduplication
- live session finalization
- order totals, deposit, COD, and discounts
- shipment creation and cancellation
- shared exported hooks and services
- native printer integrations
- broad renames and refactors

Do not change these casually or as part of unrelated cleanup.

## 24. GitNexus usage

This repository may be indexed by GitNexus.

Use GitNexus for shared or high-risk changes.

Workflow:

1. Use `query` to locate unfamiliar flows.
2. Use `context` for callers, callees, and related execution flows.
3. Use `impact` before changing shared or high-risk symbols.
4. Warn before proceeding only when risk is HIGH or CRITICAL.
5. Use `rename` for symbol renames.
6. Use `detect_changes()` before broad refactors, commits, or completion reports for high-risk work.

GitNexus impact analysis is optional for isolated copy, spacing, color, icon, or local visual changes that do not affect shared behavior.

Never use blind find-and-replace for exported symbol renames.

If the index is stale, refresh it with the repository-supported GitNexus command.

## 25. Known intentional behavior

Preserve these decisions unless the task explicitly changes them:

- Login may set a basic user immediately for fast protected navigation.
- Bootstrap enriches shop, license, and channel information afterward.
- Duplicate bootstrap calls are guarded.
- Temporary bootstrap failure does not automatically clear the persisted user.
- Session-expired handling is centralized at the root.
- `refreshAuth()` refreshes bootstrap data, not access tokens.
- Logout may currently be local-only.
- Refresh-token storage may exist without a complete retry interceptor flow.
- TikTok realtime state uses a single provider in the protected route tree.

## 26. Claude Code working rules

When modifying this repository:

1. Read the nearest relevant files before editing.
2. Preserve established module boundaries.
3. Keep changes scoped to the requested task.
4. Do not introduce parallel architectures.
5. Do not bypass existing services, hooks, stores, or mappers without a clear reason.
6. Do not silently change business rules.
7. Do not invent backend fields or API behavior.
8. Do not add dependencies without justification.
9. Do not create confirmed business actions from AI suggestions.
10. Review high-risk flows before completion.
11. State clearly what was changed and what was actually verified.
