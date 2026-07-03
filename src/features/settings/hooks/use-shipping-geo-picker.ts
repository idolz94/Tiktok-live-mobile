import { getProvinces, getWards, VnGeoItem } from "@features/settings/service/vn-geo";
import { useState } from "react";
import { GeoPickerState } from "../schemas/shipping-address-form-schema";

type UseShippingGeoPickerParams = {
  province: string;
  ward: string;
  setAddressField: (key: "province" | "ward", value: string) => void;
};

export function useShippingGeoPicker({
  province,
  ward,
  setAddressField,
}: UseShippingGeoPickerParams) {
  const [geoPicker, setGeoPicker] = useState<GeoPickerState>(null);

  const openProvincePicker = () => {
    setGeoPicker({
      type: "province",
      title: "Chọn Tỉnh/Thành phố",
      placeholder: "Tìm tỉnh/thành phố...",
      items: getProvinces(),
      selectedName: province,
    });
  };

  const openWardPicker = () => {
    if (!province) return;
    setGeoPicker({
      type: "ward",
      title: "Chọn Phường/Xã",
      placeholder: "Tìm phường/xã...",
      items: getWards(province),
      selectedName: ward,
    });
  };

  const selectGeoItem = (item: VnGeoItem) => {
    if (!geoPicker) return;

    if (geoPicker.type === "province") {
      setAddressField("province", item.name);
      setAddressField("ward", "");
      setGeoPicker(null);
      return;
    }

    setAddressField("ward", item.name);
    setGeoPicker(null);
  };

  const resetGeoSelection = () => {};

  const setInitialGeoSelection = (_provinceName?: string | null) => {};

  return {
    geoPicker,
    openProvincePicker,
    openWardPicker,
    resetGeoSelection,
    selectGeoItem,
    setGeoPicker,
    setInitialGeoSelection,
  };
}
