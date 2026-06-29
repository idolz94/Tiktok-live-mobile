import geoData from "@assets/vn-geo.json";

export type VnGeoItem = { name: string; code?: number };

const data = geoData as Record<string, string[]>;

const VN_API = "https://provinces.open-api.vn/api/v1";

export function getProvinces(): VnGeoItem[] {
  return Object.keys(data).map((name) => ({ name }));
}

// ponytail: static JSON wards kept as fallback; API-based cascade used for new address form
export function getWards(provinceName: string): VnGeoItem[] {
  return (data[provinceName] ?? []).map((name) => ({ name }));
}

export async function fetchProvinces(): Promise<VnGeoItem[]> {
  const res = await fetch(`${VN_API}/p/`);
  if (!res.ok) throw new Error("Không tải được danh sách tỉnh/thành phố");
  const list = (await res.json()) as Array<{ code: number; name: string }>;
  return list.map(({ code, name }) => ({ code, name }));
}

export async function fetchDistricts(provinceCode: number): Promise<VnGeoItem[]> {
  const res = await fetch(`${VN_API}/p/${provinceCode}?depth=2`);
  if (!res.ok) throw new Error("Không tải được danh sách quận/huyện");
  const data = (await res.json()) as { districts?: Array<{ code: number; name: string }> };
  return (data.districts ?? []).map(({ code, name }) => ({ code, name }));
}

export async function fetchWards(districtCode: number): Promise<VnGeoItem[]> {
  const res = await fetch(`${VN_API}/d/${districtCode}?depth=2`);
  if (!res.ok) throw new Error("Không tải được danh sách phường/xã");
  const data = (await res.json()) as { wards?: Array<{ code: number; name: string }> };
  return (data.wards ?? []).map(({ code, name }) => ({ code, name }));
}

export function removeDiacritics(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}
