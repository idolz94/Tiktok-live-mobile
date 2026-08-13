export type OrderStatus =
  | "draft"
  | "confirmed"
  | "packed"
  | "shipped"
  | "completed"
  | "cancelled";

export type CustomerDetail = {
  id: string;
  shopId: string;
  displayName: string | null;
  tiktokUsername: string | null;
  tiktokUniqueId: string | null;
  avatarUrl: string | null;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
  status: "active" | "inactive";
  // Fields hiện có từ API, dùng chung với customer-detail-sheet
  customerType?: string | null;
  referenceInfo?: string | null;
};

export type CustomerOrderItem = {
  id: string;
  orderCode: string | null;
  status: OrderStatus;
  shippingStatus?: string | null;
  totalAmount: number;
  // ponytail: backend listCustomerOrders chưa trả codAmount — optional để render conditional
  codAmount?: number | null;
  createdAt: string;
};

export type CustomerAddress = {
  id: string;
  customerId: string;
  label: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  isDefault: boolean;
  createdAt: string;
};
