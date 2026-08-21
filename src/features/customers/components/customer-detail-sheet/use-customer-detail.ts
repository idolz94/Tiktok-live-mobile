import type { Order, OrderProduct } from "@app-types/index";
import { getCustomerAnalyticsApi, getCustomerApi, getCustomerOrdersApi, updateCustomerApi, type CustomerAnalytics } from "@features/customers/service/api";
import { useCustomerRefreshStore } from "@features/customers/stores/customer-refresh-store";
import { cancelShipmentApi, refreshShippingStatusApi, listCustomerAddressesApi, type CustomerAddress } from "@features/orders/service/create-shipment-api";
import { getOrderTikTokUsername } from "@utils/tiktok";
import { usePhoneField } from "@hooks/use-phone-field";
import { useToast } from "@components/toast";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";

export type DetailTab = "info" | "orders" | "analytics";
export type OrderStatFilter = "all" | "confirmed" | "deposited" | "unpaid" | "draft";

// ponytail: per-customerId cache map, cleared on explicit reload
const customerAddressCache = new Map<string, CustomerAddress[]>();
const customerAddressFetch = new Map<string, Promise<CustomerAddress[]>>();

function getCustomerAddresses(customerId: string): Promise<CustomerAddress[]> {
  const cached = customerAddressCache.get(customerId);
  if (cached) return Promise.resolve(cached);
  const inflight = customerAddressFetch.get(customerId);
  if (inflight) return inflight;
  const p = listCustomerAddressesApi(customerId)
    .then((list) => { customerAddressCache.set(customerId, list); customerAddressFetch.delete(customerId); return list; })
    .catch((err) => { customerAddressFetch.delete(customerId); throw err; });
  customerAddressFetch.set(customerId, p);
  return p;
}

function pickAddress(list: CustomerAddress[], cur: CustomerAddress | null): CustomerAddress | null {
  return cur
    ? (list.find((a) => a.id === cur.id) ?? list.find((a) => a.isDefault) ?? list[0] ?? null)
    : (list.find((a) => a.isDefault) ?? list[0] ?? null);
}

export { type CustomerAddress };

function getOrderProducts(order: Order) {
  return Array.isArray(order.products) ? order.products : [];
}

function getProductQuantity(products: OrderProduct[]) {
  return products.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
}

export function formatOrderDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ ngày";
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function groupOrdersByDate(orders: Order[]) {
  return orders.reduce<{ date: string; orders: Order[] }[]>((groups, order) => {
    const date = formatOrderDate(order.createdAt);
    const existing = groups.find((g) => g.date === date);
    if (existing) { existing.orders.push(order); return groups; }
    groups.push({ date, orders: [order] });
    return groups;
  }, []);
}

function devProduct(p: Pick<OrderProduct, "id" | "name" | "quantity" | "price">): OrderProduct {
  return { code: p.id, color: "", size: "", variantName: "", totalAmount: p.price * p.quantity, rawCommentText: "", ...p };
}

function devOrder(o: {
  id: string; orderCode: string; customerId: string; customerName: string; username: string;
  totalAmount: number; subtotalAmount: number; products: OrderProduct[]; createdAt: string;
  shippingStatus?: Order["shippingStatus"]; trackingCode?: string;
}): Order {
  return {
    comment: "",
    commentId: o.id,
    productName: o.products[0]?.name ?? "",
    quantity: o.products.reduce((s, pr) => s + pr.quantity, 0),
    size: "",
    color: "",
    price: o.products[0]?.price ?? 0,
    avatar: "",
    avatarUrl: "",
    status: "draft",
    shippingStatus: "not_shipped",
    trackingCode: "",
    depositStatus: "unpaid",
    ...o,
    customerPhone: "",
    customerAddress: "",
    note: "",
    updatedAt: o.createdAt,
  };
}

const DEV_MERGE_ORDERS: Order[] = [
  devOrder({ id: "dev-a1", orderCode: "DH-A1", customerId: "cus-a", customerName: "Nguyễn Văn A", username: "nguyenvana", totalAmount: 120000, subtotalAmount: 120000, products: [devProduct({ id: "dev-a1-p1", name: "Áo thun", quantity: 1, price: 120000 })], createdAt: "2026-08-19T08:00:00.000Z" }),
  devOrder({ id: "dev-a2", orderCode: "DH-A2", customerId: "cus-a", customerName: "Nguyễn Văn A", username: "nguyenvana", totalAmount: 180000, subtotalAmount: 180000, products: [devProduct({ id: "dev-a2-p1", name: "Quần jean", quantity: 1, price: 180000 })], createdAt: "2026-08-19T08:05:00.000Z" }),
  devOrder({ id: "dev-a3", orderCode: "DH-A3", customerId: "cus-a", customerName: "Nguyễn Văn A", username: "nguyenvana", totalAmount: 90000, subtotalAmount: 90000, products: [devProduct({ id: "dev-a3-p1", name: "Socks", quantity: 3, price: 30000 })], createdAt: "2026-08-19T08:10:00.000Z" }),
  devOrder({ id: "dev-b1", orderCode: "DH-B1", customerId: "cus-b", customerName: "Trần Thị B", username: "tranthib", totalAmount: 250000, subtotalAmount: 250000, products: [devProduct({ id: "dev-b1-p1", name: "Váy", quantity: 1, price: 250000 })], createdAt: "2026-08-19T08:15:00.000Z" }),
  devOrder({ id: "dev-b2", orderCode: "DH-B2", customerId: "cus-b", customerName: "Trần Thị B", username: "tranthib", totalAmount: 150000, subtotalAmount: 150000, products: [devProduct({ id: "dev-b2-p1", name: "Áo khoác", quantity: 1, price: 150000 })], createdAt: "2026-08-19T08:20:00.000Z" }),
  devOrder({ id: "dev-c1", orderCode: "DH-C1", customerId: "cus-c", customerName: "Lê Văn C", username: "levanc", totalAmount: 80000, subtotalAmount: 80000, products: [devProduct({ id: "dev-c1-p1", name: "Mũ", quantity: 1, price: 80000 })], createdAt: "2026-08-19T08:25:00.000Z" }),
];

export function useCustomerDetail(customerKey: string, initialTab: DetailTab = "info") {
  const mountedRef = useRef(true);
  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);
  const [customerType, setCustomerType] = useState("Lẻ");
  const { phone, setPhone, phoneError, validate: validatePhone, reset: resetPhone } = usePhoneField();
  const [referenceInfo, setReferenceInfo] = useState("");
  const [address, setAddress] = useState("");

  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const toast = useToast();
  const loadDevMergeMockOrders = useCallback(() => {
    if (!__DEV__) return;
    setCustomerOrders(DEV_MERGE_ORDERS);
    setOrdersLoading(false);
  }, []);

  const reloadCustomerOrders = useCallback(async () => {
    if (!customerKey) return;
    setOrdersLoading(true);
    try {
      const res = await getCustomerOrdersApi(customerKey);
      if (!mountedRef.current) return;
      setCustomerOrders(
        res.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      );
    } catch {
      // keep previous orders on error
    } finally {
      if (mountedRef.current) setOrdersLoading(false);
    }
  }, [customerKey]);

  const customer = useMemo(
    () => {
      const latestOrder = customerOrders[0];
      if (!latestOrder) return null;
      return {
        username: latestOrder.customerName || latestOrder.username || "Khách hàng",
        avatar: latestOrder.avatar || latestOrder.avatarUrl || "",
        customerId: latestOrder.customerId ?? customerKey,
        customerTikTokUsername: getOrderTikTokUsername(latestOrder),
        customerType: latestOrder.customerType ?? null,
        totalComments: 0,
        totalOrders: customerOrders.length,
        latestComment: latestOrder.comment,
      };
    },
    [customerKey, customerOrders],
  );

  useEffect(() => {
    if (!customerKey) return;
    void reloadCustomerOrders();
  }, [customerKey, reloadCustomerOrders]);

  useEffect(() => {
    const cid = customer?.customerId;
    if (!cid) return;
    let cancelled = false;
    setAnalyticsLoading(true);
    getCustomerAnalyticsApi(String(cid))
      .then((res) => {
        if (cancelled || !mountedRef.current) return;
        setAnalytics(res.analytics);
      })
      .catch(() => {
        if (!cancelled && mountedRef.current) setAnalytics(null);
      })
      .finally(() => {
        if (!cancelled && mountedRef.current) setAnalyticsLoading(false);
      });
    return () => { cancelled = true; };
  }, [customer?.customerId]);

  const latestOrder = customerOrders[0];
  const displayName = customer?.username || latestOrder?.customerName || latestOrder?.username || "Khách hàng";
  const avatar = customer?.avatar || latestOrder?.avatar || latestOrder?.avatarUrl || "";
  const tiktokUsername = customer?.customerTikTokUsername || (latestOrder ? getOrderTikTokUsername(latestOrder) : "");
  const confirmedCount = customerOrders.filter((o) => o.status === "confirmed").length;
  const depositedCount = customerOrders.filter((o) => o.depositStatus === "paid" || o.depositStatus === "deposited").length;
  const unpaidCount = customerOrders.filter((o) => o.depositStatus !== "paid" && o.depositStatus !== "deposited").length;
  const draftCount = customerOrders.filter((o) => o.status === "draft").length;

  const [statFilter, setStatFilter] = useState<OrderStatFilter>("all");
  const filteredOrders = useMemo(
    () =>
      customerOrders.filter((o) => {
        const deposited = o.depositStatus === "paid" || o.depositStatus === "deposited";
        return (
          statFilter === "all" ||
          (statFilter === "confirmed" && o.status === "confirmed") ||
          (statFilter === "deposited" && deposited) ||
          (statFilter === "unpaid" && !deposited) ||
          (statFilter === "draft" && o.status === "draft")
        );
      }),
    [customerOrders, statFilter],
  );

  const groupedOrders = useMemo(() => groupOrdersByDate(filteredOrders), [filteredOrders]);
  const productCount = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + getProductQuantity(getOrderProducts(order)), 0),
    [filteredOrders],
  );

  useEffect(() => {
    if (!customerKey || !latestOrder) return;
    resetPhone(latestOrder.customerPhone || "");
    setAddress(latestOrder.customerAddress || latestOrder.customerAddressData?.address || "");
    setReferenceInfo(latestOrder.note || customer?.latestComment || "");
  }, [customerKey, latestOrder?.id]);

  useEffect(() => {
    const customerId = customer?.customerId;
    if (!customerId) return;
    getCustomerApi(customerId)
      .then((res) => {
        const c = res.customer;
        if (!c || !mountedRef.current) return;
        setCustomerType(c.customerType || "Lẻ");
        if (c.phone) resetPhone(c.phone);
        if (c.referenceInfo !== undefined && c.referenceInfo !== null) setReferenceInfo(c.referenceInfo);
      })
      .catch(() => {});
  }, [customer?.customerId]);

  // sync phone ↔ selectedAddress: address → phone if phone empty; phone → prefer matching address
  useEffect(() => {
    if (!selectedAddress) return;
    if (!phone && selectedAddress.phone) resetPhone(selectedAddress.phone);
  }, [selectedAddress?.id]);

  useEffect(() => {
    if (!phone || !customerAddresses.length) return;
    const match = customerAddresses.find((a) => a.phone === phone);
    if (match) setSelectedAddress(match);
  }, [phone]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const reloadCustomerAddresses = useCallback(async (customerId: string) => {
    customerAddressCache.delete(customerId);
    customerAddressFetch.delete(customerId);
    setAddressesLoading(true);
    try {
      const list = await listCustomerAddressesApi(customerId);
      if (!mountedRef.current) return;
      customerAddressCache.set(customerId, list);
      setCustomerAddresses(list);
      setSelectedAddress((cur) => pickAddress(list, cur));
    } finally {
      if (mountedRef.current) setAddressesLoading(false);
    }
  }, []);

  useEffect(() => {
    const customerId = customer?.customerId;
    if (!customerId) return;
    const cached = customerAddressCache.get(customerId);
    if (cached) {
      setCustomerAddresses(cached);
      setSelectedAddress((cur) => pickAddress(cached, cur));
      return;
    }
    let cancelled = false;
    setAddressesLoading(true);
    getCustomerAddresses(customerId)
      .then((list) => {
        if (cancelled || !mountedRef.current) return;
        setCustomerAddresses(list);
        setSelectedAddress((cur) => pickAddress(list, cur));
        setAddressesLoading(false);
      })
      .catch(() => { if (!cancelled && mountedRef.current) setAddressesLoading(false); });
    return () => { cancelled = true; };
  }, [customer?.customerId]);

  const loading = ordersLoading && !customer && customerOrders.length === 0;
  const notFound = !loading && !customer && customerOrders.length === 0;

  const invalidateCustomers = useCustomerRefreshStore((s) => s.invalidate);

  const handleSave = async () => {
    if (!validatePhone()) return;
    if (!customer?.customerId || isSaving) return;
    setIsSaving(true);
    try {
      await updateCustomerApi(customer.customerId, { customerType, phone, referenceInfo });
      const res = await getCustomerApi(customer.customerId);
      const c = res.customer;
      if (mountedRef.current && c) {
        setCustomerType(c.customerType || "Lẻ");
        if (c.phone) resetPhone(c.phone);
        if (c.referenceInfo !== undefined && c.referenceInfo !== null) setReferenceInfo(c.referenceInfo);
      }
      invalidateCustomers();
      toast.success("Đã lưu thông tin khách hàng.");
    } catch (err) {
      toast.error({ title: "Lưu thất bại", description: err instanceof Error ? err.message : "Vui lòng thử lại." });
    } finally {
      if (mountedRef.current) setIsSaving(false);
    }
  };

  const handleCancelShipment = useCallback(
    async (order: Order) => {
      if (!order.trackingCode || cancellingId) return;
      setCancellingId(order.id);
      try {
        await cancelShipmentApi(order.id, { trackingId: order.trackingCode });
        await refreshShippingStatusApi(order.id);
        const res = await getCustomerOrdersApi(customerKey);
        setCustomerOrders(
          res.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        );
      } finally {
        setCancellingId(null);
      }
    },
    [cancellingId, customerKey],
  );

  return {
    activeTab, setActiveTab,
    customerType, setCustomerType,
    phone, setPhone,
    phoneError, validatePhone,
    referenceInfo, setReferenceInfo,
    address, setAddress,
    customerAddresses, selectedAddress, setSelectedAddress, addressesLoading, reloadCustomerAddresses,
    isSaving,
    displayName, avatar, tiktokUsername,
    customer, customerOrders, setCustomerOrders, reloadCustomerOrders, groupedOrders, filteredOrders,
    productCount, confirmedCount, depositedCount, unpaidCount, draftCount,
    statFilter, setStatFilter,
    loading, notFound,
    analytics, analyticsLoading,
    handleSave,
    handleCancelShipment,
    cancellingId,
    loadDevMergeMockOrders,
  };
}
