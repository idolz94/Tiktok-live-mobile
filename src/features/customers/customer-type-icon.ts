import { images } from "@assets/images";
import { ImageSourcePropType } from "react-native";

const MAP: Record<string, ImageSourcePropType> = {
  Lẻ: images.customer_type_le,
  Sỉ: images.customer_type_si,
  VIP: images.customer_type_vip,
  "Chốt Dạo": images.customer_type_chot_dao,
  "Bom Hàng": images.customer_type_bom_hang,
  Bomb: images.customer_type_bom_hang,
};

export function getCustomerTypeIcon(
  type?: string | null,
): ImageSourcePropType | null {
  if (!type) return null;
  return MAP[type] ?? null;
}
