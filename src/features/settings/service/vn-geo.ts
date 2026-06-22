const VN_API = "https://provinces.open-api.vn/api/v1";

export type VnProvince = { code: number; name: string };
export type VnDistrict = { code: number; name: string };
export type VnWard = { code: number; name: string };
export type VnGeoItem = VnProvince | VnDistrict | VnWard;

export async function fetchVnProvinces(): Promise<VnProvince[]> {
  const response = await fetch(`${VN_API}/p/`);

  return response.json();
}

export async function fetchVnDistricts(provinceCode: number): Promise<VnDistrict[]> {
  const response = await fetch(`${VN_API}/p/${provinceCode}?depth=2`);
  const data = await response.json();

  return data.districts ?? [];
}

export async function fetchVnWards(districtCode: number): Promise<VnWard[]> {
  const response = await fetch(`${VN_API}/d/${districtCode}?depth=2`);
  const data = await response.json();

  return data.wards ?? [];
}

export function removeDiacritics(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}
