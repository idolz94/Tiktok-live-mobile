# App Navigation Flow

> Expo Router (file-based routing). Root: `src/app/`. Entry gate: `src/app/index.tsx`.

## Screens & Routes

| Screen | Route | File | Mục đích |
|--------|-------|------|----------|
| Gate | `/` | `src/app/index.tsx` | Redirect gate dựa trên auth state |
| Onboarding | `/onboarding` | `src/app/onboarding/index.tsx` | First-time landing, chỉ hiện 1 lần |
| Auth | `/(auth)` | `src/app/(auth)/index.tsx` | Login / Register animated crossfade |
| License Expired | `/license-expired` | `src/app/license-expired/index.tsx` | Block screen khi `canUseApp=false` |
| Home (tab) | `/(tabs)` | `src/app/(tabs)/index.tsx` | TikTok live + order list |
| Customers (tab) | `/(tabs)/customers` | `src/app/(tabs)/customers.tsx` | Danh sách khách hàng từ live |
| History (tab) | `/(tabs)/history` | `src/app/(tabs)/history.tsx` | Lịch sử phiên live |
| Shipping (tab) | `/(tabs)/shipping` | `src/app/(tabs)/shipping.tsx` | Quản lý vận đơn |
| Reports (tab) | `/(tabs)/reports` | `src/app/(tabs)/reports.tsx` | Báo cáo doanh thu |
| Settings (tab) | `/(tabs)/settings` | `src/app/(tabs)/settings.tsx` | Cài đặt tài khoản |
| Order Detail | `/order-detail` | `src/app/order-detail/index.tsx` | Chi tiết + sửa đơn hàng |
| Create Shipment | `/order-detail/create-shipment` | `src/app/order-detail/create-shipment.tsx` | Form tạo vận đơn |
| Address Picker | `/order-detail/create-shipment/address-picker` | `src/app/order-detail/create-shipment/address-picker.tsx` | Chọn địa chỉ người gửi/nhận |
| Address Form | `/order-detail/create-shipment/address-form` | `src/app/order-detail/create-shipment/address-form.tsx` | Thêm/sửa địa chỉ |
| Shipment Success | `/order-detail/create-shipment/success` | `src/app/order-detail/create-shipment/success.tsx` | Xác nhận tạo vận đơn thành công |
| Shipping Detail | `/shipping-detail/[id]` | `src/app/shipping-detail/[id].tsx` | Chi tiết vận đơn + timeline |
| Live Session Detail | `/live-session-detail` | `src/app/live-session-detail.tsx` | Chi tiết phiên live cũ |
| Manage TikTok | `/manage-tiktok-channel` | `src/app/manage-tiktok-channel/index.tsx` | Quản lý kênh TikTok |
| Printer Settings | `/printer-settings` | `src/app/printer-settings.tsx` | Cấu hình máy in |
| Shipping Settings | `/shipping-settings` | `src/app/shipping-settings.tsx` | Địa chỉ lấy hàng + kết nối SPX |
| Shipping Address Form | `/shipping-address-form` | `src/app/shipping-address-form.tsx` | Thêm/sửa địa chỉ shop |
| Product Info Setup | `/product-info-setup` | `src/app/product-info-setup.tsx` | Cài đặt sản phẩm trước live |
| License Plans | `/license-plans` | `src/app/license-plans.tsx` | Gói đăng ký |

## Stack Declarations (`src/app/_layout.tsx`)

Root Stack khai báo: `index`, `(auth)`, `onboarding`, `(tabs)`, `printer-settings`, `shipping-settings`, `(sheets)`, `manage-tiktok-channel`, `order-detail`, `shipping-detail`, `license-expired`, `popover-demo`

## Navigation Flowchart

```mermaid
flowchart TD
  Start([App Start]) --> Splash[Splash Overlay]
  Splash --> Gate[/index.tsx - Gate/]

  Gate -->|No token + no onboarding| ONB[/onboarding]
  Gate -->|No token| AUTH[/(auth)]
  Gate -->|canUseApp=false| LX[/license-expired]
  Gate -->|Authenticated| TABS[/(tabs)]

  ONB -->|Tap any button| AUTH
  AUTH -->|Login/Register OK| TABS
  LX -->|Đăng xuất| AUTH

  TABS --> TH[Home]
  TABS --> TC[Customers]
  TABS --> TT[History]
  TABS --> TS[Shipping]
  TABS --> TR[Reports]
  TABS --> TST[Settings]

  TH -->|Tap order| OD[/order-detail]
  TC -->|Tap customer| CDS[CustomerDetailSheet]
  TT -->|Tap session| LSD[/live-session-detail]
  TS -->|Tap card| SHD[/shipping-detail/id]
  SHD --> OD
  TST --> MTC[/manage-tiktok-channel]
  TST --> PS[/printer-settings]
  TST --> SS[/shipping-settings]
  SS --> SAF[/shipping-address-form]
  TST --> LP[/license-plans]

  OD -->|Tạo vận đơn| CS[/create-shipment]
  CS --> AP[address-picker]
  CS --> AF[address-form]
  CS -->|Submit OK| SUC[/success]
  AP --> CS
  AF --> CS
```

## Providers Wrapping Tree

```
SafeAreaProvider
  GestureHandlerRootView
    KeyboardProvider
      ToastProvider
        BottomSheetProvider
          PopoverProvider
            TikTokLiveSocketProvider   ← SSE, never unmounted
              Stack (Expo Router)
```

## Notes

- `TikTokLiveSocketProvider` wraps toàn bộ Stack — SSE connection tồn tại xuyên suốt, không bị reset khi navigate.
- `(sheets)` group được khai báo trong root stack nhưng chưa thấy file screen cụ thể — có thể là modal sheets dùng Expo Router modal presentation.
- `popover-demo` là màn developer demo, không expose trong production nav.
