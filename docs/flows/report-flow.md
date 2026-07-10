# Report Flow

> Files: `src/features/reports/hooks/use-reports.ts`, `src/features/reports/service/api.ts`
> Route: `/(tabs)/reports`

## Tổng quan

Reports tab hiển thị thống kê doanh thu và đơn hàng theo khoảng thời gian. Dữ liệu fetch từ `GET /orders/stats`.

## Fetch Flow

```mermaid
flowchart TD
  R0[User mở tab Reports] --> R1[useReports mount]
  R1 --> R2[Fetch GET /orders/stats với period + filters]
  R2 -->|OK| R3[Hiện stats + charts]
  R2 -->|Error| R4[ErrorState + retry]
  R3 --> R5{User đổi period tab?}
  R5 -->|Có| R6[Re-fetch với period mới]
  R6 --> R3
  R3 --> R7{User đổi filter?}
  R7 -->|Có| R8[Re-fetch với filter mới]
  R8 --> R3
```

## Period Selector

| Tab | Value | Mô tả |
|-----|-------|-------|
| Hôm nay | `1d` | Ngày hiện tại |
| 7 ngày | `7d` | 7 ngày gần nhất |
| 1 tháng | `1m` | 30 ngày |
| 6 tháng | `6m` | 180 ngày |
| 1 năm | `1y` | 365 ngày |
| Tùy chỉnh | `custom` | Date picker range |

## Filters

- Deposit status: all / deposited / not-deposited
- Order status: all / confirmed / paid / draft

## Response Model (từ `GET /orders/stats`)

```
OrderStats {
  totalRevenue: number       — tổng doanh thu
  totalOrders: number        — tổng số đơn
  confirmedOrders: number    — đơn xác nhận
  paidOrders: number         — đơn đã thanh toán
  depositTotal: number       — tổng đặt cọc
  codTotal: number           — tổng COD
  chartData: ChartPoint[]    — dữ liệu vẽ chart theo ngày
}
```

## Chart

- Library: `react-native-gifted-charts`
- Loại: Bar chart (doanh thu theo ngày) + Line chart (số đơn)
- Data: `chartData[]` từ API — không tính client-side

## Custom Date Range

```mermaid
flowchart TD
  C1[Chọn tab Tùy chỉnh] --> C2[Hiện date picker: từ ngày - đến ngày]
  C2 --> C3[Confirm]
  C3 --> C4[Fetch với startDate + endDate params]
  C4 --> R3[Hiện stats]
```

## Error/Empty States

| Tình huống | Xử lý |
|-----------|-------|
| Không có dữ liệu | EmptyState "Chưa có doanh thu" |
| Load lỗi | ErrorState + retry |
| Network offline | ErrorState + retry |

## Assumptions / Cần kiểm tra

- `totalRevenue` do server tổng hợp — không tính client-side, tránh inconsistency.
- Không thấy export CSV / PDF trong code hiện tại.
- Không thấy compare period (kỳ này vs kỳ trước).
