# Order Flow

> Files: `src/features/orders/`, `src/features/orders/hooks/use-order-manager.ts`, `src/features/orders/hooks/use-order-detail.ts`
> API: `src/features/orders/service/api.ts`

## Tạo đơn từ comment

```mermaid
flowchart TD
  A([Comment xuất hiện trong live]) --> B{Comment có buying intent?}
  B -->|Không| C[Hiển thị bình thường]
  B -->|Có| D[Hiện nút tạo đơn trên comment card]
  D --> E[createOrderFromComment]
  E --> F[POST /orders/from-comment với commentId + customerId]
  F -->|OK| G[Đơn nháp được tạo]
  G --> H[Hiện trong tab Đơn đã tạo]
  F -->|Error| I[Toast error]
```

## Order Manager State (`use-order-manager.ts`)

```
orders (raw list từ API)
  ├── draftOrders      — status=draft
  ├── confirmedOrders  — status=confirmed
  ├── paidOrders       — status=paid
  ├── customers        — merge từ comments + orders
  ├── filteredOrders   — sau filter + search
  ├── buyingCount      — số comment có intent
  └── totalRevenue     — tổng doanh thu confirmed/paid
```

## Xem và sửa đơn (`/order-detail`)

```mermaid
flowchart TD
  T1[Tap order trong list] --> T2[router.push /order-detail?id=...]
  T2 --> T3[useOrderDetail fetch order by ID]
  T3 --> T4{status?}
  T4 -->|draft| T5[Editable: add/edit/delete product]
  T4 -->|confirmed/paid| T6[Read-only view]
  T5 --> T7[Bottom sheet: chọn sản phẩm/màu/size/số lượng]
  T7 --> T8[POST /orders/:id/items hoặc PATCH/DELETE]
  T8 --> T9[Reload order]
```

## Xác nhận đơn

```mermaid
flowchart TD
  C1[Nhấn Xác nhận đơn] --> C2[PATCH /orders/:id/status body: status=confirmed]
  C2 -->|OK| C3[Order chuyển sang confirmed]
  C3 --> C4[Hiện nút Tạo vận đơn]
  C2 -->|Error| C5[Toast error]
  C3 --> C6{Muốn tạo vận đơn?}
  C6 -->|Có| C7[router.push /order-detail/create-shipment]
  C6 -->|Không| C8[Đơn nằm trong Shipping tab chờ]
```

## Deposit / COD

```mermaid
flowchart TD
  D1[Toggle trạng thái đặt cọc] --> D2[PATCH /orders/:id/deposit-status]
  D2 -->|OK| D3[Cập nhật UI badge deposit]
  D2 -->|Error| D4[Revert toggle]
```

## Filter & Search

- Filter tabs: "Tất cả", "Nháp", "Xác nhận", "Đã giao"
- Search: theo tên khách hàng hoặc mã đơn
- State lưu trong `useOrderManager` — không persist, reset khi reload

## Order Data Model (từ types)

```
OrderWithTikTok {
  id, status, createdAt, updatedAt
  customer: CustomerSummary
  items: OrderProduct[]
  subtotal, shipping, discount, deposit, total, cod
  note
  shipment?: ShipmentInfo
}
```

## Error/Empty States

| Tình huống | Xử lý |
|-----------|-------|
| Không có đơn | `EmptyState` component |
| Load lỗi | `ErrorState` component + retry button |
| Thêm sản phẩm lỗi | Toast error, item không được thêm |
| Xác nhận lỗi | Toast error, status không đổi |
| Xóa đơn | Confirm dialog → DELETE /orders/:id → remove khỏi list |

## Assumptions / Cần kiểm tra

- `use-order-detail.ts` fetch toàn bộ order list rồi find by ID — nên có endpoint `GET /orders/:id` riêng để tối ưu.
- Không thấy realtime sync đơn khi nhiều thiết bị cùng mở — refresh thủ công hoặc pull-to-refresh.
- `totalRevenue` tính client-side từ confirmed+paid orders — nên dùng server-side aggregate để tránh inconsistency khi có nhiều đơn.
