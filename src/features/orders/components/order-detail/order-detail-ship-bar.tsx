import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { Icon } from "@components/icon";
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
  onShare?: () => void;
  onConfirm?: () => void;
  isConfirmed?: boolean;
  confirmLoading?: boolean;
  section?: "actions" | "bottom";
};

export function OrderDetailShipBar({
  onShip,
  onPrint,
  onCancel,
  trackingCode,
  providerName,
  hasShipment,
  shippingStatus,
  onShare,
  onConfirm,
  isConfirmed,
  confirmLoading,
  section,
}: OrderDetailShipBarProps) {
  const { colors } = useThemes();
  const canCancel =
    shippingStatus !== "cancelled" &&
    shippingStatus !== "returned" &&
    shippingStatus !== "delivered";

  const actions = [
    { key: "print", label: "In đơn", icon: "print" as const, onPress: onPrint },
    {
      key: "confirm",
      label: isConfirmed ? "Bỏ chốt" : "Chốt đơn",
      icon: "clipboard_check" as const,
      onPress: onConfirm,
      active: isConfirmed,
      loading: confirmLoading,
    },
    { key: "share", label: "Chia sẻ", icon: "receipt" as const, onPress: onShare },
  ];

  if (section === "actions") {
    return (
      <View style={styles.actionsRow}>
        {actions.map((btn) => (
          <Pressable
            key={btn.key}
            style={styles.actionItem}
            onPress={btn.onPress}
            disabled={btn.loading}
          >
            {btn.loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon
                name={btn.icon}
                size={22}
                tintColor={btn.active ? "primary" : "neutral900"}
              />
            )}
            <Text style={[styles.actionLabel, { color: colors.neutral400 }]}>
              {btn.label}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  if (section === "bottom") {
    return (
      <View style={styles.wrapper}>
        <View style={styles.bottomBar}>
          {hasShipment && trackingCode ? (
            <>
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
                <Pressable
                  style={styles.iconBtn}
                  onPress={
                    onCancel ??
                    (() => Alert.alert("Huỷ vận đơn", `Huỷ vận đơn ${trackingCode}?`, [
                      { text: "Không" }, { text: "Huỷ", style: "destructive" },
                    ]))
                  }
                >
                  <Icon name="circle_x" size={22} tintColor="neutral400" />
                </Pressable>
              )}
              <Pressable style={styles.iconBtn} onPress={onPrint}>
                <Icon name="print" size={22} tintColor="neutral900" />
              </Pressable>
            </>
          ) : (
            <Pressable style={styles.shipBtn} onPress={onShip}>
              <Text style={[styles.shipBtnText, { color: "#fff" }]}>Tạo vận đơn</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return null;
}

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  wrapper: {
    backgroundColor: colors.white,
    borderTopWidth: 0.5,
    borderTopColor: colors.border10,
  },
  actionsRow: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...shadows.sd2,
  },
  actionItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  actionLabel: {
    ...textPresets.fs12_400,
    textAlign: "center" as const,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
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
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  shipBtnText: {
    ...textPresets.fs14_500,
    fontWeight: "600" as const,
  },
}));
