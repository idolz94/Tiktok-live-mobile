import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Icon } from "@components/icon";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";

type OrderDetailFooterActionsProps = {
  onPrint: () => void;
  onShare: () => void;
  onConfirm: () => void;
  isConfirmed: boolean;
  confirmLoading?: boolean;
};

export function OrderDetailFooterActions({
  onPrint,
  onShare,
  onConfirm,
  isConfirmed,
  confirmLoading,
}: OrderDetailFooterActionsProps) {
  const { colors, textPresets } = useThemes();

  const buttons = [
    { label: "In đơn", icon: "print" as const, onPress: onPrint },
    {
      label: isConfirmed ? "Bỏ chốt" : "Chốt đơn",
      icon: "clipboard_check" as const,
      onPress: onConfirm,
      loading: confirmLoading,
      active: isConfirmed,
    },
    { label: "Chia sẻ hóa đơn", icon: "receipt" as const, onPress: onShare },
  ];

  return (
    <View style={styles.row}>
      {buttons.map((btn) => (
        <Pressable key={btn.label} style={styles.item} onPress={btn.onPress} disabled={btn.loading}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: btn.active ? colors.primaryLight : colors.neutral50 },
            ]}
          >
            {btn.loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon name={btn.icon} size={24} tintColor={btn.active ? "primary" : "neutral700"} />
            )}
          </View>
          <Text style={[styles.label, { color: colors.neutral400 }, textPresets.fs14_400]}>
            {btn.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = createStyles(() => ({
  row: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  item: {
    flex: 1,
    alignItems: "center" as const,
    gap: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  label: {
    textAlign: "center" as const,
  },
}));
