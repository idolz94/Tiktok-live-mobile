# 📁 Naming Conventions — Tiktok Live Mobile

Tài liệu này là quy tắc bắt buộc cho toàn bộ project. Mọi thành viên trong nhóm
phải tuân theo để tránh lỗi routing, import sai, và để codebase dễ đọc, dễ maintain.

---

## 1. Tổng quan cấu trúc thư mục

```
Tiktok-live-mobile/
├── src/
│   ├── app/                   ← Expo Router: chỉ chứa route files
│   │   ├── _layout.tsx        ← Root layout (bắt buộc có _)
│   │   ├── (auth)/            ← Route group: không tạo URL segment
│   │   │   ├── _layout.tsx
│   │   │   ├── _components/   ← Private folder: không tạo route
│   │   │   ├── _type.ts       ← Private file: không tạo route
│   │   │   └── index.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── _types.ts
│   │   │   ├── index.tsx
│   │   │   ├── customers.tsx
│   │   │   ├── reports.tsx
│   │   │   ├── settings.tsx
│   │   │   └── shipping.tsx
│   │   └── order-detail/
│   │       └── index.tsx
│   ├── components/            ← UI components dùng chung
│   ├── modules/               ← Feature modules (logic + hooks + api)
│   ├── stores/                ← Zustand state stores
│   ├── hooks/                 ← Global custom hooks
│   ├── contexts/              ← React Contexts
│   ├── utils/                 ← Utility functions
│   ├── themes/                ← Design tokens (colors, typography...)
│   ├── types/                 ← Global TypeScript types
│   ├── constants/             ← App-wide constants
│   └── assets/                ← Hình ảnh, fonts, icons
└── declare/                   ← Module declarations (.d.ts)
```

---

## 2. Quy tắc đặt tên file & folder

### 2.1 Kebab-case cho TẤT CẢ tên file và folder

> ✅ Luôn dùng chữ thường và dấu gạch ngang (`-`) để nối từ.

| ✅ Đúng               | ❌ Sai                  |
|----------------------|------------------------|
| `order-detail/`      | `OrderDetail/`         |
| `use-auth.ts`        | `useAuth.ts`           |
| `auth-store.ts`      | `AuthStore.ts`         |
| `live-status-pill.tsx` | `LiveStatusPill.tsx` |
| `login-banner.png`   | `LoginBanner.png`      |

**Lý do:** Hệ thống file macOS không phân biệt hoa thường (`Order` = `order`),
nhưng Linux/CI server thì có. Dùng kebab-case giúp tránh lỗi trên CI/CD.

---

## 3. Prefix đặc biệt trong `src/app/` — Expo Router

Expo Router quét toàn bộ thư mục `src/app/` và **tự động tạo route** từ mỗi file.
Các prefix sau đây là cú pháp đặc biệt của Expo Router để **kiểm soát** hành vi đó.

---

### 3.1 Dấu ngoặc đơn `(name)` — Route Group

```
src/app/(auth)/
src/app/(tabs)/
```

**Ý nghĩa:**
- Nhóm các màn hình liên quan lại với nhau mà **không tạo thêm URL segment**.
- URL của `src/app/(auth)/index.tsx` vẫn là `/`, không phải `/auth/`.
- Dùng để tổ chức layout riêng (mỗi group có `_layout.tsx` riêng).

**Khi nào dùng `()`?**
- Nhóm màn hình cần share 1 layout (ví dụ: tab bar, auth flow).
- Nhóm màn hình theo tính năng mà không muốn ảnh hưởng đến URL.

**Quy tắc đặt tên:**
```
(auth)   ← tên feature, viết thường, không có dấu gạch ngang nếu 1 từ
(tabs)   ← tên feature
```

> ⚠️ **Không bao giờ đặt component thường (không có prefix) bên trong `(group)/`.**
> Mọi file `.tsx/.ts` trong `src/app/` mà không có prefix `_` đều bị coi là route.

---

### 3.2 Dấu gạch dưới `_name` — Private / Không tạo route

```
src/app/_layout.tsx
src/app/(auth)/_layout.tsx
src/app/(auth)/_components/
src/app/(auth)/_type.ts
src/app/(tabs)/_types.ts
```

**Ý nghĩa:**
- File hoặc folder bắt đầu bằng `_` sẽ **bị Expo Router bỏ qua**, không tạo route.
- Dùng để đặt file phụ trợ bên trong `src/app/` mà không làm ô nhiễm hệ thống route.

**Khi nào dùng `_`?**

| Mục đích                              | Tên file/folder         |
|---------------------------------------|-------------------------|
| Layout của group hoặc root            | `_layout.tsx`           |
| Component nội bộ của 1 route group    | `_components/`          |
| Type definitions nội bộ route         | `_type.ts` / `_types.ts`|
| Hook nội bộ (nếu chỉ dùng trong app/) | `_hooks/`               |

> ✅ `_layout.tsx` là file **bắt buộc** để định nghĩa layout cho mỗi Stack/Tab.

---

### 3.3 Dấu ngoặc vuông `[param]` — Dynamic Route

```
src/app/order-detail/[id].tsx   ← URL: /order-detail/abc123
src/app/(tabs)/[userId].tsx     ← URL: /userId-value
```

**Ý nghĩa:**
- Tạo route động, nhận tham số từ URL.
- Truy cập param bằng `useLocalSearchParams()`.

```tsx
// src/app/order-detail/[id].tsx
import { useLocalSearchParams } from "expo-router";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
}
```

---

### 3.4 `index.tsx` — Route mặc định của folder

```
src/app/(auth)/index.tsx      ← Route: /
src/app/(tabs)/index.tsx      ← Route: / (trong tab context)
src/app/order-detail/index.tsx
```

**Quy tắc:**
- Mỗi folder route nên có `index.tsx` làm entry point chính.
- Đây là file **export default** component màn hình.

---

## 4. Quy tắc bên ngoài `src/app/` — Source Code Thường

### 4.1 `src/components/` — UI Components

```
src/components/
├── avatar.tsx                    ← Component nhỏ, standalone
├── bottom-navigator.tsx
├── product-table.tsx
├── image/                        ← Component phức tạp có nhiều file
│   ├── index.tsx                 ← Export chính
│   └── type.ts                   ← Types riêng
├── screen/
│   ├── index.tsx
│   └── type.ts
├── auth/                         ← Nhóm component theo feature
│   ├── login.tsx
│   ├── register.tsx
│   └── footer.tsx
└── tabs/                         ← Nhóm component theo feature
    ├── order-card.tsx
    ├── stats-row.tsx
    └── ...
```

**Quy tắc:**
- Component đơn giản: 1 file duy nhất, tên kebab-case.
- Component phức tạp (nhiều file): tạo folder, file chính là `index.tsx`.
- Nhóm theo **feature** khi có nhiều component liên quan (`auth/`, `tabs/`).
- **Không dùng `_` prefix** ở đây vì không nằm trong `src/app/`.

---

### 4.2 `src/modules/` — Feature Modules

Mỗi module = 1 tính năng lớn, chứa hooks + services + types.

```
src/modules/
├── auth/
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   └── use-register.ts
│   ├── services/
│   │   └── api.ts
│   └── types.ts                  ← Canonical types cho module này
├── orders/
│   └── order-storage.ts
├── customers/
│   └── customer-mapper.ts
└── tiktok-live/
    ├── types.ts
    ├── sse-api.ts
    ├── use-tiktok-live-socket.ts
    └── live-session-mapper.ts
```

**Quy tắc đặt tên file:**

| Loại file     | Pattern             | Ví dụ                      |
|---------------|---------------------|----------------------------|
| Custom hook   | `use-{feature}.ts`  | `use-auth.ts`              |
| API service   | `api.ts` hoặc `{feature}-api.ts` | `sse-api.ts`  |
| Mapper/Transform | `{entity}-mapper.ts` | `live-session-mapper.ts` |
| Storage       | `{entity}-storage.ts` | `order-storage.ts`       |
| Types         | `types.ts`          | `types.ts`                 |

---

### 4.3 `src/stores/` — Zustand Stores

```
src/stores/
├── index.ts                  ← Re-export tất cả stores
├── auth/
│   ├── index.ts              ← Re-export
│   ├── auth-store.ts         ← Store implementation
│   └── auth-types.ts         ← Store types/interfaces
└── order/
    └── order-store.ts
```

**Quy tắc:**
- Tên store: `{feature}-store.ts`
- Tên types: `{feature}-types.ts`
- Mỗi store folder có `index.ts` để re-export.

---

### 4.4 `src/hooks/` — Global Hooks

```
src/hooks/
└── use-theme.ts
```

- Chỉ đặt hook ở đây nếu **dùng ở nhiều module khác nhau**.
- Hook riêng của 1 module → đặt trong `src/modules/{feature}/hooks/`.

---

### 4.5 `src/utils/` — Utility Functions

```
src/utils/
├── comment.ts
├── createStyles.ts
├── date.ts
├── id.ts
├── order.ts
├── http/
│   ├── axios.ts
│   └── base-url.ts
├── platform/
│   └── index.ts
└── storage/
    ├── constants.ts
    └── helper.ts
```

**Quy tắc:**
- Tên file = tên domain của utility: `date.ts`, `order.ts`, `id.ts`.
- Nhóm theo sub-domain khi có nhiều file liên quan: `http/`, `storage/`.

---

### 4.6 `src/themes/` — Design Tokens

```
src/themes/
├── index.ts       ← Re-export toàn bộ
├── colors.ts      ← Color palette
├── typography.ts  ← Font sizes, weights
├── shadow.ts      ← Shadow styles
└── type.ts        ← Theme TypeScript types
```

---

### 4.7 `src/types/` — Global TypeScript Types

```
src/types/
└── index.ts       ← Tất cả shared types (Order, AuthUser, v.v.)
```

- Alias: `@types` → `src/types/index.ts`
- Chỉ đặt type ở đây nếu **dùng qua nhiều module/store**.
- Type của 1 module → đặt trong `src/modules/{feature}/types.ts`.

---

## 5. Path Aliases — Cách import đúng

Dự án cấu hình sẵn các alias sau trong `tsconfig.json` và `babel.config.js`:

| Alias            | Trỏ đến                  | Ví dụ dùng                                  |
|------------------|--------------------------|---------------------------------------------|
| `@components/*`  | `src/components/*`       | `import Button from "@components/button"`   |
| `@modules/*`     | `src/modules/*`          | `import { useAuth } from "@modules/auth/hooks/use-auth"` |
| `@stores/*`      | `src/stores/*`           | `import useOrderStore from "@stores/order/order-store"` |
| `@hooks/*`       | `src/hooks/*`            | `import { useTheme } from "@hooks/use-theme"` |
| `@utils/*`       | `src/utils/*`            | `import { formatDate } from "@utils/date"`  |
| `@themes/*`      | `src/themes/*`           | `import colors from "@themes/colors"`       |
| `@themes`        | `src/themes/index`       | `import { theme } from "@themes"`           |
| `@types`         | `src/types/index`        | `import type { Order } from "@types"`       |
| `@contexts/*`    | `src/contexts/*`         | `import LiveCtx from "@contexts/live-socket-context"` |
| `@constants/*`   | `src/constants/*`        | `import { API_URL } from "@constants/config"` |
| `@assets/*`      | `src/assets/*`           | `import images from "@assets/images"`       |

### ❌ Tuyệt đối không dùng relative path dài:
```ts
// ❌ Sai
import { useAuth } from "../../../modules/auth/hooks/use-auth";
import { LoginForm } from "@app/(auth)/type";

// ✅ Đúng
import { useAuth } from "@modules/auth/hooks/use-auth";
import { LoginForm } from "@modules/auth/types";
```

---

## 6. Quy tắc Export trong `src/app/`

Expo Router yêu cầu mọi route file phải dùng **`export default`**.

```tsx
// ✅ Đúng — Expo Router nhận ra đây là route
export default function HomeScreen() { ... }

// ❌ Sai — Expo Router sẽ báo lỗi "Element type is invalid"
export const HomeScreen = () => { ... }
export { HomeScreen };
```

> File `_layout.tsx`, `index.tsx`, `customers.tsx`, v.v. — **tất cả** đều phải `export default`.

---

## 7. Quy tắc Export ngoài `src/app/`

Với components, hooks, utils, stores — dùng **named export**:

```ts
// ✅ src/components/avatar.tsx
export const Avatar = () => { ... }

// ✅ src/modules/auth/hooks/use-auth.ts
export const useAuth = () => { ... }

// ✅ src/stores/order/order-store.ts
export const useOrderStore = create<...>(...)
```

---

## 8. Quy tắc đặt tên Types & Interfaces

| Loại           | Convention          | Ví dụ                        |
|----------------|---------------------|------------------------------|
| Interface      | PascalCase          | `OrderStatus`, `AuthUser`    |
| Type alias     | PascalCase          | `LoginForm`, `RegisterForm`  |
| Enum           | PascalCase          | `OrderStatus`                |
| Props type     | `{ComponentName}Props` | `AvatarProps`, `ScreenProps` |
| Store state    | `{Feature}StoreState` | `AuthStoreState`           |

---

## 9. Tóm tắt nhanh — Cheat Sheet

```
src/app/
  (group)/          ← Nhóm route, không tạo URL segment
  _layout.tsx       ← Layout file, không tạo route
  _components/      ← Folder private, không tạo route
  _type.ts          ← File private, không tạo route
  [param].tsx       ← Dynamic route
  index.tsx         ← Route mặc định của folder

Ngoài src/app/:
  kebab-case        ← Luôn dùng cho tên file/folder
  export default    ← CHỈ dùng trong src/app/
  named export      ← Dùng ở mọi nơi khác
  @alias/...        ← Luôn dùng alias, không dùng relative path dài
```

---

## 10. Lỗi thường gặp & cách tránh

| Lỗi                                      | Nguyên nhân                                      | Cách sửa                                    |
|------------------------------------------|--------------------------------------------------|---------------------------------------------|
| `Element type is invalid: got undefined` | Route file trong `src/app/` dùng named export    | Đổi sang `export default`                   |
| `Cannot find module 'src/app/(auth)/type'` | Import trực tiếp file trong `src/app/` từ bên ngoài | Chuyển type ra `src/modules/{feature}/types.ts` |
| Component bị coi là route                | File component không có `_` prefix trong `src/app/` | Đặt vào `_components/` hoặc `src/components/` |
| Lỗi trên CI nhưng OK trên Mac            | Tên file có chữ hoa, macOS không phân biệt case | Đổi sang kebab-case hoàn toàn              |
| Alias không hoạt động lúc runtime        | Thêm alias vào `tsconfig.json` nhưng quên `babel.config.js` | Thêm vào cả hai file                   |
