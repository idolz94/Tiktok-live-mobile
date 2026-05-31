import { TopTab } from "@types";
import { createStyles } from "@utils/createStyles";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const TopSegmentTabs = ({
  activeTab,
  onChange,
}: {
  activeTab: TopTab;
  onChange: (tab: TopTab) => void;
}) => {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "connect" && styles.active]}
        onPress={() => onChange("connect")}
      >
        <Text
          style={[styles.text, activeTab === "connect" && styles.activeText]}
        >
          KẾT NỐI LIVE
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "history" && styles.active]}
        onPress={() => onChange("history")}
      >
        <Text
          style={[styles.text, activeTab === "history" && styles.activeText]}
        >
          LỊCH SỬ
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  wrapper: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: colors.background,
  },
  tab: {
    flex: 1,
    minHeight: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  active: { backgroundColor: colors.white },
  text: { ...textPresets.fs16_900, color: colors.textMuted },
  activeText: { color: colors.text },
}));
