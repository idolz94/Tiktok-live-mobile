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
  /** Suppresses built-in paddingHorizontal when the parent already provides it */
  noPaddingHorizontal?: boolean;
};

export function SectionBlock({
  title,
  actionLabel,
  onActionPress,
  actionNode,
  children,
  noPaddingHorizontal,
}: SectionBlockProps) {
  const { colors, textPresets } = useThemes();
  return (
    <View style={[styles.sectionBlock, noPaddingHorizontal && styles.sectionBlockNoPadH]}>
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
  // ponytail: used when parent (e.g. scrollContent with padding:16) already provides horizontal padding
  sectionBlockNoPadH: { paddingHorizontal: 0 },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
}));
