import { ShopTikTokChannel } from "./database";

export type AiStatus = "none" | "pending" | "done" | "error";

export type CommentPriorityLevel = "high" | "medium" | "low" | "normal";

export type CommentIntent =
  | "buying"
  | "buy"
  | "ask_price"
  | "ask_stock"
  | "ask_shipping"
  | "ask_product"
  | "provide_phone"
  | "provide_address"
  | "contact"
  | "question"
  | "normal"
  | "spam"
  | "unknown"
  | "user"
  | string;

export type LiveComment = {
  id: string;
  type?: "comment" | "user_joined";
  username: string;
  displayName?: string;
  customerTikTokUsername?: string;
  customerTikTokName?: string;
  uniqueId?: string;
  avatar?: string;
  avatarUrl?: string;
  comment: string;
  intent?: CommentIntent;
  priorityLevel?: CommentPriorityLevel | string;
  finalScore?: number;
  aiScore?: number;
  ruleScore?: number;
  aiStatus?: AiStatus | string;
  aiReason?: string;
  aiModel?: string;
  matchedReasons?: string[];
  missingInfo?: string[];
  isOrderCreated?: boolean;
  orderId?: string;
  dbId?: string;
  createdAt?: string;
  raw?: RawComment;
};

export type RawComment = {
  id: string;
  shop_id: string;
  live_session_id: string;
  customer_id: any;
  tiktok_comment_id: string;
  tiktok_username: string;
  tiktok_unique_id: string;
  display_name: string;
  avatar_url: string;
  text: string;
  raw_text: string;
  intent: string;
  has_number: boolean;
  can_create_order: boolean;
  is_order_created: boolean;
  order_id: any;
  created_at: string;
  inserted_at: string;
  external_comment_id: string;
  comment_text: string;
  priority_level: string;
  final_score: number;
  updated_at: string;
  liveSessionId: string;
  dbLiveSessionId: string;
  collectorSessionId: string;
  liveUsername: string;
  rawSsePayload: RawSsePayload;
};

export interface RawSsePayload {
  eventId: string;
  eventType: string;
  source: string;
  shopId: string;
  liveSessionId: string;
  live_session_id: string;
  externalSessionId: string;
  collectorSessionId: string;
  liveUsername: string;
  comment: Comment;
  createdAt: string;
}

export type OrderProduct = {
  id: string;
  code: string;
  name: string | null;
  price: number; // đơn vị: nghìn đồng. VD: 20 = 20.000đ
  quantity: number;
  variantName?: string;
  color?: string;
  size?: string;
  totalAmount?: number;
  rawCommentText?: string;
};

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "packed"
  | "shipping"
  | "completed"
  | "canceled"
  | "returned";

export type DepositStatus = "unpaid" | "paid" | "deposited" | "refunded";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";
export type ShippingStatus =
  | "not_shipped"
  | "waiting_pickup"
  | "shipping"
  | "delivered"
  | "failed"
  | "returned"
  | "submitted"
  | "pending_pickup"
  | "in_transit"
  | "delivering"
  | "on_hold"
  | "pickup_failed"
  | "damaged"
  | "lost"
  | "returning"
  | "return_failed"
  | "cancelled";

export type OrderAddressData = {
  id: string;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  label?: string | null;
  isDefault?: boolean | null;
};

export type Order = {
  id: string;
  orderCode: string;
  source?: string;
  username: string;
  customerId?: string | null;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerAddressId?: string | null;
  customerAddressData?: OrderAddressData | null;
  customerTikTokUsername?: string;
  customerTikTokName?: string;
  customerType?: string | null;
  uniqueId?: string;
  avatar?: string;
  avatarUrl?: string;
  comment: string;
  commentId: string;
  productName: string;
  quantity: number;
  latestComment?: string;
  size: string;
  color: string;
  price: number; // đơn vị: nghìn đồng
  products: OrderProduct[];
  status: OrderStatus;
  depositStatus: DepositStatus;
  paymentStatus?: PaymentStatus;
  shippingStatus?: ShippingStatus;
  trackingCode?: string | null;
  trackingLink?: string | null;
  providerName?: string | null;
  subtotalAmount?: number;
  shippingFee?: number;
  discountAmount?: number;
  depositAmount?: number;
  totalAmount?: number;
  codAmount?: number;
  note?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CustomerSummary = {
  username: string;
  avatar?: string;
  totalComments: number;
  totalOrders: number;
  latestComment: string;
  customerType?: string | null;
};

export type OrderWithTikTok = Order;

export type SocketMessage = {
  type?: string;
  payload?: any;
  data?: any;
};

export type AuthUser = {
  id: string;
  email?: string | null;
  username?: string | null;
  fullName?: string | null;
  phone?: string | null;
  shopId?: string | null;
  shopName?: string | null;
  tiktokUsername?: string | null;
  tiktokChannels?: ShopTikTokChannel[];
  role?: string | null;
  canUseApp?: boolean;
  hasOrders?: boolean;
  hasHistory?: boolean;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
};

export type LiveTab = "live" | "orders";
export type TopTab = "tiktok" | "facebook";
export type BottomTab =
  | "home"
  | "customers"
  | "shipping"
  | "reports"
  | "history"
  | "settings";
export type OrderFilter = "all" | "unpaid" | "paid" | "draft" | "confirmed";

export type SaveLiveStartedPayload = {
  sessionId: string;
  username: string;
  startedAt: string;
};

export type SaveLiveEndedPayload = {
  sessionId: string;
  username: string;
  startedAt?: string | null;
  endedAt: string;
  durationSeconds?: number;
  commentCount?: number;
  reason?: string;
};
