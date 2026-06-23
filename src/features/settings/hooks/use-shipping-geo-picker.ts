import {
  fetchVnDistricts,
  fetchVnProvinces,
  fetchVnWards,
  VnDistrict,
  VnGeoItem,
  VnProvince,
  VnWard,
} from "@features/settings/service/vn-geo";
import { GeoPickerState } from "./shipping-address-form.schema";
import { useState } from "react";
import { Alert } from "react-native";

type UseShippingGeoPickerParams = {
  province: string;
  district: string;
  ward: string;
  setAddressField: (key: "province" | "district" | "ward", value: string) => void;
};

export function useShippingGeoPicker({
  province,
  district,
  ward,
  setAddressField,
}: UseShippingGeoPickerParams) {
  const [provinces, setProvinces] = useState<VnProvince[]>([]);
  const [districts, setDistricts] = useState<VnDistrict[]>([]);
  const [wards, setWards] = useState<VnWard[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<VnProvince | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<VnDistrict | null>(null);
  const [geoPicker, setGeoPicker] = useState<GeoPickerState>(null);

  const ensureProvinces = async () => {
    if (provinces.length > 0) return provinces;

    try {
      const rows = await fetchVnProvinces();
      setProvinces(rows);
      return rows;
    } catch {
      Alert.alert("Không tải được danh sách tỉnh thành", "Vui lòng thử lại sau.");
      return [];
    }
  };

  const resetGeoSelection = () => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setWards([]);
  };

  const setInitialGeoSelection = (provinceName?: string | null, districtName?: string | null) => {
    setSelectedProvince(provinceName ? { code: -1, name: provinceName } : null);
    setSelectedDistrict(districtName ? { code: -1, name: districtName } : null);
  };

  const openProvincePicker = async () => {
    const rows = await ensureProvinces();
    setGeoPicker({
      type: "province",
      title: "Chọn Tỉnh/Thành phố",
      placeholder: "Tìm tỉnh/thành phố...",
      items: rows,
      selectedName: province,
    });
  };

  const openDistrictPicker = () => {
    if (!selectedProvince) return;

    setGeoPicker({
      type: "district",
      title: "Chọn Huyện/Quận",
      placeholder: "Tìm huyện/quận...",
      items: districts,
      selectedName: district,
    });
  };

  const openWardPicker = () => {
    if (!selectedDistrict) return;

    setGeoPicker({
      type: "ward",
      title: "Chọn Phường/Xã",
      placeholder: "Tìm phường/xã...",
      items: wards,
      selectedName: ward,
    });
  };

  const selectGeoItem = async (item: VnGeoItem) => {
    if (!geoPicker) return;

    if (geoPicker.type === "province") {
      setSelectedProvince(item as VnProvince);
      setSelectedDistrict(null);
      setAddressField("province", item.name);
      setAddressField("district", "");
      setAddressField("ward", "");
      setDistricts([]);
      setWards([]);
      setGeoPicker(null);

      try {
        setDistricts(await fetchVnDistricts(item.code));
      } catch {
        Alert.alert("Không tải được danh sách huyện/quận", "Vui lòng thử lại sau.");
      }
      return;
    }

    if (geoPicker.type === "district") {
      setSelectedDistrict(item as VnDistrict);
      setAddressField("district", item.name);
      setAddressField("ward", "");
      setWards([]);
      setGeoPicker(null);

      try {
        setWards(await fetchVnWards(item.code));
      } catch {
        Alert.alert("Không tải được danh sách phường/xã", "Vui lòng thử lại sau.");
      }
      return;
    }

    setAddressField("ward", item.name);
    setGeoPicker(null);
  };

  return {
    ensureProvinces,
    geoPicker,
    openDistrictPicker,
    openProvincePicker,
    openWardPicker,
    resetGeoSelection,
    selectGeoItem,
    selectedDistrict,
    selectedProvince,
    setGeoPicker,
    setInitialGeoSelection,
  };
}
