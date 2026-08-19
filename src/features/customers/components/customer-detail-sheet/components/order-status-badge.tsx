import type { Order } from "@app-types/index";
import { statusLabel } from "@features/orders/utils/order";
import { createStyles } from "@utils/createStyles";
import { memo } from "react";
import { Text, View } from "react-native";

export const OrderStatusBadge = memo(({ order }: { order: Order }) => {
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
});

OrderStatusBadge.displayName = "OrderStatusBadge";

const styles = createStyles(({ colors, textPresets }) => ({
  badgeRow: { alignItems: "flex-end", gap: 6 },
  badge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  badgeSuccess: { backgroundColor: colors.successLight },
  badgeWarning: { backgroundColor: colors.warningLight },
  badgeMuted: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: colors.neutral50 },
  badgeText: { ...textPresets.fs11_800 },
  badgeTextSuccess: { color: colors.success },
  badgeTextWarning: { color: colors.warning },
  badgeTextMuted: { color: colors.neutral400, ...textPresets.fs11_800 },
}));
