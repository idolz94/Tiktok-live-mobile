import { Pressable, Text, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { shipmentStyles } from "./shipment-styles";

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
        shipmentStyles.optionChip,
        {
          borderColor: selected ? colors.primary : colors.border10,
          backgroundColor: selected ? colors.primaryLight : colors.surface,
        },
      ]}
    >
      <View
        style={[
          shipmentStyles.optionDot,
          { borderColor: selected ? colors.primary : colors.border20 },
        ]}
      >
        {selected && (
          <View
            style={[
              shipmentStyles.optionDotInner,
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

