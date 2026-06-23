import { Pressable, Text, View } from "react-native";
import { Icon } from "@components/icon";
import { createStyles } from "@utils/createStyles";

type OrderDetailShipBarProps = {
  onShip: () => void;
};

export function OrderDetailShipBar({ onShip }: OrderDetailShipBarProps) {
  return (
    <View style={styles.bottomBar}>
      <Pressable style={styles.shipBtn} onPress={onShip}>
        <Icon name="truck" size={20} tintColor="neutral100" />
        <Text style={styles.shipBtnText}>Ship</Text>
      </Pressable>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral100,
    borderTopWidth: 1,
    borderTopColor: colors.border10,
  },
  shipBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 8,
    paddingVertical: 14,
    borderRadius: 40,
    backgroundColor: colors.primary,
  },
  shipBtnText: { color: colors.neutral100, ...textPresets.fs16_600 },
}));
