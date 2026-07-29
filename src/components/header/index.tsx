import { Ionicons } from "@expo/vector-icons";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { router } from "expo-router";
import { memo, type ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

type HeaderProps = {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightIcon?: IconName;
  onRightPress?: () => void;
  /** Bỏ nền để lộ gradient phía dưới (dùng cho màn có LinearGradient nền). */
  transparent?: boolean;
};

const ICON_SIZE = 20;
const BUTTON_SIZE = 44;

export const Header = memo(
  ({
    title,
    showBack = true,
    onBackPress,
    rightIcon,
    onRightPress,
    transparent = false,
  }: HeaderProps) => {
    const insets = useSafeAreaInsets();
    const { colors } = useThemes();

    const handleBack = () => {
      if (onBackPress) {
        onBackPress();
        return;
      }
      if (router.canGoBack()) {
        router.back();
      }
    };

    return (
      <View
        style={[
          styles.container,
          transparent && styles.containerTransparent,
          { paddingTop: insets.top },
        ]}
      >
        <View style={styles.row}>
          {showBack && (
            <Pressable
              hitSlop={8}
              onPress={handleBack}
              style={[styles.iconButton]}
            >
              <Ionicons
                name="chevron-back"
                size={ICON_SIZE}
                color={colors.neutral900}
              />
            </Pressable>
          )}

          <View style={styles.center} pointerEvents="none">
            {!!title && (
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            )}
          </View>

          {!!rightIcon && (
            <Pressable
              hitSlop={8}
              onPress={onRightPress}
              style={[styles.iconButton]}
            >
              <Ionicons
                name={rightIcon}
                size={ICON_SIZE}
                color={colors.neutral900}
              />
            </Pressable>
          )}
        </View>
      </View>
    );
  },
);

Header.displayName = "Header";

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    backgroundColor: colors.neutral100,
    paddingBottom: 16,
  },
  containerTransparent: {
    backgroundColor: "transparent",
  },
  row: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  side: {
    width: BUTTON_SIZE,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideRight: {
    alignItems: "flex-end",
  },
  center: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...textPresets.fs18_500,
    lineHeight: 24,
    color: colors.neutral900,
  },
  iconButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral50,
  },
  iconButtonTransparent: {
    backgroundColor: "transparent",
  },
}));
