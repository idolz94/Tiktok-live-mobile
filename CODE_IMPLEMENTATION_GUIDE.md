# Code Implementation Guide

Tài liệu này bổ sung cho `SOURCE_STRUCTURE_GUIDE.md` — tập trung vào **quy trình triển khai code** cụ thể: đặt tên file, tạo folder, phân tách trách nhiệm giữa screen/component/hook/type, và các nguyên tắc tổ chức khi một feature có nhiều sub-folder.

Đọc cả hai tài liệu trước khi bắt đầu một task mới.

---

## 1. Cấu trúc `src/` và nhiệm vụ từng folder

```text
src/
  app/          ← routing (Expo Router)
  features/     ← business code theo từng nghiệp vụ
  components/   ← UI dùng lại nhiều nơi
  hooks/        ← shared hooks dùng nhiều feature
  stores/       ← barrel export tất cả Zustand stores
  themes/       ← design tokens (màu, chữ, shadow)
  types/        ← shared TypeScript types toàn app
  utils/        ← hàm tiện ích, hạ tầng kỹ thuật
  constants/    ← cấu hình và hằng số toàn app
  assets/       ← ảnh, icon, lottie
```

### `src/app/` — Routing

Chỉ chứa route file của Expo Router. Đây là tầng mỏng nhất.

Nhiệm vụ duy nhất của file trong `app/`:
- Định nghĩa URL path theo cấu trúc folder
- Đọc params từ URL (`useLocalSearchParams`)
- Auth guard / redirect nếu cần
- Render screen component được import từ `features/`

Không đặt logic, API call, state, hay UI phức tạp ở đây.

```text
app/
  _layout.tsx           ← root layout, global providers
  index.tsx             ← redirect gate (auth check)
  (auth)/               ← route group public, không cần auth
    _layout.tsx
    index.tsx
  (tabs)/               ← route group protected, cần auth
    _layout.tsx
    index.tsx           ← tab TikTok live
    customers.tsx
    orders.tsx
    settings.tsx
  (sheets)/             ← modal/sheet routes
  onboarding/
  order-detail/
  splash/
```

---

### `src/features/` — Business Code

Đây là nơi chứa **toàn bộ business logic** của app, tổ chức theo chiều dọc (feature).

Mỗi feature tự chứa component, hook, service, store, type liên quan đến chính nó. Khi sửa một feature, chỉ cần mở folder của feature đó.

```text
features/
  auth/                 ← đăng nhập, đăng ký, bootstrap, session
  tiktok-live/          ← SSE, comment realtime, live session
  orders/               ← quản lý đơn hàng
  customers/            ← quản lý khách hàng
  settings/             ← cài đặt app, tài khoản
  manage-tiktok-channel/ ← kết nối và quản lý kênh TikTok
```

Mỗi feature có thể có các sub-folder:

| Sub-folder | Nhiệm vụ |
|---|---|
| `components/` | UI screens và sub-components chỉ dùng trong feature |
| `hooks/` | Custom hooks xử lý state và logic của feature |
| `service/` | Tất cả API calls (axios) của feature |
| `stores/` | Zustand store nếu cần state shared trong feature |
| `types/` | TypeScript types riêng của feature |
| `schemas/` | Zod validation schemas |
| `utils/` | Pure functions riêng cho feature |
| `contexts/` | React context/provider nếu cần |

---

### `src/components/` — Shared UI Components

Chỉ chứa component dùng lại ở **nhiều feature hoặc nhiều màn hình khác nhau**.

Tiêu chí để đặt component ở đây:
- Component không biết gì về domain cụ thể (không biết về order, comment, customer)
- Component có thể dùng độc lập với bất kỳ feature nào
- Khi feature thứ hai cần dùng cùng component → kéo lên `components/`

```text
components/
  button/               ← Button với loading state
  avatar/               ← Avatar image
  icon/                 ← Icon wrapper
  image/                ← Image với fallback
  screen/               ← Screen container (safe area, scroll)
  header/               ← Header navigation chung
  bottom-sheet/         ← Bottom sheet container
  bottom-tab/           ← Tab bar
  separator/            ← Divider line
  linear-gradient/      ← Gradient background
  pulsing-dot/          ← Animated indicator
  animated-error-text/  ← Error message có animation
  geo-picker/           ← Picker địa lý (tỉnh/huyện/xã)
```

Mỗi component nằm trong folder riêng với cấu trúc:

```text
components/<name>/
  index.tsx             ← component chính, điểm export
  type.ts               ← TypeScript props types
  hooks/                ← hook riêng nếu component có logic phức tạp
```

---

### `src/hooks/` — Shared Hooks

Chứa custom hooks dùng được ở **nhiều feature**. Khác với `features/<feature>/hooks/` chỉ phục vụ một feature.

Hiện tại:

```text
hooks/
  use-theme.ts          ← trả về theme hiện tại (colors, typography, shadows)
                           dùng ở mọi component cần styling
```

Khi nào thêm vào đây: hook không phụ thuộc vào domain cụ thể nào, được dùng ở ít nhất 2 feature khác nhau.

---

### `src/stores/` — Zustand Store Registry

Barrel export tập trung cho tất cả Zustand stores trong app.

```text
stores/
  index.ts              ← re-export tất cả stores từ features/
```

Store thực tế vẫn nằm trong `features/<feature>/stores/`. File `stores/index.ts` chỉ là điểm import thống nhất để tránh import rải rác từ nhiều path khác nhau.

---

### `src/themes/` — Design Tokens

Toàn bộ design system của app: màu sắc, typography, shadow, theme types.

```text
themes/
  colors.ts             ← bảng màu light/dark, semantic colors
  typography.ts         ← font sizes, weights, line heights
  shadow.ts             ← shadow presets
  type.ts               ← TypeScript type cho theme object
  index.ts              ← barrel export
```

Quy tắc:
- Không hardcode màu (`#fff`, `rgba(0,0,0,0.5)`) trong component — dùng token từ `colors.ts`
- Không hardcode font size hay weight — dùng token từ `typography.ts`
- Luôn import theme qua `useTheme()` hook từ `src/hooks/use-theme.ts`

---

### `src/types/` — Shared Types

Types dùng chung ở **nhiều feature**. Không chứa type chỉ một feature dùng.

```text
types/
  index.ts              ← barrel export, shared types: AuthUser, LiveComment,
                           Order, CustomerSummary, LiveTab, OrderFilter...
  database.ts           ← raw types từ DB/API response (trước khi map)
  payload.ts            ← request payload types dùng ở nhiều service
```

Quy tắc phân loại:
- Type chỉ dùng trong một feature → `features/<feature>/types/`
- Type dùng ở 2+ feature → `src/types/`
- Type raw từ API (DTO) → `src/types/database.ts`
- Type payload request → `src/types/payload.ts`

---

### `src/utils/` — Infrastructure & Shared Utilities

Hàm thuần và hạ tầng kỹ thuật dùng chung, không biết gì về domain cụ thể.

```text
utils/
  http/
    axios.ts            ← Axios client instance, interceptors
    auth-session.ts     ← inject token vào request header
    api-error.ts        ← normalize lỗi từ API response
    fetch-sse.ts        ← SSE fetch wrapper
    request-sse.ts      ← SSE request helper
    session-event.ts    ← parse SSE session events
  storage/
    secure-store.ts     ← đọc/ghi token qua Expo SecureStore
    mmkv.ts             ← MMKV instance
    helper.ts           ← helper đọc/ghi MMKV
    constants.ts        ← storage key constants
    index.ts            ← barrel export
  platform/
    index.ts            ← platform-aware helpers (iOS/Android)
  string/
    index.ts            ← string helpers (trim, truncate, normalize...)
  createStyles.ts       ← factory tạo StyleSheet với theme
  date.ts               ← format và parse ngày tháng
  id.ts                 ← generate unique ID
  emoji.ts              ← xử lý emoji trong text
  tiktok.ts             ← TikTok username helpers (dùng ở orders + tiktok-live)
```

Quy tắc:
- Hàm chỉ phục vụ một feature → `features/<feature>/utils/`
- Hàm dùng ở 2+ feature → `src/utils/`
- Không gọi API từ `utils/` — API calls thuộc về `features/<feature>/service/`
- Không import từ `features/` bên trong `utils/`

---

### `src/constants/` — App Configuration

Hằng số cấu hình toàn app, không thay đổi theo runtime.

```text
constants/
  config.ts             ← API base URL, app version, feature flags,
                           timeout values, pagination defaults...
```

Quy tắc:
- Không hardcode URL hay config value rải rác trong code — tập trung ở đây
- Giá trị đến từ environment variable phải qua `config.ts`, không dùng `process.env` trực tiếp trong feature code
- Constants riêng của một feature (ví dụ: order status labels) đặt trong `features/<feature>/constants.ts`

---

### `src/assets/` — Static Assets

```text
assets/
  icons/
    sources/            ← file SVG/PNG gốc của icons
  images/
    sources/            ← file ảnh gốc
  lotties/
    sources/            ← file JSON animation Lottie
```

Import asset qua alias `@assets/`:

```ts
import { Image } from "@components/image";
const logo = require("@assets/images/logo.png");
```

---

## 2. Checklist trước khi viết code

Trước khi tạo file đầu tiên, trả lời 5 câu hỏi sau:

1. File này thuộc feature nào? → xác định `src/features/<feature>/`
2. File này là gì: screen, component, hook, service, type, util, store, hay schema?
3. Folder tương ứng trong feature đó đã tồn tại chưa? Nếu chưa thì tạo.
4. Type của file này đã khai báo ở đâu chưa? Nếu chưa, khai báo trước khi viết logic.
5. Logic xử lý data có nên tách ra hook không?

---

## 2. Đặt tên file và folder

### 2.1 Folder — dùng `kebab-case`

```text
✅ features/orders/
✅ features/tiktok-live/
✅ features/orders/hooks/
✅ features/orders/types/
✅ features/orders/components/order-detail/

❌ features/Orders/
❌ features/tiktokLive/
❌ features/orders/Hooks/
```

### 2.2 File TypeScript/TSX — dùng `kebab-case`

```text
✅ use-order-detail.ts
✅ order-detail.tsx
✅ order-card.tsx
✅ order-api.ts
✅ types.ts  (hoặc order.ts trong folder types/)

❌ OrderDetail.tsx        (PascalCase cho file — không dùng)
❌ orderDetail.tsx        (camelCase cho file — không dùng)
❌ useOrderDetail.ts      (camelCase cho file — không dùng)
```

### 2.3 Export — dùng `PascalCase` cho component, `camelCase` cho hook/function

```ts
// File: order-detail.tsx
export function OrderDetail() { ... }          // ✅ component → PascalCase

// File: use-order-detail.ts
export function useOrderDetail() { ... }       // ✅ hook → camelCase bắt đầu "use"

// File: order-api.ts
export async function getOrderDetail() { ... } // ✅ function → camelCase
```

### 2.4 Tên hook

Hook luôn bắt đầu bằng `use-` (file) và `use` (export):

```text
use-order-detail.ts   → export function useOrderDetail()
use-order-manager.ts  → export function useOrderManager()
use-auth.ts           → export function useAuth()
```

### 2.5 Tên type

Type và interface dùng `PascalCase`:

```ts
type OrderDetail = { ... }
type OrderFilter = { ... }
interface ShipmentPayload { ... }
```

---

## 3. Cấu trúc folder bên trong một feature

Mỗi feature được tổ chức theo các sub-folder cố định. Chỉ tạo folder khi thực sự có file cần đặt vào đó.

```text
features/<feature>/
  components/       ← UI components (screen + sub-components)
  hooks/            ← custom hooks xử lý data/state cho feature
  service/          ← API calls (axios)
  stores/           ← Zustand stores (nếu cần persisted/shared state)
  types/            ← TypeScript types của feature
  schemas/          ← Zod schemas (validation)
  utils/            ← pure functions riêng cho feature
  contexts/         ← React context/provider (nếu cần)
```

Thứ tự ưu tiên tạo khi bắt đầu feature mới:

1. `types/` — khai báo type trước
2. `service/` — viết API call
3. `hooks/` — viết hook gọi service + xử lý state
4. `components/` — viết UI dùng hook

---

## 4. Nguyên tắc tách screen/component và hook

### 4.1 Nguyên tắc cốt lõi

> **File component chỉ chịu trách nhiệm render UI.**
> **Logic xử lý data, state, API call phải nằm trong hook.**

Đây không phải quy tắc cứng 100% — với component đơn giản chỉ nhận props và render thì không cần hook riêng. Nhưng khi có bất kỳ logic nào liên quan đến data fetching, state management, side effect, hay business logic, hãy tách ra hook.

### 4.2 Những gì KHÔNG nên có trong file component/screen

```ts
// ❌ Sai — gọi API trực tiếp trong screen
function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    apiClient.get("/orders").then(res => setOrders(res.data));
  }, []);
  return <FlatList data={orders} />;
}

// ❌ Sai — tính toán business logic trong render
function OrderDetail({ order }) {
  const codAmount = Math.max(order.total - order.deposit, 0);
  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  // ...
}

// ❌ Sai — xử lý form logic phức tạp trong component
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    setLoading(true);
    try { await loginApi(email, password); } finally { setLoading(false); }
  };
  // ...
}
```

### 4.3 Những gì NÊN có trong hook

```ts
// ✅ Đúng — hook chứa toàn bộ logic
// features/orders/hooks/use-order-detail.ts
export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrderDetail(orderId)
      .then(setOrder)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const codAmount = order ? Math.max(order.totalAmount - order.depositAmount, 0) : 0;

  return { order, isLoading, error, codAmount };
}
```

```tsx
// ✅ Đúng — component chỉ render
// features/orders/components/order-detail.tsx
export function OrderDetail({ orderId }: { orderId: string }) {
  const { order, isLoading, codAmount } = useOrderDetail(orderId);

  if (isLoading) return <LoadingSpinner />;
  if (!order) return null;

  return (
    <Screen>
      <OrderHeader order={order} />
      <OrderProductsSection items={order.items} />
      <OrderTotals codAmount={codAmount} />
    </Screen>
  );
}
```

### 4.4 Khi nào KHÔNG cần tách hook

Không bắt buộc tách hook khi component:

- Chỉ nhận props và render (presentational component thuần túy)
- Không có state hay side effect
- Logic quá đơn giản (1–2 dòng)

```tsx
// ✅ Không cần hook riêng — component thuần render
function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const label = ORDER_STATUS_LABELS[status];
  const color = ORDER_STATUS_COLORS[status];
  return <View style={{ backgroundColor: color }}><Text>{label}</Text></View>;
}
```

---

## 5. Khai báo type

### 5.1 Nguyên tắc

- Type **chỉ dùng trong một feature** → đặt trong `features/<feature>/types/`
- Type **dùng ở nhiều feature** → đặt trong `src/types/`
- Type **chỉ dùng trong một file** → có thể khai báo inline trong file đó, nhưng nên chuyển ra `types/` khi type lớn hơn 3 field hoặc dùng lại ở 2+ nơi trong cùng feature

### 5.2 Quy ước file trong `types/`

```text
features/orders/types/
  order.ts          ← types cho order domain (OrderDetail, OrderItem, OrderStatus...)
  filter.ts         ← types cho filtering/sorting (OrderFilter, OrderSortKey...)
  form.ts           ← types cho form data (OrderFormData, EditOrderPayload...)

src/types/
  index.ts          ← barrel export các shared types
  database.ts       ← raw DB/API response types
  payload.ts        ← request payload types dùng chung
```

### 5.3 Ví dụ khai báo type đúng

```ts
// features/orders/types/order.ts
export type OrderStatus = "draft" | "confirmed" | "shipped" | "cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

export type OrderDetail = {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotalAmount: number;
  shippingFee: number;
  discountAmount: number;
  depositAmount: number;
  totalAmount: number;
};
```

```ts
// features/orders/hooks/use-order-detail.ts
// Import từ types/ của feature — không tự khai báo lại
import type { OrderDetail } from "../types/order";
```

### 5.4 Không khai báo type inline trong hook hoặc component khi type lớn

```ts
// ❌ Sai — type lớn khai báo inline trong hook
export function useOrderDetail(id: string) {
  const [order, setOrder] = useState<{
    id: string;
    status: string;
    items: { name: string; qty: number }[];
    total: number;
  } | null>(null);
  // ...
}

// ✅ Đúng — import từ types/
import type { OrderDetail } from "../types/order";

export function useOrderDetail(id: string) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  // ...
}
```

---

## 6. Khi một feature có nhiều sub-component

Khi feature có nhiều màn hình hoặc flow phức tạp, `components/` bên trong feature có thể có sub-folder.

### 6.1 Tổ chức theo màn hình hoặc sub-flow

```text
features/orders/components/
  orders.tsx                    ← màn hình danh sách orders (screen-level)
  order-detail.tsx              ← màn hình chi tiết order (screen-level)
  order-item.tsx                ← row item trong danh sách (shared trong feature)
  order-stat-card.tsx           ← card thống kê (shared trong feature)
  order-filter.tsx              ← filter UI (shared trong feature)
  product-sheet.tsx             ← bottom sheet chọn sản phẩm
  product-table.tsx             ← bảng sản phẩm trong order
  shipping-provider-sheet.tsx   ← bottom sheet chọn đơn vị vận chuyển
```

Khi một màn hình có quá nhiều section và component con, tạo sub-folder theo màn hình:

```text
features/orders/components/
  orders/                       ← sub-folder cho màn hình orders list
    index.tsx                   ← screen chính
    order-list.tsx
    order-filter-bar.tsx
  order-detail/                 ← sub-folder cho màn hình order detail
    index.tsx                   ← screen chính
    header.tsx
    products-section.tsx
    customer-section.tsx
    shipping-section.tsx
    totals-section.tsx
    footer-actions.tsx
```

### 6.2 Rule khi có sub-folder trong components

- Mỗi sub-folder có `index.tsx` là điểm export chính của màn hình/flow đó
- Component con trong sub-folder chỉ export từ `index.tsx` (hoặc import trực tiếp nội bộ)
- Hook của màn hình đó nằm trong `features/<feature>/hooks/`, không nằm trong `components/`
- Type của màn hình đó nằm trong `features/<feature>/types/`

```text
// ✅ Đúng
features/orders/
  components/
    order-detail/
      index.tsx             ← import hook từ hooks/, render sections
      header.tsx
      products-section.tsx
  hooks/
    use-order-detail.ts     ← hook cho order-detail screen
  types/
    order.ts                ← types cho order domain
```

### 6.3 Không đặt hook hay type trong components/

```text
// ❌ Sai
features/orders/components/
  order-detail/
    index.tsx
    use-order-detail.ts     ← hook không được nằm trong components/
    types.ts                ← type không được nằm trong components/
```

---

## 7. Luồng triển khai một screen/feature mới — step by step

### Bước 1: Xác định feature và tạo folder

```bash
# Ví dụ: thêm màn hình Shipments
src/features/shipping/
  components/
  hooks/
  service/
  types/
```

Chỉ tạo folder khi có file thực sự cần đặt vào. Không tạo folder rỗng.

### Bước 2: Khai báo types trước

```ts
// src/features/shipping/types/shipment.ts
export type ShipmentStatus = "pending" | "picked_up" | "in_transit" | "delivered" | "failed";

export type Shipment = {
  id: string;
  orderId: string;
  trackingCode: string;
  status: ShipmentStatus;
  provider: string;
  createdAt: string;
};

export type CreateShipmentPayload = {
  orderId: string;
  providerId: string;
  addressId: string;
};
```

### Bước 3: Viết service (API call)

```ts
// src/features/shipping/service/shipment-api.ts
import { apiClient } from "@utils/http/axios";
import type { Shipment, CreateShipmentPayload } from "../types/shipment";

export async function getShipments(orderId: string): Promise<Shipment[]> {
  const res = await apiClient.get<Shipment[]>(`/orders/${orderId}/shipments`);
  return res.data;
}

export async function createShipment(payload: CreateShipmentPayload): Promise<Shipment> {
  const res = await apiClient.post<Shipment>("/shipments", payload);
  return res.data;
}
```

### Bước 4: Viết hook

```ts
// src/features/shipping/hooks/use-shipments.ts
import { useState, useEffect } from "react";
import { getShipments } from "../service/shipment-api";
import type { Shipment } from "../types/shipment";

export function useShipments(orderId: string) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getShipments(orderId)
      .then(setShipments)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  return { shipments, isLoading, error };
}
```

### Bước 5: Viết screen component

```tsx
// src/features/shipping/components/shipments.tsx
import { Screen } from "@components/screen";
import { FlatList } from "react-native";
import { useShipments } from "../hooks/use-shipments";
import { ShipmentItem } from "./shipment-item";

type Props = { orderId: string };

export function ShipmentsScreen({ orderId }: Props) {
  const { shipments, isLoading } = useShipments(orderId);

  return (
    <Screen>
      <FlatList
        data={shipments}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ShipmentItem shipment={item} />}
      />
    </Screen>
  );
}
```

### Bước 6: Route file chỉ render screen

```tsx
// src/app/shipments/index.tsx
import { useLocalSearchParams } from "expo-router";
import { ShipmentsScreen } from "@features/shipping/components/shipments";

export default function ShipmentsRoute() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return <ShipmentsScreen orderId={orderId} />;
}
```

---

## 8. Quy tắc đặt tên — bảng tóm tắt

| Loại file | Convention tên file | Convention export |
|---|---|---|
| Screen/Component | `kebab-case.tsx` | `PascalCase` |
| Hook | `use-kebab-case.ts` | `useCamelCase` |
| Service/API | `kebab-case-api.ts` | `camelCase` functions |
| Store | `kebab-case-store.ts` | `useCamelCase` (Zustand hook) |
| Types | `kebab-case.ts` trong `types/` | `PascalCase` types |
| Schema | `kebab-case.ts` trong `schemas/` | `camelCase` schemas |
| Utils | `kebab-case.ts` trong `utils/` | `camelCase` functions |
| Context | `kebab-case.tsx` trong `contexts/` | `PascalCase` Provider, `useCamelCase` hook |

---

## 9. Quy tắc import

### 9.1 Dùng alias, không dùng relative path dài

```ts
// ✅ Đúng
import { useOrderDetail } from "@features/orders/hooks/use-order-detail";
import { Screen } from "@components/screen";
import { formatDate } from "@utils/date";

// ❌ Sai — relative path vượt quá 2 cấp
import { useOrderDetail } from "../../../features/orders/hooks/use-order-detail";
```

### 9.2 Import nội bộ trong cùng feature — dùng relative path

```ts
// ✅ Đúng — nội bộ feature dùng relative import
// Trong features/orders/hooks/use-order-detail.ts:
import type { OrderDetail } from "../types/order";
import { getOrderDetail } from "../service/api";

// ✅ Cũng đúng nếu chỉ 1 cấp
import type { OrderDetail } from "./types/order";  // trong cùng folder features/orders/
```

### 9.3 Thứ tự import

```ts
// 1. React, React Native
import { useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";

// 2. Third-party packages
import { useForm } from "react-hook-form";

// 3. Alias imports (shared)
import { Screen } from "@components/screen";
import { formatDate } from "@utils/date";

// 4. Feature-local imports (relative)
import type { OrderDetail } from "../types/order";
import { getOrderDetail } from "../service/api";
```

---

## 10. Anti-patterns cần tránh

### 10.1 Đặt file sai vị trí

```text
// ❌ Sai — type riêng của orders đặt ở shared types
src/types/order-detail-form.ts   ← chỉ orders dùng, phải nằm trong features/orders/types/

// ❌ Sai — component feature-specific đặt ở shared components
src/components/order-card.tsx    ← chỉ orders dùng, phải nằm trong features/orders/components/

// ❌ Sai — API call đặt trong app/ route
src/app/order-detail/order-api.ts  ← phải nằm trong features/orders/service/
```

### 10.2 Nhét logic vào screen

```tsx
// ❌ Sai
export default function OrderDetailRoute() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    apiClient.get(`/orders/${id}`).then(r => setOrder(r.data)).finally(() => setLoading(false));
  }, [id]);
  
  const cod = order ? Math.max(order.total - order.deposit, 0) : 0;
  
  return <View>...</View>;
}

// ✅ Đúng
export default function OrderDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <OrderDetailScreen orderId={id} />;
}
```

### 10.3 Dùng `any` thay vì khai báo type

```ts
// ❌ Sai
const [order, setOrder] = useState<any>(null);
async function fetchOrder(id: any) { ... }

// ✅ Đúng
import type { OrderDetail } from "../types/order";
const [order, setOrder] = useState<OrderDetail | null>(null);
async function fetchOrder(id: string): Promise<OrderDetail> { ... }
```

### 10.4 Tạo hook quá rộng

```ts
// ❌ Sai — một hook làm quá nhiều việc không liên quan
export function useOrderPage() {
  // orders logic
  // customers logic
  // shipping logic
  // filter logic
  // form logic
}

// ✅ Đúng — mỗi hook có một trách nhiệm rõ ràng
export function useOrderList() { ... }       // chỉ list + filter
export function useOrderDetail(id) { ... }   // chỉ chi tiết + actions
export function useOrderForm() { ... }       // chỉ form state
```

### 10.5 Đặt hook trong components/

```text
// ❌ Sai
features/orders/components/order-detail/use-order-detail.ts

// ✅ Đúng
features/orders/hooks/use-order-detail.ts
```

---

## 11. Ví dụ thực tế từ codebase

Dưới đây là các pattern đang hoạt động tốt trong project — dùng làm tham chiếu.

### Pattern 1 — Feature orders (đầy đủ nhất)

```text
features/orders/
  components/
    order-detail.tsx        ← screen, dùng useOrderDetail hook
    orders.tsx              ← screen list, dùng useOrderManager hook
    order-item.tsx          ← row component thuần render
    order-stat-card.tsx     ← card component thuần render
    order-filter.tsx        ← filter UI
    product-sheet.tsx       ← bottom sheet
    product-table.tsx       ← sub-component
    shipping-provider-sheet.tsx
  hooks/
    use-order-detail.ts     ← state + actions cho chi tiết order
    use-order-manager.ts    ← state + actions cho list/filter orders
  service/
    api.ts                  ← tất cả API calls của orders
  stores/
    order-store.ts          ← Zustand store (shared state)
  types/
    order.ts                ← domain types
  utils/
    order.ts                ← pure helper functions
  constants.ts              ← constants của feature
```

### Pattern 2 — Component dùng lại có hook riêng

```text
components/button/
  index.tsx                 ← component chính
  spinner.tsx               ← sub-component
  hooks/
    use-loading.ts          ← hook xử lý loading state
  type.ts                   ← types của component
```

Đây là pattern phù hợp khi shared component có logic phức tạp.

### Pattern 3 — Route file mỏng

```tsx
// src/app/(tabs)/customers.tsx
import { CustomersScreen } from "@features/customers/components/customers";
export default CustomersScreen;
```

Route file chỉ re-export screen component — không có logic nào khác.

---

## 12. Tóm tắt quy tắc

| Câu hỏi | Câu trả lời |
|---|---|
| Type của feature đặt ở đâu? | `features/<feature>/types/types.ts` hoặc `types/<domain>.ts` |
| Hook đặt ở đâu? | `features/<feature>/hooks/use-<name>.ts` |
| API call đặt ở đâu? | `features/<feature>/service/<name>-api.ts` |
| Component chỉ dùng trong feature đặt ở đâu? | `features/<feature>/components/<name>.tsx` |
| Component dùng nhiều feature đặt ở đâu? | `src/components/<name>/index.tsx` |
| Route file có bao nhiêu logic? | Chỉ đọc params và render screen component |
| Screen/component có gọi API trực tiếp không? | Không — gọi qua hook |
| Logic tính toán business đặt ở đâu? | Hook hoặc utils — không trong component render |
| Mỗi hook nên làm bao nhiêu việc? | Một trách nhiệm rõ ràng, tách hook nếu scope quá rộng |
