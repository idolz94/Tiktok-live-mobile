import { Pressable, Text, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";

type OptionChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function OptionChip({ label, selected, onPress }: OptionChipProps) {
  const { colors, textPresets } = useThemes();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.optionChip,
        {
          borderColor: selected ? colors.primary : colors.border10,
          backgroundColor: selected ? colors.primaryLight : colors.surface,
        },
      ]}
    >
      <View
        style={[
          styles.optionDot,
          { borderColor: selected ? colors.primary : colors.border20 },
        ]}
      >
        {selected && (
          <View
            style={[
              styles.optionDotInner,
              { backgroundColor: colors.primary },
            ]}
          />
        )}
      </View>
      <Text style={[{ color: colors.neutral900 }, textPresets.fs14_400]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = createStyles(() => ({
  optionChip: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  optionDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  optionDotInner: { width: 8, height: 8, borderRadius: 4 },
}));
