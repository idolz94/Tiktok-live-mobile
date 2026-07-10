# Feature Architecture

---

## Feature structure

Each feature under `src/features/<feature>/` owns its vertical slice:

```
src/features/<feature>/
  screens/       route-level screen components (rendering only)
  components/    UI components scoped to this feature
  hooks/         use-*.ts hooks (logic, state, side effects)
  service/       API call functions (axios wrappers)
  stores/        Zustand stores
  types/         TypeScript types for this feature
  schemas/       Zod validation schemas
  utils/         pure helpers
  contexts/      React context providers (if needed)
  constants.ts   feature-level constants
```

Not all folders are required — create only what's needed.

---

## Features

### `auth`

Login, registration, token management. Stores: `auth-store.ts`. Hook: `use-auth.ts`.

Auth flow: login → set minimal user (fast navigation) → bootstrap in background → enrich user with shop/license/channel data.

Token storage: `SecureStore` only. Never in Zustand, MMKV, or logs.

### `orders`

Core domain feature. Most complex — 15 create-shipment components, 8 order-detail components, 9 hooks, 7 screens.

Sub-flows:
- Order list + filtering (stat cards)
- Order detail (products, shipping, COD, deposit, confirm)
- Create shipment (SPX or manual, address selection, success)
- Product CRUD within draft orders
- Shipping provider selection

Key hook: `use-order-detail.ts` — see Patterns doc for hook patterns.

### `tiktok-live`

TikTok livestream integration. Single SSE provider at root (`TikTokLiveSocketProvider`). Never create additional SSE connections from feature screens.

Context: `tiktok-live-socket.tsx`
Hooks: `use-tik-tok-live-session.ts`, `use-tik-tok-comments.ts`, `use-tiktok-live-socket.ts`, etc.

### `settings`

Shipping settings (warehouse addresses, shipping partners), printer settings, SPX account connection, license plans, shipping address CRUD.

Shipping partners: SPX (connectable), Manual (always available), Viettel Post / J&T / GHN (coming soon).

Known: `shipping-settings.styles.ts` uses many hardcoded hex values instead of theme tokens — see Tokens doc.

### `customers`

Customer list, customer detail, address management.

### `manage-tiktok-channel`

TikTok channel connection flow.

### `product-info`

Product pre-configuration before a live session.

---

## Shared types

Cross-feature types: `src/types/` (barrel: `@app-types/index`)

Feature-scoped types: `src/features/<feature>/types/`

Component-local prop types: colocate in the component file.

---

## Service layer

API calls always go through service functions — never call Axios directly from screens or hooks inline.

Pattern:
```ts
// src/features/orders/service/api.ts
export async function getOrderByIdApi(orderId: string): Promise<OrderWithTikTok | null> {
  const res = await apiClient.get(`/orders/${orderId}`);
  return res.data;
}
```

HTTP clients and interceptors: `src/utils/http/`

---

## Assets

### Icons
`src/assets/icons/sources/` — 30 PNGs + barrel export at `src/assets/icons/index.ts`

### Images
`src/assets/images/sources/` — 20 images (logos, illustrations, placeholders)
`src/assets/images/dim-icons/` — 5 dimension icons (height, length, pencil, weight, width)
Barrel: `src/assets/images/index.ts` → `images.*`

### Lotties
`src/assets/lotties/` — 8 animations

| Name | Usage |
|---|---|
| `chart` | reports tab |
| `customer` | customers tab |
| `home` | home tab |
| `live_red` | live indicator (active) |
| `live_white` | live indicator (inactive) |
| `settings` | settings tab |
| `time` | history tab |
| `truck` | shipping tab |

Used via `<Lottie name="home" focused={isActive} style={styles.icon} />`

---

## Test coverage

Minimal. One test file in the entire project:

`src/components/animated-error-text/animated-error-text.test.tsx`

Uses `@testing-library/react-native` + Jest fake timers. Three cases: no message, debounced show, instant clear.

No e2e test folder exists.
