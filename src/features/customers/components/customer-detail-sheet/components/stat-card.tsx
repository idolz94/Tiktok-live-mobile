import { createStyles } from "@utils/createStyles";
import { memo } from "react";
import { Pressable, Text } from "react-native";
import type { OrderStatFilter } from "../use-customer-detail";

type Props = {
  label: string;
  value: number;
  tone: "success" | "info" | "danger" | "muted";
  filterKey: OrderStatFilter;
  active: boolean;
  onPress: (key: OrderStatFilter) => void;
};

export const StatCard = memo(({ label, value, tone, filterKey, active, onPress }: Props) => {
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
});

StatCard.displayName = "StatCard";

const styles = createStyles(({ colors, textPresets }) => ({
  statCard: {
    width: "48.5%",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  statCard_success: { backgroundColor: colors.successLight },
  statCard_info: { backgroundColor: colors.infoLight },
  statCard_danger: { backgroundColor: colors.primaryLight },
  statCard_muted: { backgroundColor: colors.neutral50 },
  statCard_active: { borderWidth: 1.5, borderColor: colors.primary },
  statValue: { color: colors.neutral900, ...textPresets.fs20_900 },
  statLabel: { marginTop: 4, color: colors.neutral400, fontSize: 13, fontWeight: "500" },
}));
