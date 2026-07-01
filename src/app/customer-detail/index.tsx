import type { Order, OrderProduct } from "@app-types/index";
import { Avatar } from "@components/avatar";
import { Screen } from "@components/screen";
import { Ionicons } from "@expo/vector-icons";
import { formatMoney, getOrderTotal, statusLabel } from "@features/orders/utils/order";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { openTikTokProfile } from "@utils/tiktok";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type DetailTab, useCustomerDetail } from "./use-customer-detail";

type StatCardProps = {
  label: string;
  value: number;
  tone: "success" | "info" | "danger" | "muted";
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
];

function getOrderProducts(order: Order) {
  return Array.isArray(order.products) ? order.products : [];
}

function TikTokMark() {
  return (
    <View style={styles.tiktokMark}>
      <Text style={styles.tiktokMarkText}>♪</Text>
    </View>
  );
}

function ActionPill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.actionPill}>
      <TikTokMark />
      <Text style={styles.actionPillText}>{label}</Text>
    </Pressable>
  );
}

const CUSTOMER_TYPES = ["Lẻ", "Sỉ", "Boom"];

function SelectField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { colors, textPresets } = useThemes();
  const { show, hide } = useBottomSheet();

  const openSheet = () => {
    show({
      content: (
        <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          <Text style={{ paddingVertical: 16, color: colors.neutral500, ...textPresets.fs15_800 }}>{label}</Text>
          {CUSTOMER_TYPES.map((opt) => {
            const selected = value === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => { onChange(opt); hide(); }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border10,
                }}
              >
                <Text style={[textPresets.fs15_400, { color: selected ? colors.primary : colors.neutral900 }]}>{opt}</Text>
                {selected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </Pressable>
            );
          })}
        </View>
      ),
      snapPoints: ["35%"],
    });
  };

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable onPress={openSheet} style={styles.selectInput}>
        <Text style={[textPresets.fs14_400, { color: value ? colors.neutral900 : colors.neutral300, flex: 1 }]}>
          {value || "Chọn loại khách hàng"}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.neutral400} />
      </Pressable>
    </View>
  );
}

function Field({ label, value, placeholder, multiline, keyboardType, onChangeText, onBlur }: FieldProps) {
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

function StatCard({ label, value, tone }: StatCardProps) {
  const toneStyle = {
    success: styles.statCard_success,
    info: styles.statCard_info,
    danger: styles.statCard_danger,
    muted: styles.statCard_muted,
  }[tone];

  return (
    <View style={[styles.statCard, toneStyle]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function OrderStatusBadge({ order }: { order: Order }) {
  const deposited = order.depositStatus === "paid" || order.depositStatus === "deposited";

  return (
    <View style={styles.badgeRow}>
      <View style={[styles.badge, deposited ? styles.badgeSuccess : styles.badgeWarning]}>
        <Text style={[styles.badgeText, deposited ? styles.badgeTextSuccess : styles.badgeTextWarning]}>
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
          {[product.color, product.size].filter(Boolean).join(" • ") || "Phân loại mặc định"}
        </Text>
      </View>
      <View style={styles.productPriceBox}>
        <Text style={styles.productQuantity}>x{product.quantity}</Text>
        <Text style={styles.productPrice}>{formatMoney(total)}</Text>
      </View>
    </View>
  );
}

function getProviderAbbr(name?: string | null) {
  if (!name) return "VC";
  const upper = name.toUpperCase();
  if (upper.includes("GIAO HANG NHANH") || upper.includes("GHN")) return "GHN";
  if (upper.includes("GIAO HANG TIET KIEM") || upper.includes("GHTK")) return "GHTK";
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
  const statusLabel = SHIPPING_STATUS_LABEL[order.shippingStatus ?? ""] ?? "Chờ lấy hàng";
  const canCancel = order.shippingStatus !== "cancelled"
    && order.shippingStatus !== "returned"
    && order.shippingStatus !== "delivered";

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
          <Text style={styles.providerStatus}>{statusLabel}</Text>
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
        <Text style={styles.trackingOrderCode}>{order.orderCode || order.id}</Text>
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
                          err instanceof Error ? err.message : "Vui lòng thử lại.",
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
            <Text style={styles.cancelShipmentText}>{cancelling ? "Đang huỷ..." : "Huỷ Vận Đơn"}</Text>
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
}: {
  order: Order;
  cancelling: boolean;
  onCancelShipment: (order: Order) => Promise<void>;
}) {
  const products = getOrderProducts(order);
  const total = Number(order.totalAmount ?? getOrderTotal(products));

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderTitleBox}>
          <Text style={styles.orderCode}>{order.orderCode || order.id}</Text>
          <Text style={styles.orderComment} numberOfLines={1}>
            {order.comment || "Đơn hàng từ live"}
          </Text>
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
        <Text style={styles.orderTotalValue}>{formatMoney(total)}</Text>
      </View>

      <View style={styles.orderActions}>
        <Pressable
          style={styles.detailButton}
          onPress={() =>
            router.push({
              pathname: "/order-detail",
              params: { id: order.id },
            })
          }
        >
          <Text style={styles.detailButtonText}>Xem chi tiết</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function CustomerDetail() {
  const { top } = useSafeAreaInsets();
  const {
    activeTab, setActiveTab,
    customerType, setCustomerType,
    phone, setPhone,
    phoneError, validatePhone,
    referenceInfo, setReferenceInfo,
    address, setAddress,
    isSaving,
    displayName, avatar, tiktokUsername,
    customer, groupedOrders,
    productCount, confirmedCount, depositedCount, unpaidCount, draftCount,
    loading, notFound,
    handleSave,
    handleCancelShipment,
    cancellingId,
  } = useCustomerDetail();

  return (
    <Screen backgroundColorTheme="white">
      <View style={[styles.header, { paddingTop: top + 8 }]}>
        <Pressable
          hitSlop={8}
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) router.back();
          }}
        >
          <Ionicons name="chevron-back" size={20} color="#000000" />
        </Pressable>
        <View style={styles.headerCustomer}>
          <Avatar uri={avatar} username={displayName} size={40} />
          <View style={styles.headerInfo}>
            <Text numberOfLines={1} style={styles.headerName}>
              {displayName}
            </Text>
            {!!tiktokUsername && (
              <View style={styles.headerTikTokLine}>
                <TikTokMark />
                <Text numberOfLines={1} style={styles.headerTikTokText}>
                  {tiktokUsername}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#FF6B8A" />
          <Text style={styles.stateText}>Đang tải chi tiết khách hàng...</Text>
        </View>
      ) : notFound ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Không tìm thấy khách hàng</Text>
          <Text style={styles.stateText}>Khách hàng này chưa có dữ liệu trong phiên hiện tại.</Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.actionsRow}>
              {!!tiktokUsername && (
                <ActionPill label="TikTok" onPress={() => openTikTokProfile(tiktokUsername)} />
              )}
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
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {activeTab === "info" ? (
              <View style={styles.infoContent}>
                <SelectField label="Loại khách hàng" value={customerType} onChange={setCustomerType} />
                <Field label="Số điện thoại" value={phone} placeholder="Nhập số điện thoại" onChangeText={setPhone} keyboardType="phone-pad" onBlur={() => validatePhone()} />
                {!!phoneError && <Text style={styles.fieldError}>{phoneError}</Text>}
                <Field
                  label="Thông tin tham khảo"
                  value={referenceInfo}
                  placeholder="Ghi chú thêm về khách hàng"
                  multiline
                  onChangeText={setReferenceInfo}
                />
                <Field
                  label="Địa chỉ giao hàng"
                  value={address}
                  placeholder="Nhập địa chỉ giao hàng"
                  multiline
                  onChangeText={setAddress}
                />
                <TouchableOpacity
                  style={[styles.saveButton, (isSaving || !customer?.customerId) && styles.saveButtonDisabled]}
                  activeOpacity={0.8}
                  onPress={handleSave}
                  disabled={isSaving || !customer?.customerId}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>LƯU THÔNG TIN</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.ordersContent}>
                <View style={styles.statGrid}>
                  <StatCard label="Đã chốt" value={confirmedCount} tone="success" />
                  <StatCard label="Đã cọc" value={depositedCount} tone="info" />
                  <StatCard label="Chưa cọc" value={unpaidCount} tone="danger" />
                  <StatCard label="Đơn nháp" value={draftCount} tone="muted" />
                </View>
                <View style={styles.orderToolbar}>
                  <Text style={styles.productCount}>{productCount} sản phẩm</Text>
                </View>
                {groupedOrders.length === 0 ? (
                  <View style={styles.emptyOrders}>
                    <Text style={styles.stateTitle}>Chưa có đơn hàng</Text>
                    <Text style={styles.stateText}>Các đơn hàng của khách sẽ hiển thị tại đây.</Text>
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
                        />
                      ))}
                    </View>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </>
      )}
    </Screen>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  header: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral50,
  },
  headerCustomer: {
    flex: 1,
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
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
    marginLeft: 5,
    flex: 1,
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
  tiktokMark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral50,
  },
  tiktokMarkText: {
    color: colors.neutral500,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 14,
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
    gap: 8,
    paddingVertical: 12,
  },
  actionPill: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.neutral50,
  },
  actionPillText: {
    color: colors.neutral500,
    fontSize: 13,
    fontWeight: "600",
  },
  tabBar: {
    height: 48,
    flexDirection: "row",
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
    color: colors.neutral500,
    fontSize: 14,
    fontWeight: "600",
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
    flexDirection: "row" as const,
    alignItems: "center" as const,
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
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  saveButtonDisabled: {
    opacity: 0.65,
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
}));
