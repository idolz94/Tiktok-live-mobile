# Checklist — Parity giữa Web và Mobile

Mục tiêu: rà soát các màn hình/tính năng hiện có trên web (`tiktok-live-nextjs`) và đối chiếu với mobile (`Tiktok-live-mobile`) để xác định phần còn thiếu.

## 1) Checklist màn hình / route

| Hạng mục | Web | Mobile | Thiếu gì |
|---|---|---:|---|
| Auth | Có | Có | Cần đối chiếu chi tiết login/forgot/register flow |
| Onboarding | Không thấy rõ trên web | Có | Không phải thiếu, nhưng cần xem có cần parity không |
| Home / Dashboard | Có | Có | Mobile có tab home, nhưng cần đối chiếu nội dung |
| Orders list | Có | Không thấy | Thiếu màn danh sách đơn, filter, bulk/action flow |
| Order detail | Có | Có | Cần đối chiếu hành vi và action nút |
| Live dashboard | Có | Không thấy | Thiếu tab/screen live riêng |
| History | Có | Không thấy | Thiếu lịch sử hoạt động/live/order |
| Customers | Có | Có | Cần đối chiếu CRUD/search/detail |
| Shipping | Có | Có | Cần đối chiếu list, connect flow, trạng thái |
| Reports | Có | Có | Cần đối chiếu số liệu và filter |
| Settings | Có | Có | Cần đối chiếu profile, logout, account, app settings |
| Products | Có | Không thấy | Thiếu quản lý sản phẩm |

## 2) Checklist tính năng theo module

### A. Orders

| Chức năng | Web | Mobile | Ghi chú |
|---|---|---:|---|
| Danh sách đơn | Có | Chưa thấy | P0 |
| Filter/search đơn | Có | Chưa thấy | P0 |
| Detail đơn | Có | Có | P1 |
| Action trên đơn | Có | Chưa rõ | Cần kiểm tra cancel/edit/status |
| Card/list UI cho đơn | Có | Chưa thấy | P0 |
| Empty/loading/error states | Có | Chưa rõ | P1 |

### B. Live

| Chức năng | Web | Mobile | Ghi chú |
|---|---|---:|---|
| Tab/screen live riêng | Có | Chưa thấy | P0 |
| Trạng thái live | Có | Chưa rõ | P0 |
| Comment stream UI | Có | Chưa rõ | P0 |
| Connect/disconnect live | Có | Chưa rõ | P0 |
| Live footer/action controls | Có | Chưa thấy | P1 |
| Current session / viewer info | Có | Chưa rõ | P1 |

### C. History

| Chức năng | Web | Mobile | Ghi chú |
|---|---|---:|---|
| Danh sách history | Có | Chưa thấy | P1 |
| Filter theo thời gian/trạng thái | Có | Chưa thấy | P1 |
| Detail history item | Có | Chưa rõ | P2 |

### D. Products

| Chức năng | Web | Mobile | Ghi chú |
|---|---|---:|---|
| Danh sách sản phẩm | Có | Chưa thấy | P1 |
| Search/filter | Có | Chưa thấy | P1 |
| Create/edit product | Có | Chưa thấy | P1 |
| Table/card view | Có | Chưa thấy | P2 |

### E. Customers

| Chức năng | Web | Mobile | Ghi chú |
|---|---|---:|---|
| Customer list | Có | Có | Cần đối chiếu nội dung |
| Search/filter | Có | Chưa rõ | P2 |
| Detail customer | Có | Chưa rõ | P2 |
| CRUD / actions | Có | Chưa rõ | P2 |

### F. Shipping

| Chức năng | Web | Mobile | Ghi chú |
|---|---|---:|---|
| Shipping settings | Có | Có | Cần đối chiếu chi tiết |
| Connect provider flow | Có | Chưa rõ | P1 |
| Provider status / disconnect | Có | Chưa rõ | P1 |
| Errors / empty states | Có | Chưa rõ | P2 |

### G. Reports

| Chức năng | Web | Mobile | Ghi chú |
|---|---|---:|---|
| Reports dashboard | Có | Có | Cần đối chiếu metrics |
| Filter/date range | Có | Chưa rõ | P2 |
| Charts/summary | Có | Chưa rõ | P2 |

### H. Settings

| Chức năng | Web | Mobile | Ghi chú |
|---|---|---:|---|
| Account/profile | Có | Có | Cần đối chiếu đầy đủ |
| Logout/session handling | Có | Có | Cần đối chiếu UX |
| App preferences | Có | Chưa rõ | P2 |
| License/session expired gate | Có | Chưa rõ | P1 |

## 3) Ưu tiên triển khai để đạt parity nhanh

### P0
1. Orders list/management
2. Live screen riêng
3. History screen

### P1
4. Products management
5. Hoàn thiện live controls + session info
6. Hoàn thiện shipping connect/status flow
7. License/session-expired UX

### P2
8. Customers detail/search/action parity
9. Reports filter/charts parity
10. Settings parity chi tiết

## 4 Kết luận ngắn

Mobile hiện có khung app khá tốt rồi, nhưng web đang mạnh hơn ở các màn vận hành lõi:
- Orders
- Live
- History
- Products

Nếu làm theo thứ tự ưu tiên trên, mobile sẽ đạt mức dùng được gần web nhanh nhất.
