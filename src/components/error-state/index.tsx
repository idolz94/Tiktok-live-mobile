import { Ionicons } from "@expo/vector-icons";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Pressable, Text, View } from "react-native";

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message = "Đã có lỗi xảy ra", onRetry }: Props) {
  const { colors } = useThemes();

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.error} style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Thử lại"
        >
          <Text style={styles.buttonText}>Thử lại</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    color: colors.neutral500,
    ...textPresets.fs16_400,
    textAlign: "center",
  },
  button: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.neutral100,
    ...textPresets.fs14_500,
  },
}));
