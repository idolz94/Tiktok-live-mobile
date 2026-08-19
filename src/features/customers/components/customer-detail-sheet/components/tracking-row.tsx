import type { Order } from "@app-types/index";
import { createStyles } from "@utils/createStyles";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

function getProviderAbbr(name?: string | null) {
  if (!name) return "VC";
  const upper = name.toUpperCase();
  if (upper.includes("GIAO HANG NHANH") || upper.includes("GHN")) return "GHN";
  if (upper.includes("GIAO HANG TIET KIEM") || upper.includes("GHTK")) return "GHTK";
  if (upper.includes("VIETTEL") || upper.includes("VTP")) return "VTP";
  if (upper.includes("SHOPEE") || upper.includes("SPX")) return "SPX";
  return upper.slice(0, 4);
}

type Props = {
  order: Order;
  cancelling: boolean;
  onCancelShipment: () => Promise<void>;
};

export const TrackingRow = memo(({ order, cancelling, onCancelShipment }: Props) => {
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
  const shippingStatusLabel = SHIPPING_STATUS_LABEL[order.shippingStatus ?? ""] ?? "Chờ lấy hàng";
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
          {order.createdAt ? new Date(order.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--"}
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
                        Alert.alert("Không huỷ được vận đơn", err instanceof Error ? err.message : "Vui lòng thử lại.");
                      });
                  },
                },
              ])
            }
          >
            {cancelling ? <ActivityIndicator size="small" color="#EF4444" /> : <Ionicons name="close-circle-outline" size={17} color="#EF4444" />}
            <Text style={styles.cancelShipmentText}>{cancelling ? "Đang huỷ..." : "Huỷ Vận Đơn"}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
});

TrackingRow.displayName = "TrackingRow";

const styles = createStyles(({ colors, textPresets }) => ({
  trackingCard: { marginTop: 10, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 14, backgroundColor: colors.white, overflow: "hidden" },
  trackingHeader: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  trackingLabel: { color: colors.neutral400, fontSize: 14, fontWeight: "500" },
  trackingCode: { flexShrink: 1, color: colors.neutral900, fontSize: 14, fontWeight: "600", textAlign: "right" },
  trackingBody: { marginHorizontal: 8, borderRadius: 12, backgroundColor: colors.neutral50, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 14 },
  providerBadge: { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#FF321D" },
  providerBadgeText: { color: colors.white, fontSize: 14, fontWeight: "900" },
  providerInfo: { flex: 1, marginLeft: 12, minWidth: 0 },
  providerName: { color: colors.neutral900, fontSize: 16, fontWeight: "700" },
  providerStatus: { marginTop: 3, color: "#F59E0B", fontSize: 14, fontWeight: "500" },
  followText: { marginLeft: 10, color: colors.neutral900, fontSize: 14, fontWeight: "700" },
  trackingFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  trackingTime: { color: colors.neutral400, fontSize: 13, fontWeight: "500" },
  trackingOrderCode: { color: colors.neutral900, fontSize: 13, fontWeight: "600" },
  shipmentActions: { borderTopWidth: 1, borderTopColor: colors.borderLight, flexDirection: "row" },
  printShipmentButton: { flex: 1, height: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  printShipmentText: { color: colors.neutral900, fontSize: 13, fontWeight: "700" },
  cancelShipmentButton: { flex: 1, height: 42, borderLeftWidth: 1, borderLeftColor: colors.borderLight, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  cancelShipmentText: { color: "#EF4444", fontSize: 13, fontWeight: "700" },
}));
