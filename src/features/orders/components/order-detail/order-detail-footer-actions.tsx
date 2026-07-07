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
    { label: "In đơn", icon: "print", onPress: onPrint },
    {
      label: isConfirmed ? "Bỏ chốt" : "Chốt đơn",
      icon: "clipboard_check",
      onPress: onConfirm,
      loading: confirmLoading,
      active: isConfirmed,
    },
    { label: "Chia sẻ hóa đơn", icon: "receipt", onPress: onShare },
  ];

  return (
    <View style={styles.row}>
      {buttons.map((btn) => (
        <Pressable
          key={btn.label}
          style={styles.item}
          onPress={btn.onPress}
          disabled={btn.loading}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: btn.active
                  ? colors.primaryLight
                  : colors.neutral50,
              },
            ]}
          >
            {btn.loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon
                //@ts-ignore
                name={btn.icon}
                size={24}
                tintColor={btn.active ? "primary" : "neutral900"}
              />
            )}
          </View>
          <Text
            style={[
              styles.label,
              { color: colors.neutral400 },
              textPresets.fs14_400,
            ]}
          >
            {btn.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = createStyles(({ colors }) => ({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    textAlign: "center",
  },
}));
