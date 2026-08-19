import type { OrderWithTikTok } from "@app-types/index";
import { getOrderTikTokUsername } from "@utils/tiktok";
import { getOrderTotal } from "./order";

export type MergeGroup = {
  id: string;
  customerId: string | null;
  customerName: string;
  avatar: string;
  tiktokUsername: string;
  orders: OrderWithTikTok[];
  canMerge: boolean;
  reason?: string;
  totalAmount: number;
  totalItems: number;
};

export type MergeGroupsResult = {
  mergeable: MergeGroup[];
  unmergeable: MergeGroup[];
};

type Bucket = {
  id: string;
  customerId: string | null;
  customerName: string;
  avatar: string;
  tiktokUsername: string;
  orders: OrderWithTikTok[];
};

function isDraftOrder(order: OrderWithTikTok) {
  return order.status === "draft";
}

function isUnshippedOrder(order: OrderWithTikTok) {
  return order.shippingStatus === "not_shipped" && !order.trackingCode;
}

function getOrderAmount(order: OrderWithTikTok) {
  return Number(order.totalAmount || order.subtotalAmount || getOrderTotal(order.products));
}

function getDisplayName(order: OrderWithTikTok) {
  return String(
    order.customerName ||
      order.username ||
      getOrderTikTokUsername(order) ||
      "Khách live",
  );
}

function getGroupReason(bucket: Bucket) {
  if (!bucket.customerId) return "Thiếu thông tin khách";
  if (bucket.orders.length < 2) return "Chỉ có 1 đơn nháp";
  if (bucket.orders.some((order) => !isDraftOrder(order))) {
    return "Chỉ gộp đơn nháp";
  }
  if (bucket.orders.some((order) => !isUnshippedOrder(order))) {
    return "Đã có vận đơn";
  }
  return undefined;
}

function createGroup(bucket: Bucket): MergeGroup {
  const reason = getGroupReason(bucket);

  const orders = Array.isArray(bucket.orders) ? bucket.orders : [];
  return {
    ...bucket,
    orders,
    canMerge: !reason,
    reason,
    totalAmount: orders.reduce((sum, order) => sum + getOrderAmount(order), 0),
    totalItems: orders.reduce(
      (sum, order) => sum + Math.max(Array.isArray(order.products) ? order.products.length : 0, 1),
      0,
    ),
  };
}

function sortGroups(a: MergeGroup, b: MergeGroup) {
  if (b.orders.length !== a.orders.length) return b.orders.length - a.orders.length;
  return b.totalAmount - a.totalAmount;
}

export function buildMergeGroups(orders: OrderWithTikTok[]): MergeGroupsResult {
  const buckets = new Map<string, Bucket>();

  orders.forEach((order) => {
    const tiktokUsername = getOrderTikTokUsername(order);
    const customerId = order.customerId ?? null;
    const key = customerId || tiktokUsername || order.username || order.id;
    const current = buckets.get(key);

    if (!current) {
      buckets.set(key, {
        id: key,
        customerId,
        customerName: getDisplayName(order),
        avatar: String(order.avatar || order.avatarUrl || ""),
        tiktokUsername,
        orders: [order],
      });
      return;
    }

    current.orders.push(order);
    if (!current.customerId && customerId) current.customerId = customerId;
    if (!current.avatar) current.avatar = String(order.avatar || order.avatarUrl || "");
    if (!current.tiktokUsername && tiktokUsername) {
      current.tiktokUsername = tiktokUsername;
    }
  });

  const groups = Array.from(buckets.values()).map(createGroup);

  return {
    mergeable: groups.filter((group) => group.canMerge).sort(sortGroups),
    unmergeable: groups.filter((group) => !group.canMerge).sort(sortGroups),
  };
}

export function getGroupForOrder(
  groups: MergeGroup[],
  orderId: string,
): MergeGroup | undefined {
  return groups.find((group) =>
    group.orders.some((order) => order.id === orderId),
  );
}
