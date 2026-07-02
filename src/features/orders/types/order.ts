import type { OrderFilter } from "@app-types/index";
import type { LottieTypes } from "@assets/lotties";
import { OrderManager } from "../hooks/use-order-manager";

export type { Order, OrderProduct, OrderWithTikTok } from "@app-types/index";

export type OrderStatCardData = {
  filterKey: OrderFilter;
  lottie: LottieTypes;
  value: number;
  label: string;
  bgColor?: string;
};

export type OrdersProps = {
  orderManager: OrderManager;
};

export type FilterButton = {
  key: OrderFilter;
  label: string;
};

export type CustomerButton = {
  key: "vip" | "retail" | "wholesale" | "chot_dao" | "bomb";
  label: string;
  icon?: "king" | "group_user";
};

export type FilterChipKey = OrderFilter | CustomerButton["key"];

export type FilterChipProps = {
  filterKey: FilterChipKey;
  label: string;
  isActive: boolean;
  onPress: (key: FilterChipKey) => void;
  icon?: CustomerButton["icon"];
};

export type OrderFilterBarProps = {
  orderFilter: OrderFilter;
  setOrderFilter: (filter: OrderFilter) => void;
  onClose?: () => void;
};

// START: Types dùng cho useOrderDetail — tập trung ở đây để hook file gọn hơn
export type OrderItemPayload = {
  productName: string;
  quantity: number;
  price: number;
  note?: string;
};

export type UpdateOrderItemPayload = Partial<OrderItemPayload>;
// END: Types dùng cho useOrderDetail
