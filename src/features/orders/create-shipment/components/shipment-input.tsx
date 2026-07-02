import { Text, TextInput, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { shipmentStyles } from "./shipment-styles";

type ShipmentInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
  topSpacing?: boolean;
  required?: boolean;
  money?: boolean;
};

export function ShipmentInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  topSpacing,
  required,
  money,
}: ShipmentInputProps) {
  const { colors, textPresets } = useThemes();
  return (
    <View
      style={[shipmentStyles.formGroup, topSpacing ? { marginTop: 8 } : null]}
    >
      <Text style={[shipmentStyles.fieldLabel, { color: colors.neutral400 }]}>
        {label}
        {required ? <Text style={{ color: colors.error }}> *</Text> : null}
      </Text>
      {money ? (
        <View
          style={[
            shipmentStyles.moneyInputRow,
            { borderColor: colors.border10, backgroundColor: colors.neutral50 },
          ]}
        >
          <TextInput
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            style={[
              shipmentStyles.moneyInputInner,
              { color: colors.neutral900 },
              textPresets.fs14_400,
            ]}
            placeholder={placeholder}
            placeholderTextColor={colors.neutral300}
          />
          <View
            style={[
              shipmentStyles.moneyInputSuffix,
              { borderLeftColor: colors.border10 },
            ]}
          >
            <Text style={[textPresets.fs12_500, { color: colors.neutral400 }]}>
              VNĐ
            </Text>
          </View>
        </View>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          style={[
            multiline ? shipmentStyles.noteInput : shipmentStyles.textInput,
            {
              borderColor: colors.border10,
              color: colors.neutral900,
              backgroundColor: colors.neutral50,
            },
            textPresets.fs14_400,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral300}
        />
      )}
    </View>
  );
}

