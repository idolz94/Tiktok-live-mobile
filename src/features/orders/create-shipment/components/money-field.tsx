import { Text, TextInput, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { shipmentStyles } from "./shipment-styles";

type MoneyFieldProps = {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
};

export function MoneyField({
  label,
  value,
  onChangeText,
  editable = true,
}: MoneyFieldProps) {
  const { colors, textPresets } = useThemes();
  return (
    <View style={shipmentStyles.moneyFieldWrap}>
      <Text style={[{ color: colors.neutral400 }, textPresets.fs14_400]}>
        {label}
      </Text>
      <View
        style={[
          shipmentStyles.moneyField,
          { borderColor: colors.border10, backgroundColor: colors.neutral50 },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType="number-pad"
          style={[
            shipmentStyles.moneyInput,
            { color: colors.neutral900 },
            textPresets.fs16_500,
          ]}
          placeholder="0"
          placeholderTextColor={colors.neutral300}
        />
        <Text style={[{ color: colors.neutral400 }, textPresets.fs14_500]}>
          VNĐ
        </Text>
      </View>
    </View>
  );
}

