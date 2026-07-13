import type { ShippingStatus } from "@app-types/index";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { LinearGradient } from "@components/linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  useShippingTab,
  type ShippingFilterKey,
  type ShippingOrder,
} from "@features/orders/hooks/use-shipping-tab";
import { getShipmentLabelApi, cancelShipmentApi } from "@features/orders/service/create-shipment-api";
import { router } from "expo-router";
import { useTabScrollToTop } from "@hooks/use-tab-scroll-to-top";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { useRef, useState } from "react";
import { icons } from "@assets/icons";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_LABEL: Record<ShippingStatus, string> = {
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

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + "₫";
}

function formatDate(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function statusColor(
  status: ShippingStatus,
  colors: {
    success: string;
    error: string;
    warning: string;
    info: string;
    textMuted: string;
  },
) {
  if (status === "delivered") return colors.success;
  if (
    status === "in_transit" ||
    status === "shipping" ||
    status === "delivering"
  )
    return colors.info;
  if (
    status === "failed" ||
    status === "damaged" ||
    status === "lost" ||
    status === "return_failed" ||
    status === "pickup_failed"
  )
    return colors.error;
  if (status === "cancelled" || status === "returned") return colors.textMuted;
  return colors.warning;
}

function getTrackingUrl(item: ShippingOrder) {
  const trackingLink = item.trackingLink?.trim();
  if (trackingLink) return trackingLink;

  const trackingCode = item.trackingCode?.trim();
  return trackingCode
    ? `https://test.spx.co.th/track?${encodeURIComponent(trackingCode)}`
    : null;
}

function SummaryCard({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "success" | "info" | "error";
}) {
  const { colors, textPresets } = useThemes();
  const toneColor =
    tone === "success"
      ? colors.success
      : tone === "info"
        ? colors.info
        : colors.error;
  const bg =
    tone === "success"
      ? colors.successLight
      : tone === "info"
        ? colors.infoLight
        : colors.primaryLight;

  return (
    <View
      style={[
        styles.summaryCard,
        { backgroundColor: bg, borderColor: colors.border10 },
      ]}
    >
      <View style={[styles.summaryIcon, { backgroundColor: toneColor }]}>
        <Text style={styles.summaryIconText}>
          {tone === "success" ? "✓" : tone === "info" ? "i" : "!"}
        </Text>
      </View>
      <View style={styles.summaryTextWrap}>
        <Text
          style={[
            styles.summaryValue,
            { color: colors.text, ...textPresets.fs16_600 },
          ]}
        >
          {formatMoney(value)}
        </Text>
        <Text
          style={[
            styles.summaryLabel,
            { color: colors.textDarkGray, ...textPresets.fs12_400 },
          ]}
        >
          {label}
        </Text>
      </View>
      <Text style={[styles.chevron, { color: colors.text }]}>›</Text>
    </View>
  );
}

function providerAbbr(name?: string | null): string {
  const n = name?.toUpperCase() ?? "";
  if (n.includes("GHN")) return "GHN";
  if (n.includes("GHTK")) return "GHTK";
  if (n.includes("VTP") || n.includes("VIETTEL")) return "VTP";
  if (n.includes("SPX") || n.includes("SHOPEE")) return "SPX";
  return "TC";
}

function providerLabel(name?: string | null): string {
  const n = name?.toLowerCase() ?? "";
  if (n.includes("ghn")) return "Giao Hàng Nhanh";
  if (n.includes("ghtk")) return "Giao Hàng Tiết Kiệm";
  if (n.includes("vtp") || n.includes("viettel")) return "Viettel Post";
  if (n.includes("spx") || n.includes("shopee")) return "Shopee Express";
  return "Thủ công";
}

function OrderCard({ item, onCancelled }: { item: ShippingOrder; onCancelled: () => void }) {
  const { colors, textPresets } = useThemes();
  const [printing, setPrinting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const name = item.customerName || item.username || "Khách live";
  const trackingUrl = getTrackingUrl(item);
  const abbr = providerAbbr(item.providerName);
  const label = providerLabel(item.providerName);
  const sColor = statusColor(item.shippingStatus, colors);

  const addressText =
    [
      item.customerAddressData?.address,
      item.customerAddressData?.ward,
      item.customerAddressData?.district,
      item.customerAddressData?.province,
    ]
      .filter(Boolean)
      .join(", ") || item.customerAddress?.trim() || "";

  const productCount =
    item.products?.reduce((s, p) => s + Number(p.quantity || 0), 0) ||
    item.quantity ||
    0;
  const noteText = (item as any).note?.trim() as string | undefined;
  const productSummary = noteText
    ? `Đơn hàng ${productCount} sản phẩm, ${noteText}`
    : `Đơn hàng ${productCount} sản phẩm`;

  const handlePrint = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      const res = await getShipmentLabelApi(item.id);
      if (res.labelUrl) await Linking.openURL(res.labelUrl);
      else Alert.alert("Chưa có nhãn in", "Vận đơn chưa có nhãn để in.");
    } catch {
      Alert.alert("Lỗi", "Không thể lấy nhãn in. Vui lòng thử lại.");
    } finally {
      setPrinting(false);
    }
  };

  const handleCancel = () => {
    Alert.alert("Huỷ đơn", "Bạn có chắc muốn huỷ vận đơn này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Huỷ đơn",
        style: "destructive",
        onPress: async () => {
          if (cancelling) return;
          setCancelling(true);
          try {
            await cancelShipmentApi(item.id, { trackingId: item.trackingCode });
            onCancelled();
          } catch {
            Alert.alert("Lỗi", "Không thể huỷ vận đơn. Vui lòng thử lại.");
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  return (
    <Pressable
      style={[styles.orderCard, { backgroundColor: colors.white }]}
      onPress={() =>
        router.push({
          pathname: "/shipping-detail/[id]" as never,
          params: { id: item.id, order: JSON.stringify(item) },
        })
      }
    >
      {/* Top row: date/code + theo dõi */}
      <View style={styles.cardTopRow}>
        <Text
          style={{ color: "#787878", ...textPresets.fs12_400 }}
          numberOfLines={1}
        >
          {formatDate(item.createdAt)}
          {"  "}
          {item.orderCode ?? item.id.slice(0, 12)}
        </Text>
        <Pressable
          style={styles.cardTrackingLink}
          onPress={() => {
            if (!trackingUrl) {
              Alert.alert(
                "Chưa có link theo dõi",
                `Mã: ${item.trackingCode ?? "—"}`,
              );
              return;
            }
            void Linking.openURL(trackingUrl);
          }}
        >
          <Text style={{ color: "#c6a84d", fontSize: 12, fontWeight: "600" }}>
            Theo dõi
          </Text>
          <Ionicons name="chevron-forward" size={12} color="#c6a84d" />
        </Pressable>
      </View>

      {/* Provider row */}
      <View style={styles.cardProviderRow}>
        <View style={styles.cardProviderLeft}>
          <View
            style={[
              styles.cardLogoBox,
              abbr === "TC"
                ? { backgroundColor: "#fff8e6", borderColor: "#e8cf88" }
                : { borderColor: "#e0e0e0" },
            ]}
          >
            {abbr === "TC" ? (
              <Ionicons name="cube-outline" size={21} color="#c6a84d" />
            ) : (
              <Text style={{ color: abbr === "SPX" ? "#ee4d2d" : "#666", fontSize: 10, fontWeight: "900" }}>
                {abbr}
              </Text>
            )}
          </View>
          <View style={styles.cardProviderInfo}>
            <Text
              style={[{ color: colors.text, ...textPresets.fs14_500 }]}
              numberOfLines={1}
            >
              {label}
            </Text>
            <Text style={{ color: sColor, fontSize: 13, fontWeight: "600" }}>
              {STATUS_LABEL[item.shippingStatus]}
            </Text>
          </View>
        </View>
        <View style={styles.cardTrackingCodeBlock}>
          <Text style={[{ color: colors.neutral400, ...textPresets.fs11_400 }]}>
            MÃ - {abbr}
          </Text>
          <Text
            style={{ color: "#c6a84d", fontSize: 14, fontWeight: "700" }}
            numberOfLines={1}
          >
            {item.trackingCode ?? "—"}
          </Text>
        </View>
      </View>

      <View style={[styles.cardDivider, { backgroundColor: colors.border10 }]} />

      {/* Info section */}
      <View style={styles.cardInfoSection}>
        {/* Customer name + inline actions */}
        <View style={styles.cardInfoNameRow}>
          <View style={[styles.cardIconRow, { flex: 1 }]}>
            <Ionicons name="person-outline" size={16} color={colors.neutral500} />
            <Text
              style={[styles.cardInfoFlex, { color: colors.text, ...textPresets.fs12_400 }]}
              numberOfLines={1}
            >
              {name}
            </Text>
          </View>
          <View style={styles.cardNameActions}>
            <Pressable
              style={[styles.cardPrintBtn, { backgroundColor: colors.neutral50, borderColor: colors.border10 }]}
              onPress={() => { void handlePrint(); }}
              disabled={printing}
            >
              {printing
                ? <ActivityIndicator size="small" color={colors.text} />
                : <Image source={icons.print} style={[styles.cardPrintIcon, { tintColor: colors.text }]} />
              }
            </Pressable>
            <Pressable
              style={[styles.cardDetailBtn, { borderColor: "#2196f3", backgroundColor: "#f0f7ff" }]}
              onPress={() =>
                router.push({
                  pathname: "/shipping-detail/[id]" as never,
                  params: { id: item.id, order: JSON.stringify(item) },
                })
              }
            >
              <Text style={{ color: "#2196f3", ...textPresets.fs12_500 }}>Chi tiết 🛒</Text>
            </Pressable>
          </View>
        </View>

        {/* Phone */}
        {item.customerPhone ? (
          <View style={styles.cardIconRow}>
            <Ionicons name="call-outline" size={16} color={colors.neutral500} />
            <Text
              style={[styles.cardInfoFlex, { color: colors.text, ...textPresets.fs12_400 }]}
            >
              {item.customerPhone}
            </Text>
          </View>
        ) : null}

        {/* Address */}
        {addressText ? (
          <View style={styles.cardIconRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={colors.neutral500}
              style={{ marginTop: 1 }}
            />
            <View style={styles.cardAddressBlock}>
              <Text style={{ color: colors.text, ...textPresets.fs12_400 }}>
                {addressText}
              </Text>
              {(item.customerAddressData as any)?.isOld ? (
                <View style={styles.cardOldBadge}>
                  <Text
                    style={{ color: "#ff9800", fontSize: 10, fontWeight: "600" }}
                  >
                    Địa chỉ cũ
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Products */}
        <View style={styles.cardIconRow}>
          <Ionicons name="cube-outline" size={16} color={colors.neutral500} />
          <Text
            style={[styles.cardInfoFlex, { color: colors.text, ...textPresets.fs12_400 }]}
            numberOfLines={2}
          >
            {productSummary}
          </Text>
        </View>
      </View>

      <View style={[styles.cardDivider, { backgroundColor: colors.border10 }]} />

      {/* Money rows */}
      <View style={styles.cardMoneySection}>
        <View style={styles.cardMoneyRow}>
          <Text style={{ color: colors.neutral400, ...textPresets.fs12_400 }}>
            Tiền thu hộ (COD)
          </Text>
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>
            {formatMoney(Number(item.codAmount || 0))}
          </Text>
        </View>
        <View style={styles.cardMoneyRow}>
          <Text style={{ color: colors.neutral400, ...textPresets.fs12_400 }}>
            Phí vận chuyển
          </Text>
          <Text style={{ color: colors.text, ...textPresets.fs12_400 }}>
            {formatMoney(Number(item.shippingFee || 0))}
          </Text>
        </View>
      </View>

      <View style={[styles.cardDivider, { backgroundColor: colors.border10 }]} />

      {/* Action buttons */}
      <View style={styles.cardActions}>
        <Pressable
          style={[styles.cardActionBtn, { borderColor: colors.border10, backgroundColor: colors.neutral50 }]}
          onPress={() =>
            router.push({ pathname: "/order-detail" as never, params: { id: item.id } })
          }
        >
          <Text style={[styles.cardActionText, { color: colors.text, ...textPresets.fs12_500 }]}>
            Tổng quan
          </Text>
        </Pressable>
        {item.shippingStatus !== "cancelled" && (
          <Pressable
            style={[styles.cardActionBtn, { borderColor: "#ffcdd2", backgroundColor: "#fff5f5" }]}
            onPress={handleCancel}
          >
            <Text style={[styles.cardActionText, { color: colors.error, ...textPresets.fs12_500 }]}>
              Huỷ đơn
            </Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const FILTER_LABELS: Record<ShippingFilterKey, string> = {
  all: "Tất cả",
  waiting: "Chờ lấy hàng",
  transit: "Đang vận chuyển",
  delivered: "Đã giao hàng",
  returning: "Trả hàng",
  other: "Khác",
};

const filterKeys: ShippingFilterKey[] = [
  "all",
  "waiting",
  "transit",
  "delivered",
  "returning",
  "other",
];

function FilterSheet({
  filter,
  onClose,
  onSelect,
}: {
  filter: ShippingFilterKey;
  onClose: () => void;
  onSelect: (key: ShippingFilterKey) => void;
}) {
  const { colors, textPresets } = useThemes();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
      <View style={styles.sheetHeader}>
        <View style={styles.sheetHeaderSpacer} />
        <Text
          style={[
            styles.sheetTitle,
            { color: colors.text, ...textPresets.fs18_500 },
          ]}
        >
          Trạng thái đơn hàng
        </Text>
        <Pressable style={styles.sheetCloseButton} onPress={() => onClose()}>
          <Text style={[styles.sheetCloseText, { color: colors.text }]}>×</Text>
        </Pressable>
      </View>
      <View style={styles.sheetContent}>
        {filterKeys.map((key) => (
          <Pressable
            key={key}
            style={styles.sheetRow}
            onPress={() => {
              onSelect(key);
              onClose();
            }}
          >
            <Text
              style={[
                styles.sheetRowText,
                { color: colors.text, ...textPresets.fs16_400 },
              ]}
            >
              {FILTER_LABELS[key]}
            </Text>
            {filter === key ? (
              <Text style={[styles.sheetCheck, { color: colors.text }]}>✓</Text>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SkeletonBox({ style }: { style?: object }) {
  return <View style={[styles.skeletonBox, style]} />;
}

function ShippingSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.headerBackground}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={[styles.container, { paddingBottom: 34 }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <SkeletonBox style={{ width: 180, height: 28, borderRadius: 6 }} />
        <SkeletonBox style={{ width: 44, height: 44, borderRadius: 999 }} />
      </View>
      <View style={styles.summaryWrap}>
        <SkeletonBox style={{ height: 64, borderRadius: 12 }} />
        <SkeletonBox style={{ height: 64, borderRadius: 12 }} />
        <SkeletonBox style={{ height: 64, borderRadius: 12 }} />
      </View>
      <View style={[styles.countRow, { paddingBottom: 20 }]}>
        <View style={{ gap: 6 }}>
          <SkeletonBox style={{ width: 120, height: 22, borderRadius: 6 }} />
          <SkeletonBox style={{ width: 60, height: 16, borderRadius: 4 }} />
        </View>
        <SkeletonBox style={{ width: 72, height: 36, borderRadius: 999 }} />
      </View>
      {[0, 1].map((i) => (
        <View key={i} style={[styles.orderCard, { paddingBottom: 16 }]}>
          <View style={styles.userRow}>
            <SkeletonBox style={{ width: 40, height: 40, borderRadius: 999 }} />
            <SkeletonBox style={{ flex: 1, height: 20, borderRadius: 6 }} />
          </View>
          <SkeletonBox style={{ height: 96, borderRadius: 12 }} />
          <SkeletonBox style={{ height: 80, borderRadius: 8 }} />
          {i < 1 && <View style={styles.divider} />}
        </View>
      ))}
      </View>
    </View>
  );
}

export default function ShippingTab() {
  const {
    orders,
    loading,
    refreshing,
    error,
    refresh,
    summary,
    filter,
    setFilter,
  } = useShippingTab();
  const { colors, textPresets } = useThemes();
  const insets = useSafeAreaInsets();
  const { show, hide } = useBottomSheet();

  const scrollRef = useRef<FlatList>(null);
  useTabScrollToTop("shipping", scrollRef, { isFlatList: true });

  if (loading) return <ShippingSkeleton />;

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.headerBackground}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <FlatList
        ref={scrollRef}
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View>
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
              <Text
                style={[
                  styles.title,
                  { color: colors.text, ...textPresets.fs24_800 },
                ]}
              >
                Quản lý vận đơn
              </Text>
            </View>
            <View style={styles.summaryWrap}>
              <SummaryCard
                value={summary.codAmount}
                label="Tổng tiền thu hộ (COD)"
                tone="success"
              />
              <SummaryCard
                value={summary.revenue}
                label="Tổng doanh thu"
                tone="info"
              />
              <SummaryCard
                value={summary.shippingFee}
                label="Tổng phí vận chuyển"
                tone="error"
              />
            </View>
            <View style={styles.countRow}>
              <View>
                <Text
                  style={[
                    styles.countTitle,
                    { color: colors.text, ...textPresets.fs20_600 },
                  ]}
                >
                  {summary.orderCount} đơn hàng
                </Text>
              </View>
              <Pressable
                style={[styles.filterTrigger, { borderColor: colors.border10 }]}
                onPress={() => {
                  show({
                    showDragIndicator: true,
                    backgroundStyle: { backgroundColor: colors.white },
                    content: (
                      <FilterSheet
                        filter={filter}
                        onClose={() => hide()}
                        onSelect={setFilter}
                      />
                    ),
                  });
                }}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: colors.text, ...textPresets.fs14_500 },
                  ]}
                >
                  Filter
                </Text>
              </Pressable>
            </View>
            {error ? (
              <Text style={[styles.error, { color: colors.error }]}>
                {error}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text
              style={[
                styles.emptyText,
                { color: colors.textMuted, ...textPresets.fs15_800 },
              ]}
            >
              Chưa có vận đơn nào.
            </Text>
          </View>
        }
        renderItem={({ item }) => <OrderCard item={item} onCancelled={refresh} />}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
    </View>
  );
}

const styles = createStyles(({ colors }) => ({
  root: { flex: 1 },
  headerBackground: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  container: { paddingBottom: 34 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    minHeight: 119,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { lineHeight: 28 },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  searchIcon: { fontSize: 24, lineHeight: 28 },
  summaryWrap: { gap: 8, paddingHorizontal: 16, paddingBottom: 16 },
  summaryCard: {
    borderWidth: 0.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryIconText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  summaryTextWrap: { flex: 1, gap: 4 },
  summaryValue: { lineHeight: 24 },
  summaryLabel: { lineHeight: 18 },
  chevron: { fontSize: 24, lineHeight: 24 },
  countRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countTitle: { lineHeight: 24 },
  countSubtitle: { marginTop: 4, lineHeight: 22 },
  filterTrigger: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  filterText: { lineHeight: 22 },
  sheetHeader: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  sheetHeaderSpacer: { width: 32, height: 32 },
  sheetTitle: { flex: 1, textAlign: "center", lineHeight: 24 },
  sheetCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCloseText: { fontSize: 24, lineHeight: 28 },
  sheetContent: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  sheetRow: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  sheetRowText: { flex: 1, lineHeight: 24 },
  sheetCheck: { fontSize: 18, lineHeight: 22 },
  orderCard: { padding: 16, gap: 12, backgroundColor: colors.white, borderRadius: 12, marginHorizontal: 16 },
  skeletonBox: { backgroundColor: "#EBEBEB" },
  userRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTrackingLink: { flexDirection: "row", alignItems: "center", gap: 2 },
  cardProviderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardProviderLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  cardLogoBox: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" },
  cardProviderInfo: { gap: 4, flex: 1 },
  cardTrackingCodeBlock: { alignItems: "flex-end", gap: 2 },
  cardDivider: { height: 0.5 },
  cardInfoSection: { gap: 8 },
  cardInfoNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardNameActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardPrintBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  cardPrintIcon: { width: 16, height: 16 },
  cardDetailBtn: { borderWidth: 1, borderRadius: 8, height: 30, paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
  cardIconRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  cardInfoFlex: { flex: 1 },
  cardAddressBlock: { flex: 1, gap: 4 },
  cardActions: { flexDirection: "row", gap: 8 },
  cardActionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
  },
  cardActionText: { textAlign: "center" },
  cardOldBadge: { backgroundColor: "#fff3e0", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: "flex-start" },
  cardMoneySection: { gap: 4 },
  cardMoneyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  divider: { height: 12 },
  empty: { padding: 40, alignItems: "center" },
  emptyText: {},
  error: { paddingHorizontal: 16, paddingBottom: 12 },
}));
