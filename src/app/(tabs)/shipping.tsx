import type { ShippingStatus } from "@app-types/index";
import { Avatar } from "@components/avatar";
import { useShippingTab, type ShippingFilterKey, type ShippingOrder } from "@features/orders/hooks/use-shipping-tab";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { useState } from "react";
import { Alert, FlatList, Linking, Modal, Pressable, RefreshControl, Text, View } from "react-native";
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

function statusColor(status: ShippingStatus, colors: { success: string; error: string; warning: string; info: string; textMuted: string }) {
  if (status === "delivered") return colors.success;
  if (status === "in_transit" || status === "shipping" || status === "delivering") return colors.info;
  if (status === "failed" || status === "damaged" || status === "lost" || status === "return_failed" || status === "pickup_failed") return colors.error;
  if (status === "cancelled" || status === "returned") return colors.textMuted;
  return colors.warning;
}

function providerName(value?: string | null) {
  const code = String(value || "SPX").toLowerCase();
  if (code.includes("spx")) return "SPX express";
  return value || "Đơn vị vận chuyển";
}

function getTrackingUrl(item: ShippingOrder) {
  const trackingLink = item.trackingLink?.trim();
  if (trackingLink) return trackingLink;

  const trackingCode = item.trackingCode?.trim();
  return trackingCode ? `https://test.spx.co.th/track?${encodeURIComponent(trackingCode)}` : null;
}

function SummaryCard({ value, label, tone }: { value: number; label: string; tone: "success" | "info" | "error" }) {
  const { colors, textPresets } = useThemes();
  const toneColor = tone === "success" ? colors.success : tone === "info" ? colors.info : colors.error;
  const bg = tone === "success" ? colors.successLight : tone === "info" ? colors.infoLight : colors.primaryLight;

  return (
    <View style={[styles.summaryCard, { backgroundColor: bg, borderColor: colors.border10 }]}>
      <View style={[styles.summaryIcon, { backgroundColor: toneColor }]}>
        <Text style={styles.summaryIconText}>{tone === "success" ? "✓" : tone === "info" ? "i" : "!"}</Text>
      </View>
      <View style={styles.summaryTextWrap}>
        <Text style={[styles.summaryValue, { color: colors.text, ...textPresets.fs16_600 }]}>{formatMoney(value)}</Text>
        <Text style={[styles.summaryLabel, { color: colors.textDarkGray, ...textPresets.fs12_400 }]}>{label}</Text>
      </View>
      <Text style={[styles.chevron, { color: colors.text }]}>›</Text>
    </View>
  );
}

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  const { colors, textPresets } = useThemes();
  return (
    <View style={[styles.infoRow, !last && { borderBottomColor: colors.neutral50, borderBottomWidth: 1 }]}>
      <Text style={[styles.infoLabel, { color: colors.neutral500, ...textPresets.fs14_400 }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text, ...textPresets.fs14_500 }]}>{value}</Text>
    </View>
  );
}

function TrackingInfo({ item }: { item: ShippingOrder }) {
  const { colors, textPresets } = useThemes();
  const color = statusColor(item.shippingStatus, colors);
  const trackingUrl = getTrackingUrl(item);
  return (
    <View style={[styles.trackingBox, { borderColor: colors.border10 }]}>
      <View style={styles.trackingCodeRow}>
        <Text style={[styles.muted12, { color: colors.neutral400, ...textPresets.fs12_400 }]}>Mã SPX</Text>
        <Text style={[styles.trackingCode, { color: colors.text, ...textPresets.fs12_400 }]}>{item.trackingCode}</Text>
      </View>
      <View style={[styles.trackingMain, { backgroundColor: colors.neutral50 }]}>
        <View style={styles.carrierRow}>
          <View style={[styles.logoBox, { backgroundColor: "#ff3911" }]}>
            <Text style={styles.logoText}>SPX</Text>
          </View>
          <View style={styles.carrierText}>
            <Text style={[styles.carrierName, { color: colors.text, ...textPresets.fs14_500 }]}>{providerName(item.providerName)}</Text>
            <Text style={[styles.carrierStatus, { color, ...textPresets.fs12_400 }]}>{STATUS_LABEL[item.shippingStatus]}</Text>
          </View>
          <Pressable
            style={styles.followButton}
            onPress={() => {
              if (!trackingUrl) {
                Alert.alert("Chưa có link theo dõi", `Mã SPX: ${item.trackingCode}`);
                return;
              }
              void Linking.openURL(trackingUrl);
            }}
          >
            <Text style={[styles.followText, { color: colors.text, ...textPresets.fs12_500 }]}>Theo dõi</Text>
            <Text style={[styles.followText, { color: colors.text }]}>›</Text>
          </Pressable>
        </View>
        <View style={styles.trackingMetaRow}>
          <Text style={[styles.muted12, { color: colors.neutral400, ...textPresets.fs12_400 }]}>{formatDate(item.updatedAt || item.createdAt)}</Text>
          <Text style={[styles.orderCode, { color: colors.text, ...textPresets.fs12_400 }]}>{item.orderCode || item.id.slice(0, 8)}</Text>
        </View>
      </View>
    </View>
  );
}

function OrderCard({ item }: { item: ShippingOrder }) {
  const { colors, textPresets } = useThemes();
  const name = item.customerName || item.username || "Khách live";
  const count = item.products?.reduce((sum, p) => sum + Number(p.quantity || 0), 0) || item.quantity || 0;
  return (
    <View style={styles.orderCard}>
      <View style={styles.userRow}>
        <Avatar uri={item.avatarUrl || item.avatar} username={name} size={40} />
        <Text style={[styles.userName, { color: colors.text, ...textPresets.fs16_500 }]} numberOfLines={1}>{name}</Text>
      </View>
      <TrackingInfo item={item} />
      <View style={styles.infoBlock}>
        <InfoRow label="Số lượng sản phẩm" value={String(count)} />
        <InfoRow label="Phí vận chuyển" value={formatMoney(Number(item.shippingFee || 0))} />
        <InfoRow label="Tiền thu hộ (COD)" value={formatMoney(Number(item.codAmount || 0))} last />
      </View>
    </View>
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

const filterKeys: ShippingFilterKey[] = ["all", "waiting", "transit", "delivered", "returning", "other"];

function FilterSheet({ visible, filter, onClose, onSelect }: { visible: boolean; filter: ShippingFilterKey; onClose: () => void; onSelect: (key: ShippingFilterKey) => void }) {
  const { colors, textPresets } = useThemes();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]} onPress={(event) => event.stopPropagation()}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderSpacer} />
            <Text style={[styles.sheetTitle, { color: colors.text, ...textPresets.fs18_500 }]}>Trạng thái đơn hàng</Text>
            <Pressable style={styles.sheetCloseButton} onPress={onClose}>
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
                <Text style={[styles.sheetRowText, { color: colors.text, ...textPresets.fs16_400 }]}>{FILTER_LABELS[key]}</Text>
                {filter === key ? <Text style={[styles.sheetCheck, { color: colors.text }]}>✓</Text> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SkeletonBox({ style }: { style?: object }) {
  return <View style={[styles.skeletonBox, style]} />;
}

function ShippingSkeleton() {
  const insets = useSafeAreaInsets();
  return (
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
  );
}

export default function ShippingTab() {
  const { orders, loading, refreshing, error, refresh, summary, filter, setFilter } = useShippingTab();
  const { colors, textPresets } = useThemes();
  const insets = useSafeAreaInsets();
  const [filterOpen, setFilterOpen] = useState(false);

  if (loading) return <ShippingSkeleton />;

  return (
    <>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View>
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
              <Text style={[styles.title, { color: colors.text, ...textPresets.fs24_800 }]}>Quản lý vận đơn</Text>
              <View style={[styles.searchButton, { backgroundColor: colors.white }]}>
                <Text style={[styles.searchIcon, { color: colors.text }]}>⌕</Text>
              </View>
            </View>
            <View style={styles.summaryWrap}>
              <SummaryCard value={summary.codAmount} label="Tổng tiền thu hộ (COD)" tone="success" />
              <SummaryCard value={summary.revenue} label="Tổng doanh thu" tone="info" />
              <SummaryCard value={summary.shippingFee} label="Tổng phí vận chuyển" tone="error" />
            </View>
            <View style={styles.countRow}>
              <View>
                <Text style={[styles.countTitle, { color: colors.text, ...textPresets.fs20_600 }]}>{summary.orderCount} đơn hàng</Text>
                <Text style={[styles.countSubtitle, { color: colors.neutral400, ...textPresets.fs14_400 }]}>{FILTER_LABELS[filter]} ›</Text>
              </View>
              <Pressable style={[styles.filterTrigger, { borderColor: colors.border10 }]} onPress={() => setFilterOpen(true)}>
                <Text style={[styles.filterText, { color: colors.text, ...textPresets.fs14_500 }]}>Filter</Text>
              </Pressable>
            </View>
            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textMuted, ...textPresets.fs15_800 }]}>Chưa có vận đơn nào.</Text>
          </View>
        }
        renderItem={({ item }) => <OrderCard item={item} />}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
      <FilterSheet visible={filterOpen} filter={filter} onClose={() => setFilterOpen(false)} onSelect={setFilter} />
    </>
  );
}

const styles = createStyles(() => ({
  container: { paddingBottom: 34, backgroundColor: "#FFFFFF" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingTop: 18, paddingHorizontal: 16, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { lineHeight: 28 },
  searchButton: { width: 44, height: 44, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  searchIcon: { fontSize: 24, lineHeight: 28 },
  summaryWrap: { gap: 8, paddingHorizontal: 16, paddingBottom: 16 },
  summaryCard: { borderWidth: 0.5, borderRadius: 12, paddingVertical: 12, paddingLeft: 16, paddingRight: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  summaryIcon: { width: 32, height: 32, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  summaryIconText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  summaryTextWrap: { flex: 1, gap: 4 },
  summaryValue: { lineHeight: 24 },
  summaryLabel: { lineHeight: 18 },
  chevron: { fontSize: 24, lineHeight: 24 },
  countRow: { paddingHorizontal: 16, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  countTitle: { lineHeight: 24 },
  countSubtitle: { marginTop: 4, lineHeight: 22 },
  filterTrigger: { borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16 },
  filterText: { lineHeight: 22 },
  sheetOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: "hidden" },
  sheetHeader: { padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
  sheetHeaderSpacer: { width: 32, height: 32 },
  sheetTitle: { flex: 1, textAlign: "center", lineHeight: 24 },
  sheetCloseButton: { width: 32, height: 32, borderRadius: 999, backgroundColor: "#F2F2F2", alignItems: "center", justifyContent: "center" },
  sheetCloseText: { fontSize: 24, lineHeight: 28 },
  sheetContent: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  sheetRow: { height: 48, borderRadius: 8, backgroundColor: "#F2F2F2", paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 16 },
  sheetRowText: { flex: 1, lineHeight: 24 },
  sheetCheck: { fontSize: 18, lineHeight: 22 },
  orderCard: { paddingHorizontal: 16, gap: 16 },
  skeletonBox: { backgroundColor: "#EBEBEB" },
  userRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  userName: { flex: 1, lineHeight: 24 },
  trackingBox: { borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  trackingCodeRow: { backgroundColor: "#FFFFFF", paddingTop: 8, paddingHorizontal: 16, paddingBottom: 20, marginBottom: -12, flexDirection: "row", justifyContent: "space-between", gap: 16 },
  muted12: { lineHeight: 18 },
  trackingCode: { flex: 1, textAlign: "right", lineHeight: 18 },
  trackingMain: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  carrierRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  logoBox: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  logoText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  carrierText: { flex: 1 },
  carrierName: { lineHeight: 22 },
  carrierStatus: { lineHeight: 18 },
  followButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  followText: { lineHeight: 18 },
  trackingMetaRow: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  orderCode: { flex: 1, textAlign: "right", lineHeight: 18 },
  infoBlock: {},
  infoRow: { paddingTop: 12, paddingBottom: 12, flexDirection: "row", justifyContent: "space-between", gap: 16 },
  infoLabel: { flex: 1, lineHeight: 22 },
  infoValue: { width: 120, textAlign: "right", lineHeight: 22 },
  divider: { height: 8, backgroundColor: "#F2F2F2", marginVertical: 16 },
  empty: { padding: 40, alignItems: "center" },
  emptyText: {},
  error: { paddingHorizontal: 16, paddingBottom: 12 },
}));
