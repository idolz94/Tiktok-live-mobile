export type LiveComment = {
  id: string;
  username: string;
  comment: string;
  avatar?: string;
  raw_text?: string;
  text?: string;
  uniqueId?: string;
  intent?: "buying" | "normal" | string;
  created_at?: string;
  createdAt?: string;
};

export type OrderProduct = {
  id: string;
  code: string;
  name: string;
  price: number;
  quantity: number;
};

export type OrderStatus = "draft" | "confirmed";
export type DepositStatus = "unpaid" | "paid";

export type Order = {
  id: string;
  orderCode: string;
  username: string;
  avatar?: string;
  comment: string;
  commentId: string;
  productName: string;
  quantity: number;
  latestComment?: string;
  size: string;
  color: string;
  price: number;
  products: OrderProduct[];
  status: OrderStatus;
  depositStatus: DepositStatus;
  note?: string;
  createdAt: string;
};

export type SocketMessage = {
  type?: string;
  payload?: unknown;
  data?: unknown;
};

export type AuthUser = {
  id: string;
  username: string;
};

export type LiveTab = "live" | "orders";
export type TopTab = "connect" | "history";
export type BottomTab = "home" | "customers" | "shipping" | "reports" | "settings";
export type OrderFilter = "all" | "unpaid" | "paid" | "draft" | "confirmed";
