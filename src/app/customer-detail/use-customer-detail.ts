import type { Order, OrderProduct } from "@app-types/index";
import { useAuth } from "@features/auth/hooks/use-auth";
import { updateCustomerApi } from "@features/customers/service/api";
import { useOrderManager, type CustomerSummaryWithTikTok } from "@features/orders/hooks/use-order-manager";
import { cancelShipmentApi, refreshShippingStatusApi } from "../order-detail/create-shipment/create-shipment-api";
import { getOrderTikTokUsername } from "@utils/tiktok";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

export type DetailTab = "info" | "orders";

function getSingleParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function getCustomerKey(customer: CustomerSummaryWithTikTok) {
  return customer.customerTikTokUsername || customer.username;
}

function matchesCustomer(order: Order, customerKey: string, customer?: CustomerSummaryWithTikTok) {
  if (!customerKey) return false;
  const orderTikTokUsername = getOrderTikTokUsername(order);
  const customerTikTokUsername = customer?.customerTikTokUsername || "";
  const customerUsername = customer?.username || "";
  if (customerTikTokUsername) return orderTikTokUsername === customerTikTokUsername;
  return order.username === customerKey || order.username === customerUsername;
}

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

export function useCustomerDetail() {
  const params = useLocalSearchParams<{ customerKey?: string; tab?: string }>();
  const customerKey = getSingleParam(params.customerKey);
  const initialTab = getSingleParam(params.tab) === "orders" ? "orders" : "info";

  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);
  const [customerType, setCustomerType] = useState("Lẻ");
  const [phone, setPhone] = useState("");
  const [referenceInfo, setReferenceInfo] = useState("");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { user } = useAuth();
  const orderManager = useOrderManager({ comments: [], hasOrders: user?.hasOrders ?? false, allStatuses: true });

  const customer = useMemo(
    () => orderManager.customers.find((item) => getCustomerKey(item) === customerKey),
    [customerKey, orderManager.customers],
  );

  const customerOrders = useMemo(
    () =>
      orderManager.orders
        .filter((order) => matchesCustomer(order, customerKey, customer))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [customer, customerKey, orderManager.orders],
  );

  const latestOrder = customerOrders[0];
  const displayName = customer?.username || latestOrder?.customerName || latestOrder?.username || "Khách hàng";
  const avatar = customer?.avatar || latestOrder?.avatar || latestOrder?.avatarUrl || "";
  const tiktokUsername = customer?.customerTikTokUsername || (latestOrder ? getOrderTikTokUsername(latestOrder) : "");
  const groupedOrders = useMemo(() => groupOrdersByDate(customerOrders), [customerOrders]);
  const productCount = useMemo(
    () => customerOrders.reduce((sum, order) => sum + getProductQuantity(getOrderProducts(order)), 0),
    [customerOrders],
  );

  const confirmedCount = customerOrders.filter((o) => o.status === "confirmed").length;
  const depositedCount = customerOrders.filter((o) => o.depositStatus === "paid" || o.depositStatus === "deposited").length;
  const unpaidCount = customerOrders.filter((o) => o.depositStatus !== "paid" && o.depositStatus !== "deposited").length;
  const draftCount = customerOrders.filter((o) => o.status === "draft").length;

  useEffect(() => {
    if (!customerKey || !latestOrder) return;
    setPhone(latestOrder.customerPhone || "");
    setAddress(latestOrder.customerAddress || latestOrder.customerAddressData?.address || "");
    setReferenceInfo(latestOrder.note || customer?.latestComment || "");
  }, [customerKey]);

  const loading = orderManager.orderLoading && !customer && customerOrders.length === 0;
  const notFound = !loading && !customer && customerOrders.length === 0;

  const handleSave = async () => {
    if (!customer?.customerId || isSaving) return;
    setIsSaving(true);
    try {
      await updateCustomerApi(customer.customerId, { customerType, phone, referenceInfo });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelShipment = useCallback(
    async (order: Order) => {
      if (!order.trackingCode || cancellingId) return;
      setCancellingId(order.id);
      try {
        await cancelShipmentApi(order.id, { trackingId: order.trackingCode });
        await refreshShippingStatusApi(order.id);
        await orderManager.reloadOrders();
      } finally {
        setCancellingId(null);
      }
    },
    [cancellingId, orderManager],
  );

  return {
    activeTab, setActiveTab,
    customerType, setCustomerType,
    phone, setPhone,
    referenceInfo, setReferenceInfo,
    address, setAddress,
    isSaving,
    displayName, avatar, tiktokUsername,
    customer, customerOrders, groupedOrders,
    productCount, confirmedCount, depositedCount, unpaidCount, draftCount,
    loading, notFound,
    handleSave,
    handleCancelShipment,
    cancellingId,
  };
}
