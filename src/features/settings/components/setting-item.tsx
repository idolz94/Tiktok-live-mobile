import { createStyles } from "@utils/createStyles";
import { Pressable, Text, View } from "react-native";
import { Setting } from "../constants";

export function SettingItem({ icon, label, onPress }: Setting) {
  return (
    <Pressable
      style={styles.settingItem}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconBox}>
          <Text style={styles.settingIcon}>{icon}</Text>
        </View>
        <Text style={styles.settingText}>{label}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  settingItem: {
    minHeight: 48,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  settingIconBox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  settingIcon: {
    color: colors.neutral900,
    fontSize: 18,
    fontWeight: "600",
  },
  settingText: {
    flex: 1,
    color: colors.neutral900,
    lineHeight: 22,
    ...textPresets.fs14_400,
  },
  chevron: {
    color: colors.neutral900,
    fontSize: 28,
    lineHeight: 28,
    fontWeight: "300",
  },
}));
