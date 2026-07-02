import { CustomerButton, FilterButton } from "./types/order";

export const CUSTOMER_BUTTONS: CustomerButton[] = [
  { key: "retail", label: "Lẻ", icon: "group_user" },
  { key: "wholesale", label: "Sỉ", icon: "group_user" },
  { key: "vip", label: "VIP", icon: "king" },
  { key: "chot_dao", label: "Chốt Dạo", icon: "group_user" },
  { key: "bomb", label: "Bomb", icon: "group_user" },
];

export const STATUS_BUTTONS: FilterButton[] = [
  { key: "confirmed", label: "Đã chốt" },
  { key: "paid", label: "Đã cọc" },
  { key: "unpaid", label: "Chưa cọc" },
  { key: "draft", label: "Đơn nháp" },
];
