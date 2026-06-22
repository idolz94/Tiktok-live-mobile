import { Ionicons } from "@expo/vector-icons";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { router } from "expo-router";
import { memo, type ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

type HeaderProps = {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightIcon?: IconName;
  onRightPress?: () => void;
};

const ICON_SIZE = 20;
const BUTTON_SIZE = 40;

export const Header = memo(
  ({
    title,
    showBack = true,
    onBackPress,
    rightIcon,
    onRightPress,
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
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.row}>
          <View style={styles.side}>
            {showBack && (
              <Pressable
                hitSlop={8}
                onPress={handleBack}
                style={({ pressed }) => [
                  styles.iconButton,
                  // pressed && styles.iconButtonPressed,
                ]}
              >
                <Ionicons
                  name="chevron-back"
                  size={ICON_SIZE}
                  color={colors.neutral900}
                />
              </Pressable>
            )}
          </View>

          <View style={styles.center} pointerEvents="none">
            {!!title && (
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            )}
          </View>

          <View style={[styles.side, styles.sideRight]}>
            {!!rightIcon && (
              <Pressable
                hitSlop={8}
                onPress={onRightPress}
                style={({ pressed }) => [
                  styles.iconButton,
                  // pressed && styles.iconButtonPressed,
                ]}
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
      </View>
    );
  },
);

Header.displayName = "Header";

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    backgroundColor: colors.neutral100,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: colors.neutral300,
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
    ...textPresets.fs16_600,
    color: colors.neutral900,
    maxWidth: "60%",
  },
  iconButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral50,
  },
  // iconButtonPressed: {
  //   backgroundColor: colors.neutral300,
  // },
}));
