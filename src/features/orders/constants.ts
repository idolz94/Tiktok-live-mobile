import { images } from "@assets/images";
import { CustomerButton, FilterButton } from "./types/order";

export const CUSTOMER_BUTTONS: CustomerButton[] = [
  { key: "retail", label: "Lẻ", icon: images.customer_type_le },
  { key: "wholesale", label: "Sỉ", icon: images.customer_type_si },
  { key: "vip", label: "VIP", icon: "king" },
  { key: "chot_dao", label: "Chốt Dạo", icon: images.customer_type_chot_dao },
  { key: "bomb", label: "Bomb", icon: images.customer_type_bom_hang },
];

export const STATUS_BUTTONS: FilterButton[] = [
  { key: "confirmed", label: "Đã chốt" },
  { key: "paid", label: "Đã cọc" },
  { key: "unpaid", label: "Chưa cọc" },
  { key: "draft", label: "Đơn nháp" },
];
