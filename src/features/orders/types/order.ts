import type { OrderFilter } from "@app-types/index";
import type { LottieTypes } from "@assets/lotties";

export type { Order, OrderProduct, OrderWithTikTok } from "@app-types/index";

export type OrderStatCardData = {
  filterKey: OrderFilter;
  lottie: LottieTypes;
  value: number;
  label: string;
  bgColor?: string;
};
