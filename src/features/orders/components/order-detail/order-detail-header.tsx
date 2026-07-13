import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";

type OrderDetailHeaderProps = {
  onBack: () => void;
};

export function OrderDetailHeader({ onBack }: OrderDetailHeaderProps) {
  const { colors } = useThemes();
  const { top } = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: top + 14 }]}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.headerBtn}>
        <Ionicons name="chevron-back" size={22} color={colors.neutral900} />
      </Pressable>
      <Text style={styles.headerTitle}>Tổng quan đơn hàng</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: colors.neutral900,
    ...textPresets.fs16_600,
  },
  headerSpacer: { width: 44 },
}));
