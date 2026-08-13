import type { OrderStatus } from "../types/customer-detail";

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Nháp",
  confirmed: "Đã xác nhận",
  packed: "Đã đóng gói",
  shipped: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
};

export function getOrderStatusLabel(status: OrderStatus) {
  return ORDER_STATUS_LABELS[status] ?? status;
}
