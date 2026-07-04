import { Pressable, Text, View } from "react-native";
import type React from "react";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";

export type SectionBlockProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  actionNode?: React.ReactNode;
  children: React.ReactNode;
};

export function SectionBlock({
  title,
  actionLabel,
  onActionPress,
  actionNode,
  children,
}: SectionBlockProps) {
  const { colors, textPresets } = useThemes();
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeader}>
        <Text style={[{ color: colors.neutral900 }, textPresets.fs18_700]}>
          {title}
        </Text>
        {actionNode ?? (!!actionLabel && !!onActionPress && (
          <Pressable onPress={onActionPress} hitSlop={8}>
            <Text style={[{ color: colors.primary }, textPresets.fs14_500]}>
              {actionLabel}
            </Text>
          </Pressable>
        ))}
      </View>
      {children}
    </View>
  );
}

const styles = createStyles(() => ({
  sectionBlock: { paddingHorizontal: 16, paddingVertical: 20, gap: 16 },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
}));
