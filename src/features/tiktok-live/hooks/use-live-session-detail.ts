import { OrderFilter } from "@app-types/index";
import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import { useCallback, useMemo, useState } from "react";

export function useLiveSessionDetail(sessionId: string) {
  const { liveHistory } = useTikTokLiveSocketContext();
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");

  const session = useMemo(
    () => liveHistory.find((s) => s.id === sessionId) ?? null,
    [liveHistory, sessionId],
  );

  const orders = useMemo(() => session?.orders ?? [], [session]);

  const confirmedOrders = useMemo(
    () => orders.filter((o) => o.status === "confirmed").length,
    [orders],
  );
  const paidOrders = useMemo(
    () =>
      orders.filter(
        (o) => o.depositStatus === "paid" || o.depositStatus === "deposited",
      ).length,
    [orders],
  );
  const unpaidOrders = useMemo(
    () =>
      orders.filter(
        (o) => o.depositStatus !== "paid" && o.depositStatus !== "deposited",
      ).length,
    [orders],
  );
  const draftOrders = useMemo(
    () => orders.filter((o) => o.status === "draft").length,
    [orders],
  );

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders;
    if (orderFilter === "confirmed") return orders.filter((o) => o.status === "confirmed");
    if (orderFilter === "paid")
      return orders.filter(
        (o) => o.depositStatus === "paid" || o.depositStatus === "deposited",
      );
    if (orderFilter === "unpaid")
      return orders.filter(
        (o) => o.depositStatus !== "paid" && o.depositStatus !== "deposited",
      );
    if (orderFilter === "draft") return orders.filter((o) => o.status === "draft");
    return orders;
  }, [orders, orderFilter]);

  const productCount = useMemo(
    () =>
      orders.reduce(
        (sum, o) =>
          sum +
          (Array.isArray(o.products)
            ? o.products.reduce((s, p) => s + Number(p.quantity || 1), 0)
            : 1),
        0,
      ),
    [orders],
  );

  const toggleFilter = useCallback(
    (key: OrderFilter) =>
      setOrderFilter((cur) => (cur === key ? "all" : key)),
    [],
  );

  return {
    session,
    orders,
    filteredOrders,
    orderFilter,
    setOrderFilter,
    toggleFilter,
    confirmedOrders,
    paidOrders,
    unpaidOrders,
    draftOrders,
    productCount,
  };
}
