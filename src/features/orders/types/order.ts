import { OrderFilter, OrderWithTikTok } from "@app-types/index";
import { LottieTypes } from "@assets/lotties";

export type { Order, OrderProduct, OrderWithTikTok } from "@app-types/index";

export type OrderStatCardData = {
  filterKey: OrderFilter;
  lottie: LottieTypes;
  value: number;
  label: string;
  bgColor: string;
};

export type OrdersProps = {
  orders: OrderWithTikTok[];
  paidOrders: number;
  draftOrders: number;
  confirmedOrders: number;
  orderProductCount: number;
  orderFilter: OrderFilter;
  setOrderFilter: (filter: OrderFilter) => void;
};
