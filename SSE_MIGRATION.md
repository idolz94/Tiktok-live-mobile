# SSE Migration — Tại sao phải thay đổi và thay đổi gì

## Bối cảnh

Tính năng cốt lõi của app là nhận comment real-time từ TikTok Live thông qua **SSE (Server-Sent Events)**. Backend giữ một kết nối HTTP mở và liên tục đẩy dữ liệu về app. App phải lắng nghe dòng dữ liệu đó và cập nhật UI.

Web app dùng `@microsoft/fetch-event-source`. Mobile app cần cơ chế tương đương nhưng phù hợp với React Native/iOS.

---

## Các file thay đổi

| File | Loại thay đổi |
|------|---------------|
| `src/utils/http/fetch-sse.ts` | Tạo mới — SSE client thay thế react-native-sse |
| `src/modules/tiktok-live/hooks/use-tiktok-live-socket.ts` | Sửa — nhiều vấn đề logic và kỹ thuật |
| `src/modules/tiktok-live/hooks/use-tiktok-live-sse.ts` | Sửa nhỏ — bỏ code trùng lặp |

---

## Vấn đề 1: `react-native-sse` không nhận được event trên iOS

### Triệu chứng

Tab EventStream trong Expo Network Devtools không hiển thị event nào, dù request `/live-stream/events?clientId=...` đã mở thành công (status 200, connection vẫn sống).

### Nguyên nhân kỹ thuật

`react-native-sse` dùng `XMLHttpRequest (XHR)` bên dưới. XHR đọc `responseText` incremental qua callback `onreadystatechange`. Vấn đề là iOS HTTP stack **buffer** dữ liệu trước khi giao cho XHR, nên `responseText` thường nhận được từng chunk lớn, không phải từng event riêng lẻ.

SSE protocol dùng **blank line (`\n\n`) làm ranh giới** giữa các event. Thư viện `react-native-sse` parse bằng cách tìm `\n\n` trong `responseText`. Nếu chunk đầu tiên nhận được bị cắt giữa chừng (chưa có `\n\n`), thư viện bỏ qua không parse — event mất.

Ví dụ thực tế từ debug session:

```
chunk #1 (165 chars): "event: CONNECTED\ndata: {\"clientId\":\"44221cdf...\",\"shopI"
                                                               ^ bị cắt ở đây, chưa có \n\n
```

Chunk tiếp theo bắt đầu bằng phần còn lại của event trước → ranh giới `\n\n` bị "nối" qua 2 chunk khác nhau → thư viện vẫn không nhận ra.

### Giải pháp

Bỏ `react-native-sse`, thay bằng `fetch` với `ReadableStream`. React Native 0.72+ hỗ trợ streaming response qua `response.body.getReader()`. Khác với XHR, `fetch` streaming giao dữ liệu ngay khi nhận từng byte, không buffer.

```ts
// src/utils/http/fetch-sse.ts — file mới hoàn toàn

response = await fetch(url, {
  reactNative: { textStreaming: true }, // tắt buffer của React Native fetch
});

const reader = response.body.getReader(); // đọc stream trực tiếp

while (true) {
  const { done, value } = await reader.read(); // nhận từng chunk ngay khi có
  buffer += decode(value);

  // Tách theo \n\n — ranh giới giữa các SSE event
  const eventBlocks = buffer.split("\n\n");
  buffer = eventBlocks.pop(); // giữ lại phần chưa hoàn chỉnh

  for (const block of eventBlocks) {
    // parse từng event và gọi onEvent callback
  }
}
```

Cách buffer tích lũy đảm bảo rằng dù `\n\n` bị nằm giữa 2 chunk thì vẫn được xử lý đúng vì ta luôn giữ lại phần chưa hoàn chỉnh (`buffer = eventBlocks.pop()`).

---

## Vấn đề 2: `clientId` bị tạo mới mỗi lần component mount

### Triệu chứng

Khi user subscribe một TikTok username, backend ghi nhớ `clientId` để biết gửi event về đâu. Nhưng nếu component re-mount (ví dụ navigate ra rồi vào lại), `clientId` mới được tạo và không trùng với `clientId` đã đăng ký trước → backend vẫn stream vào channel cũ, app mở channel mới và không nhận được gì.

### Code cũ (sai)

```ts
// Mỗi lần component mount = một UUID hoàn toàn mới
const clientIdRef = useRef(createClientId());
```

### Code mới (đúng)

```ts
// Lần đầu: tạo UUID và lưu vào MMKV
// Các lần sau: đọc lại từ MMKV, luôn cùng một ID
const clientIdRef = useRef(getOrCreateClientId());

export function getOrCreateClientId() {
  const existing = loadString(STORAGE_KEYS.CLIENT_ID);
  if (existing) return existing;

  const clientId = createClientId();
  saveString(STORAGE_KEYS.CLIENT_ID, clientId);
  return clientId;
}
```

`getOrCreateClientId` được export và chia sẻ cho cả `use-tiktok-live-socket.ts` lẫn `use-tiktok-live-sse.ts` để đảm bảo 2 hook luôn dùng cùng một `clientId` — tránh trường hợp mỗi hook dùng một ID khác nhau rồi conflict với nhau.

---

## Vấn đề 3: `useEffect` tự động gọi `connectSse()` gây reconnect loop

### Triệu chứng

SSE connection bị đóng rồi mở lại liên tục, không ổn định.

### Nguyên nhân

Code cũ có:

```ts
useEffect(() => {
  connectSse(); // gọi khi mount
}, [connectSse]); // connectSse thay đổi mỗi khi dependencies thay đổi
```

`connectSse` được khai báo trong `useCallback` và phụ thuộc vào `handleServerEvent`, `handleServerEvent` phụ thuộc vào nhiều hàm từ sub-hooks. Chuỗi dependency này có thể tạo ra function reference mới sau mỗi render → `connectSse` thay đổi → `useEffect` chạy lại → đóng/mở SSE liên tục.

Web app tránh được vấn đề này vì `connectSse` chỉ được gọi thủ công (khi user bấm connect), không có `useEffect` tự động.

### Giải pháp

Bỏ `useEffect` tự động gọi `connectSse()`. SSE chỉ được mở khi user thực sự subscribe một TikTok username:

```ts
// Chỉ giữ lại cleanup khi component unmount
useEffect(() => {
  // setup batch flush, AppState listener...
  return () => {
    isManualCloseRef.current = true;
    abortControllerRef.current?.abort(); // hủy fetch stream
    abortControllerRef.current = null;
    // cleanup các timer khác...
  };
}, []); // dependency rỗng = chỉ chạy khi mount/unmount, không bao giờ re-run
```

---

## Vấn đề 4: `LIVE_ERROR` không reset đủ state

### Code cũ

```ts
if (type === "LIVE_ERROR") {
  finalizeCurrentSessionLocally("live_error");
  setStatus(`TikTok lỗi...`); // chỉ cập nhật status text
}
```

### Vấn đề

Khi xảy ra lỗi TikTok live, UI cần biết đây là trạng thái lỗi thực sự (không chỉ là một dòng status text) để có thể highlight đỏ, show banner lỗi riêng. Ngoài ra, `isConnected` vẫn là `true` và comments cũ vẫn còn hiển thị — gây hiểu nhầm UI.

### Giải pháp — thêm `liveError` state riêng

```ts
const [liveError, setLiveError] = useState<string | null>(null);

if (type === "LIVE_ERROR") {
  finalizeCurrentSessionLocally("live_error");
  setIsConnected(false);   // đánh dấu mất kết nối
  setComments([]);          // xóa comment cũ (không còn live nữa)
  setJoinEvent(null);       // tắt notification người vào live
  setLiveError(errorText);  // state riêng biệt để UI render error banner
  setStatus(errorText);
}
```

`liveError` tách biệt khỏi `status` cho phép UI component kiểm tra `liveError !== null` để render trạng thái lỗi khác với trạng thái bình thường.

---

## Vấn đề 5: `subscribeTikTokUsername` không dừng collector cũ khi đổi username

### Vấn đề

Khi user đổi từ username A sang B, code chỉ gọi `finalizeCurrentSessionLocally("change_username")` để cập nhật state local, nhưng **không báo backend dừng Python collector** đang chạy cho A. Backend tiếp tục stream event của A vào channel — lãng phí tài nguyên và có thể gây lẫn event.

Web app luôn gọi `stopTikTokLiveApi` trước khi subscribe username mới.

### Giải pháp

```ts
if (oldUsername && oldUsername !== nextUsername) {
  finalizeCurrentSessionLocally("change_username");
  try {
    // Báo backend dừng collector của username cũ
    await stopTikTokLiveApi({ clientId: clientIdRef.current, username: oldUsernameWithoutAt });
  } catch {
    // best-effort: không crash app nếu lệnh dừng thất bại
  }
}
```

Dùng `try/catch` bỏ qua lỗi vì đây là "best-effort" — nếu stop thất bại, app vẫn tiếp tục subscribe username mới. Không nên chặn user vì lỗi dừng collector cũ.

---

## Vấn đề 6: `subscribeTikTokLiveApi` trả về kết quả nhưng bị bỏ qua

### Code cũ

```ts
await subscribeTikTokLiveApi({ clientId, username: nextUsername });
// result bị bỏ hoàn toàn
await connectSse();
return true; // luôn trả true
```

### Vấn đề

Backend có thể trả về `{ username: "tên_đã_normalize", message: "...", success: false }`. Bỏ qua result khiến:
- Username hiển thị trên UI không được sync với username backend thực sự đang dùng
- Không phân biệt được success/failure từ API

### Giải pháp

```ts
const result = await subscribeTikTokLiveApi({ clientId, username });

if (result?.username) {
  // Dùng username backend trả về (có thể đã normalize khác)
  tiktokUsernameRef.current = result.username;
  setTiktokUsername(result.username);
}

connectSse(); // không await — chạy song song với setStatus
setStatus(result?.message || `Đã gửi lệnh start collector...`);
return result?.success ?? true;
```

`connectSse()` không còn `await` nữa — để `subscribeTikTokLiveApi` và `connectSse` chạy nối tiếp thay vì block, giống cách web app làm.

---

## Vấn đề 7: `USER_JOINED` event bị thiếu

### Vấn đề

Web app hiển thị notification khi có người tham gia live (tự tắt sau 3 giây). Mobile app không có handler cho event `USER_JOINED` nên event này bị bỏ qua hoàn toàn.

### Giải pháp

Thêm `joinEvent` state và handler:

```ts
const [joinEvent, setJoinEvent] = useState<UserJoinedEvent | null>(null);
const joinEventTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

if (type === "USER_JOINED") {
  // Nếu đang có notification cũ, hủy timer cũ trước
  if (joinEventTimerRef.current) clearTimeout(joinEventTimerRef.current);

  setJoinEvent({ displayName, joinAvatarUrl, ... });

  // Tự động xóa sau 3 giây
  joinEventTimerRef.current = setTimeout(() => {
    setJoinEvent(null);
    joinEventTimerRef.current = null;
  }, 3000);
}
```

Dùng `ref` cho timer thay vì state để tránh re-render khi reset timer. Cleanup timer trong `useEffect` để tránh memory leak khi component unmount.

---

## Vấn đề 8: Buffer SSE có thể tăng vô hạn nếu server bug

### Vấn đề

Nếu server gặp lỗi và không bao giờ gửi `\n\n` (blank line phân cách event), vòng lặp `read()` vẫn chạy và `buffer` sẽ tăng không ngừng:

```
10KB → 100KB → 1MB → 5MB → crash (OutOfMemory)
```

### Giải pháp

Thêm guard kiểm tra kích thước buffer:

```ts
const MAX_BUFFER_SIZE = 1024 * 1024; // 1MB

if (buffer.length > MAX_BUFFER_SIZE) {
  throw new Error("SSE buffer overflow — server may not be sending event boundaries");
}
```

Khi vượt ngưỡng, throw error → vòng while thoát qua catch → `onError` được gọi → retry logic xử lý tiếp.

**Lưu ý:** Dùng `value.byteLength` (byte thực tế từ Uint8Array) để đo, không dùng `string.length` (đếm UTF-16 code unit, sai lệch với emoji/Unicode). Sau khi consume events xong thì recalculate lại byte size của buffer còn lại bằng `TextEncoder`.

---

## Vấn đề 9: Re-render mỗi comment gây lag UI khi live đông người

### Vấn đề

`addCommentToList` gọi `setComments` mỗi khi nhận được 1 comment. Nếu TikTok live đông người:

```
50 comments/s  →  setComments() 50 lần/s  →  React re-render 50 lần/s
```

JS thread chạy nóng, UI bắt đầu giật lag, FlatList không scroll mượt.

### Giải pháp — Batch flush mỗi 200ms với bulk insert

```ts
// Đưa vào queue, không gọi setComments ngay
pendingCommentsRef.current.push(unwrapSseCommentPayload(payload));

// setInterval flush toàn bộ queue vào state 1 lần mỗi 200ms
setInterval(() => {
  if (pendingCommentsRef.current.length === 0) return;
  const batch = pendingCommentsRef.current.splice(0);
  // addCommentsToList gọi setComments 1 lần duy nhất cho toàn bộ batch
  const added = addCommentsToList(batch);
  added.forEach((c) => addCommentToCurrentSession(c));
}, 200);
```

**Điểm quan trọng:** `addCommentsToList` (số nhiều) là hàm bulk mới — nhận mảng raw comments, normalize tất cả, rồi gọi `setComments` **1 lần duy nhất**. Khác với `addCommentToList` (số ít) gọi `setComments` mỗi comment. Nếu dùng forEach `addCommentToList` thì 20 comment trong 1 flush vẫn gây 20 renders — sai mục đích.

Kết quả:

```
100 comments/s  →  chỉ còn 5 renders/s (flush mỗi 200ms, 1 render/flush)
```

Ngoài ra `dedupComments()` trong `use-tik-tok-comments.ts` đã có `.slice(0, MAX_COMMENTS)` (500 comment) để giới hạn số lượng render item trong FlatList.

---

## Vấn đề 10: Thiếu reconnect strategy khi mất mạng hoặc app background

### Vấn đề

Hiện tại khi SSE mất kết nối, `onError` chỉ set status text và không làm gì thêm. Các tình huống thực tế:

- Wifi đổi mạng / 4G mất sóng → stream chết, không tự kết nối lại
- iOS: bấm Home button → app xuống background → iOS suspend network → stream chết lặng lẽ
- Khi quay lại foreground: stream đã chết mà app không biết, UI hiển thị "đã kết nối" nhưng thực ra không nhận được event nào

### Giải pháp 1 — Exponential backoff retry

```ts
const RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000]; // ms

onError: (error) => {
  if (isManualCloseRef.current) return;
  setIsConnected(false);

  const delay = RETRY_DELAYS[Math.min(retryCountRef.current, RETRY_DELAYS.length - 1)];
  retryCountRef.current += 1;

  retryTimerRef.current = setTimeout(() => {
    if (!isManualCloseRef.current) connectSse();
  }, delay);
},

onOpen: () => {
  retryCountRef.current = 0; // reset khi kết nối thành công
  setIsConnected(true);
},
```

Thử lần 1 sau 1s, lần 2 sau 2s, lần 3 sau 5s... đến tối đa 30s. Tránh spam server khi backend đang restart.

### Giải pháp 2 — AppState listener cho iOS background (có delay)

```ts
const appStateSub = AppState.addEventListener("change", (nextState) => {
  if (nextState === "active" && !isManualCloseRef.current) {
    // Delay 500ms để iOS network stack kịp sẵn sàng
    setTimeout(() => {
      if (isManualCloseRef.current) return;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      connectSse();
    }, 500);
  }
});
```

**Tại sao delay 500ms?** Khi app vừa foreground, iOS network stack đôi lúc chưa sẵn sàng ngay (đặc biệt khi đổi từ wifi sang 4G trong lúc background). Reconnect ngay lập tức có thể thất bại giả → gây thêm 1 vòng retry không cần thiết.

### Giải pháp 3 — Chống double connect

```ts
const connectSse = useCallback(async () => {
  // Cancel retry timer cũ trước khi mở connection mới
  if (retryTimerRef.current) {
    clearTimeout(retryTimerRef.current);
    retryTimerRef.current = null;
  }

  // Abort connection cũ (nếu có)
  abortControllerRef.current?.abort();
  abortControllerRef.current = new AbortController();
  // ...
});
```

Nếu không clear `retryTimerRef` ở đầu `connectSse`, có thể xảy ra:
```
AppState active → connectSse() → stream mở
1s sau retry timer cũ fire → connectSse() → stream thứ 2 mở song song
```

### Giải pháp 4 — Reset retry khi đổi username

```ts
if (oldUsername && oldUsername !== nextUsername) {
  // Clear retry timer cũ: tránh reconnect vào stream của username cũ
  if (retryTimerRef.current) {
    clearTimeout(retryTimerRef.current);
    retryTimerRef.current = null;
  }
  retryCountRef.current = 0;
  // ...stop collector cũ...
}
```

---

## Vấn đề 11: Heartbeat / Stale connection detection

### Vấn đề

Có trường hợp mạng "nửa sống nửa chết":
- TCP connection vẫn mở
- Không có dữ liệu mới đến
- `reader.read()` không reject (chờ mãi mà không có response)
- UI vẫn hiển thị "đã kết nối" nhưng thực ra stream đã chết

### Giải pháp — Idle timeout trong `fetchSse`

```ts
let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;

function resetHeartbeat() {
  if (heartbeatTimer) clearTimeout(heartbeatTimer);
  heartbeatTimer = setTimeout(() => {
    reader.cancel(); // force đóng stream
    onError?.(new Error("SSE heartbeat timeout — no data received"));
  }, 60_000); // 60s không nhận gì = stream chết
}

// Reset mỗi lần nhận được chunk
resetHeartbeat();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  resetHeartbeat(); // có data → reset đồng hồ
  // ...xử lý buffer...
}
```

Backend server gửi PING mỗi 25s. Nếu 60s không nhận được gì (kể cả PING) → chắc chắn stream đã chết → cancel reader → `onError` fire → retry logic kick in.

---

## Tổng kết thay đổi

| Vấn đề | Giải pháp |
|--------|-----------|
| `react-native-sse` (XHR bị buffer iOS) | `fetch` streaming với `ReadableStream` |
| `createClientId()` mới mỗi mount | `getOrCreateClientId()` lưu vào MMKV |
| `useEffect` tự động `connectSse` | Chỉ gọi khi user subscribe |
| `LIVE_ERROR` chỉ `setStatus` | Reset `isConnected` + `comments` + `liveError` |
| Không stop collector cũ | Gọi `stopTikTokLiveApi` trước khi đổi username |
| Bỏ qua result của API | Đọc `result.username` + `result.success` |
| Thiếu `USER_JOINED` | Thêm `joinEvent` state + auto-clear timer 3s |
| Buffer tăng vô hạn | Guard `MAX_BUFFER_BYTES = 1MB` (đo bằng byte) |
| 50 renders/s khi đông comment | `addCommentsToList` bulk + batch flush 200ms → 1 render/flush |
| Không tự kết nối lại | Exponential backoff + `AppState` listener (delay 500ms) |
| Double connect | Clear `retryTimer` ở đầu `connectSse()` |
| Retry ghost sau đổi username | Clear `retryTimer` + reset count trong `subscribeTikTokUsername` |
| Mạng "nửa sống nửa chết" | Heartbeat timeout 60s → cancel stream nếu idle |

Sau khi áp dụng tất cả thay đổi trên, SSE nhận được event thành công — xác nhận qua debug log:

```
[fetchSse] chunk #1: "event: CONNECTED\ndata: {\"clientId\":\"44221cdf...\"}"
[fetchSse] chunk #2: "event: LIVE_ERROR\ndata: {\"shopId\":\"...\"}"
```
