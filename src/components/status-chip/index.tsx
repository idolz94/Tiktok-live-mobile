import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Text, View } from "react-native";

type OrderStatus =
  | "draft"
  | "confirmed"
  | "deposited"
  | "unpaid"
  | "ready_to_ship"
  | "completed"
  | "cancelled";

type ShipmentStatus =
  | "manual"
  | "checking_fee"
  | "ready"
  | "creating"
  | "outcome_unknown"
  | "created"
  | "awaiting_pickup"
  | "in_transit"
  | "delivered"
  | "delivery_failed"
  | "returning"
  | "returned"
  | "cancelled";

type CustomerType =
  | "new"
  | "returning"
  | "high_intent"
  | "incomplete_info"
  | "has_active_order";

type LiveStatus =
  | "live_active"
  | "live_ended"
  | "realtime_connected"
  | "realtime_disconnected"
  | "realtime_reconnecting";

type StatusVariant = "success" | "warning" | "error" | "info" | "neutral" | "live";

type ChipMeta = { label: string; variant: StatusVariant };

const ORDER_MAP: Record<OrderStatus, ChipMeta> = {
  draft:         { label: "Nháp",             variant: "neutral" },
  confirmed:     { label: "Đã xác nhận",      variant: "info" },
  deposited:     { label: "Đã cọc",           variant: "warning" },
  unpaid:        { label: "Chưa thanh toán",  variant: "error" },
  ready_to_ship: { label: "Sẵn sàng ship",    variant: "success" },
  completed:     { label: "Hoàn thành",       variant: "success" },
  cancelled:     { label: "Đã huỷ",           variant: "error" },
};

const SHIPMENT_MAP: Record<ShipmentStatus, ChipMeta> = {
  manual:          { label: "Tự tạo",           variant: "neutral" },
  checking_fee:    { label: "Kiểm tra phí",      variant: "neutral" },
  ready:           { label: "Sẵn sàng tạo",      variant: "info" },
  creating:        { label: "Đang tạo",           variant: "warning" },
  outcome_unknown: { label: "Chờ xác nhận",       variant: "warning" },
  created:         { label: "Đã tạo",             variant: "info" },
  awaiting_pickup: { label: "Chờ lấy hàng",       variant: "warning" },
  in_transit:      { label: "Đang vận chuyển",    variant: "info" },
  delivered:       { label: "Đã giao",            variant: "success" },
  delivery_failed: { label: "Giao thất bại",      variant: "error" },
  returning:       { label: "Đang hoàn hàng",     variant: "warning" },
  returned:        { label: "Đã hoàn",            variant: "neutral" },
  cancelled:       { label: "Đã huỷ",             variant: "error" },
};

const CUSTOMER_MAP: Record<CustomerType, ChipMeta> = {
  new:             { label: "Khách mới",          variant: "info" },
  returning:       { label: "Khách cũ",           variant: "neutral" },
  high_intent:     { label: "Tiềm năng cao",      variant: "success" },
  incomplete_info: { label: "Thiếu thông tin",    variant: "warning" },
  has_active_order:{ label: "Có đơn đang xử lý", variant: "warning" },
};

const LIVE_MAP: Record<LiveStatus, ChipMeta> = {
  live_active:           { label: "LIVE",               variant: "live" },
  live_ended:            { label: "Đã kết thúc",         variant: "neutral" },
  realtime_connected:    { label: "Kết nối ổn định",     variant: "success" },
  realtime_disconnected: { label: "Mất kết nối",         variant: "error" },
  realtime_reconnecting: { label: "Đang kết nối lại",    variant: "warning" },
};

type Props =
  | { domain: "order";    status: OrderStatus }
  | { domain: "shipment"; status: ShipmentStatus }
  | { domain: "customer"; status: CustomerType }
  | { domain: "live";     status: LiveStatus };

export function StatusChip({ domain, status }: Props) {
  const { colors } = useThemes();

  let meta: ChipMeta | undefined;

  if (domain === "order")    meta = ORDER_MAP[status as OrderStatus];
  if (domain === "shipment") meta = SHIPMENT_MAP[status as ShipmentStatus];
  if (domain === "customer") meta = CUSTOMER_MAP[status as CustomerType];
  if (domain === "live")     meta = LIVE_MAP[status as LiveStatus];

  const { label, variant } = meta ?? { label: status, variant: "neutral" as StatusVariant };

  const variantColors: Record<StatusVariant, [string, string]> = {
    success: [colors.success,  colors.successLight],
    warning: [colors.warning,  colors.warningLight],
    error:   [colors.error,    colors.errorLight],
    info:    [colors.info,     colors.infoLight],
    neutral: [colors.neutral400, colors.neutral50],
    // ponytail: no orange token yet; add when live color needed outside StatusChip
    live:    ["#F97316", "#FFEDD5"],
  };

  const [textColor, bgColor] = variantColors[variant];

  return (
    <View
      style={[styles.chip, { backgroundColor: bgColor }]}
      accessible
      accessibilityLabel={`Trạng thái: ${label}`}
      accessibilityRole="text"
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = createStyles(({ textPresets }) => ({
  chip: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  label: {
    ...textPresets.fs12_500,
  },
}));
