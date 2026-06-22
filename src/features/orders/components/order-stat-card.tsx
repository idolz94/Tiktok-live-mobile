import { OrderFilter } from "@app-types/index";
import { Lottie } from "@assets/lotties";
import { HairlineWidth } from "@themes/index";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { OrderStatCardData } from "../types/order";

export const OrderStatCard = memo(
  ({
    lottie,
    value,
    label,
    filterKey,
    isActive,
    bgColor,
    onPressCard,
  }: OrderStatCardData & {
    isActive: boolean;
    onPressCard: (filterKey: OrderFilter) => void;
  }) => {
    const handlePress = useCallback(() => {
      onPressCard(filterKey);
    }, [onPressCard, filterKey]);

    return (
      <Pressable
        style={[
          styles.infoCard,
          {
            backgroundColor: bgColor,
            borderColor: isActive ? "red" : "transparent",
          },
        ]}
        onPress={handlePress}
      >
        <Lottie name={lottie} style={styles.infoCardIcon} focused={isActive} />
        <View style={styles.infoCardTextGroup}>
          <Text style={styles.valueCount}>{value}</Text>
          <Text style={styles.txtCardFlag}>{label}</Text>
        </View>
      </Pressable>
    );
  },
);

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  infoCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    columnGap: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: HairlineWidth * 3,
    borderColor: colors.border10,
    overflow: "hidden",
    ...shadows.sd1,
  },
  infoCardIcon: {
    width: 32,
    height: 32,
  },
  infoCardTextGroup: {
    rowGap: 4,
  },
  valueCount: {
    color: colors.neutral900,
    ...textPresets.fs20_600,
  },
  txtCardFlag: {
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
}));
