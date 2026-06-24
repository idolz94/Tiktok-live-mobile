import type { Order, OrderProduct } from "@app-types/index";
import { Avatar } from "@components/avatar";
import { Screen } from "@components/screen";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@features/auth/hooks/use-auth";
import { useOrderManager, type CustomerSummaryWithTikTok } from "@features/orders/hooks/use-order-manager";
import { updateCustomerApi } from "@features/customers/service/api";
import { formatMoney, getOrderTotal, statusLabel } from "@features/orders/utils/order";
import { createStyles } from "@utils/createStyles";
import { getOrderTikTokUsername, openTikTokProfile } from "@utils/tiktok";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DetailTab = "info" | "orders";

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
  onChangeText: (value: string) => void;
};

const TABS: { key: DetailTab; label: string }[] = [
  { key: "info", label: "Thông tin" },
  { key: "orders", label: "Đơn hàng" },
];

function getSingleParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function getCustomerKey(customer: CustomerSummaryWithTikTok) {
  return customer.customerTikTokUsername || customer.username;
}

function matchesCustomer(order: Order, customerKey: string, customer?: CustomerSummaryWithTikTok) {
  if (!customerKey) return false;

  const orderTikTokUsername = getOrderTikTokUsername(order);
  const customerTikTokUsername = customer?.customerTikTokUsername || "";
  const customerUsername = customer?.username || "";

  if (customerTikTokUsername) return orderTikTokUsername === customerTikTokUsername;

  return order.username === customerKey || order.username === customerUsername;
}

function getOrderProducts(order: Order) {
  return Array.isArray(order.products) ? order.products : [];
}

function getProductQuantity(products: OrderProduct[]) {
  return products.reduce((sum, product) => sum + Number(product.quantity || 0), 0);
}

function formatOrderDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ ngày";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function groupOrdersByDate(orders: Order[]) {
  return orders.reduce<{ date: string; orders: Order[] }[]>((groups, order) => {
    const date = formatOrderDate(order.createdAt);
    const existing = groups.find((group) => group.date === date);

    if (existing) {
      existing.orders.push(order);
      return groups;
    }

    groups.push({ date, orders: [order] });
    return groups;
  }, []);
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

function Field({ label, value, placeholder, multiline, onChangeText }: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        multiline={multiline}
        onChangeText={onChangeText}
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

function OrderCard({ order }: { order: Order }) {
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
  const params = useLocalSearchParams<{ customerKey?: string; tab?: string }>();
  const customerKey = getSingleParam(params.customerKey);
  const initialTab = getSingleParam(params.tab) === "orders" ? "orders" : "info";
  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);
  const [customerType, setCustomerType] = useState("Lẻ");
  const [phone, setPhone] = useState("");
  const [referenceInfo, setReferenceInfo] = useState("");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { top } = useSafeAreaInsets();
  const { user } = useAuth();

  const orderManager = useOrderManager({
    comments: [],
    hasOrders: user?.hasOrders ?? false,
  });

  const customers = orderManager.customers;
  const customer = useMemo(
    () => customers.find((item) => getCustomerKey(item) === customerKey),
    [customerKey, customers],
  );
  const customerOrders = useMemo(
    () =>
      orderManager.orders
        .filter((order) => matchesCustomer(order, customerKey, customer))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [customer, customerKey, orderManager.orders],
  );
  const latestOrder = customerOrders[0];
  const displayName = customer?.username || latestOrder?.customerName || latestOrder?.username || "Khách hàng";
  const avatar = customer?.avatar || latestOrder?.avatar || latestOrder?.avatarUrl || "";
  const tiktokUsername = customer?.customerTikTokUsername || (latestOrder ? getOrderTikTokUsername(latestOrder) : "");
  const groupedOrders = useMemo(() => groupOrdersByDate(customerOrders), [customerOrders]);
  const productCount = useMemo(
    () => customerOrders.reduce((sum, order) => sum + getProductQuantity(getOrderProducts(order)), 0),
    [customerOrders],
  );
  const confirmedCount = customerOrders.filter((order) => order.status === "confirmed").length;
  const depositedCount = customerOrders.filter(
    (order) => order.depositStatus === "paid" || order.depositStatus === "deposited",
  ).length;
  const unpaidCount = customerOrders.filter(
    (order) => order.depositStatus !== "paid" && order.depositStatus !== "deposited",
  ).length;
  const draftCount = customerOrders.filter((order) => order.status === "draft").length;

  useEffect(() => {
    if (!customerKey || !latestOrder) return;
    setPhone(latestOrder.customerPhone || "");
    setAddress(latestOrder.customerAddress || latestOrder.customerAddressData?.address || "");
    setReferenceInfo(latestOrder.note || customer?.latestComment || "");
  }, [customerKey]);

  const loading = orderManager.orderLoading && !customer && customerOrders.length === 0;
  const notFound = !loading && !customer && customerOrders.length === 0;

  const handleSave = async () => {
    if (!customer?.customerId || isSaving) return;
    setIsSaving(true);
    try {
      await updateCustomerApi(customer.customerId, { customerType, phone, referenceInfo });
    } finally {
      setIsSaving(false);
    }
  };

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
                <Field label="Loại khách hàng" value={customerType} onChangeText={setCustomerType} />
                <Field label="Số điện thoại" value={phone} placeholder="Nhập số điện thoại" onChangeText={setPhone} />
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
                        <OrderCard key={order.id} order={order} />
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
}));
