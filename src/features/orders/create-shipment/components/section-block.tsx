import { Pressable, Text, View } from "react-native";
import type React from "react";
import { useThemes } from "@hooks/use-theme";
import { shipmentStyles } from "./shipment-styles";

export type SectionBlockProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  children: React.ReactNode;
};

export function SectionBlock({
  title,
  actionLabel,
  onActionPress,
  children,
}: SectionBlockProps) {
  const { colors, textPresets } = useThemes();
  return (
    <View style={shipmentStyles.sectionBlock}>
      <View style={shipmentStyles.sectionHeader}>
        <Text style={[{ color: colors.neutral900 }, textPresets.fs18_700]}>
          {title}
        </Text>
        {!!actionLabel && !!onActionPress && (
          <Pressable onPress={onActionPress} hitSlop={8}>
            <Text style={[{ color: colors.primary }, textPresets.fs14_500]}>
              {actionLabel}
            </Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

