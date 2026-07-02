import { Alert, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";

type OrderDetailShipBarProps = {
  onShip: () => void;
  onPrint?: () => void;
  onCancel?: () => void;
  trackingCode?: string | null;
  providerName?: string | null;
  hasShipment?: boolean;
  shippingStatus?: string | null;
};

export function OrderDetailShipBar({
  onShip,
  onPrint,
  onCancel,
  trackingCode,
  providerName,
  hasShipment,
  shippingStatus,
}: OrderDetailShipBarProps) {
  const { colors } = useThemes();
  const canCancel = shippingStatus !== "cancelled"
    && shippingStatus !== "returned"
    && shippingStatus !== "delivered";

  if (hasShipment && trackingCode) {
    return (
      <View style={[styles.bottomBar, { borderTopColor: colors.border10 }]}>
        <View style={[styles.providerLogo, { backgroundColor: "#ff3911" }]}>
          <Text style={styles.providerLogoText}>SPX</Text>
        </View>
        <View style={styles.shipInfo}>
          <Text style={[styles.providerLabel, { color: colors.text }]} numberOfLines={1}>
            {providerName || "SPX Express"}
          </Text>
          <Text style={[styles.trackingLabel, { color: colors.neutral400 }]} numberOfLines={1}>
            {trackingCode}
          </Text>
        </View>
        {canCancel && (
          <Pressable style={styles.iconBtn} onPress={onCancel ?? (() => Alert.alert("Huỷ vận đơn", `Huỷ vận đơn ${trackingCode}?`, [{ text: "Không" }, { text: "Huỷ", style: "destructive" }]))}>
            <Ionicons name="close-circle-outline" size={22} color="#EF4444" />
          </Pressable>
        )}
        <Pressable style={styles.iconBtn} onPress={onPrint}>
          <Ionicons name="print-outline" size={22} color={colors.text} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.bottomBar, { borderTopColor: colors.border10 }]}>
      <Pressable style={[styles.shipBtn, { backgroundColor: colors.primary }]} onPress={onShip}>
        <Ionicons name="cube-outline" size={20} color="#fff" />
        <Text style={styles.shipBtnText}>Tạo vận đơn</Text>
      </Pressable>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: colors.neutral100,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
  },
  providerLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  providerLogoText: { color: "#fff", fontSize: 10, fontWeight: "900" as const },
  shipInfo: { flex: 1, rowGap: 2 },
  providerLabel: { ...textPresets.fs14_500 },
  trackingLabel: { ...textPresets.fs12_400 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  shipBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 8,
    paddingVertical: 14,
    borderRadius: 40,
  },
  shipBtnText: { color: "#fff", ...textPresets.fs16_600 },
}));
