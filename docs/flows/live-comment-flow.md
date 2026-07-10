# Live Comment Flow

> Files: `src/features/tiktok-live/`, `src/utils/http/fetch-sse.ts`, `src/utils/http/session-event.ts`
> Provider: `TikTokLiveSocketProvider` — root level, never unmounted.

## SSE Architecture

```
Backend SSE endpoint: GET /live-stream/events?clientId=...
  ↓
fetchSse() — streaming fetch, React Native textStreaming
  ↓
TikTokLiveSocketProvider (root context)
  ├── TikTokLiveSocketContext  — stable state + actions
  └── TikTokLiveTimerContext   — liveDurationSeconds (high-frequency updates)
```

Comment batching: pending buffer flushed mỗi 200ms bằng `setInterval`.

## Connect & Start Live

```mermaid
flowchart TD
  A([User chọn kênh TikTok]) --> B[subscribeTikTokUsername]
  B --> C[POST /live-stream/start với clientId + username]
  C -->|OK| D[connectSse]
  D --> E[fetchSse mở streaming fetch]
  E --> F{SSE event}
  F -->|CONNECTED| G[mark connected]
  F -->|SUBSCRIBING| H[Hiện trạng thái đang kết nối]
  F -->|SUBSCRIBED| I[Load snapshot]
  F -->|LIVE_CONNECTED| J[startSessionFromPayload]
  J --> K[Session active — nhận comment]
```

## Comment Realtime Flow

```mermaid
flowchart TD
  K[Session active] --> L{SSE event loop}
  L -->|COMMENT / COMMENT_SAVED| M[Thêm vào pending buffer]
  M --> N[Flush mỗi 200ms vào state]
  N --> O[ConnectedLive render comment cards]
  L -->|COMMENT_UPDATED| P[Patch comment trong list]
  L -->|SNAPSHOT| Q[replaceSnapshot — dedup]
  L -->|USER_JOINED| R[Synthetic join comment]
  L -->|PING| S[Cập nhật viewers count]
  L -->|ORDER_SHIPPING_UPDATED| T[Callback cập nhật order shipping state]
```

## Disconnect / End Live

```mermaid
flowchart TD
  E1{SSE event} -->|LIVE_TIME_ENDED| F1[finalizeSession]
  E1 -->|LIVE_DISCONNECTED| F1
  E1 -->|LIVE_ERROR| F1
  E1 -->|COLLECTOR_STOPPED| F1
  E1 -->|UNSUBSCRIBED| F1
  F1 --> F2[Clear comments]
  F2 --> F3[Session ended state]
  F3 --> F4[Hiện nút Kết nối lại / Kết thúc]
```

## Reconnect (Exponential Backoff)

```mermaid
flowchart TD
  D1[SSE stream error / closed] --> D2[Wait backoff]
  D2 --> D3[Backoff steps: 1s → 2s → 5s → 10s → 30s]
  D3 --> D4[connectSse lại]
  D4 -->|OK| D5[Resume session]
  D4 -->|Still fail| D2
```

## AppState Foreground Resume

```mermaid
flowchart TD
  AP[App về foreground] --> AP2[refreshAccessToken]
  AP2 --> AP3[getLiveSessionStatusApi GET /live-stream/running-session]
  AP3 -->|Session còn active| AP4[Reconnect SSE nếu bị ngắt]
  AP3 -->|Không có session| AP5[Giữ nguyên state]
```

## SSE Events Handled

| Event | Hành động |
|-------|-----------|
| `CONNECTED` | Mark connected |
| `PING` | Update viewers count |
| `SUBSCRIBING` | Show connecting state |
| `SUBSCRIBED` | Load snapshot |
| `LIVE_CONNECTED` | `startSessionFromPayload()` |
| `LIVE_TIME_STARTED` | Start timer |
| `LIVE_TIME_STATUS` | Update timer |
| `LIVE_TIME_ENDED` | Finalize session |
| `LIVE_DISCONNECTED` | Finalize session |
| `LIVE_ERROR` | Finalize session |
| `COLLECTOR_STOPPED` | Finalize session |
| `COMMENT` | Add to pending buffer |
| `COMMENT_SAVED` | Add to pending buffer |
| `COMMENT_UPDATED` | Patch in list |
| `SNAPSHOT` | Replace snapshot (dedup) |
| `USER_JOINED` | Synthetic join comment |
| `UNSUBSCRIBED` | Finalize session |
| `ORDER_SHIPPING_UPDATED` | Callback to order state |

## fetchSse Details

- File: `src/utils/http/fetch-sse.ts`
- Dùng `reactNative: { textStreaming: true }` — không dùng WebSocket hay EventSource
- Buffer cap: 1MB
- Heartbeat timeout: 60s — nếu không có data → cancel reader
- AbortSignal support cho clean teardown
- Xử lý `AbortError` và `FetchRequestCanceledException` im lặng

## Resume Username

Username cuối cùng kết nối được persist vào MMKV key `"lumi_live_resume_username"`. Khi mở lại app, UI tự điền lại username để user dễ reconnect.

## Assumptions / Cần kiểm tra

- Facebook tab trên Home PagerView hiện là "coming soon" — chưa có logic SSE cho Facebook.
- `fetchSse` dùng streaming fetch không chuẩn EventSource — cần test kỹ trên Android (một số thiết bị cũ có vấn đề với text streaming).
- Comment dedup khi `SNAPSHOT` được handle bằng `replaceSnapshot()` — cần verify logic dedup không bỏ sót comment khi snapshot overlap với pending buffer.
