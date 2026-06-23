import { Pressable, Text, View } from "react-native";
import { Icon } from "@components/icon";
import { createStyles } from "@utils/createStyles";

type OrderDetailHeaderProps = {
  onBack: () => void;
  onPrint: () => void;
  onMore: () => void;
};

export function OrderDetailHeader({ onBack, onPrint, onMore }: OrderDetailHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.headerBtn}>
        <Icon name="arrow_down" size={22} tintColor="neutral900" />
      </Pressable>
      <Text style={styles.headerTitle}>Tổng quan đơn hàng</Text>
      <View style={styles.headerActions}>
        <Pressable onPress={onPrint} hitSlop={12} style={styles.headerBtn}>
          <Icon name="print" size={20} tintColor="neutral900" />
        </Pressable>
        <Pressable onPress={onMore} hitSlop={12} style={styles.headerBtn}>
          <Icon name="more" size={20} tintColor="neutral900" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral100,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral50,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: colors.neutral900,
    ...textPresets.fs20_600,
  },
  headerActions: {
    width: 92,
    flexDirection: "row",
    justifyContent: "flex-end",
    columnGap: 4,
  },
}));
