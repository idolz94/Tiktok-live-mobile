import {
  getRequest,
  patchRequest,
  postRequest,
} from "@utils/http/request-sse";

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

export type ShopAddressPayload = {
  label?: string | null;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  isDefault?: boolean;
};

type ShopAddressResponse = { address: ShopAddress } | { data: { address: ShopAddress } };

function unwrapAddress(data: ShopAddressResponse): ShopAddress {
  if ("data" in data) return data?.data?.address;

  return data?.address;
}

export async function listShopAddressesApi() {
  const data = await getRequest<{ addresses: ShopAddress[] }>(
    "/me/shop-addresses",
  );

  return data.addresses ?? [];
}

export async function createShopAddressApi(payload: ShopAddressPayload) {
  const data = await postRequest<ShopAddressResponse>("/me/shop-addresses", payload);

  return unwrapAddress(data);
}

export async function updateShopAddressApi(
  addressId: string,
  payload: ShopAddressPayload,
) {
  const data = await patchRequest<ShopAddressResponse>(`/me/shop-addresses/${addressId}`, payload);

  return unwrapAddress(data);
}
