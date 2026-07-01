import { Image, Pressable, Text, View } from "react-native";
import { createStyles } from "@utils/createStyles";
import { icons } from "@assets/icons";

const TEMPLATE_ITEMS = [
  { key: "live" as const, label: "Điều chỉnh mẫu in Live" },
  { key: "shipment" as const, label: "Điều chỉnh mẫu in vận đơn (SHIP)" },
];

type PrinterTemplateListProps = {
  onPressLiveTemplate?: () => void;
  onPressShipmentTemplate?: () => void;
};

export function PrinterTemplateList({
  onPressLiveTemplate,
  onPressShipmentTemplate,
}: PrinterTemplateListProps) {
  const items = TEMPLATE_ITEMS.map((item) => ({
    ...item,
    onPress: item.key === "live" ? onPressLiveTemplate : onPressShipmentTemplate,
  }));

  return (
    <View style={styles.templateList}>
      {items.map((item, index) => (
        <View key={item.key}>
          <Pressable
            style={styles.templateRow}
            onPress={item.onPress}
          >
            <View style={styles.templateLeft}>
              <Image
                source={icons.settings}
                style={styles.templateIcon}
                resizeMode="contain"
              />
              <Text style={styles.templateText}>{item.label}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          {index < items.length - 1 ? <View style={styles.templateDivider} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = createStyles(({ colors }) => ({
  templateList: { gap: 0 },
  templateRow: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  templateLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  templateIcon: { width: 24, height: 24, tintColor: colors.neutral900 },
  templateText: { flex: 1, color: colors.neutral900, fontSize: 14, lineHeight: 22 },
  templateDivider: {
    height: 0.5,
    backgroundColor: colors.border10,
    marginVertical: 16,
  },
  chevron: {
    color: colors.neutral900,
    fontSize: 24,
    lineHeight: 24,
    transform: [{ rotate: "180deg" }],
  },
}));
