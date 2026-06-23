import { ShopAddress, ShopAddressPayload } from "@features/settings/service/shop-addresses-api";
import { VnGeoItem } from "@features/settings/service/vn-geo";
import { z } from "zod";

const fullNamePattern = /^[\p{L}\s]+$/u;
const VN_PHONE_RE = /^(\+84|0)(3[2-9]|5[25689]|7[06-9]|8[1-689]|9[0-46-8])\d{7}$/;

export const addressFormSchema = z.object({
  label: z.string(),
  name: z
    .string()
    .trim()
    .min(1, { error: "Tên không được bỏ trống" })
    .regex(fullNamePattern, "Tên chỉ được gồm chữ cái và khoảng trắng"),
  phone: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length > 0, "Số điện thoại không được để trống")
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 12;
    }, "Số điện thoại phải từ 10 đến 12 chữ số")
    .refine((value) => VN_PHONE_RE.test(value), "Số điện thoại không đúng nhà mạng Việt Nam"),
  address: z.string(),
  province: z.string().trim().min(1, { error: "Vui lòng chọn Tỉnh/Thành phố" }),
  district: z.string().trim().min(1, { error: "Vui lòng chọn Huyện/Quận" }),
  ward: z.string().trim().min(1, { error: "Vui lòng chọn Phường/Xã" }),
  isDefault: z.boolean(),
});

export type AddressForm = z.infer<typeof addressFormSchema>;

export type GeoPickerState = {
  type: "province" | "district" | "ward";
  title: string;
  placeholder: string;
  items: VnGeoItem[];
  selectedName: string;
} | null;

export const emptyAddressForm: AddressForm = {
  label: "Kho hàng",
  name: "",
  phone: "",
  address: "",
  province: "",
  district: "",
  ward: "",
  isDefault: false,
};

export function buildAddressPayload(values: AddressForm): ShopAddressPayload {
  return {
    label: values.label.trim() || null,
    name: values.name.trim(),
    phone: values.phone.trim(),
    address: values.address.trim() || null,
    province: values.province.trim(),
    district: values.district.trim(),
    ward: values.ward.trim(),
    isDefault: values.isDefault,
  };
}

export function formatShopAddress(address: ShopAddress) {
  return [address.address, address.ward, address.district, address.province].filter(Boolean).join(", ") || "Chưa có địa chỉ";
}
