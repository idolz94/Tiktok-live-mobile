import { useState, useCallback, useEffect } from "react";
import type { ReportPeriod, ChartPoint, ReportFilter } from "../types";
import { getOrderStatsApi, type OrderStatsData, type StatChartPoint } from "@features/orders/service/api";

function getPeriodDates(
  period: ReportPeriod,
  customFrom?: Date | null,
  customTo?: Date | null,
): { dateFrom: string; dateTo: string } {
  if (period === "custom" && customFrom && customTo) {
    const from = new Date(customFrom);
    from.setHours(0, 0, 0, 0);
    const to = new Date(customTo);
    to.setHours(23, 59, 59, 999);
    return { dateFrom: from.toISOString(), dateTo: to.toISOString() };
  }

  const now = new Date();
  const to = new Date(now);
  const from = new Date(now);

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  if (period === "7d") from.setDate(from.getDate() - 6);
  else if (period === "1m") from.setDate(from.getDate() - 29);
  else if (period === "6m") {
    from.setMonth(from.getMonth() - 5);
    from.setDate(1);
  } else if (period === "1y") {
    from.setFullYear(from.getFullYear() - 1);
    from.setMonth(0);
    from.setDate(1);
  }

  return { dateFrom: from.toISOString(), dateTo: to.toISOString() };
}

function buildChart(rawPoints: StatChartPoint[], period: ReportPeriod): ChartPoint[] {
  if (period === "6m" || period === "1y") {
    const byMonth: Record<string, number> = {};
    for (const p of rawPoints) {
      const key = p.date.slice(0, 7);
      byMonth[key] = (byMonth[key] ?? 0) + p.value;
    }
    const months = period === "1y" ? 12 : 6;
    const now = new Date();
    return Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return {
        date: key,
        value: byMonth[key] ?? 0,
        label: `T${d.getMonth() + 1}`,
      };
    });
  }

  const days = period === "1d" ? 1 : period === "7d" ? 7 : 30;
  const byDate: Record<string, number> = {};
  for (const p of rawPoints) byDate[p.date] = p.value;

  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().slice(0, 10);
    const dayOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()];
    const label = period === "1d" ? "Hôm nay" : period === "7d" ? dayOfWeek! : String(d.getDate()).padStart(2, "0");
    return { date: key, value: byDate[key] ?? 0, label };
  });
}

export function useReports() {
  const [period, setPeriod] = useState<ReportPeriod>("7d");
  const [filter, setFilter] = useState<ReportFilter>({ depositStatus: null, status: null, customFrom: null, customTo: null });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [stats, setStats] = useState<OrderStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { dateFrom, dateTo } = getPeriodDates(period, filter.customFrom, filter.customTo);
      const data = await getOrderStatsApi({
        dateFrom,
        dateTo,
        ...(filter.depositStatus ? { depositStatus: filter.depositStatus } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      });
      setStats(data);
    } catch (err) {
      setError((err as Error)?.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [period, filter]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refresh = useCallback(async () => {
    await fetch();
  }, [fetch]);

  return {
    period,
    setPeriod,
    filter,
    setFilter,
    filterSheetOpen,
    setFilterSheetOpen,
    stats,
    loading,
    error,
    refresh,
    chartData: {
      revenue: stats ? buildChart(stats.revenue.chart, period) : [],
      orders: stats ? buildChart(stats.orders.chart, period) : [],
      products: stats ? buildChart(stats.products.chart, period) : [],
      customers: stats ? buildChart(stats.customers.chart, period) : [],
    },
  };
}
