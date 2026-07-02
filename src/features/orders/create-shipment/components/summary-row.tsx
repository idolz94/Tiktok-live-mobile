import { Text, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { shipmentStyles } from "./shipment-styles";

export function SummaryRow({ label, value }: { label: string; value: string }) {
  const { colors, textPresets } = useThemes();
  return (
    <View style={shipmentStyles.summaryRow}>
      <Text style={[textPresets.fs12_400, { color: colors.neutral500 }]}>
        {label}
      </Text>
      <Text style={[textPresets.fs14_500, { color: colors.neutral900 }]}>
        {value}
      </Text>
    </View>
  );
}

