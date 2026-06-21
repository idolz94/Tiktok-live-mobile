import { OrderFilter } from "@app-types/index";
import { LottieTypes } from "@assets/lotties";
import { OrderManager } from "../hooks/use-order-manager";
import { Colors } from "@themes/type";

export type { Order, OrderProduct, OrderWithTikTok } from "@app-types/index";

export type OrderStatCardData = {
  filterKey: OrderFilter;
  lottie: LottieTypes;
  value: number;
  label: string;
  bgColor: string;
};

export type OrdersProps = {
  orderManager: OrderManager;
};
