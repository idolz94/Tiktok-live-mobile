import type { Order, OrderProduct } from "@app-types/index";
import { Avatar } from "@components/avatar";
import { Button } from "@components/button";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { Popover } from "@components/popover";
import { Skeleton } from "@components/skeleton";
import { images } from "@assets/images";
import { Ionicons } from "@expo/vector-icons";
import { getCustomerTypeIcon } from "@features/customers/customer-type-icon";
import {
  createCustomerAddressApi,
  updateCustomerAddressApi,
  type CustomerAddress,
} from "@features/orders/service/create-shipment-api";
import { useAddressPageStore } from "@features/orders/stores/address-page-store";
import type { AddrFormValues } from "@features/orders/types/shipment";
import { getOrderStatusLabel } from "@features/customers/components/order-status-label";
import {
  formatMoneyCompact,
  getOrderTotal,
  statusLabel,
} from "@features/orders/utils/order";
import {
  addressLine,
  formInitialValues,
} from "@features/orders/utils/shipment";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { openTikTokProfile } from "@utils/tiktok";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  useCustomerDetail,
  type DetailTab,
  type OrderStatFilter,
} from "./use-customer-detail";

type StatCardProps = {
  label: string;
  value: number;
  tone: "success" | "info" | "danger" | "muted";
  filterKey: OrderStatFilter;
  active: boolean;
  onPress: (key: OrderStatFilter) => void;
};

type FieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: import("react-native").TextInputProps["keyboardType"];
  onChangeText: (value: string) => void;
  onBlur?: () => void;
};

const TABS: { key: DetailTab; label: string }[] = [
  { key: "info", label: "Thông tin" },
  { key: "orders", label: "Đơn hàng" },
  { key: "analytics", label: "Phân tích" },
];

function formatAnalyticsDate(raw: string | null | undefined) {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

function getOrderProducts(order: Order) {
  return Array.isArray(order.products) ? order.products : [];
}

type ActionTone = "TikTok" | "Zalo" | "Phone";

function ActionPill({
  label,
  onPress,
  icon,
  tone,
}: {
  label: string;
  onPress: () => void;
  icon: React.ReactNode;
  tone: ActionTone;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.actionPill, styles[`btn${tone}`]]}>
      {icon}
      <Text style={[styles.actionPillText, styles[`btn${tone}Text`]]}>{label}</Text>
    </Pressable>
  );
}

const CUSTOMER_TYPES = ["Lẻ", "Sỉ", "VIP", "Chốt Dạo", "Bomb"];

function SelectField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const { colors, textPresets } = useThemes();
  const [popoverVisible, setPopoverVisible] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Popover
        visible={popoverVisible}
        onVisibleChange={setPopoverVisible}
        trigger={
          <Pressable
            onPress={() => setPopoverVisible(true)}
            style={styles.selectInput}
          >
            <Text
              style={[
                textPresets.fs14_400,
                {
                  color: value ? colors.neutral900 : colors.neutral300,
                  flex: 1,
                },
              ]}
            >
              {value || "Chọn loại khách hàng"}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.neutral400} />
          </Pressable>
        }
        placement="bottom"
        showArrow={false}
        showBackdrop={false}
        closeOnOutsidePress={true}
      >
        <View style={{ width: 200, padding: 4 }}>
          {CUSTOMER_TYPES.map((opt) => {
            const selected = value === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => {
                  onChange(opt);
                  setPopoverVisible(false);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 6,
                  backgroundColor: selected
                    ? colors.primaryLight
                    : "transparent",
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  {(() => {
                    const icon = getCustomerTypeIcon(opt);
                    return icon ? (
                      <Image source={icon} style={{ width: 20, height: 20 }} />
                    ) : null;
                  })()}
                  <Text
                    style={[
                      textPresets.fs14_400,
                      { color: selected ? colors.primary : colors.neutral900 },
                    ]}
                  >
                    {opt}
                  </Text>
                </View>
                {selected && (
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>
      </Popover>
      {!!hint && <Text style={styles.fieldHint}>{hint}</Text>}
    </View>
  );
}

function Field({
  label,
  value,
  placeholder,
  multiline,
  keyboardType,
  onChangeText,
  onBlur,
}: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        multiline={multiline}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        onBlur={onBlur}
        style={[styles.input, multiline && styles.inputMultiline]}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

function StatCard({
  label,
  value,
  tone,
  filterKey,
  active,
  onPress,
}: StatCardProps) {
  const toneStyle = {
    success: styles.statCard_success,
    info: styles.statCard_info,
    danger: styles.statCard_danger,
    muted: styles.statCard_muted,
  }[tone];

  return (
    <Pressable
      style={[styles.statCard, toneStyle, active && styles.statCard_active]}
      onPress={() => onPress(filterKey)}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

function OrderStatusBadge({ order }: { order: Order }) {
  const deposited =
    order.depositStatus === "paid" || order.depositStatus === "deposited";

  return (
    <View style={styles.badgeRow}>
      <View
        style={[
          styles.badge,
          deposited ? styles.badgeSuccess : styles.badgeWarning,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            deposited ? styles.badgeTextSuccess : styles.badgeTextWarning,
          ]}
        >
          {deposited ? "Đã cọc" : "Chưa cọc"}
        </Text>
      </View>
      <View style={styles.badgeMuted}>
        <Text style={styles.badgeTextMuted}>{statusLabel(order.status)}</Text>
      </View>
    </View>
  );
}

function ProductRow({ product }: { product: OrderProduct }) {
  const total = Number(product.totalAmount ?? product.price * product.quantity);

  return (
    <View style={styles.productRow}>
      <View style={styles.productInfo}>
        <Text numberOfLines={1} style={styles.productName}>
          {product.name || product.code || "Sản phẩm"}
        </Text>
        <Text style={styles.productMeta}>
          {[product.color, product.size].filter(Boolean).join(" • ") ||
            "Phân loại mặc định"}
        </Text>
      </View>
      <View style={styles.productPriceBox}>
        <Text style={styles.productQuantity}>x{product.quantity}</Text>
        <Text style={styles.productPrice}>{formatMoneyCompact(total)}</Text>
      </View>
    </View>
  );
}

function getProviderAbbr(name?: string | null) {
  if (!name) return "VC";
  const upper = name.toUpperCase();
  if (upper.includes("GIAO HANG NHANH") || upper.includes("GHN")) return "GHN";
  if (upper.includes("GIAO HANG TIET KIEM") || upper.includes("GHTK"))
    return "GHTK";
  if (upper.includes("VIETTEL") || upper.includes("VTP")) return "VTP";
  if (upper.includes("SHOPEE") || upper.includes("SPX")) return "SPX";
  return upper.slice(0, 4);
}

function TrackingRow({
  order,
  cancelling,
  onCancelShipment,
}: {
  order: Order;
  cancelling: boolean;
  onCancelShipment: () => Promise<void>;
}) {
  if (!order.trackingCode) return null;
  const abbr = getProviderAbbr(order.providerName);
  const providerName = order.providerName || `${abbr} express`;

  const SHIPPING_STATUS_LABEL: Partial<Record<string, string>> = {
    not_shipped: "Chưa giao",
    submitted: "Đã gửi",
    pending_pickup: "Chờ lấy hàng",
    waiting_pickup: "Chờ lấy hàng",
    in_transit: "Đang vận chuyển",
    shipping: "Đang giao",
    delivering: "Đang giao",
    delivered: "Đã giao hàng",
    on_hold: "Tạm giữ",
    pickup_failed: "Lấy hàng thất bại",
    failed: "Giao thất bại",
    damaged: "Hàng hỏng",
    lost: "Mất hàng",
    returning: "Đang hoàn",
    return_failed: "Hoàn thất bại",
    returned: "Đã hoàn",
    cancelled: "Đã hủy",
  };
  const shippingStatusLabel =
    SHIPPING_STATUS_LABEL[order.shippingStatus ?? ""] ?? "Chờ lấy hàng";
  const canCancel =
    order.shippingStatus !== "cancelled" &&
    order.shippingStatus !== "returned" &&
    order.shippingStatus !== "delivered";

  return (
    <View style={styles.trackingCard}>
      <View style={styles.trackingHeader}>
        <Text style={styles.trackingLabel}>Mã {abbr}</Text>
        <Text style={styles.trackingCode}>{order.trackingCode}</Text>
      </View>

      <View style={styles.trackingBody}>
        <View style={styles.providerBadge}>
          <Text style={styles.providerBadgeText}>{abbr}</Text>
        </View>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{providerName}</Text>
          <Text style={styles.providerStatus}>{shippingStatusLabel}</Text>
        </View>
        <Text style={styles.followText}>Theo dõi ›</Text>
      </View>

      <View style={styles.trackingFooter}>
        <Text style={styles.trackingTime}>
          {order.createdAt
            ? new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "--:--"}
        </Text>
        <Text style={styles.trackingOrderCode}>
          {order.orderCode || order.id}
        </Text>
      </View>

      <View style={styles.shipmentActions}>
        <Pressable style={styles.printShipmentButton}>
          <Ionicons name="print-outline" size={17} color="#111827" />
          <Text style={styles.printShipmentText}>In Đơn</Text>
        </Pressable>
        {canCancel && (
          <Pressable
            disabled={cancelling}
            style={styles.cancelShipmentButton}
            onPress={() =>
              Alert.alert("Huỷ vận đơn", `Huỷ vận đơn ${order.trackingCode}?`, [
                { text: "Không" },
                {
                  text: "Huỷ vận đơn",
                  style: "destructive",
                  onPress: () => {
                    void onCancelShipment()
                      .then(() => Alert.alert("Thành công", "Đã huỷ vận đơn."))
                      .catch((err: unknown) => {
                        Alert.alert(
                          "Không huỷ được vận đơn",
                          err instanceof Error
                            ? err.message
                            : "Vui lòng thử lại.",
                        );
                      });
                  },
                },
              ])
            }
          >
            {cancelling ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Ionicons name="close-circle-outline" size={17} color="#EF4444" />
            )}
            <Text style={styles.cancelShipmentText}>
              {cancelling ? "Đang huỷ..." : "Huỷ Vận Đơn"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function OrderCard({
  order,
  cancelling,
  onCancelShipment,
  onViewDetail,
}: {
  order: Order;
  cancelling: boolean;
  onCancelShipment: (order: Order) => Promise<void>;
  onViewDetail: () => void;
}) {
  const products = getOrderProducts(order);
  const total = Number(order.totalAmount ?? getOrderTotal(products));
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderTitleBox}>
          <Text style={styles.orderCode}>{order.orderCode || order.id}</Text>
          {/* <Text style={styles.orderComment} numberOfLines={1}>
            {order.comment || "Đơn hàng từ live"}
          </Text> */}
        </View>
        <OrderStatusBadge order={order} />
      </View>

      <TrackingRow
        order={order}
        cancelling={cancelling}
        onCancelShipment={() => onCancelShipment(order)}
      />

      <View style={styles.productList}>
        {products.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </View>

      <View style={styles.orderTotalRow}>
        <Text style={styles.orderTotalLabel}>Tổng đơn hàng</Text>
        <Text style={styles.orderTotalValue}>{formatMoneyCompact(total)}</Text>
      </View>

      <View style={styles.orderActions}>
        <Pressable style={styles.detailButton} onPress={onViewDetail}>
          <Text style={styles.detailButtonText}>Xem chi tiết</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  headerName: {
    color: colors.neutral900,
    ...textPresets.fs16_600,
  },
  headerTikTokLine: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTikTokText: {
    flex: 1,
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
    marginHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border10,
  },
  actionPill: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  btnTikTok: { backgroundColor: "rgba(0,0,0,0.08)" },
  btnZalo: { backgroundColor: "rgba(0,106,255,0.1)" },
  btnPhone: { backgroundColor: "rgba(82,196,26,0.1)" },
  actionIcon: {
    width: 16,
    height: 16,
  },
  actionPillText: {
    ...textPresets.fs12_500,
  },
  btnTikTokText: {
    color: "#000000",
  },
  btnZaloText: {
    color: "#006aff",
  },
  btnPhoneText: {
    color: "#52c41a",
  },
  tabBar: {
    height: 48,
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.neutral300,
    fontSize: 15,
    fontWeight: "600",
  },
  tabTextActive: {
    color: colors.primary,
  },
  infoContent: {
    paddingTop: 18,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    marginBottom: 8,
    color: colors.neutral400,
    fontSize: 14,
    fontWeight: "600",
  },
  fieldHint: {
    marginTop: 4,
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
  fieldError: {
    marginTop: 4,
    color: colors.error,
    fontSize: 12,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border10,
    borderRadius: 8,
    paddingHorizontal: 16,
    color: colors.neutral900,
    backgroundColor: colors.white,
    ...textPresets.fs14_400,
  },
  inputMultiline: {
    minHeight: 88,
    paddingTop: 14,
    paddingBottom: 14,
  },
  selectInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border10,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
  },
  ordersContent: {
    paddingTop: 16,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "48.5%",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  statCard_success: {
    backgroundColor: colors.successLight,
  },
  statCard_info: {
    backgroundColor: colors.infoLight,
  },
  statCard_danger: {
    backgroundColor: colors.primaryLight,
  },
  statCard_muted: {
    backgroundColor: colors.neutral50,
  },
  statCard_active: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  statValue: {
    color: colors.neutral900,
    ...textPresets.fs20_900,
  },
  statLabel: {
    marginTop: 4,
    color: colors.neutral400,
    fontSize: 13,
    fontWeight: "500",
  },
  orderToolbar: {
    marginTop: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productCount: {
    color: colors.neutral900,
    ...textPresets.fs16_600,
  },
  dateGroup: {
    marginBottom: 18,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  dateText: {
    color: colors.neutral500,
    fontSize: 14,
    fontWeight: "600",
  },
  orderCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: 14,
    ...shadows.sd1,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  orderTitleBox: {
    flex: 1,
    minWidth: 0,
  },
  orderCode: {
    color: colors.neutral900,
    fontSize: 14,
    fontWeight: "600",
  },
  orderComment: {
    marginTop: 4,
    color: colors.textMuted,
    ...textPresets.fs12_400,
  },
  badgeRow: {
    alignItems: "flex-end",
    gap: 6,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeSuccess: {
    backgroundColor: colors.successLight,
  },
  badgeWarning: {
    backgroundColor: colors.warningLight,
  },
  badgeMuted: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: colors.neutral50,
  },
  badgeText: {
    ...textPresets.fs11_800,
  },
  badgeTextSuccess: {
    color: colors.success,
  },
  badgeTextWarning: {
    color: colors.warning,
  },
  badgeTextMuted: {
    color: colors.neutral400,
    ...textPresets.fs11_800,
  },
  productList: {
    marginTop: 12,
    gap: 10,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  productInfo: {
    flex: 1,
    minWidth: 0,
  },
  productName: {
    color: colors.neutral500,
    fontSize: 13,
    fontWeight: "600",
  },
  productMeta: {
    marginTop: 3,
    color: colors.textMuted,
    ...textPresets.fs12_400,
  },
  productPriceBox: {
    alignItems: "flex-end",
  },
  productQuantity: {
    color: colors.textMuted,
    ...textPresets.fs12_400,
  },
  productPrice: {
    marginTop: 3,
    color: colors.neutral900,
    fontSize: 13,
    fontWeight: "600",
  },
  orderTotalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderTotalLabel: {
    color: colors.neutral400,
    fontSize: 13,
    fontWeight: "500",
  },
  orderTotalValue: {
    color: colors.neutral900,
    ...textPresets.fs15_800,
  },
  orderActions: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  detailButton: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  detailButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyOrders: {
    alignItems: "center",
    paddingVertical: 42,
  },
  stateBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  stateTitle: {
    color: colors.neutral900,
    textAlign: "center",
    ...textPresets.fs16_600,
  },
  stateText: {
    marginTop: 8,
    color: colors.textMuted,
    textAlign: "center",
    ...textPresets.fs14_400,
  },
  saveButton: {
    height: 56,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  trackingCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 14,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  trackingHeader: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  trackingLabel: {
    color: colors.neutral400,
    fontSize: 14,
    fontWeight: "500",
  },
  trackingCode: {
    flexShrink: 1,
    color: colors.neutral900,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },
  trackingBody: {
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.neutral50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  providerBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF321D",
  },
  providerBadgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  providerName: {
    color: colors.neutral900,
    fontSize: 16,
    fontWeight: "700",
  },
  providerStatus: {
    marginTop: 3,
    color: "#F59E0B",
    fontSize: 14,
    fontWeight: "500",
  },
  followText: {
    marginLeft: 10,
    color: colors.neutral900,
    fontSize: 14,
    fontWeight: "700",
  },
  trackingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  trackingTime: {
    color: colors.neutral400,
    fontSize: 13,
    fontWeight: "500",
  },
  trackingOrderCode: {
    color: colors.neutral900,
    fontSize: 13,
    fontWeight: "600",
  },
  shipmentActions: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: "row",
  },
  printShipmentButton: {
    flex: 1,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  printShipmentText: {
    color: colors.neutral900,
    fontSize: 13,
    fontWeight: "700",
  },
  cancelShipmentButton: {
    flex: 1,
    height: 42,
    borderLeftWidth: 1,
    borderLeftColor: colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  cancelShipmentText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
  },
  addressCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  addressTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addressAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  addressInfo: {
    flex: 1,
    gap: 3,
  },
  addressNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  addressName: {
    flexShrink: 1,
  },
  addressDefaultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addressChangePill: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addressLineText: {
    lineHeight: 20,
  },

  analyticsContent: {
    paddingTop: 16,
    gap: 12,
  },
  analyticsCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 2,
  },
  analyticsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
    gap: 12,
  },
  analyticsLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  analyticsValue: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },
  analyticsSectionTitle: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "700",
  },
  addAddressCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  revenueBarsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 6,
    paddingTop: 4,
  },
  revenueBarCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  revenueBarTrack: {
    width: "100%",
    height: 72,
    borderRadius: 8,
    backgroundColor: "#F2F4F7",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  revenueBarFill: {
    width: "100%",
    borderRadius: 8,
    minHeight: 4,
  },
  revenueBarLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  revenueBarValue: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
}));

type Props = { customerKey: string; initialTab?: DetailTab };

export function CustomerDetailSheet({ customerKey, initialTab }: Props) {
  const { colors, textPresets, shadows } = useThemes();
  const { hide } = useBottomSheet();
  const { setPicker, setForm } = useAddressPageStore();
  const {
    activeTab,
    setActiveTab,
    customerType,
    setCustomerType,
    phone,
    setPhone,
    phoneError,
    referenceInfo,
    setReferenceInfo,
    customerAddresses,
    selectedAddress,
    setSelectedAddress,
    addressesLoading,
    reloadCustomerAddresses,
    isSaving,
    displayName,
    avatar,
    tiktokUsername,
    customer,
    customerOrders,
    groupedOrders,
    productCount,
    confirmedCount,
    depositedCount,
    unpaidCount,
    draftCount,
    statFilter,
    setStatFilter,
    loading,
    notFound,
    analytics,
    analyticsLoading,
    handleSave,
    handleCancelShipment,
    cancellingId,
  } = useCustomerDetail(customerKey, initialTab);

  const onPressStatCard = (key: OrderStatFilter) =>
    setStatFilter((current) => (current === key ? "all" : key));

  // ponytail: client-computed revenue by month (last 6) from existing orders — no backend field needed
  const revenueByMonth = useMemo(() => {
    const now = new Date();
    const buckets: { label: string; key: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.push({ label: `T${d.getMonth() + 1}`, key, total: 0 });
    }
    const map = new Map(buckets.map((b) => [b.key, b]));
    for (const o of customerOrders as any[]) {
      const raw = o?.createdAt ?? o?.created_at;
      const d = raw ? new Date(raw) : null;
      if (!d || isNaN(d.getTime())) continue;
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const b = map.get(k);
      if (!b) continue;
      const amt = Number(o?.totalAmount ?? o?.total_amount ?? o?.codAmount ?? 0) || 0;
      b.total += amt;
    }
    return buckets;
  }, [customerOrders]);

  const openAddressForm = (addr?: CustomerAddress) => {
    const cid = customer?.customerId;
    if (!cid) return;
    setForm({
      title: addr ? "Sửa địa chỉ" : "Thêm địa chỉ",
      initialValues: addr
        ? formInitialValues(addr)
        : phone
          ? { phone }
          : undefined,
      onSave: async (vals: AddrFormValues) => {
        if (addr) await updateCustomerAddressApi(cid, addr.id, vals);
        else await createCustomerAddressApi(cid, vals);
        await reloadCustomerAddresses(cid);
      },
    });
    router.push("/order-detail/create-shipment/address-form");
    requestAnimationFrame(() => hide());
  };

  const openAddressPicker = () => {
    setPicker({
      title: "Địa chỉ nhận hàng",
      addresses: customerAddresses,
      selectedId: selectedAddress?.id,
      loading: addressesLoading,
      onSelect: (addr) => setSelectedAddress(addr as CustomerAddress),
      onAddPress: () => {
        router.back();
        setTimeout(() => openAddressForm(), 100);
      },
      onEditPress: (addr) => {
        router.back();
        setTimeout(() => openAddressForm(addr as CustomerAddress), 100);
      },
    });
    router.push("/order-detail/create-shipment/address-picker");
    requestAnimationFrame(() => hide());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar uri={avatar} username={displayName} size={40} />
        <View style={styles.headerInfo}>
          <Text numberOfLines={1} style={styles.headerName}>
            {displayName}
          </Text>
          {!!tiktokUsername && (
            <View style={styles.headerTikTokLine}>
              <Text numberOfLines={1} style={styles.headerTikTokText}>
                {tiktokUsername}
              </Text>
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <>
          <View style={styles.actionsRow}>
            <Skeleton height={40} style={{ flex: 1 }} borderRadius={999} />
            <Skeleton height={40} style={{ flex: 1 }} borderRadius={999} />
            <Skeleton height={40} style={{ flex: 1 }} borderRadius={999} />
          </View>
          <View style={[styles.tabBar, { gap: 0 }]}>
            <Skeleton height={4} style={{ flex: 1 }} borderRadius={0} />
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.infoContent, { gap: 16 }]}>
              {/* label + select input */}
              <View style={styles.fieldGroup}>
                <Skeleton
                  height={14}
                  width="40%"
                  borderRadius={4}
                  style={{ marginBottom: 8 }}
                />
                <Skeleton height={48} borderRadius={8} />
              </View>
              {/* label + phone input */}
              <View style={styles.fieldGroup}>
                <Skeleton
                  height={14}
                  width="35%"
                  borderRadius={4}
                  style={{ marginBottom: 8 }}
                />
                <Skeleton height={48} borderRadius={8} />
              </View>
              {/* label + multiline textarea */}
              <View style={styles.fieldGroup}>
                <Skeleton
                  height={14}
                  width="50%"
                  borderRadius={4}
                  style={{ marginBottom: 8 }}
                />
                <Skeleton height={88} borderRadius={8} />
              </View>
              {/* label + address picker */}
              <View style={styles.fieldGroup}>
                <Skeleton
                  height={14}
                  width="45%"
                  borderRadius={4}
                  style={{ marginBottom: 8 }}
                />
                <Skeleton height={48} borderRadius={8} />
              </View>
              {/* save button */}
              <Skeleton
                height={56}
                borderRadius={40}
                style={{ marginTop: 16 }}
              />
            </View>
          </ScrollView>
        </>
      ) : notFound ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Không tìm thấy khách hàng</Text>
          <Text style={styles.stateText}>
            Khách hàng này chưa có dữ liệu trong phiên hiện tại.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.actionsRow}>
            <ActionPill
              label="Tiktok"
              tone="TikTok"
              onPress={() => openTikTokProfile(tiktokUsername)}
              icon={<Image source={images.logo_tiktok} style={styles.actionIcon} />}
            />
            <ActionPill
              label="Zalo"
              tone="Zalo"
              onPress={() => {
                if (phone)
                  Linking.openURL(
                    `zalo://chat?phone=${phone.replace(/^0/, "84")}`,
                  );
              }}
              icon={<Image source={images.logo_zalo} style={styles.actionIcon} />}
            />
            <ActionPill
              label="Điện thoại"
              tone="Phone"
              onPress={() => {
                if (phone) Linking.openURL(`tel:${phone}`);
              }}
              icon={<Image source={images.logo_phone} style={styles.actionIcon} />}
            />
          </View>

          <View style={styles.tabBar}>
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[styles.tabItem, active && styles.tabItemActive]}
                >
                  <Text
                    style={[styles.tabText, active && styles.tabTextActive]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {activeTab === "info" ? (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.infoContent}>
                <SelectField
                  label="Loại khách hàng"
                  value={customerType}
                  onChange={setCustomerType}
                  hint="Tỉ lệ đánh giá tốt từ các shop: 2/2"
                />
                <Field
                  label="Số điện thoại"
                  value={phone}
                  placeholder="Nhập số điện thoại"
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                {!!phoneError && (
                  <Text style={styles.fieldError}>{phoneError}</Text>
                )}
                <Field
                  label="Thông tin tham khảo"
                  value={referenceInfo}
                  placeholder="Nhập thông tin"
                  multiline
                  onChangeText={setReferenceInfo}
                />
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Địa chỉ giao hàng</Text>
                  {selectedAddress ? (
                    <View
                      style={[
                        styles.addressCard,
                        {
                          borderColor: colors.border10,
                          backgroundColor: colors.surface,
                        },
                      ]}
                    >
                      <View style={styles.addressTopRow}>
                        <View
                          style={[
                            styles.addressAvatar,
                            { backgroundColor: colors.primaryLight },
                          ]}
                        >
                          <Text
                            style={[
                              { color: colors.primary },
                              textPresets.fs16_500,
                            ]}
                          >
                            {(
                              selectedAddress.name?.trim()?.charAt(0) || "L"
                            ).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.addressInfo}>
                          <View style={styles.addressNameRow}>
                            <Text
                              style={[
                                styles.addressName,
                                { color: colors.neutral900 },
                                textPresets.fs16_500,
                              ]}
                              numberOfLines={1}
                            >
                              {selectedAddress.name ?? "—"}
                            </Text>
                            {selectedAddress.isDefault && (
                              <View
                                style={[
                                  styles.addressDefaultBadge,
                                  { backgroundColor: colors.primaryLight },
                                ]}
                              >
                                <Text
                                  style={[
                                    { color: colors.primary },
                                    textPresets.fs11_400,
                                  ]}
                                >
                                  Mặc định
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text
                            style={[
                              { color: colors.neutral400 },
                              textPresets.fs12_400,
                            ]}
                          >
                            {selectedAddress.phone ?? "—"}
                          </Text>
                        </View>
                        <Pressable
                          hitSlop={8}
                          style={[
                            styles.addressChangePill,
                            { borderColor: colors.border10 },
                          ]}
                          onPress={openAddressPicker}
                        >
                          <Text
                            style={[
                              { color: colors.primary },
                              textPresets.fs12_500,
                            ]}
                          >
                            Thay đổi
                          </Text>
                        </Pressable>
                      </View>
                      <Text
                        style={[
                          styles.addressLineText,
                          { color: colors.neutral400 },
                          textPresets.fs14_400,
                        ]}
                        numberOfLines={2}
                      >
                        {addressLine(selectedAddress)}
                      </Text>
                    </View>
                  ) : (
                    <Button
                      onPress={openAddressPicker}
                      type="outline-dashed"
                      title="Thêm mới"
                      icon={<Ionicons name="add" size={18} color={"black"} />}
                    />
                  )}
                </View>
                <Button
                  onPress={handleSave}
                  disabled={isSaving || !customer?.customerId}
                  loading={isSaving}
                  type="gradient"
                  title="Lưu"
                  gradientType="gra_primary"
                  containerStyle={styles.saveButton}
                  txtBtnStyle={styles.saveButtonText}
                  loadingColor="white"
                />
              </View>
            </ScrollView>
          ) : activeTab === "orders" ? (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.ordersContent}>
                <View style={styles.statGrid}>
                  <StatCard
                    label="Đã chốt"
                    value={confirmedCount}
                    tone="success"
                    filterKey="confirmed"
                    active={statFilter === "confirmed"}
                    onPress={onPressStatCard}
                  />
                  <StatCard
                    label="Đã cọc"
                    value={depositedCount}
                    tone="info"
                    filterKey="deposited"
                    active={statFilter === "deposited"}
                    onPress={onPressStatCard}
                  />
                  <StatCard
                    label="Chưa cọc"
                    value={unpaidCount}
                    tone="danger"
                    filterKey="unpaid"
                    active={statFilter === "unpaid"}
                    onPress={onPressStatCard}
                  />
                  <StatCard
                    label="Đơn nháp"
                    value={draftCount}
                    tone="muted"
                    filterKey="draft"
                    active={statFilter === "draft"}
                    onPress={onPressStatCard}
                  />
                </View>
                <View style={styles.orderToolbar}>
                  <Text style={styles.productCount}>
                    {productCount} sản phẩm
                  </Text>
                </View>
                {groupedOrders.length === 0 ? (
                  <View style={styles.emptyOrders}>
                    <Text style={styles.stateTitle}>Chưa có đơn hàng</Text>
                    <Text style={styles.stateText}>
                      Các đơn hàng của khách sẽ hiển thị tại đây.
                    </Text>
                  </View>
                ) : (
                  groupedOrders.map((group) => (
                    <View key={group.date} style={styles.dateGroup}>
                      <View style={styles.dateHeader}>
                        <View style={styles.dateDot} />
                        <Text style={styles.dateText}>{group.date}</Text>
                      </View>
                      {group.orders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          cancelling={cancellingId === order.id}
                          onCancelShipment={handleCancelShipment}
                          onViewDetail={() => {
                            hide();
                            router.push({
                              pathname: "/order-detail",
                              params: { id: order.id },
                            });
                          }}
                        />
                      ))}
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          ) : (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.analyticsContent}>
                {analyticsLoading ? (
                  <>
                    <Skeleton height={96} borderRadius={16} />
                    <Skeleton height={96} borderRadius={16} />
                    <Skeleton height={96} borderRadius={16} />
                  </>
                ) : !analytics ? (
                  <View style={styles.emptyOrders}>
                    <Text style={styles.stateTitle}>Chưa có dữ liệu phân tích</Text>
                    <Text style={styles.stateText}>Khách này chưa có đơn hàng để phân tích.</Text>
                  </View>
                ) : (
                  <>
                    <View style={[styles.analyticsCard, { borderColor: colors.border10, backgroundColor: colors.white }, shadows.sd1]}>
                      <View style={styles.analyticsRow}>
                        <Text style={[styles.analyticsLabel, { color: colors.neutral400 }]}>Tổng đơn</Text>
                        <Text style={[styles.analyticsValue, { color: colors.neutral900 }]}>{analytics.totalOrders}</Text>
                      </View>
                      <View style={styles.analyticsRow}>
                        <Text style={[styles.analyticsLabel, { color: colors.neutral400 }]}>Tổng chi tiêu</Text>
                        <Text style={[styles.analyticsValue, { color: colors.neutral900 }]}>{formatMoneyCompact(analytics.totalSpent)}</Text>
                      </View>
                      <View style={styles.analyticsRow}>
                        <Text style={[styles.analyticsLabel, { color: colors.neutral400 }]}>Trung bình đơn</Text>
                        <Text style={[styles.analyticsValue, { color: colors.neutral900 }]}>{formatMoneyCompact(analytics.avgOrderValue)}</Text>
                      </View>
                      {!!analytics.lastOrderAt && (
                        <View style={styles.analyticsRow}>
                          <Text style={[styles.analyticsLabel, { color: colors.neutral400 }]}>Đơn gần nhất</Text>
                          <Text style={[styles.analyticsValue, { color: colors.neutral900 }]}>{formatAnalyticsDate(analytics.lastOrderAt)}</Text>
                        </View>
                      )}
                    </View>

                    {Object.keys(analytics.byStatus).length > 0 && (
                      <View style={[styles.analyticsCard, { borderColor: colors.border10, backgroundColor: colors.white }, shadows.sd1]}>
                        <Text style={[styles.analyticsSectionTitle, { color: colors.neutral900 }]}>Trạng thái đơn</Text>
                        {Object.entries(analytics.byStatus).map(([s, c]) => (
                          <View key={s} style={styles.analyticsRow}>
                            <Text style={[styles.analyticsLabel, { color: colors.neutral400 }]}>{getOrderStatusLabel(s as any)}</Text>
                            <Text style={[styles.analyticsValue, { color: colors.neutral900 }]}>{c as number}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {analytics.topProducts.length > 0 && (
                      <View style={[styles.analyticsCard, { borderColor: colors.border10, backgroundColor: colors.white }, shadows.sd1]}>
                        <Text style={[styles.analyticsSectionTitle, { color: colors.neutral900 }]}>Sản phẩm ưa thích</Text>
                        {analytics.topProducts.map((p, idx) => (
                          <View key={`${p.productCode ?? ""}-${p.productName ?? ""}-${idx}`} style={styles.analyticsRow}>
                            <Text style={[styles.analyticsLabel, { color: colors.neutral400 }, { flex: 1, marginRight: 12 }]} numberOfLines={1}>
                              {p.productName || p.productCode || "—"}
                            </Text>
                            <Text style={[styles.analyticsValue, { color: colors.neutral900 }]}>x{p.quantity}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {/* Doanh thu theo thời gian — 6 tháng gần nhất, từ customerOrders (không đổi API) */}
                    {(() => {
                      const max = Math.max(...revenueByMonth.map((b) => b.total), 1);
                      const hasAny = revenueByMonth.some((b) => b.total > 0);
                      if (!hasAny && customerOrders.length === 0) return null;
                      return (
                        <View style={[styles.analyticsCard, { borderColor: colors.border10, backgroundColor: colors.white }, shadows.sd1]}>
                          <Text style={[styles.analyticsSectionTitle, { color: colors.neutral900 }]}>Doanh thu theo thời gian</Text>
                          <Text style={[styles.analyticsLabel, { color: colors.neutral400, marginBottom: 8 }]}>
                            6 tháng gần nhất (từ đơn hàng hiện có)
                          </Text>
                          <View style={styles.revenueBarsRow}>
                            {revenueByMonth.map((b) => (
                              <View key={b.key} style={styles.revenueBarCol}>
                                <View style={styles.revenueBarTrack}>
                                  <View
                                    style={[
                                      styles.revenueBarFill,
                                      { height: `${Math.max(4, Math.round((b.total / max) * 100))}%`, backgroundColor: colors.primary },
                                    ]}
                                  />
                                </View>
                                <Text style={[styles.revenueBarLabel, { color: colors.neutral400 }]}>{b.label}</Text>
                                <Text style={[styles.revenueBarValue, { color: colors.neutral900 }]} numberOfLines={1}>
                                  {b.total > 0 ? formatMoneyCompact(b.total) : "—"}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      );
                    })()}
                  </>
                )}
              </View>
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}
