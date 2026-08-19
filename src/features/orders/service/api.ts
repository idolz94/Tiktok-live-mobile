import { LiveComment, OrderWithTikTok } from "@app-types/index";
import { normalizeApiOrderForUi } from "@features/orders/utils/order";
import type { OrderItemPayload } from "@features/orders/types/order";
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "@utils/http/request-sse";

type CreateOrderFromCommentPayload = {
  comment: LiveComment;
  liveSessionId?: string | null;
  price?: number;
  quantity?: number;
  note?: string;
};

const DEFAULT_PRICE = 20000;

function pickArrayResponse(data: any, keys: string[]) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function pickObjectResponse(data: any, keys: string[]) {
  for (const key of keys) {
    if (data?.[key]) return data[key];
  }

  return data;
}

function normalizeOrderResponse(data: any) {
  const rawOrder = pickObjectResponse(data, ["uiOrder", "order", "item"]);

  if (data?.uiOrder) {
    return normalizeApiOrderForUi(data.uiOrder);
  }

  if (data?.order && data?.orderItem) {
    return normalizeApiOrderForUi({
      ...data.order,
      products: [data.orderItem],
      avatar:
        data.customer?.avatar_url ||
        data.customer?.avatarUrl ||
        data.order.avatar,
    });
  }

  return normalizeApiOrderForUi(rawOrder);
}

export async function getOrdersApi(status: string | null = "draft"): Promise<OrderWithTikTok[]> {
  const data = await getRequest<any>(status ? `/orders?status=${status}` : "/orders");
  const rows = pickArrayResponse(data, ["orders", "items", "data"]);

  return rows.map((order: any) => normalizeApiOrderForUi(order));
}

export async function getShippingOrdersApi(): Promise<OrderWithTikTok[]> {
  const data = await getRequest<any>("/orders/shipping");
  const rows = pickArrayResponse(data, ["orders", "items", "data"]);

  return rows.map((order: any) => normalizeApiOrderForUi(order));
}

export async function getCustomersApi() {
  return getRequest<{ customers: Array<{ id: string; displayName: string | null }> }>("/customers");
}

export async function getCustomerOrdersApi(customerId: string) {
  return getRequest<{ orders: Array<{ id: string; orderCode: string | null }> }>(`/customers/${customerId}/orders`);
}

export async function getOrderByIdApi(orderId: string): Promise<OrderWithTikTok | null> {
  const data = await getRequest<any>(`/orders/${orderId}`);
  const raw = pickObjectResponse(data, ["order", "uiOrder", "item"]);
  if (!raw) return null;
  return normalizeApiOrderForUi(raw);
}

export type CreateOrderFromCommentResult = {
  success: boolean;
  message: string;
  orderId: string;
  orderCode: string;
};

export async function createOrderFromCommentApi({
  comment,
  liveSessionId,
  price = DEFAULT_PRICE,
  quantity,
  note = "",
}: CreateOrderFromCommentPayload): Promise<CreateOrderFromCommentResult> {
  const data = await postRequest<any>("/orders/from-comment", {
    comment,
    liveSessionId,
    price,
    ...(quantity !== undefined ? { quantity } : {}),
    note,
  });

  const result = data?.data ?? data;

  return {
    success: Boolean(result?.success ?? true),
    message: String(result?.message ?? ""),
    orderId: String(result?.orderId ?? result?.order_id ?? ""),
    orderCode: String(result?.orderCode ?? result?.order_code ?? ""),
  };
}

export async function updateOrderDepositStatusApi({
  orderId,
  depositStatus,
}: {
  orderId: string;
  depositStatus: "unpaid" | "paid" | "deposited" | "refunded";
}) {
  const data = await patchRequest<any>(`/orders/${orderId}/deposit-status`, {
    depositStatus,
  });

  return normalizeOrderResponse(data);
}

export async function updateOrderStatusApi({
  orderId,
  status,
}: {
  orderId: string;
  status: "draft" | "confirmed" | "success";
}) {
  const data = await patchRequest<any>(`/orders/${orderId}/status`, {
    status,
  });

  return normalizeOrderResponse(data);
}

export async function addOrderItemApi(
  orderId: string,
  payload: OrderItemPayload,
) {
  return postRequest<{ item: unknown }>(`/orders/${orderId}/items`, payload);
}

export async function updateOrderItemApi(
  orderId: string,
  itemId: string,
  payload: Partial<OrderItemPayload>,
) {
  return patchRequest<{ item: unknown }>(
    `/orders/${orderId}/items/${itemId}`,
    payload,
  );
}

export async function deleteOrderItemApi(orderId: string, itemId: string) {
  return deleteRequest<{ ok: boolean }>(`/orders/${orderId}/items/${itemId}`);
}

export type StatChartPoint = { date: string; value: number };
export type StatSectionData = { total: number; avg: number; max: number; chart: StatChartPoint[] };
export type OrderStatsData = {
  revenue: StatSectionData;
  orders: StatSectionData;
  products: StatSectionData;
  customers: StatSectionData;
  prev: { revenue: number; orders: number; products: number; customers: number };
};

export async function getOrderStatsApi(params: {
  dateFrom: string;
  dateTo: string;
  depositStatus?: string;
  status?: string;
}): Promise<OrderStatsData> {
  const qs = new URLSearchParams({ dateFrom: params.dateFrom, dateTo: params.dateTo });
  if (params.depositStatus) qs.set("depositStatus", params.depositStatus);
  if (params.status) qs.set("status", params.status);
  const data = await getRequest<{ data: OrderStatsData } | OrderStatsData>(`/orders/stats?${qs.toString()}`);
  return (data as { data: OrderStatsData }).data ?? (data as OrderStatsData);
}

export async function deleteOrderApi(orderId: string) {
  return deleteRequest<{ ok: boolean }>(`/orders/${orderId}`);
}

export type MergeDraftsPayload = {
  targetOrderId: string;
  sourceOrderIds: string[];
};

export type MergeDraftsResult = {
  targetOrderId: string;
  mergedOrderIds: string[];
  deletedOrderIds: string[];
  mergedItemCount: number;
  order: OrderWithTikTok;
};

export async function mergeDraftOrdersApi(
  payload: MergeDraftsPayload,
): Promise<MergeDraftsResult> {
  const raw = await postRequest<any>("/orders/merge-drafts", payload);
  const merge =
    raw?.merge ??
    raw?.data?.merge ??
    raw?.data?.data?.merge ??
    raw;

  if (!merge || !merge.order) {
    throw new Error("Phản hồi gộp đơn không hợp lệ.");
  }

  const rawOrder = merge.order;
  if (
    (rawOrder.remainingAmount != null || rawOrder.remaining_amount != null) &&
    (rawOrder.codAmount == null && rawOrder.cod_amount == null)
  ) {
    rawOrder.codAmount =
      rawOrder.remainingAmount ?? rawOrder.remaining_amount;
  }

  const order = normalizeApiOrderForUi(rawOrder);

  return {
    targetOrderId: String(merge.targetOrderId ?? merge.target_order_id ?? payload.targetOrderId),
    mergedOrderIds: Array.isArray(merge.mergedOrderIds ?? merge.merged_order_ids)
      ? (merge.mergedOrderIds ?? merge.merged_order_ids).map(String)
      : [],
    deletedOrderIds: Array.isArray(merge.deletedOrderIds ?? merge.deleted_order_ids)
      ? (merge.deletedOrderIds ?? merge.deleted_order_ids).map(String)
      : [],
    mergedItemCount: Number(merge.mergedItemCount ?? merge.merged_item_count ?? 0),
    order,
  };
}
