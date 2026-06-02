import { createStyles } from "@utils/createStyles";
import { Text, TouchableOpacity, View } from "react-native";

export const SectionHeader = ({
  title,
  actionText,
  onAction,
}: {
  title: string;
  actionText?: string;
  onAction?: () => void;
}) => {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionText ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.action}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  row: {
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { color: colors.text, ...textPresets.fs22_900 },
  action: { color: colors.danger, ...textPresets.fs16_900 },
}));
