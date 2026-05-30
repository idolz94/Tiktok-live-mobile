import { useCallback, useEffect, useMemo, useState } from "react";
import { LiveComment, LiveTab, Order, OrderFilter, OrderProduct } from "@/types";
import { createId, createOrderCode } from "@/utils/id";
import { createProductFromComment, getOrderTotal, parseOrderFromComment } from "@/utils/order";
import { readOrders, writeOrders } from "@/features/oders/orderStorage";
import { buildCustomersFromOrders } from "@/features/customers/customerMapper";

type UseOrderManagerParams = {
  comments: LiveComment[];
  onAfterCreateOrder?: () => void;
};

export function useOrderManager({ comments, onAfterCreateOrder }: UseOrderManagerParams) {
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [liveTab, setLiveTab] = useState<LiveTab>("live");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [orderSearchText, setOrderSearchText] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    readOrders().then(setOrdersState);
  }, []);

  const setOrders = useCallback((updater: Order[] | ((prev: Order[]) => Order[])) => {
    setOrdersState((prev) => {
      const nextOrders = typeof updater === "function" ? updater(prev) : updater;
      void writeOrders(nextOrders);
      return nextOrders;
    });
  }, []);

  const buyingCount = useMemo(() => comments.filter((item) => item.intent === "buying").length, [comments]);
  const unpaidOrders = useMemo(() => orders.filter((item) => item.depositStatus === "unpaid").length, [orders]);
  const paidOrders = useMemo(() => orders.filter((item) => item.depositStatus === "paid").length, [orders]);
  const draftOrders = useMemo(() => orders.filter((item) => item.status === "draft").length, [orders]);
  const confirmedOrders = useMemo(() => orders.filter((item) => item.status === "confirmed").length, [orders]);
  const orderProductCount = useMemo(() => orders.reduce((sum, order) => sum + (order.products?.length || 0), 0), [orders]);

  const filteredOrders = useMemo(() => {
    const keyword = orderSearchText.trim().toLowerCase();

    return orders.filter((order) => {
      const matchFilter =
        orderFilter === "all" ||
        (orderFilter === "unpaid" && order.depositStatus === "unpaid") ||
        (orderFilter === "paid" && order.depositStatus === "paid") ||
        (orderFilter === "draft" && order.status === "draft") ||
        (orderFilter === "confirmed" && order.status === "confirmed");

      if (!matchFilter) return false;
      if (!keyword) return true;

      return `${order.orderCode} ${order.username} ${order.comment} ${order.productName}`
        .toLowerCase()
        .includes(keyword);
    });
  }, [orderFilter, orderSearchText, orders]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find((order) => order.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  const customers = useMemo(() => buildCustomersFromOrders(orders), [orders]);

  const createOrderFromComment = useCallback(
    (item: LiveComment) => {
      const commentText = item.comment || item.text || "";
      const parsed = parseOrderFromComment(commentText);
      const product = createProductFromComment(commentText);

      const order: Order = {
        id: createId(),
        orderCode: createOrderCode(),
        commentId: item.id,
        username: item.username,
        avatar: item.avatar,
        comment: commentText,
        productName: commentText,
        quantity: parsed.quantity,
        size: parsed.size,
        color: parsed.color,
        price: parsed.price,
        products: [product],
        status: "draft",
        depositStatus: "unpaid",
        createdAt: new Date().toISOString()
      };

      setOrders((prev) => {
        const existed = prev.some((oldOrder) => oldOrder.commentId === item.id);
        if (existed) return prev;
        return [order, ...prev];
      });

      setLiveTab("orders");
      onAfterCreateOrder?.();
      return order;
    },
    [onAfterCreateOrder, setOrders]
  );

  const clearOrders = useCallback(() => setOrders([]), [setOrders]);

  const updateOrder = useCallback(
    (id: string, field: keyof Order, value: string) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== id) return order;
          if (field === "quantity" || field === "price") return { ...order, [field]: Number(value || 0) };
          return { ...order, [field]: value };
        })
      );
    },
    [setOrders]
  );

  const addProductToOrder = useCallback(
    (orderId: string, product: OrderProduct) => {
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, products: [...(order.products || []), product] } : order)));
    },
    [setOrders]
  );

  const toggleDepositStatus = useCallback(
    (orderId: string) => {
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, depositStatus: order.depositStatus === "paid" ? "unpaid" : "paid" } : order)));
    },
    [setOrders]
  );

  const confirmOrder = useCallback(
    (orderId: string) => {
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: order.status === "confirmed" ? "draft" : "confirmed" } : order)));
    },
    [setOrders]
  );

  const deleteOrder = useCallback((id: string) => setOrders((prev) => prev.filter((order) => order.id !== id)), [setOrders]);
  const openOrderOverview = useCallback((orderId: string) => setSelectedOrderId(orderId), []);
  const closeOrderOverview = useCallback(() => setSelectedOrderId(null), []);

  const totalRevenue = useMemo(() => orders.reduce((sum, item) => sum + getOrderTotal(item.products || []), 0), [orders]);

  return {
    orders,
    filteredOrders,
    customers,
    selectedOrder,
    liveTab,
    setLiveTab,
    orderFilter,
    setOrderFilter,
    orderSearchText,
    setOrderSearchText,
    buyingCount,
    unpaidOrders,
    paidOrders,
    draftOrders,
    confirmedOrders,
    orderProductCount,
    totalRevenue,
    createOrderFromComment,
    clearOrders,
    updateOrder,
    addProductToOrder,
    toggleDepositStatus,
    confirmOrder,
    deleteOrder,
    openOrderOverview,
    closeOrderOverview
  };
}
