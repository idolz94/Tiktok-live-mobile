import { Ionicons } from "@expo/vector-icons";
import { images, ImageTypes } from "@assets/images";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Image, Pressable, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  image?: ImageTypes;
  icon?: keyof typeof Ionicons.glyphMap;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ title, subtitle, image, icon, action }: Props) {
  const { colors } = useThemes();

  return (
    <View style={styles.container}>
      {image ? (
        <Image source={images[image]} style={styles.image} resizeMode="contain" />
      ) : icon ? (
        <Ionicons name={icon} size={48} color={colors.neutral300} style={styles.icon} />
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && (
        <Pressable
          style={[styles.button, { borderColor: colors.primary }]}
          onPress={action.onPress}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>{action.label}</Text>
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
  image: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    color: colors.neutral500,
    ...textPresets.fs16_500,
    textAlign: "center",
  },
  subtitle: {
    color: colors.neutral300,
    ...textPresets.fs14_400,
    textAlign: "center",
    marginTop: 8,
  },
  button: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonText: {
    ...textPresets.fs14_500,
  },
}));
