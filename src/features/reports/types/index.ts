export type ReportPeriod = "1d" | "7d" | "1m" | "6m" | "1y" | "custom";

export const REPORT_PERIODS: { id: ReportPeriod; label: string }[] = [
  { id: "1d", label: "1 ngày" },
  { id: "7d", label: "7 ngày" },
  { id: "1m", label: "1 tháng" },
  { id: "6m", label: "6 tháng" },
  { id: "1y", label: "1 năm" },
  { id: "custom", label: "Tuỳ chỉnh" },
];

export type ChartPoint = { date: string; value: number; label: string };

export type ReportFilter = {
  depositStatus: "paid" | "deposited" | "unpaid" | "refunded" | null;
  status: "draft" | "confirmed" | "packed" | "shipping" | "completed" | "canceled" | "returned" | null;
  customFrom: Date | null;
  customTo: Date | null;
};
