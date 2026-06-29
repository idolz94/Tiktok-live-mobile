import { getShippingOrdersApi } from "@features/orders/service/api";
import type { OrderWithTikTok, ShippingStatus } from "@app-types/index";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

export type ShippingFilterKey = "all" | "waiting" | "transit" | "delivered" | "returning" | "other";

export type ShippingOrder = OrderWithTikTok & {
  trackingCode: string;
  shippingStatus: ShippingStatus;
};

const FILTER_STATUSES: Record<ShippingFilterKey, ShippingStatus[]> = {
  all: [],
  waiting: ["pending_pickup", "waiting_pickup", "submitted"],
  transit: ["in_transit", "shipping", "delivering", "on_hold"],
  delivered: ["delivered"],
  returning: ["returning", "return_failed", "returned"],
  other: ["pickup_failed", "damaged", "lost", "cancelled", "failed"],
};

export function useShippingTab() {
  const { refreshShipping } = useLocalSearchParams<{ refreshShipping?: string }>();
  const handledRefreshRef = useRef<string | null>(null);
  const [orders, setOrders] = useState<ShippingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ShippingFilterKey>("all");

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const all = await getShippingOrdersApi();
        // ponytail: only show orders that have an active shipment
        const withShipment = all
          .filter((o) => o.trackingCode && o.shippingStatus !== "not_shipped")
          .sort((a, b) => {
            const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
            const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
            return bTime - aTime;
          }) as ShippingOrder[];

        const filterStatuses = FILTER_STATUSES[filter];
        const filtered = filter === "all" ? withShipment : withShipment.filter((o) => filterStatuses.includes(o.shippingStatus));
        setOrders(filtered);
      } catch (e: any) {
        setError(e?.message ?? "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  useEffect(() => {
    if (!refreshShipping || handledRefreshRef.current === refreshShipping) return;
    handledRefreshRef.current = refreshShipping;
    void load(true);
  }, [load, refreshShipping]);

  const refresh = useCallback(() => load(true), [load]);
  const summary = orders.reduce(
    (acc, order) => ({
      codAmount: acc.codAmount + Number(order.codAmount || 0),
      revenue: acc.revenue + Number(order.totalAmount || order.subtotalAmount || 0),
      shippingFee: acc.shippingFee + Number(order.shippingFee || 0),
      orderCount: acc.orderCount + 1,
    }),
    { codAmount: 0, revenue: 0, shippingFee: 0, orderCount: 0 }
  );

  return { orders, loading, refreshing, error, refresh, summary, filter, setFilter };
}
