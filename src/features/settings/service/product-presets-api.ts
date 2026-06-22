import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "@utils/http/request-sse";

export type ProductPreset = {
  id: string;
  shopId: string;
  code: string;
  name: string | null;
  color: string | null;
  price: number;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProductPresetPayload = {
  code: string;
  name?: string | null;
  color?: string | null;
  price: number;
};

export async function listProductPresetsApi() {
  const data = await getRequest<{ presets: ProductPreset[] }>(
    "/me/product-presets",
  );

  return data.presets;
}

export async function createProductPresetApi(payload: ProductPresetPayload) {
  const data = await postRequest<{ preset: ProductPreset }>(
    "/me/product-presets",
    payload,
  );

  return data.preset;
}

export async function updateProductPresetApi(
  presetId: string,
  payload: Partial<ProductPresetPayload>,
) {
  const data = await patchRequest<{ preset: ProductPreset }>(
    `/me/product-presets/${presetId}`,
    payload,
  );

  return data.preset;
}

export async function deleteProductPresetApi(presetId: string) {
  await deleteRequest(`/me/product-presets/${presetId}`);
}
