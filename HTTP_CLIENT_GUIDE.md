# 📡 HTTP Client Guide — Axios trong dự án này

> Tài liệu này giải thích **tại sao** và **như thế nào** chúng ta triển khai Axios,
> dành cho bất kỳ ai lần đầu tiếp cận codebase.

---

## Mục lục

1. [Axios là gì? Tại sao không dùng fetch?](#1-axios-là-gì-tại-sao-không-dùng-fetch)
2. [Cấu trúc file HTTP Client](#2-cấu-trúc-file-http-client)
3. [Tại sao tách `getSseBaseUrl` ra file riêng?](#3-tại-sao-tách-getssebaseurl-ra-file-riêng)
4. [Giải thích từng file chi tiết](#4-giải-thích-từng-file-chi-tiết)
5. [Cách dùng trong thực tế](#5-cách-dùng-trong-thực-tế)
6. [Interceptor là gì và tại sao cần nó?](#6-interceptor-là-gì-và-tại-sao-cần-nó)
7. [Câu hỏi thường gặp (FAQ)](#7-câu-hỏi-thường-gặp-faq)

---

## 1. Axios là gì? Tại sao không dùng `fetch`?

### `fetch` là gì?

`fetch` là API có sẵn trong trình duyệt và React Native để gọi HTTP.
Ví dụ đơn giản nhất:

```ts
const response = await fetch("https://api.example.com/users");
const data = await response.json();
```

### Vấn đề với `fetch` trong dự án thực tế

Khi dự án lớn lên, bạn sẽ có **hàng chục API call** khác nhau.
Nếu dùng `fetch`, mỗi call đều phải viết lặp đi lặp lại:

```ts
// ❌ Cách cũ - fetch - lặp code rất nhiều

// API call 1: đăng nhập
const res1 = await fetch("https://python-tiktok-comment.onrender.com/subscribe", {
  method: "POST",
  headers: { "Content-Type": "application/json" }, // ← viết lại
  body: JSON.stringify({ clientId, username }),     // ← viết lại
});
if (!res1.ok) throw new Error(`Lỗi: ${res1.status}`); // ← viết lại
const data1 = await res1.json();                       // ← viết lại

// API call 2: dừng
const res2 = await fetch("https://python-tiktok-comment.onrender.com/stop", {
  method: "POST",
  headers: { "Content-Type": "application/json" }, // ← lặp lại lần 2
  body: JSON.stringify({ clientId }),              // ← lặp lại lần 2
});
if (!res2.ok) throw new Error(`Lỗi: ${res2.status}`); // ← lặp lại lần 2
const data2 = await res2.json();                       // ← lặp lại lần 2

// API call 3, 4, 5... cứ thế nhân lên
```

Rõ ràng đây là **code rác** — cùng một đoạn lặp đi lặp lại.

### Axios giải quyết vấn đề đó như thế nào?

Axios cho phép tạo một **"instance"** (thực thể) đã được cấu hình sẵn.
Sau đó mọi API call đều dùng chung instance đó:

```ts
// ✅ Cách mới - axios - cấu hình 1 lần, dùng mãi mãi

// Tạo instance (chỉ làm 1 lần, trong file axios.ts)
const httpClient = axios.create({
  baseURL: "https://python-tiktok-comment.onrender.com",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Dùng ở bất cứ đâu - gọn gàng, không lặp code
const { data: data1 } = await httpClient.post("/subscribe", { clientId, username });
const { data: data2 } = await httpClient.post("/stop", { clientId });
```

### Bảng so sánh `fetch` vs `axios`

| Tính năng | `fetch` | `axios` |
|-----------|---------|---------|
| **Base URL** | Phải ghép chuỗi thủ công mỗi lần | Cấu hình 1 lần, tự động gắn |
| **Headers** | Phải khai báo lại mỗi request | Khai báo 1 lần trong instance |
| **Parse JSON** | Phải gọi `res.json()` thủ công | Tự động, lấy qua `response.data` |
| **Kiểm tra lỗi** | Phải tự check `if (!res.ok)` | Tự động throw lỗi nếu status ≥ 400 |
| **Timeout** | Cần dùng `AbortController` (phức tạp) | `timeout: 15000` đơn giản |
| **Interceptor** | Không hỗ trợ | ✅ Có, xử lý lỗi tập trung |

---

## 2. Cấu trúc file HTTP Client

```
src/
├── utils/
│   └── http/
│       ├── base-url.ts    ← Tính toán URL gốc của server
│       └── axios.ts       ← Axios instance (trái tim của HTTP client)
│
└── features/
    └── tiktok-live/
        └── sse-api.ts     ← Các hàm gọi API cụ thể (dùng axios)
```

**Luồng hoạt động:**

```
base-url.ts
    │
    │  (cung cấp URL gốc)
    ▼
axios.ts  ──────────────────────────────────────────▶  httpClient
    │                                                       │
    │  (httpClient được export ra)                         │
    ▼                                                       ▼
sse-api.ts  ──(import httpClient)──▶  httpClient.post("/subscribe", ...)
```

---

## 3. Tại sao tách `getSseBaseUrl` ra file riêng?

### Vấn đề: Circular Dependency (Phụ thuộc vòng)

"Circular dependency" xảy ra khi **module A import module B**, và **module B cũng import lại module A**.

Hãy tưởng tượng tình huống nếu KHÔNG tách ra:

```
# Kịch bản lỗi nếu getSseBaseUrl vẫn nằm trong sse-api.ts:

axios.ts cần import getSseBaseUrl từ sse-api.ts
    ↓
sse-api.ts cần import httpClient từ axios.ts
    ↓
axios.ts lại cần import getSseBaseUrl từ sse-api.ts
    ↓
💥 VÒNG LẶP VÔ TẬN!
```

### Ví dụ thực tế để dễ hiểu

Giống như trong cuộc sống:

> "Anh A nói: Tôi sẽ đến nhà anh B sau khi anh B đến nhà tôi."
> "Anh B nói: Tôi sẽ đến nhà anh A sau khi anh A đến nhà tôi."
> → Không ai đi được cả! ❌

### Giải pháp: Tách ra một file trung gian

```
# Sau khi tách getSseBaseUrl vào base-url.ts:

base-url.ts  ← Không import gì từ project (độc lập hoàn toàn)
    ▲               ▲
    │               │
axios.ts         sse-api.ts

✅ Không còn vòng lặp!
```

---

## 4. Giải thích từng file chi tiết

### 📄 `src/utils/http/base-url.ts`

```ts
import { DEFAULT_WS_URL } from "@constants/config";

export function getSseBaseUrl(): string {
  const rawUrl = DEFAULT_WS_URL.trim();
  // DEFAULT_WS_URL lấy từ biến môi trường: EXPO_PUBLIC_TIKTOK_SSE_API
  // Ví dụ: "https://python-tiktok-comment.onrender.com"

  try {
    const url = new URL(rawUrl);

    // Chuyển đổi giao thức WebSocket → HTTP
    // ws://  → http://
    // wss:// → https://
    if (url.protocol === "ws:") url.protocol = "http:";
    if (url.protocol === "wss:") url.protocol = "https:";

    // Xóa path, query string, hash — chỉ lấy phần gốc
    // "https://api.example.com/some/path?foo=bar" → "https://api.example.com"
    url.pathname = "";
    url.search = "";
    url.hash = "";

    return url.toString().replace(/\/$/, ""); // Xóa dấu / cuối
  } catch {
    // Nếu URL không hợp lệ, thay thế thủ công bằng regex
    return rawUrl
      .replace(/^ws:\/\//, "http://")
      .replace(/^wss:\/\//, "https://")
      .replace(/\/$/, "");
  }
}
```

**Mục đích:** Đảm bảo URL server luôn đúng định dạng HTTP/HTTPS,
bất kể người dùng cấu hình là `ws://`, `wss://`, hay `https://`.

---

### 📄 `src/utils/http/axios.ts`

```ts
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getSseBaseUrl } from "@utils/http/base-url";

// Tạo axios instance với cấu hình mặc định
const httpClient = axios.create({
  baseURL: getSseBaseUrl(),   // URL gốc: "https://python-tiktok-comment.onrender.com"
  timeout: 15_000,            // Hủy request nếu quá 15 giây
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// REQUEST INTERCEPTOR — chạy TRƯỚC khi request được gửi đi
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Ví dụ: Tự động gắn token xác thực vào mọi request
    // const token = getAuthToken();
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR — chạy SAU khi nhận được response
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response, // Thành công → trả về bình thường
  (error: AxiosError) => {
    const status = error.response?.status;

    // Xử lý lỗi tập trung tại đây, không cần lặp ở mỗi API call
    if (status === 401) console.warn("[HTTP] 401 Unauthorized");
    else if (status === 403) console.warn("[HTTP] 403 Forbidden");
    else if (status === 500) console.error("[HTTP] 500 Internal Server Error");
    else if (!error.response) console.error("[HTTP] Network error:", error.message);

    return Promise.reject(error); // Vẫn throw lỗi để caller xử lý tiếp
  },
);

export default httpClient;
```

---

### 📄 `src/features/tiktok-live/sse-api.ts`

```ts
import httpClient from "@utils/http/axios";
import { getSseBaseUrl } from "@utils/http/base-url";

// Re-export để các file khác đang dùng getSseBaseUrl từ sse-api.ts
// không bị lỗi (backward compatible)
export { getSseBaseUrl };

// Gọi API: Bắt đầu kết nối TikTok Live
export async function subscribeTikTokLiveApi({
  clientId,
  username,
}: {
  clientId: string;
  username: string;
}) {
  // httpClient.post tự động:
  // - Gắn baseURL: "https://python-tiktok-comment.onrender.com/subscribe"
  // - Gắn header: "Content-Type: application/json"
  // - Serialize object thành JSON
  // - Parse response JSON
  // - Throw error nếu status >= 400
  const { data } = await httpClient.post("/subscribe", { clientId, username });
  return data;
}

// Gọi API: Dừng kết nối TikTok Live
export async function stopTikTokLiveApi(clientId: string) {
  const { data } = await httpClient.post("/stop", { clientId });
  return data;
}
```

---

## 5. Cách dùng trong thực tế

### Gọi GET request

```ts
import httpClient from "@utils/http/axios";

// Lấy danh sách users
async function getUsers() {
  const { data } = await httpClient.get("/users");
  return data; // data đã được parse JSON tự động
}

// Lấy user theo ID, kèm query params
async function getUserById(id: string) {
  const { data } = await httpClient.get(`/users/${id}`, {
    params: { include: "profile" }, // → /users/123?include=profile
  });
  return data;
}
```

### Gọi POST request

```ts
import httpClient from "@utils/http/axios";

async function createOrder(payload: { productId: string; quantity: number }) {
  const { data } = await httpClient.post("/orders", payload);
  return data;
}
```

### Xử lý lỗi

```ts
import httpClient from "@utils/http/axios";
import { AxiosError } from "axios";

async function fetchSomething() {
  try {
    const { data } = await httpClient.get("/some-endpoint");
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      // Lỗi từ server (4xx, 5xx)
      console.error("Status:", error.response?.status);
      console.error("Message:", error.response?.data?.message);
    } else {
      // Lỗi khác (network, timeout...)
      console.error("Unknown error:", error);
    }
    throw error; // Re-throw để component xử lý tiếp (hiện toast, v.v.)
  }
}
```

### Gọi với custom header (override)

```ts
// Ghi đè header cho một request cụ thể
const { data } = await httpClient.get("/protected", {
  headers: {
    Authorization: "Bearer my-special-token",
  },
});
```

---

## 6. Interceptor là gì và tại sao cần nó?

### Định nghĩa

**Interceptor** (bộ chặn) là hàm chạy tự động trước hoặc sau mỗi request/response.
Giống như người gác cổng — mọi request đều phải qua đây.

```
                    ┌─────────────────┐
                    │ Request Interceptor │
                    └────────┬────────┘
                             │ (chạy trước khi gửi)
                             ▼
  Code của bạn ──────▶  [SERVER]  ──────▶ Response Interceptor
                                                    │
                                                    │ (chạy sau khi nhận)
                                                    ▼
                                              Code của bạn
```

### Ví dụ thực tế: Tự động gắn token

Giả sử mọi API đều cần header `Authorization`. Nếu không có interceptor:

```ts
// ❌ Không có interceptor — phải lặp ở mọi nơi
await httpClient.get("/users", { headers: { Authorization: `Bearer ${token}` } });
await httpClient.get("/orders", { headers: { Authorization: `Bearer ${token}` } });
await httpClient.post("/products", data, { headers: { Authorization: `Bearer ${token}` } });
// ... lặp 50 lần trong project
```

Với interceptor:

```ts
// ✅ Có interceptor — chỉ viết 1 lần trong axios.ts
httpClient.interceptors.request.use((config) => {
  const token = getAuthToken(); // Lấy token từ storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sau đó mọi call TỰ ĐỘNG có token — không cần viết gì thêm
await httpClient.get("/users");   // ← tự có Authorization header
await httpClient.get("/orders");  // ← tự có Authorization header
```

### Ví dụ thực tế: Tự động refresh token khi hết hạn

```ts
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token hết hạn → tự động refresh
      const newToken = await refreshAuthToken();
      // Thử lại request cũ với token mới
      error.config!.headers.Authorization = `Bearer ${newToken}`;
      return httpClient(error.config!);
    }
    return Promise.reject(error);
  }
);
```

---

## 7. Câu hỏi thường gặp (FAQ)

### ❓ `axios.create()` khác gì `axios` thường?

`axios` mặc định là instance dùng chung toàn cầu, không có cấu hình riêng.
`axios.create()` tạo ra một instance **mới, độc lập** với cấu hình riêng.

```ts
import axios from "axios";

// ❌ Dùng axios mặc định — không có baseURL, timeout, headers
const res = await axios.get("https://python-tiktok-comment.onrender.com/users");

// ✅ Dùng instance tùy chỉnh — đã có cấu hình sẵn
const res = await httpClient.get("/users");
// httpClient biết baseURL là gì rồi, chỉ cần truyền path
```

Trong một project lớn, bạn có thể tạo **nhiều instance khác nhau**:

```ts
// Client cho API của mình
const apiClient = axios.create({ baseURL: "https://my-api.com" });

// Client cho API bên thứ 3
const googleClient = axios.create({ baseURL: "https://maps.googleapis.com" });
```

---

### ❓ `response.data` là gì? Tại sao không phải `response` luôn?

Khi axios nhận response, nó gói kết quả vào một object có nhiều thông tin:

```ts
const response = await httpClient.get("/users");

response.data;    // ← Dữ liệu thực sự từ server (JSON đã parse)
response.status;  // ← HTTP status code (200, 201, ...)
response.headers; // ← Response headers
response.config;  // ← Cấu hình request ban đầu

// Thường chỉ cần data, nên dùng destructuring:
const { data } = await httpClient.get("/users");
```

---

### ❓ Tại sao `timeout: 15_000` thay vì `timeout: 15000`?

Đây là cách viết số với **dấu gạch dưới phân cách** (`numeric separator`),
có từ ES2021. Chỉ để dễ đọc, không ảnh hưởng gì đến giá trị:

```ts
15_000  ===  15000   // true
1_000_000  ===  1000000  // true
```

Giống như khi viết "15.000đ" ngoài đời thực để dễ đọc hơn "15000đ".

---

### ❓ `Promise.reject(error)` trong interceptor là gì?

Khi bắt lỗi trong response interceptor, bạn phải **re-throw** lỗi đó để code nơi gọi API vẫn nhận được lỗi:

```ts
// Trong interceptor
(error) => {
  console.error("[HTTP] Lỗi:", error.response?.status);
  // Nếu không có dòng này, lỗi sẽ bị "nuốt" — caller không biết có lỗi
  return Promise.reject(error); // ← Trả lỗi về cho caller xử lý tiếp
}

// Caller vẫn bắt được lỗi để hiện thông báo cho user
try {
  await httpClient.get("/data");
} catch (err) {
  showErrorToast("Có lỗi xảy ra!"); // Vẫn chạy được nhờ re-throw
}
```

---

### ❓ `@utils/http/axios` là path gì vậy?

Đây là **path alias** — cách viết tắt đường dẫn. Thay vì viết:

```ts
import httpClient from "../../../utils/http/axios"; // ← Khó đọc, dễ sai
```

Ta cấu hình alias trong `babel.config.js` và `tsconfig.json` để viết:

```ts
import httpClient from "@utils/http/axios"; // ← Rõ ràng, luôn đúng
```

Alias `@utils` tương ứng với `src/utils/`, `@constants` với `src/constants/`, v.v.

---

### ❓ Khi nào nên thêm API call mới?

1. Tạo (hoặc tìm) file trong `src/features/<tên-feature>/`
2. Import `httpClient` từ `@utils/http/axios`
3. Viết function mới:

```ts
// src/features/customers/customer-api.ts
import httpClient from "@utils/http/axios";

export async function getCustomers() {
  const { data } = await httpClient.get("/customers");
  return data;
}

export async function updateCustomer(id: string, payload: Partial<Customer>) {
  const { data } = await httpClient.put(`/customers/${id}`, payload);
  return data;
}
```

**Không bao giờ** dùng `fetch` trực tiếp trong feature — luôn dùng `httpClient`.

---

*Tài liệu này được viết dựa trên codebase thực tế của dự án.
Nếu có thắc mắc, hãy hỏi trực tiếp team lead.*
