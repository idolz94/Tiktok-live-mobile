export type ID = string;
export type ISODateString = string;

export type OrderStatus =
  | 'draft'
  | 'confirmed'
  | 'packed'
  | 'shipping'
  | 'completed'
  | 'canceled'
  | 'returned';

export type DepositStatus = 'unpaid' | 'paid' | 'deposited' | 'refunded';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export type ShippingStatus =
  | 'not_shipped'
  | 'waiting_pickup'
  | 'shipping'
  | 'delivered'
  | 'failed'
  | 'returned';

export type LiveSessionStatus = 'running' | 'ended' | 'error';

export type LiveEndReason =
  | 'manual_stop'
  | 'manual_disconnect'
  | 'change_username'
  | 'live_disconnected'
  | 'live_error'
  | 'component_unmount'
  | 'socket_close';

export type CommentIntent = 'buying' | 'question' | 'spam' | 'unknown';

export type MemberRole = 'owner' | 'admin' | 'staff' | 'viewer';

export type LicenseStatus = 'trial' | 'active' | 'expired' | 'canceled'


export type Profile = {
  id: ID;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: 'active' | 'blocked';
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type Shop = {
  id: ID;
  owner_id: ID;
  name: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  default_tiktok_username: string | null;
  status: 'active' | 'inactive' | 'blocked';
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type ShopTikTokChannel = {
  id: ID;
  shopId: ID;
  tiktokUsername: string;
  isDefault: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type ShopMember = {
  id: ID;
  shop_id: ID;
  user_id: ID;
  role: MemberRole;
  status: 'active' | 'pending' | 'removed';
  invited_by: ID | null;
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type LicensePlan = {
  id: ID;
  code: 'free' | 'basic' | 'pro' | 'business';
  name: string;
  description: string | null;
  price_monthly: number | null;
  price_3_months: number | null;
  price_6_months: number | null;
  price_yearly: number | null;
  max_orders_per_month: number | null;
  max_live_sessions_per_month: number | null;
  max_members: number | null;
  max_tiktok_accounts: number | null;
  can_print: boolean;
  can_export_excel: boolean;
  can_use_reports: boolean;
  can_use_shipping: boolean;
  status: 'active' | 'inactive';
  sort_order: number | null;
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type ShopLicense = {
  id: ID;
  shop_id: ID;
  plan_code: 'free' | 'basic' | 'pro' | 'business';
  status: LicenseStatus;
  started_at: ISODateString;
  expired_at: ISODateString | null;
  trial_ends_at: ISODateString | null;
  is_current: boolean;
  max_orders_per_month: number | null;
  max_live_sessions_per_month: number | null;
  max_members: number | null;
  max_tiktok_accounts: number | null;
  price: number | null;
  currency: string;
  payment_status: 'unpaid' | 'paid' | 'failed' | 'refunded';
  last_payment_at: ISODateString | null;
  note: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type UsageLog = {
  id: ID;
  shop_id: ID;
  license_id: ID | null;
  month: string;
  order_count: number;
  live_session_count: number;
  comment_count: number;
  print_count: number;
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type Customer = {
  id: ID;
  shop_id: ID;
  tiktok_username: string | null;
  tiktok_unique_id: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  note: string | null;
  tags: string[] | null;
  total_orders: number;
  total_spent: number;
  last_order_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type LiveSession = {
  id: ID;
  shop_id: ID;
  tiktok_username: string;
  started_at: ISODateString;
  ended_at: ISODateString | null;
  duration_seconds: number;
  comment_count: number;
  order_count: number;
  customer_count: number;
  status: LiveSessionStatus;
  end_reason: LiveEndReason | null;
  created_by: ID | null;
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type LiveCommentRecord = {
  id: ID;
  shop_id: ID;
  live_session_id: ID | null;
  customer_id: ID | null;
  tiktok_comment_id: string | null;
  tiktok_username: string | null;
  tiktok_unique_id: string | null;
  display_name: string | null;
  avatar_url: string | null;
  text: string;
  raw_text: string | null;
  intent: CommentIntent;
  has_number: boolean;
  can_create_order: boolean;
  is_order_created: boolean;
  order_id: ID | null;
  created_at: ISODateString;
  inserted_at: ISODateString;
};


export type Order = {
  id: ID;
  shop_id: ID;
  customer_id: ID | null;
  live_session_id: ID | null;
  live_comment_id: ID | null;
  customer_tiktok_username: string | null;
  order_code: string;
  source: 'live_comment' | 'manual' | 'import';
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  comment_text: string | null;
  status: OrderStatus;
  deposit_status: DepositStatus;
  payment_status: PaymentStatus;
  shipping_status: ShippingStatus;
  subtotal_amount: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  deposit_amount: number;
  cod_amount: number;
  note: string | null;
  created_by: ID | null;
  confirmed_at: ISODateString | null;
  canceled_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type OrderItem = {
  id: ID;
  order_id: ID;
  shop_id: ID;
  product_code: string | null;
  product_name: string;
  variant_name: string | null;
  color: string | null;
  size: string | null;
  quantity: number;
  price: number;
  total_amount: number;
  raw_comment_text: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type Product = {
  id: ID;
  shop_id: ID;
  product_code: string;
  name: string;
  default_price: number;
  description: string | null;
  image_url: string | null;
  status: 'active' | 'inactive';
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type ProductVariant = {
  id: ID;
  product_id: ID;
  shop_id: ID;
  sku: string | null;
  color: string | null;
  size: string | null;
  price: number | null;
  stock_quantity: number | null;
  status: 'active' | 'inactive';
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type PrinterSetting = {
  id: ID;
  shop_id: ID;
  printer_name: string | null;
  printer_type: 'browser' | 'lan' | 'bluetooth' | 'usb';
  printer_ip: string | null;
  printer_port: number | null;
  paper_size: '58mm' | '80mm' | 'a5';
  font_size: number | null;
  auto_print: boolean;
  is_default: boolean;
  status: 'active' | 'inactive';
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type BillTemplate = {
  id: ID;
  shop_id: ID;
  name: string;
  paper_size: '58mm' | '80mm' | 'a5';
  header_text: string | null;
  footer_text: string | null;
  show_customer_phone: boolean;
  show_customer_address: boolean;
  show_comment_text: boolean;
  is_default: boolean;
  status: 'active' | 'inactive';
  created_at: ISODateString;
  updated_at: ISODateString;
};