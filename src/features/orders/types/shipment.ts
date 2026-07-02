export type { AddrFormValues } from "../schemas/shipment-schema";

export type Transport = "road" | "fly";
export type PaymentSide = 0 | 1;
export type ViewCondition = "fragile" | "viewable" | "no_open";
export type PickupOption = "cod" | "post";
export type DeliveryPolicy = "full" | "partial";
export type RefusalFee = "free" | "charge";

export type ServiceType = 1 | 2;
export type CollectType = 1 | 2;

export type SpxTimeslot = {
  date: string;
  pickupTime: number;
  slots: Array<{ id: number; range: string }>;
};

