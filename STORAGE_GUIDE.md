# Hướng Dẫn Sử Dụng Hệ Thống Storage (MMKV & Secure Store)

Tài liệu này được biên soạn chi tiết nhằm giúp các lập trình viên (đặc biệt là các bạn Intern/Junior) nhanh chóng nắm bắt được vai trò, cấu trúc cấu hình và cách sử dụng hệ thống lưu trữ dữ liệu cục bộ trong dự án.

---

## 1. Tại Sao Lại Sử Dụng MMKV Thay Vì AsyncStorage?

Trong lập trình React Native truyền thống, `@react-native-async-storage/async-storage` là thư viện quốc dân để lưu dữ liệu key-value. Tuy nhiên, nó có những hạn chế lớn sau:
1. **Xử lý bất đồng bộ (Asynchronous)**: Mọi thao tác đọc/ghi đều phải dùng `await` hoặc `.then()`. Khi mở app, việc chờ đọc dữ liệu bất đồng bộ từ bộ nhớ để khởi tạo UI có thể gây ra hiện tượng giao diện bị nhấp nháy (flash screen) hoặc giật lag.
2. **Hiệu năng trung bình**: Dữ liệu phải đi qua cầu nối (Bridge) giữa luồng Native (Java/Objective-C) và luồng Javascript dưới dạng chuỗi JSON, gây tốn tài nguyên.

**MMKV** khắc phục hoàn toàn nhờ các ưu điểm:
* **Tốc độ siêu nhanh**: Được phát triển bởi Tencent, viết bằng **C++**, ghi dữ liệu trực tiếp vào bộ nhớ dạng mapped-memory (`mmap`), nhanh hơn `AsyncStorage` từ **30x đến 100x**.
* **Đọc/ghi đồng bộ (Synchronous)**: Nhận kết quả ngay lập tức trên luồng JS mà không cần dùng `await`.
* **Tích hợp hoàn hảo với Zustand**: Cho phép Zustand tải dữ liệu cũ (hydrate) ngay tức thì khi ứng dụng khởi động.

---

## 2. Cấu Trúc Thư Mục Cấu Hình Storage

Hệ thống Storage được tổ chức tập trung trong thư mục `src/utils/storage/` bao gồm các file:
```text
src/utils/storage/
├── constants.ts     # Định nghĩa danh sách các Key lưu trữ tập trung
├── mmkv.ts          # Khởi tạo instance MMKV & adapter cho Zustand
├── secure-store.ts  # Lưu trữ các dữ liệu bảo mật (như Access/Refresh Token)
├── helper.ts        # Các hàm tiện ích đọc ghi đồng bộ dạng Type-safe
└── index.ts         # Entry point (Barrel Export) gom tất cả để import dễ dàng
```

---

## 3. Giải Thích Các Thành Phần & Hàm Quan Trọng (Kèm Ví Dụ)

### 3.1. constants.ts (Quản lý Keys tập trung)
Để tránh lỗi gõ sai chữ (typo) dẫn đến đọc ghi sai dữ liệu, toàn bộ key lưu trữ bắt buộc phải được khai báo trong `STORAGE_KEYS`.

```typescript
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_SETTINGS: "user_settings",
  THEME: "theme",
  ORDERS: "orders",
  LIVE_HISTORY: "live_history",
} as const; // "as const" giúp khóa chặt giá trị chuỗi của key để TS check type
```

---

### 3.2. secure-store.ts (Lưu trữ dữ liệu nhạy cảm)
Sử dụng `expo-secure-store` để lưu trữ dữ liệu nhạy cảm bằng công nghệ mã hóa phần cứng (Keychain của iOS và Keystore của Android). Thao tác này là **bất đồng bộ (async)**.

> [!WARNING]
> **Tuyệt đối KHÔNG** lưu mật khẩu hoặc Access Token trực tiếp vào MMKV thông thường dưới dạng văn bản thô (clear text). Bắt buộc phải sử dụng `secureStorage`.

#### Các hàm chính:
* `getAccessToken()`: Lấy access token bảo mật.
* `setAccessToken(token)`: Lưu access token bảo mật.
* `removeAccessToken()`: Xóa access token.
* `clearAuth()`: Xóa sạch cả access token lẫn refresh token (thường dùng khi logout).

#### Ví dụ sử dụng:
```typescript
import { secureStorage } from "@utils/storage";

// 1. Khi đăng nhập thành công: lưu Token
const handleLoginSuccess = async (accessToken: string, refreshToken: string) => {
  await secureStorage.setAccessToken(accessToken);
  await secureStorage.setRefreshToken(refreshToken);
};

// 2. Cấu hình Authorization Header trong API Axios Interceptor
axiosInstance.interceptors.request.use(async (config) => {
  const token = await secureStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Khi người dùng bấm Đăng xuất:
const handleLogout = async () => {
  await secureStorage.clearAuth();
  // Điều hướng về màn hình Login...
};
```

---

### 3.3. helper.ts (Các hàm đọc ghi đồng bộ nhanh)
Được xây dựng trên MMKV nhằm cung cấp các hàm đọc/ghi tiện lợi, có ép kiểu dữ liệu an toàn (Type-safe) thông qua type `StorageKey`.

#### A. Đọc Ghi dữ liệu nguyên bản (String, Boolean, Number)
Các hàm này chạy **đồng bộ**, trả về kết quả ngay lập tức:

* `loadString(key)` / `saveString(key, value)`
* `loadBoolean(key)` / `saveBoolean(key, value)`
* `loadNumber(key)` / `saveNumber(key, value)`

##### Ví dụ sử dụng:
```typescript
import { loadBoolean, saveBoolean, loadString, saveString, STORAGE_KEYS } from "@utils/storage";

// Lưu cấu hình giao diện tối (Dark Mode)
const toggleDarkMode = (isDark: boolean) => {
  saveBoolean(STORAGE_KEYS.THEME, isDark); // Trả về true nếu ghi thành công
};

// Đọc cấu hình giao diện tối đồng bộ ngay khi render màn hình
const isDark = loadBoolean(STORAGE_KEYS.THEME) ?? false;
```

#### B. Đọc Ghi Object phức tạp (`loadObject` và `saveObject`)
MMKV nguyên bản chỉ hỗ trợ lưu string, boolean, number. Để lưu Object/Array, ta phải chuyển thành JSON string. Hai hàm này tự động hóa việc đó:

* `saveObject(key, value)`: Tự động `JSON.stringify(value)` và lưu.
* `loadObject<T>(key)`: Tự động `JSON.parse` và ép về kiểu dữ liệu `<T>` mong muốn.

> [!NOTE]
> Hàm `loadObject` kiểm tra `value === undefined` thay vị `!value` để tránh nhận diện sai chuỗi rỗng `""` (vốn là chuỗi JSON hợp lệ nhưng sẽ trả về null nếu check bằng `!value`).

##### Ví dụ sử dụng:
```typescript
import { loadObject, saveObject, STORAGE_KEYS } from "@utils/storage";

interface UserSettings {
  language: string;
  enableNotification: boolean;
}

// 1. Lưu Object cài đặt
const settings: UserSettings = { language: "vi", enableNotification: true };
saveObject(STORAGE_KEYS.USER_SETTINGS, settings);

// 2. Đọc Object cài đặt (Có Type-safety gợi ý thuộc tính)
const userSettings = loadObject<UserSettings>(STORAGE_KEYS.USER_SETTINGS);
if (userSettings) {
  console.log(userSettings.language); // Typescript tự động gợi ý .language và .enableNotification
}
```

---

## 4. Cách Sử Dụng MMKV với Zustand

Khi sử dụng middleware `persist` của Zustand để tự động lưu trạng thái (State) xuống thiết bị, ta dùng `zustandStorage` (adapter đồng bộ của MMKV) thay cho `AsyncStorage`.

### 4.1. Ví dụ cấu hình Store chuẩn (Dùng MMKV hoàn toàn)
```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandStorage } from "@utils/storage";

interface SettingsState {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "settings-storage", // Key lưu dưới MMKV
      storage: createJSONStorage(() => zustandStorage), // Dùng adapter MMKV đồng bộ
    }
  )
);
```
**Tại sao điều này lại tuyệt vời?**
Khi component gọi `useSettingsStore()`, giá trị `theme` được tải trực tiếp đồng bộ từ MMKV. Bạn không cần hiển thị màn hình chờ (Loading) vì không có độ trễ đọc đĩa!

---

### 4.2. Quản lý Di trú Dữ liệu cũ từ AsyncStorage (Migration)
Trong trường hợp ứng dụng của bạn đã chạy một thời gian và có dữ liệu tài khoản cũ của người dùng ở `AsyncStorage`, khi cập nhật lên phiên bản dùng MMKV, ta cần viết một adapter chuyển đổi thông minh (như đã triển khai tại `src/stores/auth/auth-store.ts`):

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { zustandStorage } from "@utils/storage";

const customPersistStorage: StateStorage = {
  getItem: (name: string): string | null | Promise<string | null> => {
    // 1. Thử lấy từ MMKV trước để đảm bảo tốc độ tối đa
    const value = zustandStorage.getItem(name);
    if (value) {
      return value;
    }

    // 2. Nếu MMKV chưa có (chạy app lần đầu sau nâng cấp), đọc từ AsyncStorage cũ bất đồng bộ
    return (async () => {
      try {
        const oldVal = await AsyncStorage.getItem(name);
        if (oldVal) {
          // Lưu đè sang MMKV để các lần sau chạy đồng bộ siêu tốc
          zustandStorage.setItem(name, oldVal);
          return oldVal;
        }
      } catch (e) {
        console.warn("Lỗi di trú dữ liệu cũ:", e);
      }
      return null;
    })();
  },
  setItem: (name: string, value: string): void => {
    zustandStorage.setItem(name, value); // Lưu thẳng đồng bộ vào MMKV
  },
  removeItem: (name: string): void => {
    zustandStorage.removeItem(name); // Xóa khỏi MMKV
  },
};
```

---

## 5. Quy Tắc "Nằm Lòng" Cho Intern / Junior Developer

1. **Khai báo key trước**: Luôn thêm key mới vào `STORAGE_KEYS` trong file `constants.ts` trước khi gọi đọc ghi. Không được tự gõ chuỗi cứng (raw string) ở các component.
2. **Không dùng `await` cho MMKV**: Ngoại trừ `secureStorage`, các hàm khác như `loadString`, `loadObject`, `saveBoolean` chạy đồng bộ nên **không** thêm `await`. Gõ `await loadString(...)` là thừa và không đúng bản chất.
3. **Mã hóa khi cần**: Các thông tin bảo mật/token bắt buộc đi qua `secureStorage`. Dữ liệu cấu hình giao diện, lịch sử, danh sách đơn hàng đi qua `helper` của MMKV.
4. **Không lạm dụng lưu dung lượng quá lớn**: Tuy MMKV rất nhanh, nhưng tránh lưu trữ file ảnh Base64 hoặc các Object nặng vài chục MB vào Storage vì nó sẽ ngốn bộ nhớ RAM của ứng dụng.
