import { Text, TextInput, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";

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
    <View style={styles.moneyFieldWrap}>
      <Text style={[{ color: colors.neutral400 }, textPresets.fs14_400]}>
        {label}
      </Text>
      <View
        style={[
          styles.moneyField,
          { borderColor: colors.border10, backgroundColor: colors.neutral50 },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType="number-pad"
          style={[
            styles.moneyInput,
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

const styles = createStyles(() => ({
  moneyFieldWrap: { gap: 8 },
  moneyField: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  moneyInput: { flex: 1, padding: 0 },
}));
