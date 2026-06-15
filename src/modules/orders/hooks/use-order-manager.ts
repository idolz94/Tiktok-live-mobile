import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  LiveComment,
  LiveTab,
  Order,
  OrderFilter,
  OrderProduct,
  OrderWithTikTok,
} from "../../../types";
import { CustomerSummary } from "@app-types/index";
import { getOrderTotal } from "../../../utils/order";
import {
  createOrderFromCommentApi,
  deleteOrderApi,
  getOrdersApi,
  updateOrderDepositStatusApi,
  updateOrderStatusApi,
} from "../service/api";
import {
  getCommentTikTokUsername,
  getOrderTikTokUsername,
} from "@utils/tiktok";

type UseOrderManagerParams = {
  comments: LiveComment[];
  liveSessionId?: string | null;
  onAfterCreateOrder?: () => void;
};

type CustomerSummaryWithTikTok = CustomerSummary & {
  customerTikTokUsername?: string;
};

function getCommentText(comment: LiveComment) {
  return String(comment.comment || "").trim();
}

function getCommentDisplayName(comment: LiveComment) {
  return String(comment.username || comment.displayName || "Khách live").trim();
}

function getCommentAvatar(comment: LiveComment) {
  return String(comment.avatar || comment.avatarUrl || "").trim();
}

function getOrderRevenue(order: OrderWithTikTok) {
  const totalAmount = Number(order.totalAmount || 0);

  if (totalAmount > 0) return totalAmount;

  return getOrderTotal(order.products);
}

export function useOrderManager({
  comments,
  liveSessionId,
  onAfterCreateOrder,
}: UseOrderManagerParams) {
  const [orders, setOrders] = useState<OrderWithTikTok[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [depositLoadingIds, setDepositLoadingIds] = useState<Set<string>>(new Set());

  const [liveTab, setLiveTab] = useState<LiveTab>("live");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [orderSearchText, setOrderSearchText] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const reloadOrders = useCallback(async () => {
    try {
      setOrderLoading(true);
      setOrderError("");

      const nextOrders = await getOrdersApi();
      setOrders(nextOrders);
    } catch (error) {
      if (__DEV__) console.error("LOAD ORDERS ERROR:", error);
      setOrderError(
        error instanceof Error ? error.message : "Không tải được đơn hàng.",
      );
    } finally {
      setOrderLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void reloadOrders();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [reloadOrders]);

  const buyingCount = useMemo(
    () =>
      comments.filter((item) => {
        const score = Number(item.finalScore || 0);

        return (
          score >= 50 ||
          item.intent === "buying" ||
          item.intent === "buy" ||
          item.priorityLevel === "high" ||
          item.priorityLevel === "medium"
        );
      }).length,
    [comments],
  );

  const paidOrders = useMemo(
    () => orders.filter((item) => item.depositStatus === "paid").length,
    [orders],
  );

  const draftOrders = useMemo(
    () => orders.filter((item) => item.status === "draft").length,
    [orders],
  );

  const confirmedOrders = useMemo(
    () => orders.filter((item) => item.status === "confirmed").length,
    [orders],
  );

  const orderProductCount = useMemo(
    () => orders.reduce((sum, order) => sum + order.products.length, 0),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const keyword = orderSearchText.trim().toLowerCase();

    return orders.filter((order) => {
      const tiktokUsername = getOrderTikTokUsername(order);

      const matchFilter =
        orderFilter === "all" ||
        (orderFilter === "unpaid" && order.depositStatus === "unpaid") ||
        (orderFilter === "paid" && order.depositStatus === "paid") ||
        (orderFilter === "draft" && order.status === "draft") ||
        (orderFilter === "confirmed" && order.status === "confirmed");

      if (!matchFilter) return false;
      if (!keyword) return true;

      const searchValue = [
        order.orderCode,
        order.username,
        order.customerTikTokUsername,
        tiktokUsername,
        order.comment,
        order.productName,
      ]
        .join(" ")
        .toLowerCase();

      return searchValue.includes(keyword);
    });
  }, [orderFilter, orderSearchText, orders]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;

    return orders.find((order) => order.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  const customers = useMemo<CustomerSummaryWithTikTok[]>(() => {
    const map = new Map<string, CustomerSummaryWithTikTok>();

    comments.forEach((comment) => {
      const displayName = getCommentDisplayName(comment);
      const customerTikTokUsername = getCommentTikTokUsername(comment);
      const username = displayName || customerTikTokUsername || "Unknown user";
      const customerKey = customerTikTokUsername || username;
      const current = map.get(customerKey);

      if (!current) {
        map.set(customerKey, {
          username,
          avatar: getCommentAvatar(comment),
          customerTikTokUsername,
          totalComments: 1,
          totalOrders: orders.filter((order) => {
            return (
              getOrderTikTokUsername(order) === customerTikTokUsername ||
              order.username === username
            );
          }).length,
          latestComment: getCommentText(comment),
        });

        return;
      }

      current.totalComments += 1;
      if (!current.latestComment)
        current.latestComment = getCommentText(comment);
      if (!current.customerTikTokUsername && customerTikTokUsername) {
        current.customerTikTokUsername = customerTikTokUsername;
      }
    });

    orders.forEach((order) => {
      const customerTikTokUsername = getOrderTikTokUsername(order);
      const username = order.username || customerTikTokUsername || "Khách live";
      const customerKey = customerTikTokUsername || username;
      const current = map.get(customerKey);

      if (!current) {
        map.set(customerKey, {
          username,
          avatar: order.avatar,
          customerTikTokUsername,
          totalComments: 0,
          totalOrders: 1,
          latestComment: order.comment,
        });

        return;
      }

      current.totalOrders = orders.filter((item) => {
        return (
          getOrderTikTokUsername(item) === customerTikTokUsername ||
          item.username === username
        );
      }).length;

      if (!current.customerTikTokUsername && customerTikTokUsername) {
        current.customerTikTokUsername = customerTikTokUsername;
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => b.totalComments - a.totalComments,
    );
  }, [comments, orders]);

  const createOrderFromComment = useCallback(
    async (item: LiveComment) => {
      try {
        const result = await createOrderFromCommentApi({
          comment: item,
          liveSessionId,
          quantity: 1,
        });

        await reloadOrders();
        onAfterCreateOrder?.();

        return result;
      } catch (error) {
        if (__DEV__) console.error("CREATE ORDER ERROR:", error);
        setOrderError(
          error instanceof Error ? error.message : "Tạo đơn thất bại.",
        );
        throw error;
      }
    },
    [liveSessionId, onAfterCreateOrder, reloadOrders],
  );

  const clearOrders = useCallback(() => {
    setOrders([]);
  }, []);

  const updateOrder = useCallback(
    (id: string, field: keyof Order, value: string) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== id) return order;

          if (field === "quantity" || field === "price") {
            return { ...order, [field]: Number(value || 0) };
          }

          return { ...order, [field]: value };
        }),
      );
    },
    [],
  );

  const addProductToOrder = useCallback(
    (orderId: string, product: OrderProduct) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          return { ...order, products: [...order.products, product] };
        }),
      );
    },
    [],
  );

  const removeProductFromOrder = useCallback(
    (orderId: string, itemId: string) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          return {
            ...order,
            products: order.products.filter((p) => p.id !== itemId),
          };
        }),
      );
    },
    [],
  );

  const updateProductInOrder = useCallback(
    (orderId: string, itemId: string, updates: Partial<OrderProduct>) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          return {
            ...order,
            products: order.products.map((p) =>
              p.id === itemId ? { ...p, ...updates } : p,
            ),
          };
        }),
      );
    },
    [],
  );

  const toggleDepositStatus = useCallback(
    async (orderId: string) => {
      const currentOrder = orders.find((order) => order.id === orderId);
      if (!currentOrder || depositLoadingIds.has(orderId)) return;

      const nextDepositStatus =
        currentOrder.depositStatus === "paid" ||
        currentOrder.depositStatus === "deposited"
          ? "unpaid"
          : "paid";

      setDepositLoadingIds((prev) => new Set(prev).add(orderId));

      try {
        await updateOrderDepositStatusApi({
          orderId,
          depositStatus: nextDepositStatus,
        });

        setOrders((prev) =>
          prev.map((order) => {
            if (order.id !== orderId) return order;
            return { ...order, depositStatus: nextDepositStatus };
          }),
        );
      } finally {
        setDepositLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }
    },
    [depositLoadingIds, orders],
  );

  const confirmOrder = useCallback(
    async (orderId: string) => {
      const currentOrder = orders.find((order) => order.id === orderId);
      if (!currentOrder) return;

      const nextStatus =
        currentOrder.status === "confirmed" ? "draft" : "confirmed";

      await updateOrderStatusApi({
        orderId,
        status: nextStatus,
      });

      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          return { ...order, status: nextStatus };
        }),
      );
    },
    [orders],
  );

  const deleteOrder = useCallback(
    async (id: string) => {
      await deleteOrderApi(id);
      await reloadOrders();
    },
    [reloadOrders],
  );

  const openOrderOverview = useCallback(
    (orderId: string) => setSelectedOrderId(orderId),
    [],
  );
  const closeOrderOverview = useCallback(() => setSelectedOrderId(null), []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, item) => sum + getOrderRevenue(item), 0),
    [orders],
  );

  return {
    orders,
    filteredOrders,
    customers,
    selectedOrder,
    orderLoading,
    orderError,
    reloadOrders,
    liveTab,
    setLiveTab,
    orderFilter,
    setOrderFilter,
    orderSearchText,
    setOrderSearchText,
    buyingCount,
    paidOrders,
    draftOrders,
    confirmedOrders,
    orderProductCount,
    totalRevenue,
    createOrderFromComment,
    clearOrders,
    updateOrder,
    addProductToOrder,
    removeProductFromOrder,
    updateProductInOrder,
    toggleDepositStatus,
    depositLoadingIds,
    confirmOrder,
    deleteOrder,
    openOrderOverview,
    closeOrderOverview,
  };
}
