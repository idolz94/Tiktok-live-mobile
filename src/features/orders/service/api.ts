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

export async function getOrdersApi(): Promise<OrderWithTikTok[]> {
  const data = await getRequest<any>("/orders");
  const rows = pickArrayResponse(data, ["orders", "items", "data"]);

  return rows.map((order: any) => normalizeApiOrderForUi(order));
}

export async function getOrderByIdApi(orderId: string): Promise<OrderWithTikTok> {
  const orders = await getOrdersApi();
  const order = orders.find((item) => item.id === orderId);

  if (!order) throw new Error("Không tìm thấy đơn hàng.");

  return order;
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

export async function deleteOrderApi(orderId: string) {
  return deleteRequest<{ ok: boolean }>(`/orders/${orderId}`);
}

export async function addOrderItemApi(
  orderId: string,
  payload: { productCode: string; productName: string; price: number; quantity: number },
) {
  const data = await postRequest<any>(`/orders/${orderId}/items`, payload);
  const item =
    data?.item ??
    data?.data?.item ??
    data?.orderItem ??
    data?.data?.orderItem ??
    data?.order_item ??
    data?.data ??
    data;
  return item as { id: string; [key: string]: any };
}

export async function updateOrderItemApi(
  orderId: string,
  itemId: string,
  payload: { productCode?: string; productName?: string; price?: number; quantity?: number },
) {
  const data = await patchRequest<any>(`/orders/${orderId}/items/${itemId}`, payload);
  return data;
}

export async function deleteOrderItemApi(orderId: string, itemId: string) {
  return deleteRequest<{ ok: boolean }>(`/orders/${orderId}/items/${itemId}`);
}

export type ManualShippingPayload = {
  trackingCode: string;
  providerName?: string;
  shippingFee?: number;
  note?: string;
};

export type ManualShippingResult = {
  trackingCode: string;
  providerName: string;
  shippingStatus: string;
};

export async function submitManualShippingApi(
  orderId: string,
  payload: ManualShippingPayload,
): Promise<ManualShippingResult> {
  const data = await postRequest<any>(`/orders/${orderId}/shipping/manual`, payload);
  return (data?.shipping ?? data) as ManualShippingResult;
}

// ─── Address types ────────────────────────────────────────────────────────────

export type ShopAddress = {
  id: string;
  shopId: string;
  label: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CustomerAddress = {
  id: string;
  customerId: string;
  shopId: string;
  label: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressPayload = {
  label?: string | null;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  isDefault?: boolean;
};

// ─── Shop addresses ───────────────────────────────────────────────────────────

export async function listShopAddressesApi(): Promise<ShopAddress[]> {
  const data = await getRequest<{ addresses: ShopAddress[] }>("/me/shop-addresses");
  return data.addresses ?? [];
}

export async function createShopAddressApi(payload: AddressPayload): Promise<ShopAddress> {
  const data = await postRequest<any>("/me/shop-addresses", payload);
  return (data?.data?.address ?? data?.address ?? data) as ShopAddress;
}

export async function updateShopAddressApi(addressId: string, payload: AddressPayload): Promise<ShopAddress> {
  const data = await patchRequest<any>(`/me/shop-addresses/${addressId}`, payload);
  return (data?.data?.address ?? data?.address ?? data) as ShopAddress;
}

export async function deleteShopAddressApi(addressId: string): Promise<void> {
  await deleteRequest(`/me/shop-addresses/${addressId}`);
}

// ─── Customer addresses ───────────────────────────────────────────────────────

export async function listCustomerAddressesApi(customerId: string): Promise<CustomerAddress[]> {
  const data = await getRequest<{ addresses: CustomerAddress[] }>(`/customers/${customerId}/addresses`);
  return data.addresses ?? [];
}

export async function createCustomerAddressApi(customerId: string, payload: AddressPayload): Promise<CustomerAddress> {
  const data = await postRequest<any>(`/customers/${customerId}/addresses`, payload);
  return (data?.data?.address ?? data?.address ?? data) as CustomerAddress;
}

export async function updateCustomerAddressApi(
  customerId: string,
  addressId: string,
  payload: AddressPayload,
): Promise<CustomerAddress> {
  const data = await patchRequest<any>(`/customers/${customerId}/addresses/${addressId}`, payload);
  return (data?.data?.address ?? data?.address ?? data) as CustomerAddress;
}

export async function deleteCustomerAddressApi(customerId: string, addressId: string): Promise<void> {
  await deleteRequest(`/customers/${customerId}/addresses/${addressId}`);
}

// ─── Shipping fee & GHTK submit ───────────────────────────────────────────────

export type ShippingFeeParams = {
  pickProvince: string;
  pickDistrict: string;
  pickWard?: string;
  pickAddress?: string;
  receiverProvince: string;
  receiverDistrict: string;
  receiverWard?: string;
  receiverAddress?: string;
  weight?: number;
  transport?: "road" | "fly";
};

export type ShippingFeeResult = {
  name: string;
  fee: number;
  insuranceFee: number;
  delivery: boolean;
  extFees: Array<{ title: string; amount: number; type: string }>;
};

export async function getShippingFeeApi(orderId: string, params: ShippingFeeParams): Promise<ShippingFeeResult> {
  const data = await postRequest<any>(`/orders/${orderId}/shipping/fee`, params);
  return (data?.fee ?? data) as ShippingFeeResult;
}

export type SubmitShippingPayload = {
  pickName: string;
  pickAddress: string;
  pickProvince: string;
  pickDistrict: string;
  pickWard?: string;
  pickTel: string;
  receiverName: string;
  receiverAddress: string;
  receiverProvince: string;
  receiverDistrict: string;
  receiverWard: string;
  receiverHamlet?: string;
  receiverTel: string;
  note?: string;
  isFreeShip?: 0 | 1;
  transport?: "road" | "fly";
  pickOption?: "cod" | "post";
};

export async function submitOrderToGhtkApi(
  orderId: string,
  payload: SubmitShippingPayload,
): Promise<{ orderId: string; label?: string; trackingId?: number; fee?: number }> {
  return postRequest(`/orders/${orderId}/shipping/submit`, payload);
}

export async function patchOrderApi(
  orderId: string,
  payload: { customerAddressId?: string; note?: string },
): Promise<void> {
  await patchRequest(`/orders/${orderId}`, payload);
}
