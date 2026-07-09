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
const DEFAULT_QUANTITY = 1;

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
  const data = await getRequest<any>("/orders");
  const rows = pickArrayResponse(data, ["orders", "items", "data"]);

  return rows.map((order: any) => normalizeApiOrderForUi(order));
}

// START: Backend không có GET /orders/:id — lấy toàn bộ list rồi find theo id, đúng với cách web lấy order từ in-memory context
export async function getOrderByIdApi(
  orderId: string,
): Promise<OrderWithTikTok | null> {
  const orders = await getOrdersApi(null);

  return orders.find((o) => o.id === orderId) ?? null;
}
// END: Backend không có GET /orders/:id — lấy toàn bộ list rồi find theo id, đúng với cách web lấy order từ in-memory context

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
  quantity = DEFAULT_QUANTITY,
  note = "",
}: CreateOrderFromCommentPayload): Promise<CreateOrderFromCommentResult> {
  const data = await postRequest<any>("/orders/from-comment", {
    comment,
    liveSessionId,
    price,
    quantity,
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
  status:
    | "draft"
    | "confirmed"
    | "packed"
    | "shipping"
    | "completed"
    | "canceled"
    | "returned";
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
