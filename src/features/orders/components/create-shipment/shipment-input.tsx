import { Text, TextInput, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";

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
      style={[styles.formGroup, topSpacing ? { marginTop: 8 } : null]}
    >
      <Text style={[styles.fieldLabel, { color: colors.neutral400 }]}>
        {label}
        {required ? <Text style={{ color: colors.error }}> *</Text> : null}
      </Text>
      {money ? (
        <View
          style={[
            styles.moneyInputRow,
            { borderColor: colors.border10, backgroundColor: colors.neutral50 },
          ]}
        >
          <TextInput
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            style={[
              styles.moneyInputInner,
              { color: colors.neutral900 },
              textPresets.fs14_400,
            ]}
            placeholder={placeholder}
            placeholderTextColor={colors.neutral300}
          />
          <View
            style={[
              styles.moneyInputSuffix,
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
            multiline ? styles.noteInput : styles.textInput,
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

const styles = createStyles(() => ({
  noteInput: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: "top" as const,
  },
  formGroup: { gap: 6 },
  fieldLabel: { fontSize: 12, lineHeight: 18 },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  moneyInputRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden" as const,
  },
  moneyInputInner: { flex: 1, paddingHorizontal: 14, height: "100%" as const },
  moneyInputSuffix: {
    paddingHorizontal: 12,
    height: "100%" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderLeftWidth: 1,
  },
}));
