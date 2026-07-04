# Project Guide — Lumi Live Mobile

Tài liệu hợp nhất toàn bộ quy tắc: cấu trúc source, naming convention, và quy trình triển khai code.

---

## 1. Mô hình kiến trúc: route mỏng + feature module dày

`src/app/` chỉ chứa routing của Expo Router. Toàn bộ business logic, UI, hook, service, store, type nằm trong `src/features/<tên-feature>`.

```text
src/app → src/features → src/components, src/utils, src/types, src/themes
```

- `app` import từ `features`.
- `features` import từ `components`, `utils`, `types`, `themes`.
- `components` và `utils` không import từ `features`.

---

## 2. Cấu trúc tổng quan `src/`

```text
src/
  app/          ← routing (Expo Router)
  features/     ← business code theo từng nghiệp vụ
  components/   ← UI dùng lại nhiều nơi
  hooks/        ← shared hooks dùng nhiều feature
  stores/       ← barrel export Zustand stores
  themes/       ← design tokens (màu, chữ, shadow)
  types/        ← shared TypeScript types toàn app
  utils/        ← hàm tiện ích, hạ tầng kỹ thuật
  constants/    ← cấu hình và hằng số toàn app
  assets/       ← ảnh, icon, lottie
```

---

## 3. `src/app/` — Routing

Chỉ chứa route files của Expo Router. Nhiệm vụ duy nhất:
- Định nghĩa URL path
- Đọc params từ URL (`useLocalSearchParams`)
- Auth guard / redirect
- Render screen component import từ `features/`

Không đặt logic, API call, hay UI phức tạp ở đây.

### Expo Router prefix rules

| Prefix | Ý nghĩa |
|--------|----------|
| `(name)/` | Route group — không tạo URL segment |
| `_name` | Private — Expo Router bỏ qua, không tạo route |
| `[param]` | Dynamic route — nhận param từ URL |
| `index.tsx` | Route mặc định của folder |

Route file phải dùng `export default`.

---

## 4. `src/features/` — Cấu trúc feature

Mỗi feature tổ chức theo chiều dọc, tự chứa mọi thứ liên quan.

```text
features/<feature>/
  screens/        ← TẤT CẢ màn hình chính và màn hình liên quan
  components/     ← UI components chỉ dùng trong feature
  hooks/          ← TẤT CẢ custom hooks của feature
  service/        ← API calls (axios)
  stores/         ← Zustand stores
  types/          ← TẤT CẢ TypeScript types của feature
  schemas/        ← TẤT CẢ Zod validation schemas
  utils/          ← TẤT CẢ pure helper functions của feature
  contexts/       ← React context/provider (nếu cần)
  constants.ts    ← constants riêng feature (nếu cần)
```

### 4.1 `screens/` — Màn hình

Folder `screens/` chứa tất cả màn hình chính của feature và các màn hình liên quan.

Ví dụ `features/orders/screens/`:
- `order-detail.tsx` — màn hình chi tiết đơn hàng
- `create-shipment.tsx` — màn hình tạo vận đơn
- `orders.tsx` — màn hình danh sách đơn hàng

Mỗi screen file chỉ render UI, logic nằm trong hooks.

### 4.2 `components/` — Sub-components

Folder `components/` chứa các component con phục vụ cho screens trong feature.

Có thể tách sub-folder theo màn hình khi component nhiều:

```text
features/orders/components/
  order-detail/           ← components riêng cho order-detail screen
    customer-section.tsx
    footer-actions.tsx
    products-section.tsx
    shipping-section.tsx
  create-shipment/        ← components riêng cho create-shipment screen
    address-card.tsx
    money-field.tsx
    shipping-options.tsx
  order-item.tsx          ← component dùng chung trong feature
  order-stat-card.tsx
```

### 4.3 `hooks/` — Custom hooks

TẤT CẢ hooks của feature nằm ở `features/<feature>/hooks/`, kể cả hooks phục vụ từng screen cụ thể.

```text
features/orders/hooks/
  use-order-detail.ts
  use-order-manager.ts
  use-create-shipment.ts
  use-shipment-form.ts
  use-address-form.ts
```

KHÔNG đặt hooks bên trong `components/` hay `screens/`.

### 4.4 `types/` — TypeScript types

TẤT CẢ types của feature nằm ở `features/<feature>/types/`.

Nếu cần khai báo type nội bộ (chỉ dùng trong 1 file) hoặc extend type có sẵn, được phép viết trực tiếp trong file code đó.

```text
features/orders/types/
  order.ts        ← domain types (OrderDetail, OrderItem, OrderStatus...)
  shipment.ts     ← types liên quan shipment
  filter.ts       ← types cho filtering
```

### 4.5 `utils/` — Helper functions

TẤT CẢ helper functions của feature nằm ở `features/<feature>/utils/`.

```text
features/orders/utils/
  order.ts
  shipment.ts
```

### 4.6 `schemas/` — Zod schemas

TẤT CẢ Zod validation schemas nằm ở `features/<feature>/schemas/`.

```text
features/orders/schemas/
  order-schema.ts
  shipment-schema.ts
```

---

## 5. Quy tắc tách component và memo

### Khi nào tách component

Đánh giá mức độ cần thiết trước khi tách:
- **Tách khi:** component được dùng lại 2+ nơi, hoặc screen quá dài (>200 dòng render), hoặc component có logic riêng biệt rõ ràng
- **Không tách khi:** chỉ dùng 1 lần và logic đơn giản (<50 dòng)

### Khi nào dùng `memo`

Khi tách component, đánh giá có cần bọc `memo` không:
- **Dùng memo khi:** component render tốn kém (list item, chart), parent re-render thường xuyên mà props không đổi, component nằm trong realtime list
- **Không dùng memo khi:** component nhẹ, props luôn thay đổi, component ít re-render

---

## 6. Styling — dùng `createStyles`

Mỗi file `.tsx` khai báo `createStyles` ở cuối file nếu cần style. **Không tách ra file style riêng.**

```tsx
import { createStyles } from "@utils/createStyles";

export function OrderItem({ item }: OrderItemProps) {
  return <View style={styles.container}>...</View>;
}

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    flex: 1,
    backgroundColor: colors.neutral100,
  },
}));
```

Quy tắc:
- Hạn chế tối đa style inline
- Không tách ra file `*-styles.ts` riêng để import
- Không import `StyleSheet` từ `react-native` (trừ `StyleSheet.absoluteFill`)
- Thay `StyleSheet.hairlineWidth` bằng `0.5`
- Không hardcode hex — dùng token từ `colors`

---

## 7. Naming Conventions

### 7.1 File & folder — kebab-case bắt buộc

| Đúng | Sai |
|------|-----|
| `order-detail/` | `OrderDetail/` |
| `use-auth.ts` | `useAuth.ts` |
| `order-stat-card.tsx` | `OrderStatCard.tsx` |

### 7.2 Export naming

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Component | PascalCase | `export function OrderDetail()` |
| Hook | camelCase bắt đầu `use` | `export function useOrderDetail()` |
| Function/util | camelCase | `export function formatMoney()` |
| Type/Interface | PascalCase | `type OrderStatus = ...` |
| Props type | `{Component}Props` | `type OrderItemProps = ...` |
| Store state | `{Feature}StoreState` | `type OrderStoreState = ...` |
| Zod schema | camelCase | `const orderSchema = z.object(...)` |

### 7.3 File naming patterns

| Loại file | Pattern tên file | Ví dụ |
|-----------|-----------------|-------|
| Screen | `kebab-case.tsx` | `order-detail.tsx` |
| Component | `kebab-case.tsx` | `order-item.tsx` |
| Hook | `use-kebab-case.ts` | `use-order-detail.ts` |
| Service/API | `kebab-case-api.ts` hoặc `api.ts` | `create-shipment-api.ts` |
| Store | `kebab-case-store.ts` | `order-store.ts` |
| Types | `kebab-case.ts` trong `types/` | `order.ts`, `shipment.ts` |
| Schema | `kebab-case.ts` trong `schemas/` | `order-schema.ts` |
| Utils | `kebab-case.ts` trong `utils/` | `order.ts`, `shipment.ts` |
| Context | `kebab-case.tsx` trong `contexts/` | `tiktok-live-socket.tsx` |

---

## 8. Export rules

- Trong `src/app/`: **bắt buộc `export default`** (yêu cầu của Expo Router)
- Ngoài `src/app/`: **dùng named export**

```tsx
// src/app/(tabs)/orders.tsx
export default function OrdersRoute() { ... }

// src/features/orders/screens/orders.tsx
export function OrdersScreen() { ... }
```

---

## 9. Path Aliases

| Alias | Trỏ đến |
|-------|---------|
| `@features/*` | `src/features/*` |
| `@components/*` | `src/components/*` |
| `@utils/*` | `src/utils/*` |
| `@themes/*` | `src/themes/*` |
| `@hooks/*` | `src/hooks/*` |
| `@stores/*` | `src/stores/*` |
| `@app-types/*` | `src/types/*` |
| `@constants/*` | `src/constants/*` |
| `@assets/*` | `src/assets/*` |

### Import rules

- Dùng alias cho import xuyên feature/module
- Dùng relative path cho import nội bộ cùng feature
- KHÔNG dùng relative path vượt quá 2 cấp (`../../..`)

```ts
// ✅ Nội bộ feature — relative
import type { OrderDetail } from "../types/order";
import { getOrderDetail } from "../service/api";

// ✅ Xuyên feature — alias
import { Screen } from "@components/screen";
import { formatDate } from "@utils/date";

// ❌ Sai
import { useAuth } from "../../../features/auth/hooks/use-auth";
```

### Thứ tự import

1. React, React Native
2. Third-party packages
3. Alias imports (shared)
4. Feature-local imports (relative)

---

## 10. Shared folders

### `src/components/` — Shared UI

Chỉ chứa component dùng lại ở nhiều feature. Mỗi component nằm trong folder riêng:

```text
components/<name>/
  index.tsx     ← component chính
  type.ts       ← props types
```

### `src/hooks/` — Shared Hooks

Hook dùng ở 2+ feature khác nhau. Ví dụ: `use-theme.ts`.

### `src/utils/` — Shared Utilities

Hàm thuần dùng chung, không biết domain cụ thể:
- `http/` — axios, SSE
- `storage/` — SecureStore, MMKV
- `createStyles.ts` — style factory
- `date.ts`, `id.ts` — helpers

### `src/types/` — Shared Types

Types dùng ở 2+ feature: `AuthUser`, `LiveComment`, `Order`...

### `src/themes/` — Design Tokens

Colors, typography, shadow, theme types.

---

## 11. Nguyên tắc tách screen và hook

### File screen chỉ render UI

Logic xử lý data, state, API call phải nằm trong hook.

```tsx
// ✅ Screen chỉ render
export function OrderDetailScreen({ orderId }: { orderId: string }) {
  const { order, isLoading, codAmount } = useOrderDetail(orderId);
  if (isLoading) return <LoadingSpinner />;
  return <Screen>...</Screen>;
}
```

### Khi nào KHÔNG cần hook riêng

- Component chỉ nhận props và render (presentational)
- Không có state hay side effect
- Logic quá đơn giản (1–2 dòng)

---

## 12. Bottom Sheet — dùng `useBottomSheet`

Dùng `useBottomSheet` từ `@components/bottom-sheet/hook`. Không dùng `Modal` của React Native.

```tsx
const { show, hide } = useBottomSheet();

show({
  content: <MyContent />,
  showDragIndicator: true,
});
```

### Chặn đóng khi tap ra ngoài / swipe

Mặc định sheet đóng được bằng tap-backdrop và swipe-down. Với form hoặc luồng cần chủ động (không được đóng nhầm), set `enablePanDownToClose: false` và bắt buộc content có nút X gọi `hide()`.

```tsx
show({
  content: <EditChannel onClose={hide} ... />,
  showDragIndicator: false,
  enablePanDownToClose: false, // chỉ đóng qua nút X
});
```

Lưu ý nền tảng: trên iOS/Android, `enablePanDownToClose` gộp cả swipe-down lẫn tap-backdrop (không tách riêng được). Nên khi set `false`, phải luôn có nút X — nếu không sheet sẽ không đóng được.

---

## 13. Checklist trước khi viết code

1. File này thuộc feature nào? → `src/features/<feature>/`
2. File này là gì: screen, component, hook, service, type, util, store, schema?
3. Folder tương ứng đã tồn tại chưa?
4. Type đã khai báo ở `types/` chưa?
5. Logic có nên tách hook không?

---

## 14. Ví dụ cấu trúc feature hoàn chỉnh: Orders

```text
features/orders/
  screens/
    orders.tsx                    ← danh sách đơn hàng
    order-detail.tsx              ← chi tiết đơn hàng
    create-shipment.tsx           ← tạo vận đơn
  components/
    order-detail/                 ← components riêng cho order-detail screen
      customer-section.tsx
      footer-actions.tsx
      header.tsx
      info-sections.tsx
      primitives.tsx
      products-section.tsx
      ship-bar.tsx
      shipping-section.tsx
    create-shipment/              ← components riêng cho create-shipment screen
      address-card.tsx
      address-form-modal.tsx
      address-picker-sheet.tsx
      money-field.tsx
      option-chip.tsx
      package-dim-modal.tsx
      section-block.tsx
      shipment-input.tsx
      shipping-options.tsx
      spx-options.tsx
      summary-row.tsx
      timeslot-select.tsx
      voucher-select-sheet.tsx
    order-item.tsx                ← dùng chung trong feature
    order-stat-card.tsx
    order-filter.tsx
    product-sheet.tsx
    product-table.tsx
    shipping-provider-sheet.tsx
  hooks/
    use-order-detail.ts
    use-order-manager.ts
    use-shipping-tab.ts
    use-create-shipment.ts
    use-shipment-form.ts
    use-shipment-addresses.ts
    use-address-form.ts
    use-spx-shipping.ts
    use-submit-shipment.ts
  service/
    api.ts
    create-shipment-api.ts
  stores/
    order-store.ts
    address-page-store.ts
  types/
    order.ts
    shipment.ts
  schemas/
    (tạo khi cần)
  utils/
    order.ts
    shipment.ts
  constants.ts
```

---

## 15. Lỗi thường gặp & cách tránh

| Lỗi | Nguyên nhân | Cách sửa |
|------|-------------|----------|
| `Element type is invalid` | Route file dùng named export | Đổi sang `export default` |
| Component bị coi là route | File không có `_` prefix trong `src/app/` | Đặt vào `_components/` |
| Lỗi trên CI nhưng OK trên Mac | Tên file có chữ hoa | Đổi sang kebab-case |
| Alias không hoạt động runtime | Chỉ thêm `tsconfig.json` | Thêm vào cả `babel.config.js` |
| Hook trong components/ | Sai vị trí | Chuyển về `features/<feature>/hooks/` |
| Type trong components/ | Sai vị trí | Chuyển về `features/<feature>/types/` |
| Style file riêng | Không tuân thủ | Viết `createStyles` trong cùng file `.tsx` |

---

## 16. Danh sách feature hiện có

Workspace `src/features/` hiện có 7 feature. `orders` (mục 14) là feature chuẩn nhất; các feature còn lại tổ chức theo cùng nguyên tắc nhưng chỉ tạo folder khi thực sự cần.

| Feature | Vai trò | Folder chính hiện có |
|---------|---------|----------------------|
| `auth` | Đăng nhập, đăng ký, quên mật khẩu, license, bootstrap user | `components/`, `hooks/`, `schemas/`, `services/`, `stores/` |
| `orders` | Danh sách đơn, chi tiết đơn, tạo vận đơn, SPX | `screens/`, `components/`, `hooks/`, `service/`, `stores/`, `types/`, `schemas/`, `utils/`, `constants.ts` |
| `tiktok-live` | SSE live, comment realtime, live session | `components/`, `contexts/`, `hooks/`, `service/`, `types/`, `utils/`, `live-session-mapper.ts` |
| `settings` | Cấu hình shop, địa chỉ, đối tác ship, máy in | `components/` (có `printer/`), `hooks/`, `service/`, `stores/`, `types/`, `constants.ts` |
| `customers` | Mapping và API khách hàng | `service/`, `customer-mapper.ts` |
| `manage-tiktok-channel` | Kết nối và chỉnh sửa kênh TikTok | `components/`, `index.tsx`, `type.ts`, `use-manage-tiktok-channel.ts` |
| `product-info` | Cấu hình sản phẩm trước live | `use-product-info-setup.ts` |

### Lưu ý về mức độ tuân thủ cấu trúc

- `auth` dùng `services/` (số nhiều), các feature khác dùng `service/` (số ít). Mục 4 mô tả chuẩn là `service/`; giữ nguyên `auth/services/` cho tới khi có kế hoạch đổi tên đồng bộ.
- `customers`, `product-info`, `manage-tiktok-channel` là feature nhỏ nên đặt file phẳng (mapper, hook, type) ngay trong folder feature thay vì tạo đủ các sub-folder. Chỉ nâng lên cấu trúc dọc đầy đủ khi feature lớn dần.
- Feature nhỏ có thể để hook/type cạnh nhau (ví dụ `manage-tiktok-channel/type.ts`, `use-manage-tiktok-channel.ts`) — đây là ngoại lệ chấp nhận được cho feature một-vài file.

---

## 17. Bản đồ route thực tế (`src/app/`)

Mục 3 mô tả quy tắc prefix; phần này liệt kê route đang có để tham chiếu.

```text
src/app/
  _layout.tsx                 ← root providers, auth/live provider, global behavior
  index.tsx                   ← redirect gate ban đầu
  (auth)/                     ← route công khai
    _layout.tsx
    index.tsx
  (tabs)/                     ← route sau khi đăng nhập (bottom tabs)
    _layout.tsx
    index.tsx                 ← tab live/trang chủ
    customers.tsx
    reports.tsx
    settings.tsx
    shipping.tsx
  (sheets)/                   ← route dạng sheet/modal
    _layout.tsx
  order-detail/               ← luồng chi tiết đơn + tạo vận đơn
    _layout.tsx
    index.tsx
    create-shipment/
      index.tsx
      address-form.tsx
      address-picker.tsx
  manage-tiktok-channel/
    index.tsx
  license-expired/
    index.tsx
  onboarding/
    index.tsx
  splash/
    index.tsx
  printer-settings.tsx        ← route lẻ cấp cao
  product-info-setup.tsx
  shipping-address-form.tsx
  shipping-settings.tsx
```

Quy tắc bổ sung:
- Route file chỉ khai báo path + đọc params + guard, rồi render screen import từ `features/`. Ví dụ `order-detail/index.tsx` render `OrderDetailScreen` từ `@features/orders/screens/order-detail`.
- Khi sửa guard, review cùng lúc: `_layout.tsx`, `index.tsx`, `(auth)/_layout.tsx`, `(tabs)/_layout.tsx`.
- Route lẻ cấp cao (`printer-settings.tsx`, `shipping-settings.tsx`, ...) là push screen ngoài tab, không thuộc group nào.

---

## 18. Nội dung thực tế các folder shared

Bổ sung chi tiết cho mục 10. Đây là inventory hiện tại, không phải danh sách cố định — thêm file mới theo đúng nguyên tắc của từng folder.

### `src/components/` — Shared UI

Component dùng ở nhiều feature, mỗi component một folder. Cấu trúc nội bộ linh hoạt theo độ phức tạp: đơn giản chỉ cần `index.tsx`; phức tạp có thêm `type.ts`, `hooks/`, hoặc file phụ.

```text
components/
  animated-error-text/  avatar/       bottom-sheet/   bottom-tab/
  button/               customer-detail-sheet/          empty-state/
  error-state/          geo-picker/   header/          home/
  icon/                 image/        input/           linear-gradient/
  money-display/        pulsing-dot/  screen/          separator/
  skeleton/             status-chip/  toast/
```

- `bottom-sheet/` là hạ tầng sheet toàn app (`provider.tsx`, `hook.ts`, `context.ts`, `renderer.tsx`, `sheet.tsx`, `type.ts`) — dùng qua `useBottomSheet` (mục 12).
- Component có props → tách `type.ts`; có logic riêng → tách `hooks/`.

### `src/hooks/` — Shared hooks

Hook dùng ở 2+ feature:

```text
hooks/
  use-theme.ts            ← theme tokens
  use-confirm-dialog.ts   ← dialog xác nhận dùng chung
  use-phone-field.ts      ← xử lý field số điện thoại
```

### `src/utils/` — Shared utilities

Hàm thuần và hạ tầng kỹ thuật, không biết domain:

```text
utils/
  http/         ← axios.ts, api-error.ts, auth-session.ts, fetch-sse.ts, request-sse.ts, session-event.ts
  storage/      ← secure-store.ts, mmkv.ts, helper.ts, constants.ts, index.ts
  platform/     ← index.ts (platform helpers)
  string/       ← index.ts (string helpers)
  createStyles.ts   date.ts   emoji.ts   id.ts   tiktok.ts   validate-phone.ts
```

- Token/secret: chỉ qua `storage/secure-store.ts`.
- UI/session state bền: `storage/mmkv.ts`.
- SSE: qua `http/request-sse.ts` / `http/fetch-sse.ts`, không tạo kết nối SSE rời trong screen.

### `src/stores/` — Barrel export

`src/stores/index.ts` chỉ re-export store từ các feature (`@features/auth/stores`, `@features/settings/stores/printer-store`). Store thực tế sống trong feature, không định nghĩa store mới trực tiếp ở đây.

### `src/types/` — Shared types

Type dùng ở 2+ feature:

```text
types/
  index.ts       ← AiStatus, CommentIntent, CommentPriorityLevel, Order... (union và view type dùng chung)
  database.ts    ← shape dữ liệu từ backend (ShopTikTokChannel...)
  payload.ts     ← payload SSE / API
```

### `src/themes/` & `src/constants/`

```text
themes/     ← colors.ts, typography.ts, shadow.ts, type.ts, index.ts
constants/  ← config.ts (API URL, env config)
```

---

## 19. Điểm lệch convention — đã dọn

Các điểm lệch convention (mục 4, 6, 7) trước đây đã được xử lý:

| File cũ | Vi phạm | Đã dọn |
|---------|---------|--------|
| `orders/create-shipment/components/PackageDimModal.tsx` | Tên PascalCase + folder lặp với `components/create-shipment/` | Xóa folder chết (file rỗng, không import); bản chuẩn `components/create-shipment/package-dim-modal.tsx` đang được dùng |
| `settings/hooks/shipping-address-form.schema.ts` | Zod schema nằm trong `hooks/` | Chuyển sang `settings/schemas/shipping-address-form-schema.ts`, cập nhật 4 import |
| `manage-tiktok-channel/components/use-edit-channel.ts` | Hook nằm trong `components/` | Chuyển ra root feature `manage-tiktok-channel/use-edit-channel.ts` (feature phẳng, cạnh `use-manage-tiktok-channel.ts`) |
| `tiktok-live/components/use-connected-live.ts` | Hook nằm trong `components/` | Chuyển vào `tiktok-live/hooks/use-connected-live.ts` |

### `settings/components/shipping-settings.styles.ts` — ngoại lệ style dùng chung

File này **được 4 component dùng chung** (`shipping-address-section`, `shipping-partners-section`, `shipping-address-modal`, `shipping-address-form-fields`) nên giữ dạng một module thay vì inline vào từng `.tsx` (inline sẽ lặp ~254 dòng × 4). Đã dọn để đúng tinh thần mục 6:

- Đổi `StyleSheet.create` → `createStyles(({ colors }) => ...)`.
- Thay `StyleSheet.hairlineWidth` → `0.5` (giữ `StyleSheet.absoluteFill`).
- Map các màu **khớp token tuyệt đối** sang `colors.*` (`neutral900/100/50/500/400`, `border10/20`).

Các hex còn lại (`#ebb140` gold accent, `#ef4444`, `#d1d5db`...) **chưa có token khớp** nên giữ nguyên — không map ép để tránh lệch giao diện. Bổ sung token cho các màu này là một quyết định design-system riêng.
