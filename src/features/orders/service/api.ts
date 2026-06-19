import { LiveComment, OrderWithTikTok } from "@app-types/index";
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "@utils/http/request-sse";
import { normalizeApiOrderForUi } from "@features/orders/utils/order";

type CreateOrderFromCommentPayload = {
  comment: LiveComment;
  liveSessionId?: string | null;
  price?: number;
  quantity?: number;
  note?: string;
};

const DEFAULT_PRICE = 20;
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

export async function getOrdersApi(): Promise<OrderWithTikTok[]> {
  const data = await getRequest<any>("/orders");
  const rows = pickArrayResponse(data, ["orders", "items", "data"]);

  return rows.map((order: any) => normalizeApiOrderForUi(order));
}

export async function createOrderFromCommentApi({
  comment,
  liveSessionId,
  price = DEFAULT_PRICE,
  quantity = DEFAULT_QUANTITY,
  note = "",
}: CreateOrderFromCommentPayload) {
  const data = await postRequest<any>("/orders/from-comment", {
    comment,
    liveSessionId,
    price,
    quantity,
    note,
  });

  return {
    ...data,
    uiOrder: normalizeOrderResponse(data),
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

export async function deleteOrderApi(orderId: string) {
  return deleteRequest<{ ok: boolean }>(`/orders/${orderId}`);
}
