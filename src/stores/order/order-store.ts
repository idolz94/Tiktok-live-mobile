import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import {
  LiveComment,
  LiveTab,
  Order,
  OrderFilter,
  OrderProduct,
  DepositStatus,
  OrderStatus,
} from "@app-types/index";
import { createId, createOrderCode } from "@utils/id";
import {
  createProductFromComment,
  getOrderTotal,
  parseOrderFromComment,
} from "@utils/order";
import { readOrders, writeOrders } from "@modules/orders/order-storage";
import { buildCustomersFromOrders } from "@modules/customers/customer-mapper";

export interface OrderState {
  orders: Order[];
  liveTab: LiveTab;
  orderFilter: OrderFilter;
  orderSearchText: string;
  selectedOrderId: string | null;
}

export interface OrderActions {
  loadOrders: () => Promise<void>;
  setLiveTab: (liveTab: LiveTab) => void;
  setOrderFilter: (orderFilter: OrderFilter) => void;
  setOrderSearchText: (orderSearchText: string) => void;
  createOrderFromComment: (item: LiveComment, onAfter?: () => void) => void;
  updateOrder: (id: string, field: keyof Order, value: string) => void;
  addProductToOrder: (orderId: string, product: OrderProduct) => void;
  toggleDepositStatus: (orderId: string) => void;
  confirmOrder: (orderId: string) => void;
  deleteOrder: (id: string) => void;
  clearOrders: () => void;
  openOrderOverview: (selectedOrderId: string) => void;
  closeOrderOverview: () => void;
}

export const useOrderStore = create<OrderState & OrderActions>((set) => ({
  orders: [],
  liveTab: "live" as LiveTab,
  orderFilter: "all" as OrderFilter,
  orderSearchText: "",
  selectedOrderId: null as string | null,

  loadOrders: async () => {
    const orders = await readOrders();
    set({ orders });
  },
  setLiveTab: (liveTab: LiveTab) => set({ liveTab }),
  setOrderFilter: (orderFilter: OrderFilter) => set({ orderFilter }),
  setOrderSearchText: (orderSearchText: string) => set({ orderSearchText }),

  createOrderFromComment: (item: LiveComment, onAfter?: () => void) => {
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
      createdAt: new Date().toISOString(),
    };
    set((state: OrderState) => {
      if (state.orders.some((o: Order) => o.commentId === item.id))
        return state;
      const next = [order, ...state.orders];
      void writeOrders(next);
      return { orders: next, liveTab: "orders" };
    });
    onAfter?.();
  },

  updateOrder: (id: string, field: keyof Order, value: string) =>
    set((state: OrderState) => {
      const next = state.orders.map((o: Order) => {
        if (o.id !== id) return o;
        if (field === "quantity" || field === "price")
          return { ...o, [field]: Number(value || 0) };
        return { ...o, [field]: value };
      });
      void writeOrders(next);
      return { orders: next };
    }),

  addProductToOrder: (orderId: string, product: OrderProduct) =>
    set((state: OrderState) => {
      const next = state.orders.map((o: Order) =>
        o.id === orderId
          ? { ...o, products: [...(o.products || []), product] }
          : o,
      );
      void writeOrders(next);
      return { orders: next };
    }),

  toggleDepositStatus: (orderId: string) =>
    set((state: OrderState) => {
      const next = state.orders.map((o: Order) =>
        o.id === orderId
          ? {
              ...o,
              depositStatus: (o.depositStatus === "paid"
                ? "unpaid"
                : "paid") as DepositStatus,
            }
          : o,
      );
      void writeOrders(next);
      return { orders: next };
    }),

  confirmOrder: (orderId: string) =>
    set((state: OrderState) => {
      const next = state.orders.map((o: Order) =>
        o.id === orderId
          ? {
              ...o,
              status: (o.status === "confirmed"
                ? "draft"
                : "confirmed") as OrderStatus,
            }
          : o,
      );
      void writeOrders(next);
      return { orders: next };
    }),

  deleteOrder: (id: string) =>
    set((state: OrderState) => {
      const next = state.orders.filter((o: Order) => o.id !== id);
      void writeOrders(next);
      return { orders: next };
    }),

  clearOrders: () => {
    void writeOrders([]);
    set({ orders: [] });
  },
  openOrderOverview: (selectedOrderId: string) => set({ selectedOrderId }),
  closeOrderOverview: () => set({ selectedOrderId: null }),
}));

// Selectors
export const useFilteredOrders = () =>
  useOrderStore(
    useShallow((s: OrderState & OrderActions) => {
      const kw = s.orderSearchText.trim().toLowerCase();
      return s.orders.filter((o: Order) => {
        const match =
          s.orderFilter === "all" ||
          (s.orderFilter === "unpaid" && o.depositStatus === "unpaid") ||
          (s.orderFilter === "paid" && o.depositStatus === "paid") ||
          (s.orderFilter === "draft" && o.status === "draft") ||
          (s.orderFilter === "confirmed" && o.status === "confirmed");
        if (!match) return false;
        if (!kw) return true;
        return `${o.orderCode} ${o.username} ${o.comment} ${o.productName}`
          .toLowerCase()
          .includes(kw);
      });
    }),
  );

export const useCustomers = () =>
  useOrderStore(
    useShallow((s: OrderState & OrderActions) =>
      buildCustomersFromOrders(s.orders),
    ),
  );

export const useOrderStats = () =>
  useOrderStore(
    useShallow((s: OrderState & OrderActions) => ({
      unpaidOrders: s.orders.filter((o: Order) => o.depositStatus === "unpaid")
        .length,
      paidOrders: s.orders.filter((o: Order) => o.depositStatus === "paid")
        .length,
      draftOrders: s.orders.filter((o: Order) => o.status === "draft").length,
      confirmedOrders: s.orders.filter((o: Order) => o.status === "confirmed")
        .length,
      orderProductCount: s.orders.reduce(
        (sum: number, o: Order) => sum + (o.products?.length || 0),
        0,
      ),
      totalRevenue: s.orders.reduce(
        (sum: number, o: Order) => sum + getOrderTotal(o.products || []),
        0,
      ),
    })),
  );
