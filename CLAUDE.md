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

Kiến trúc: **route mỏng + feature module dày** (chi tiết đầy đủ trong `PROJECT_GUIDE.md`).

```text
src/app → src/features → src/components, src/utils, src/types, src/themes
```

Important directories:

- `src/app/` — Expo Router routes and layouts (chỉ routing, không business logic)
- `src/features/` — feature-oriented code theo từng nghiệp vụ (source of truth cho business logic, UI, hook, service, store, type)
- `src/components/` — reusable UI components dùng ở nhiều feature
- `src/stores/` — barrel export cho Zustand stores (store thực tế sống trong feature)
- `src/hooks/` — shared hooks dùng ở nhiều feature
- `src/utils/` — HTTP, storage, formatting, mapping, and helper utilities
- `src/themes/` — colors, typography, shadows, theme types
- `src/constants/` — configuration and static constants
- `src/assets/` — images, icons, lotties
- `src/types/` — shared TypeScript types
- `declare/` — global declarations

Feature hiện có (dưới `src/features/`):

- `src/features/auth/`
- `src/features/orders/`
- `src/features/tiktok-live/`
- `src/features/settings/`
- `src/features/customers/`
- `src/features/manage-tiktok-channel/`
- `src/features/product-info/`

Mỗi feature tổ chức dọc: `screens/`, `components/`, `hooks/`, `service/`, `stores/`, `types/`, `schemas/`, `utils/`, `contexts/`, `constants.ts` — chỉ tạo folder khi thực sự cần. Feature nhỏ có thể đặt file phẳng ngay trong folder feature.

Zod validation schemas nằm trong `src/features/<feature>/schemas/`, không có `src/schemas/` chung.

Không dùng `src/modules/`; toàn bộ domain code nằm trong `src/features/`. Không tạo kiến trúc song song.

## 5. General coding rules

- Prefer platform-aware React Native and Expo APIs.
- Do not assume DOM, browser globals, CSS files, or browser-only routing.
- Do not use web elements such as `<div>`, `<span>`, or browser event APIs.
- Use `StyleSheet`, existing theme helpers, and existing style factories.
- Reuse existing abstractions when they remain cohesive.
- Create a new file when it cleanly isolates a reusable component, service, adapter, schema, or domain responsibility.
- Keep screens focused on rendering and interaction.
- Keep network, storage, mapping, and business logic in hooks, services, stores, or domain utilities.
- **Hook rule:** when a screen or component contains logic longer than ~30 lines (API calls, state orchestration, derived values, side effects), extract it into a dedicated `use-*.ts` hook colocated in the same feature folder. The UI file only calls values and functions from the hook — no business logic in the component body.
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

### Screen layout pattern (reference: `LiveHistoryScreen`)

New screens and screens being updated must follow this layout:

**Background:**

```tsx
<LinearGradient
  type="gra_background"
  style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
/>
```

**Header:**

```tsx
<View style={{ paddingTop: top + 12, minHeight: 119, flexDirection: "row",
  alignItems: "center", justifyContent: "space-between",
  paddingHorizontal: 16, paddingBottom: 16 }}>
  <Text style={{ color: colors.text, fontSize: 24, fontWeight: "600", lineHeight: 28 }}>
    Tiêu đề màn
  </Text>
  {/* optional action button */}
  <Pressable style={{ width: 44, height: 44, borderRadius: 999,
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.white }}>
    <Icon name="..." size={20} />
  </Pressable>
</View>
```

- `top` comes from `useSafeAreaInsets().top`.
- Title: `fontSize: 24`, `fontWeight: "600"`, `color: colors.text`.
- Action button: `44×44`, `borderRadius: 999`, `backgroundColor: colors.white`.

**List content:**

```tsx
contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, rowGap: 12 }}
```

**Cards:**

```tsx
{ borderRadius: 16, backgroundColor: colors.white, overflow: "hidden", ...shadows.sd2 }
```

**Empty state:**

```tsx
<View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, rowGap: 8 }}>
  <View style={{ width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.neutral50,
    alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
    <Icon name="..." size={32} tintColor="neutral300" />
  </View>
  <Text style={{ color: colors.neutral500, ...textPresets.fs14_500, textAlign: "center" }}>
    Tiêu đề trống
  </Text>
  <Text style={{ color: colors.neutral300, ...textPresets.fs12_400, textAlign: "center" }}>
    Mô tả phụ
  </Text>
</View>
```

**Filter badge (if applicable):**

```tsx
<View style={{ flexDirection: "row", alignItems: "center", columnGap: 6,
  paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99,
  backgroundColor: colors.neutral50 }}>
  <Icon name="..." size={12} tintColor="neutral400" />
  <Text style={{ color: colors.neutral500, ...textPresets.fs12_500 }}>Label</Text>
  <Pressable onPress={onClear} hitSlop={8}>
    <Icon name="close" size={12} tintColor="neutral400" />
  </Pressable>
</View>
```

Screens using the old `<Screen>` + `<Header>` pattern should be migrated to this layout gradually as they are touched.

## 7. Routing rules

Routing is controlled by Expo Router under `src/app/`.

Main route groups (bản đồ route đầy đủ trong `PROJECT_GUIDE.md` mục 17):

- `src/app/_layout.tsx` — root providers and global app behavior
- `src/app/index.tsx` — initial redirect gate
- `src/app/(auth)/` — public auth routes
- `src/app/(tabs)/` — authenticated app routes (index, customers, reports, settings, shipping)
- `src/app/(sheets)/` — sheet/modal routes
- `src/app/order-detail/` — order detail + create-shipment flow
- `src/app/manage-tiktok-channel/`, `src/app/license-expired/`, `src/app/onboarding/`, `src/app/splash/`
- Route lẻ cấp cao: `printer-settings.tsx`, `product-info-setup.tsx`, `shipping-address-form.tsx`, `shipping-settings.tsx`

Route file chỉ khai báo path + đọc params + guard, rồi render screen import từ `src/features/<feature>/screens/`.

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
- Token refresh (access token via refresh token) happens at the HTTP interceptor layer — do not duplicate in feature screens.
- Unauthorized handling belongs at the root level.
- Do not show duplicated session-expired alerts in feature screens.
- Local logout clears local auth state and removes tokens from SecureStore.
- Do not assume server logout or refresh-token retry exists unless confirmed in code.

Relevant areas:

```text
src/features/auth/
src/features/auth/stores/
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
src/features/tiktok-live/
src/features/tiktok-live/contexts/tiktok-live-socket.tsx
src/features/tiktok-live/utils/comment.ts
src/utils/http/request-sse.ts
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

- Reuse design tokens (`colors`, `textPresets`) and theme helpers.
- Avoid one-off colors and spacing when an existing token exists; không hardcode hex khi có token.
- Avoid CSS modules and Tailwind-style web assumptions.
- Dùng `createStyles(({ colors, textPresets }) => ...)` khai báo ở cuối cùng file `.tsx`; không tách ra file `*-styles.ts` riêng để import.
- Không import `StyleSheet` từ `react-native` (trừ `StyleSheet.absoluteFill`); thay `StyleSheet.hairlineWidth` bằng `0.5`.
- Ngoại lệ: style dùng chung bởi nhiều component có thể để một module `createStyles` riêng thay vì lặp lại trong từng file.
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
2. Preserve established feature boundaries.
3. Keep changes scoped to the requested task.
4. Do not introduce parallel architectures.
5. Do not bypass existing services, hooks, stores, or mappers without a clear reason.
6. Do not silently change business rules.
7. Do not invent backend fields or API behavior.
8. Do not add dependencies without justification.
9. Do not create confirmed business actions from AI suggestions.
10. Review high-risk flows before completion.
11. State clearly what was changed and what was actually verified.
Keep validation in schema files where practical rather than duplicating validation logic in components.

## Development rules for Claude Code

Follow these rules when modifying this project:

1. Prefer editing existing files over creating new files.
2. Respect Expo Router conventions under `src/app/`; do not introduce manual navigation architecture unless explicitly requested.
3. Use project aliases instead of deep relative imports.
4. Keep `babel.config.js` and `tsconfig.json` aliases synchronized.
5. Route auth changes through `use-auth.ts`, `auth-store.ts`, `auth-utils.ts`, and `src/features/auth/services/api.ts` as appropriate.
6. Do not hardcode access tokens, refresh tokens, API URLs, app keys, or user secrets.
7. Preserve SecureStore for tokens and MMKV/Zustand for user/session UI state.
8. When changing session-expired behavior, keep the root-level alert pattern and avoid duplicate feature-level alerts.
9. When changing live/SSE behavior, reuse existing services and hooks in `src/features/tiktok-live/` and `src/utils/http/request-sse.ts`.
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

This project is indexed by GitNexus as **Tiktok-live-mobile** (2612 symbols, 6111 relationships, 211 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

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
