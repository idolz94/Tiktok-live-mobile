# Source Structure Guide

Tài liệu này mô tả cách tổ chức source code cho app Lumi Live — Expo Router + React Native. Được viết để intern đọc cũng hiểu được và biết đặt file mới ở đâu.

## 1. Mô hình đang dùng: route mỏng + feature module dày

`src/app/` chỉ chứa routing của Expo Router. Toàn bộ business logic, UI, hook, service, store, type của mỗi nghiệp vụ nằm trong `src/features/<tên-feature>`.

Trước đây code bị rải ở nhiều folder theo loại file (`modules`, `components`, `stores`, `schemas`, `types`, `utils`, `contexts`). Nay gom về một nơi theo feature.

## 2. Cây folder thực tế

```text
src/
  app/                          ← route files của Expo Router
    _layout.tsx
    index.tsx
    (auth)/
    (tabs)/
    (sheets)/
    onboarding/
    order-detail/
    splash/

  features/                     ← business code từng feature
    auth/
      components/               ← UI riêng của auth
      hooks/
      services/
      schemas/
      stores/
    tiktok-live/
      components/               ← UI TikTok live + live session
      contexts/                 ← TikTokLiveSocketProvider
      hooks/
      service/
      types/
      utils/
      live-session-mapper.ts
    orders/
      components/
      hooks/
      service/
      stores/
      types/
      utils/
    customers/
      customer-mapper.ts

  components/                   ← UI dùng lại nhiều feature
    avatar/
    bottom-sheet/
    bottom-tab/
    button/
    header/
    home/                       ← HomeHeader dùng ở tabs index
    icon/
    image/
    linear-gradient/
    pulsing-dot/
    screen/
    separator/

  hooks/
    use-theme.ts

  stores/
    index.ts                    ← barrel export stores

  themes/
    colors.ts
    typography.ts
    shadow.ts
    index.ts

  types/
    index.ts                    ← shared types toàn app (AuthUser, LiveComment, Order, CustomerSummary, ...)
    database.ts
    payload.ts

  utils/
    http/                       ← axios clients, SSE, session-event
    storage/                    ← SecureStore, MMKV, constants
    platform/
    string/
    tiktok.ts                   ← username helpers dùng ở nhiều feature
    date.ts
    id.ts
    createStyles.ts

  constants/
    config.ts

  assets/
    icons/
    images/
    lotties/
```

## 3. Vai trò từng folder

### `src/app/`

Expo Router file-based routing. Chỉ chứa route file.

Nhiệm vụ route file:
- Định nghĩa path
- Đọc params từ URL
- Auth guard / redirect
- Render screen component từ feature

Ví dụ đúng — route chỉ render feature screen:

```tsx
// src/app/(tabs)/settings.tsx
import { useAuth } from "@features/auth/hooks/use-auth";
import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
// render UI từ contexts đã có sẵn, không tự logic ở đây
```

Không nên đặt toàn bộ UI, API call, hay mapper trong route file.

### `src/features/`

Đây là nơi chứa code theo chiều dọc. Một feature tự chứa component, hook, service, store, type liên quan đến chính nó.

Khi sửa TikTok live, mở `src/features/tiktok-live/`. Khi sửa orders, mở `src/features/orders/`.

#### Cấu trúc bên trong một feature

```text
features/tiktok-live/
  components/          ← UI components chỉ dùng trong feature này
  contexts/            ← React provider/context của feature
  hooks/               ← custom hooks của feature
  service/             ← API calls
  types/               ← TypeScript types riêng cho feature
  utils/               ← helper functions riêng cho feature
  live-session-mapper.ts
```

Không phải feature nào cũng cần đủ tất cả folder. Chỉ tạo khi có file thực sự cần.

#### Mapping feature → folder thực tế

| Feature | Location |
|---------|----------|
| Auth (login/register/bootstrap) | `src/features/auth/` |
| TikTok live (SSE, comments, session) | `src/features/tiktok-live/` |
| Orders | `src/features/orders/` |
| Customers | `src/features/customers/` |

### `src/components/`

Chỉ chứa component dùng lại nhiều feature hoặc nhiều màn hình.

Ví dụ nên đặt tại đây:

```text
Button, Avatar, Icon, Image, Screen, Separator, BottomSheet, LinearGradient
```

Không đặt feature-specific component ở đây. `CommentCard`, `OrderCard`, `TiktokPage` nằm trong feature tương ứng.

Ngoại lệ: `src/components/home/header.tsx` là `HomeHeader` dùng ở tab root nên vẫn nằm trong `src/components/home/`.

### `src/utils/`

Hàm thuần dùng chung, không biết gì về feature cụ thể.

Ví dụ:
- `date.ts` — format ngày tháng
- `id.ts` — generate ID
- `tiktok.ts` — helpers TikTok username, dùng ở cả orders và tiktok-live nên ở shared
- `createStyles.ts` — theme style helper
- `http/` — axios, request helpers, SSE, session event
- `storage/` — SecureStore, MMKV

Nếu hàm chỉ phục vụ một feature, đặt trong `features/<feature>/utils/`.

### `src/types/`

Types dùng chung toàn app: `AuthUser`, `LiveComment`, `Order`, `CustomerSummary`, `LiveTab`, `OrderFilter`, v.v. Không nên có type chỉ một feature dùng.

Types riêng của một feature nên nằm trong `features/<feature>/types/`.

## 4. Path aliases hiện tại

Tất cả aliases trong `tsconfig.json` và `babel.config.js` phải đồng bộ nhau.

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
| `@app/*` | `src/app/*` |
| `@contexts/*` | `src/contexts/*` _(folder hiện đã rỗng, alias còn lại để tránh break nếu dùng lại)_ |

## 5. Quy tắc đặt file — checklist nhanh

Trả lời theo thứ tự:

1. **File này tạo route không?** → `src/app/`
2. **File này chỉ phục vụ một feature không?** → `src/features/<feature>/`
3. **File này là UI dùng lại nhiều nơi không?** → `src/components/`
4. **File này là hạ tầng kỹ thuật (axios, storage, SSE)?** → `src/utils/`
5. **File này là type dùng toàn app không?** → `src/types/`

Nếu vẫn phân vân, đặt gần nơi dùng nhất. Khi feature thứ hai cần dùng lại, kéo lên shared.

## 6. Dependency rule

```text
src/app → src/features → src/components, src/utils, src/types, src/themes
```

- `app` được import từ `features`.
- `features` được import từ `components`, `utils`, `types`.
- `components` không nên import từ `features`.
- `utils` không nên import từ `features`.

## 7. Ví dụ implement feature mới: Reports

Giả sử cần thêm feature `reports`.

### Bước 1: Tạo feature folder

```text
src/features/reports/
  components/
    ReportsScreen.tsx
    ReportSummaryCard.tsx
  hooks/
    use-reports.ts
  service/
    reports-api.ts
  types.ts
```

### Bước 2: Định nghĩa type

```ts
// src/features/reports/types.ts
export type ReportSummary = {
  totalOrders: number;
  totalRevenue: number;
  totalComments: number;
};
```

### Bước 3: Viết service gọi API

```ts
// src/features/reports/service/reports-api.ts
import { apiClient } from "@utils/http/axios";
import type { ReportSummary } from "../types";

export async function getReportSummary() {
  const res = await apiClient.get<ReportSummary>("/reports/summary");
  return res.data;
}
```

### Bước 4: Viết hook

```ts
// src/features/reports/hooks/use-reports.ts
import { useEffect, useState } from "react";
import { getReportSummary } from "../service/reports-api";
import type { ReportSummary } from "../types";

export function useReports() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getReportSummary()
      .then(setSummary)
      .finally(() => setIsLoading(false));
  }, []);

  return { summary, isLoading };
}
```

### Bước 5: Viết screen component

```tsx
// src/features/reports/components/ReportsScreen.tsx
import { Screen } from "@components/screen";
import { useReports } from "../hooks/use-reports";
import { ReportSummaryCard } from "./ReportSummaryCard";

export function ReportsScreen() {
  const { summary, isLoading } = useReports();

  return (
    <Screen>
      {!isLoading && summary ? <ReportSummaryCard summary={summary} /> : null}
    </Screen>
  );
}
```

### Bước 6: Route chỉ render screen

```tsx
// src/app/(tabs)/reports.tsx
import { ReportsScreen } from "@features/reports/components/ReportsScreen";

export default function ReportsRoute() {
  return <ReportsScreen />;
}
```

## 8. Ví dụ import đúng

### Thêm component dùng lại nhiều feature

```text
src/components/button/index.tsx      ← đúng
src/features/auth/components/Button.tsx  ← sai nếu Button dùng ở nhiều nơi
```

### Thêm CommentCard chỉ dùng ở TikTok live

```text
src/features/tiktok-live/components/comment-card.tsx  ← đúng
src/components/comment-card.tsx                       ← sai, đây là feature-specific UI
```

### Import order store từ route

```ts
import { useOrderStore } from "@features/orders/stores/order-store";  // đúng
import { useOrderStore } from "@stores/order/order-store";             // sai, path cũ
```

### Import context TikTok live

```ts
import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";  // đúng
import { useTikTokLiveSocketContext } from "@contexts/tiktok-live-socket";                       // sai, path cũ
```

## 9. Những gì còn giữ ở shared

Tạm thời giữ tại `src/utils/` thay vì chuyển vào feature vì có nhiều feature dùng chung:

- `src/utils/tiktok.ts` — `cleanTikTokUsername`, `getOrderTikTokUsername` dùng ở cả orders và tiktok-live
- `src/utils/http/` — axios clients, request helpers, SSE infrastructure
- `src/utils/storage/` — token/MMKV storage

## 10. Nguyên tắc cốt lõi

> Code nên nằm gần nơi nó thay đổi, không nằm theo loại file.

Khi sửa TikTok live: mở `src/features/tiktok-live/`.
Khi sửa orders: mở `src/features/orders/`.
Khi sửa auth: mở `src/features/auth/`.
Khi sửa shared UI: mở `src/components/`.

## 11. Nguồn tham khảo

- [Expo Router core concepts](https://docs.expo.dev/router/basics/core-concepts)
- [Expo app folder structure best practices](https://expo.dev/blog/expo-app-folder-structure-best-practices)
- [Bulletproof React project structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
- [Feature-based organization for React Native](https://gist.github.com/SwarajDashDev/bf0f18a9587414f98c26b3e61b87c197)
