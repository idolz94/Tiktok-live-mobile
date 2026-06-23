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
import type { Transport, PickupOption } from "./types";

export {
  createShopAddressApi,
  listShopAddressesApi,
  updateShopAddressApi,
};
export type { ShopAddress };

export type AddressPayload = ShopAddressPayload;

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

type AddressResponse<T> = { address: T };

type ShippingFeePayload = {
  pickProvince: string;
  pickDistrict: string;
  pickWard?: string;
  pickAddress?: string;
  receiverProvince: string;
  receiverDistrict: string;
  receiverWard?: string;
  receiverAddress?: string;
  weight?: number;
  transport?: Transport;
};

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
  receiverTel: string;
  note?: string;
  isFreeShip?: 0 | 1;
  transport?: Transport;
  pickOption?: PickupOption;
};

type ManualShippingPayload = {
  trackingCode: string;
  providerName?: string;
  shippingFee?: number;
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
  const data = await postRequest<AddressResponse<CustomerAddress>>(
    `/customers/${customerId}/addresses`,
    payload,
  );

  return data.address;
}

export async function updateCustomerAddressApi(
  customerId: string,
  addressId: string,
  payload: AddressPayload,
) {
  const data = await patchRequest<AddressResponse<CustomerAddress>>(
    `/customers/${customerId}/addresses/${addressId}`,
    payload,
  );

  return data.address;
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

export async function getShippingFeeApi(
  orderId: string,
  payload: ShippingFeePayload,
) {
  return postRequest<{ fee: number }>(`/orders/${orderId}/shipping/fee`, payload);
}

export async function submitOrderToGhtkApi(
  orderId: string,
  payload: SubmitShippingPayload,
) {
  return postRequest<{ shipping: unknown }>(`/orders/${orderId}/shipping`, payload);
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
