import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "@utils/http/request-sse";
import {
  createShopAddressApi,
  listShopAddressesApi,
  ShopAddress,
  ShopAddressPayload,
  updateShopAddressApi,
} from "@features/settings/service/shop-addresses-api";
import type { PaymentSide, ServiceType, CollectType, SpxTimeslot } from "./types";

export {
  createShopAddressApi,
  listShopAddressesApi,
  updateShopAddressApi,
  ShopAddress,
};
export type { ShopAddressPayload as AddressPayload };

export type CustomerAddress = {
  id: string;
  customerId: string;
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

type AddressPayload = ShopAddressPayload;

type ManualShippingPayload = {
  paymentSide: PaymentSide;
  shippingFee?: number;
  codAmount?: number;
  note?: string;
};

type PatchOrderPayload = {
  customerAddressId?: string | null;
  note?: string;
  color?: string | null;
  codAmount?: number;
};

export async function deleteShopAddressApi(addressId: string) {
  return deleteRequest<{ message?: string }>(`/me/shop-addresses/${addressId}`);
}

export async function listCustomerAddressesApi(customerId: string) {
  const data = await getRequest<{ addresses: CustomerAddress[] }>(
    `/customers/${customerId}/addresses`,
  );

  return data.addresses ?? [];
}

export async function createCustomerAddressApi(
  customerId: string,
  payload: AddressPayload,
) {
  const raw = await postRequest<any>(
    `/customers/${customerId}/addresses`,
    payload,
  );

  return (raw?.data?.address ?? raw?.address ?? raw) as CustomerAddress;
}

export async function updateCustomerAddressApi(
  customerId: string,
  addressId: string,
  payload: AddressPayload,
) {
  const raw = await patchRequest<any>(
    `/customers/${customerId}/addresses/${addressId}`,
    payload,
  );

  return (raw?.data?.address ?? raw?.address ?? raw) as CustomerAddress;
}

export async function deleteCustomerAddressApi(
  customerId: string,
  addressId: string,
) {
  return deleteRequest<{ message?: string }>(
    `/customers/${customerId}/addresses/${addressId}`,
  );
}

export async function patchOrderApi(orderId: string, payload: PatchOrderPayload) {
  return patchRequest<{ order: unknown }>(`/orders/${orderId}`, payload);
}

export async function submitManualShippingApi(
  orderId: string,
  payload: ManualShippingPayload,
) {
  return postRequest<{ shipping: unknown }>(
    `/orders/${orderId}/shipping/manual`,
    payload,
  );
}

export async function getShippingTrackingApi(orderId: string) {
  return getRequest<{ tracking: unknown }>(`/orders/${orderId}/shipping/tracking`);
}

export async function cancelShipmentApi(
  orderId: string,
  payload?: { trackingId?: string | null; reason?: string },
) {
  return postRequest<{ shipping: unknown }>(
    `/orders/${orderId}/shipping/cancel`,
    payload ?? {},
  );
}

type SubmitSpxPayload = {
  providerCode: "spx";
  senderAddressId: string;
  serviceType: ServiceType;
  collectType: CollectType;
  pickupTimeRangeId?: number;
  pickupTime?: number;
  parcelWeightGram: number;
  parcelLengthCm?: number;
  parcelWidthCm?: number;
  parcelHeightCm?: number;
  parcelItemName?: string;
  declaredValue?: number;
  note?: string;
  idempotencyKey: string;
};

export async function submitSpxApi(
  orderId: string,
  payload: SubmitSpxPayload,
) {
  return postRequest<{ shipping: unknown }>(
    `/orders/${orderId}/shipping/spx`,
    payload,
  );
}

export async function getSpxTimeslotsApi(serviceType: number) {
  return getRequest<{ timeslots: SpxTimeslot[] }>(`/orders/spx/timeslots?serviceType=${serviceType}`);
}

type ShippingFeePayload = {
  providerCode: "spx";
  pickProvince: string;
  pickDistrict: string;
  pickWard: string;
  pickAddress?: string;
  receiverProvince: string;
  receiverDistrict: string;
  receiverWard: string;
  receiverAddress?: string;
  weightGram?: number;
};

export async function getShippingFeeApi(orderId: string, payload: ShippingFeePayload) {
  return postRequest<{ fee: { providerCode: string; fee: number } }>(
    `/orders/${orderId}/shipping/fee`,
    payload,
  );
}

export async function getShipmentLabelApi(orderId: string) {
  return getRequest<{ label_url?: string; format?: string }>(`/orders/${orderId}/shipping/label`);
}

export async function refreshShippingStatusApi(orderId: string) {
  return postRequest<{ tracking: unknown }>(`/orders/${orderId}/shipping/refresh`, {});
}
