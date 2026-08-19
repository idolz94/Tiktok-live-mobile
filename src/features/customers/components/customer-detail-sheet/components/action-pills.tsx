import { Pressable, Text } from "react-native";
import { createStyles } from "@utils/createStyles";
import { memo } from "react";

export const ActionPill = memo(({ label, onPress, icon, tone }: {
  label: string;
  onPress: () => void;
  icon: React.ReactNode;
  tone: "TikTok" | "Zalo" | "Phone";
}) => (
  <Pressable onPress={onPress} style={[styles.actionPill, styles[`btn${tone}`]]}>
    {icon}
    <Text style={[styles.actionPillText, styles[`btn${tone}Text`]]}>{label}</Text>
  </Pressable>
));
ActionPill.displayName = "ActionPill";

export const ActionIcons = {} as const;

const styles = createStyles(({ textPresets }) => ({
  actionPill: { flex: 1, height: 32, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", columnGap: 6, paddingHorizontal: 10, paddingVertical: 6 },
  btnTikTok: { backgroundColor: "rgba(0,0,0,0.08)" },
  btnZalo: { backgroundColor: "rgba(0,106,255,0.1)" },
  btnPhone: { backgroundColor: "rgba(82,196,26,0.1)" },
  actionPillText: { ...textPresets.fs12_500 },
  btnTikTokText: { color: "#000000" },
  btnZaloText: { color: "#006aff" },
  btnPhoneText: { color: "#52c41a" },
}));
