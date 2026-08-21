import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  LiveComment,
  LiveTab,
  Order,
  OrderFilter,
  OrderProduct,
  OrderWithTikTok,
} from "@app-types/index";
import { CustomerSummary } from "@app-types/index";
import {
  createOrderFromCommentApi,
  deleteOrderApi,
  getOrdersApi,
  updateOrderDepositStatusApi,
  updateOrderStatusApi,
} from "../service/api";
import { useCustomerRefreshStore } from "@features/customers/stores/customer-refresh-store";
import {
  getCommentTikTokUsername,
  getOrderTikTokUsername,
} from "@utils/tiktok";

type UseOrderManagerParams = {
  comments: LiveComment[];
  liveSessionId?: string | null;
  onAfterCreateOrder?: () => void;
  hasOrders?: boolean;
  allStatuses?: boolean;
  enabled?: boolean;
};

export type CustomerSummaryWithTikTok = CustomerSummary & {
  customerTikTokUsername?: string;
  customerId?: string | null;
};

type OrderWithAvatarFallback = OrderWithTikTok & {
  customerAvatarUrl?: string | null;
  customer_avatar_url?: string | null;
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

function getOrderAvatar(order: OrderWithAvatarFallback) {
  return String(
    order.avatar ||
      order.avatarUrl ||
      order.customerAvatarUrl ||
      order.customer_avatar_url ||
      "",
  ).trim();
}

// START: Đồng bộ cách hiểu trạng thái đã cọc giữa card thống kê và bộ lọc
function isDepositedOrder(order: OrderWithTikTok) {
  return order.depositStatus === "paid" || order.depositStatus === "deposited";
}

function isUnpaidOrder(order: OrderWithTikTok) {
  return !isDepositedOrder(order);
}
// END: Đồng bộ cách hiểu trạng thái đã cọc giữa card thống kê và bộ lọc

export type OrderManager = ReturnType<typeof useOrderManager>;

export function useOrderManager({
  comments,
  liveSessionId,
  onAfterCreateOrder,
  hasOrders = false,
  allStatuses = false,
  enabled = true,
}: UseOrderManagerParams) {
  const [orders, setOrders] = useState<OrderWithTikTok[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [depositLoadingIds, setDepositLoadingIds] = useState<Set<string>>(
    new Set(),
  );

  const [liveTab, setLiveTab] = useState<LiveTab>("live");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [orderSearchText, setOrderSearchText] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const reloadOrders = useCallback(async () => {
    try {
      setOrderLoading(true);
      setOrderError("");
      const nextOrders = await getOrdersApi(allStatuses ? null : undefined);
      setOrders(nextOrders);
    } catch (error) {
      if (__DEV__) console.error("LOAD ORDERS ERROR:", error);
      setOrderError(
        error instanceof Error ? error.message : "Không tải được đơn hàng.",
      );
    } finally {
      setOrderLoading(false);
    }
  }, [allStatuses]);

  useEffect(() => {
    if (!enabled || !hasOrders) return;
    const timer = setTimeout(() => void reloadOrders(), 0);
    return () => clearTimeout(timer);
  }, [enabled, reloadOrders, hasOrders]);

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

  // START: Code cũ chỉ tính đơn có depositStatus là paid, nên bỏ sót deposited
  // const paidOrders = useMemo(
  //   () => orders.filter((item) => item.depositStatus === "paid").length,
  //   [orders],
  // );
  // END: Code cũ chỉ tính đơn có depositStatus là paid, nên bỏ sót deposited

  // START: Code mới tính Đã cọc gồm cả paid và deposited
  const paidOrders = useMemo(
    () => orders.filter(isDepositedOrder).length,
    [orders],
  );
  // END: Code mới tính Đã cọc gồm cả paid và deposited

  const draftOrders = useMemo(
    () => orders.filter((item) => item.status === "draft").length,
    [orders],
  );

  const confirmedOrders = useMemo(
    () => orders.filter((item) => item.status === "confirmed").length,
    [orders],
  );

  // START: Code cũ tính tổng sản phẩm trên toàn bộ đơn hàng nên sai khi đang bật filter
  // const orderProductCount = useMemo(
  //   () => orders.reduce((sum, order) => sum + order.products.length, 0),
  //   [orders],
  // );
  // END: Code cũ tính tổng sản phẩm trên toàn bộ đơn hàng nên sai khi đang bật filter

  const filteredOrders = useMemo(() => {
    const keyword = orderSearchText.trim().toLowerCase();

    return orders.filter((order) => {
      // START: Code cũ chỉ lọc đúng paid/unpaid tuyệt đối nên bỏ sót trạng thái deposited
      // const matchFilter =
      //   orderFilter === "all" ||
      //   (orderFilter === "unpaid" && order.depositStatus === "unpaid") ||
      //   (orderFilter === "paid" && order.depositStatus === "paid") ||
      //   (orderFilter === "draft" && order.status === "draft") ||
      //   (orderFilter === "confirmed" && order.status === "confirmed");
      // END: Code cũ chỉ lọc đúng paid/unpaid tuyệt đối nên bỏ sót trạng thái deposited

      // START: Logic mới đồng bộ với cách tính card Đã cọc và Chưa cọc
      const matchFilter =
        orderFilter === "all" ||
        (orderFilter === "unpaid" && isUnpaidOrder(order)) ||
        (orderFilter === "paid" && isDepositedOrder(order)) ||
        (orderFilter === "draft" && order.status === "draft") ||
        (orderFilter === "confirmed" && order.status === "confirmed");
      // END: Logic mới đồng bộ với cách tính card Đã cọc và Chưa cọc

      if (!matchFilter) return false;
      if (!keyword) return true;

      const tiktokUsername = getOrderTikTokUsername(order);
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

  // START: Tổng sản phẩm mới tính theo danh sách đơn đã được lọc
  const orderProductCount = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + order.products.length, 0),
    [filteredOrders],
  );
  // END: Tổng sản phẩm mới tính theo danh sách đơn đã được lọc

  const selectedOrder = useMemo(
    () =>
      selectedOrderId
        ? (orders.find((o) => o.id === selectedOrderId) ?? null)
        : null,
    [orders, selectedOrderId],
  );

  const customers = useMemo<CustomerSummaryWithTikTok[]>(() => {
    const map = new Map<string, CustomerSummaryWithTikTok>();

    comments.forEach((comment) => {
      const displayName = getCommentDisplayName(comment);
      const customerTikTokUsername = getCommentTikTokUsername(comment);
      const username = displayName || customerTikTokUsername || "Unknown user";
      const customerKey = customerTikTokUsername || username;
      const current = map.get(customerKey);

      if (!current) {
        const matchingOrder = orders.find(
          (order) =>
            getOrderTikTokUsername(order) === customerTikTokUsername ||
            order.username === username,
        );
        map.set(customerKey, {
          username,
          avatar: getCommentAvatar(comment),
          customerId: matchingOrder?.customerId ?? null,
          customerTikTokUsername,
          customerType: matchingOrder?.customerType ?? null,
          totalComments: 1,
          totalOrders: orders.filter(
            (order) =>
              getOrderTikTokUsername(order) === customerTikTokUsername ||
              order.username === username,
          ).length,
          latestComment: getCommentText(comment),
        });
        return;
      }

      current.totalComments += 1;
      if (!current.avatar) current.avatar = getCommentAvatar(comment);
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
          avatar: getOrderAvatar(order),
          customerId: order.customerId ?? null,
          customerTikTokUsername,
          customerType: order.customerType ?? null,
          totalComments: 0,
          totalOrders: 1,
          latestComment: order.comment,
        });
        return;
      }

      if (!current.customerId && order.customerId) {
        current.customerId = order.customerId;
      }

      if (!current.customerType && order.customerType) {
        current.customerType = order.customerType;
      }

      if (!current.avatar) {
        current.avatar = getOrderAvatar(order);
      }

      current.totalOrders = orders.filter(
        (item) =>
          getOrderTikTokUsername(item) === customerTikTokUsername ||
          item.username === username,
      ).length;

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
        });

        await reloadOrders();
        useCustomerRefreshStore.getState().invalidate();
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

  const clearOrders = useCallback(() => setOrders([]), []);

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
        prev.map((order) =>
          order.id !== orderId
            ? order
            : { ...order, products: [...order.products, product] },
        ),
      );
    },
    [],
  );

  const removeProductFromOrder = useCallback(
    (orderId: string, itemId: string) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id !== orderId
            ? order
            : {
                ...order,
                products: order.products.filter((p) => p.id !== itemId),
              },
        ),
      );
    },
    [],
  );

  const updateProductInOrder = useCallback(
    (orderId: string, itemId: string, updates: Partial<OrderProduct>) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id !== orderId
            ? order
            : {
                ...order,
                products: order.products.map((p) =>
                  p.id === itemId ? { ...p, ...updates } : p,
                ),
              },
        ),
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
          prev.map((order) =>
            order.id !== orderId
              ? order
              : { ...order, depositStatus: nextDepositStatus },
          ),
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

      await updateOrderStatusApi({ orderId, status: nextStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order.id !== orderId ? order : { ...order, status: nextStatus },
        ),
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

  return {
    orders,
    setOrders,
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
