import { Ionicons } from "@expo/vector-icons";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  type SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICON_SIZE = 20;

type CollapsibleHeaderProps = {
  title: string;
  scrollY: SharedValue<number>;
  scrollDistance?: number;
  rightContent?: React.ReactNode;
  showBack?: boolean;
  onBackPress?: () => void;
};

export function CollapsibleHeader({
  title,
  scrollY,
  scrollDistance,
  rightContent,
  showBack = false,
  onBackPress,
}: CollapsibleHeaderProps) {
  const { top } = useSafeAreaInsets();
  const { colors } = useThemes();

  const headerMaxHeight = top + 76;
  const headerMinHeight = top + 50;
  const collapseRange = scrollDistance ?? headerMaxHeight - headerMinHeight;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, collapseRange],
      [headerMaxHeight, headerMinHeight],
      "clamp",
    ),
  }));

  const blurAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, collapseRange], [0, 1], "clamp"),
  }));

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, collapseRange], [0, 1], "clamp"),
  }));

  const largeTitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, collapseRange * 0.8],
      [1, 0],
      "clamp",
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, collapseRange],
          [0, -10],
          "clamp",
        ),
      },
    ],
  }));

  const smallTitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [collapseRange * 0.4, collapseRange],
      [0, 1],
      "clamp",
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, collapseRange],
          [10, 0],
          "clamp",
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      {/* Translucent background */}
      <Animated.View style={[StyleSheet.absoluteFill, blurAnimatedStyle]}>
        <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* Fixed top back button */}
      {showBack && (
        <Pressable
          hitSlop={8}
          onPress={handleBack}
          style={[styles.backButton, { top }]}
        >
          <Ionicons
            name="chevron-back"
            size={ICON_SIZE}
            color={colors.neutral900}
          />
        </Pressable>
      )}

      {/* Fixed top small title */}
      <Animated.View
        pointerEvents="none"
        style={[styles.smallTitleContainer, { top }, smallTitleAnimatedStyle]}
      >
        <Text style={styles.smallTitle} numberOfLines={1}>
          {title}
        </Text>
      </Animated.View>

      {/* Content Row containing Large Title (left) and Right Content (right) */}
      <View style={styles.contentRow}>
        <Animated.View
          style={[styles.largeTitleContainer, largeTitleAnimatedStyle]}
        >
          <Text style={styles.largeTitle} numberOfLines={1}>
            {title}
          </Text>
        </Animated.View>

        {rightContent && (
          <View style={styles.rightContainer}>{rightContent}</View>
        )}
      </View>

      {/* Subtle bottom border line */}
      <Animated.View style={[styles.border, borderAnimatedStyle]} />
    </Animated.View>
  );
}

export function useCollapsibleHeaderHeight() {
  const { top } = useSafeAreaInsets();
  return top + 76;
}

const styles = createStyles(({ colors }) => ({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral50,
    zIndex: 20,
  },
  smallTitleContainer: {
    position: "absolute",
    left: 60,
    right: 60,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 15,
  },
  smallTitle: {
    color: colors.neutral900,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  contentRow: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  largeTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  largeTitle: {
    color: colors.neutral900,
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 0.41,
    lineHeight: 28,
  },
  rightContainer: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  border: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
}));
