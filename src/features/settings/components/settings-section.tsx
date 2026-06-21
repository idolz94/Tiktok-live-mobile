import { settingGroups, Setting } from "../constants";
import { SettingItem } from "./setting-item";
import { createStyles } from "@utils/createStyles";
import { Text, TouchableOpacity, View } from "react-native";

type SettingsSectionProps = {
  groups?: Setting[][];
  logoutLabel: string;
  onLogout: () => void;
};

export function SettingsSection({
  groups = settingGroups,
  logoutLabel,
  onLogout,
}: SettingsSectionProps) {
  return (
    <View style={styles.settingsContainer}>
      {groups.map((group, groupIndex) => (
        <View key={groupIndex} style={styles.settingsGroupWrap}>
          <View style={styles.settingsGroup}>
            {group.map((item) => (
              <SettingItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                onPress={item.onPress}
              />
            ))}
          </View>
          <View style={styles.divider} />
        </View>
      ))}
      <TouchableOpacity activeOpacity={0.7} style={styles.settingItem} onPress={onLogout}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIconBox}>
            <Text style={styles.settingIcon}>↗</Text>
          </View>
          <Text style={styles.settingText}>{logoutLabel}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  settingsContainer: {
    gap: 16,
  },
  settingsGroupWrap: {
    gap: 16,
  },
  settingsGroup: {
    gap: 0,
  },
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
  divider: {
    height: 0.5,
    backgroundColor: colors.border10,
  },
  chevron: {
    color: colors.neutral900,
    fontSize: 28,
    lineHeight: 28,
    fontWeight: "300",
  },
}));