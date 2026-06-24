import { Image, Text, TouchableOpacity, View } from "react-native";
import { icons } from "@assets/icons";
import { printerSettingsStyles as s } from "./printer-settings.styles";

type PrinterTemplateItem = {
  key: "live" | "shipment";
  label: string;
  onPress?: () => void;
};

const TEMPLATE_ITEMS: PrinterTemplateItem[] = [
  { key: "live", label: "Điều chỉnh mẫu in Live" },
  { key: "shipment", label: "Điều chỉnh mẫu in vận đơn (SHIP)" },
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
    <View style={s.templateList}>
      {items.map((item, index) => (
        <View key={item.key}>
          <TouchableOpacity
            style={s.templateRow}
            activeOpacity={0.75}
            onPress={item.onPress}
          >
            <View style={s.templateLeft}>
              <Image
                source={icons.settings}
                style={s.templateIcon}
                resizeMode="contain"
              />
              <Text style={s.templateText}>{item.label}</Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
          {index < items.length - 1 ? <View style={s.templateDivider} /> : null}
        </View>
      ))}
    </View>
  );
}
