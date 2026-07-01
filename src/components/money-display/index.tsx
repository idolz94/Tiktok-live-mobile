import { formatMoney } from "@features/orders/utils/order";
import { useThemes } from "@hooks/use-theme";
import { Text, TextStyle } from "react-native";

type Size = "sm" | "md" | "lg";

type Props = {
  value: number;
  style?: TextStyle;
  size?: Size;
  color?: string;
};

export function MoneyDisplay({ value, style, size = "md", color }: Props) {
  const { colors, textPresets } = useThemes();

  const sizeStyle: TextStyle =
    size === "sm" ? textPresets.fs12_400
    : size === "lg" ? textPresets.fs16_600
    : textPresets.fs14_500;

  return (
    <Text
      style={[sizeStyle, { color: color ?? colors.neutral900 }, style]}
      numberOfLines={1}
    >
      {formatMoney(value)}
    </Text>
  );
}
