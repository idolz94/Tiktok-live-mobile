import { createStyles } from "@utils/createStyles";
import { Text, View } from "react-native";

export const LiveStatusPill = ({
  isConnected,
  status,
}: {
  isConnected: boolean;
  status: string;
}) => {
  return (
    <View style={styles.pill}>
      <View style={[styles.dot, isConnected ? styles.dotOn : styles.dotOff]} />
      <Text
        numberOfLines={1}
        style={[styles.text, isConnected ? styles.textOn : styles.textOff]}
      >
        {status}
      </Text>
    </View>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  pill: {
    alignSelf: "center",
    maxWidth: "92%",
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: colors.dustyTealBg,
    flexDirection: "row",
    alignItems: "center",
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  dotOn: { backgroundColor: colors.success },
  dotOff: { backgroundColor: colors.danger },
  text: {
    flexShrink: 1,
    ...textPresets.fs14_800,
  },
  textOn: { color: colors.successText },
  textOff: { color: colors.dangerHeavy },
}));
