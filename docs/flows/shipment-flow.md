# Shipment Flow

> Files: `src/features/orders/hooks/use-create-shipment.ts`, `src/features/orders/service/create-shipment-api.ts`
> SPX auth: `src/utils/http/axios.ts` (HMAC-SHA256 interceptor)
> Routes: `/order-detail/create-shipment`, `/success`

## Provider Modes

| Mode | Kích hoạt | Backend path |
|------|-----------|-------------|
| Manual | Luôn hiện | `POST /orders/:id/shipments/manual` |
| SPX | Shop đã kết nối SPX token | `POST /orders/:id/shipments/spx` |
| GHN/GHTK/VTP | Coming soon | — |

## SPX Shipment Flow

```mermaid
flowchart TD
  S0[Vào create-shipment] --> S1[useCreateShipment mount]
  S1 --> S2[Load: shop addresses, customer addresses, SPX services, pickup timeslots]
  S2 --> S3[User chọn sender address]
  S3 --> S4[User chọn recipient address]
  S4 --> S5[User chọn service type]
  S5 --> S6[User chọn collect type: COD / Prepaid]
  S6 --> S7[User nhập parcel info: weight, value, dims]
  S7 --> S8[User chọn pickup timeslot]
  S8 --> S9{Có voucher?}
  S9 -->|Áp dụng| S10[Apply SPX voucher]
  S9 -->|Bỏ qua| S11[Xem summary + fee breakdown]
  S10 --> S11
  S11 --> S12[Nhấn Xác nhận → router.push /confirm screen]
  S12 --> S13[Nhấn Tạo vận đơn]
  S13 --> S14[POST /spx/orders/create — HMAC-SHA256 signed]
  S14 -->|OK| S15[router.replace /success]
  S14 -->|Error| S16[Toast error, giữ form]
```

## Manual Shipment Flow

```mermaid
flowchart TD
  M0[Chọn Manual mode] --> M1[Nhập tracking number thủ công]
  M1 --> M2[Chọn carrier name optional]
  M2 --> M3[Nhấn Tạo vận đơn]
  M3 --> M4[POST /orders/:id/shipments/manual]
  M4 -->|OK| M5[router.replace /success]
  M4 -->|Error| M6[Toast error]
```

## SPX HMAC-SHA256 Auth

Mọi request đến `/spx/*` được Axios interceptor ký tự động:

```
check-sign = HMAC-SHA256(key=SPX_TOKEN, data="{appId}_{timestamp}_{randomNum}_{payloadString}")
Headers thêm: check-sign, timestamp, random-num
```

Token không bao giờ trả về client — interceptor đọc từ backend env.

## Pickup Timeslots

- API: `GET /spx/pickup-timeslots` với sender address
- Hiện dạng date tabs + radio list timeslot
- Screen riêng: `/order-detail/create-shipment/timeslot`

## Voucher Flow

- API: `GET /spx/vouchers`
- Apply: `POST /spx/vouchers/apply` → trả về discounted_fee
- Unapply: xoá voucher, reload fee

## Success Screen

Route: `/order-detail/create-shipment/success`

Hiển thị:
- Tracking number (màu `#C7A84E` — gold)
- Tóm tắt: người gửi, người nhận, dịch vụ, phí
- CTAs: In nhãn, Về trang đơn hàng

## State Flow (useCreateShipment)

```mermaid
flowchart LR
  Init[Mount] --> Load[Load data]
  Load --> Form[Form state: React Hook Form + Zod]
  Form --> Confirm[Confirm screen]
  Confirm --> Submit[API call]
  Submit -->|OK| Success[Navigate success]
  Submit -->|Error| Form
```

## Error/Empty States

| Tình huống | Xử lý |
|-----------|-------|
| Không có SPX token | Hiện banner kết nối SPX |
| Load timeslots lỗi | Retry button |
| Submit lỗi | Toast, giữ confirm screen |
| Không có địa chỉ | Redirect address-picker |

## Assumptions / Cần kiểm tra

- SPX token được lưu server-side — client không bao giờ biết token value.
- Không có draft state cho shipment form — nếu user tắt app giữa chừng, phải nhập lại từ đầu.
- GHN/GHTK/VTP chưa implement — placeholder trong provider selector.
