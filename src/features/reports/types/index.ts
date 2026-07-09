export type ReportPeriod = "1d" | "7d" | "1m" | "6m" | "1y";

export type ChartPoint = { date: string; value: number; label: string };

export type ReportFilter = {
  depositStatus: "paid" | "deposited" | "unpaid" | "refunded" | null;
  status: "draft" | "confirmed" | "packed" | "shipping" | "completed" | "canceled" | "returned" | null;
};
