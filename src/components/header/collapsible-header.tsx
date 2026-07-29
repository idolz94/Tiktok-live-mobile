import { createStyles } from "@utils/createStyles";
import { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  type SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DEFAULT_SCROLL_DISTANCE = 80;

type CollapsibleHeaderProps = {
  title: string;
  scrollY: SharedValue<number>;
  scrollDistance?: number;
  rightContent?: React.ReactNode;
};

export function CollapsibleHeader({
  title,
  scrollY,
  scrollDistance = DEFAULT_SCROLL_DISTANCE,
  rightContent,
}: CollapsibleHeaderProps) {
  const { top } = useSafeAreaInsets();
  const [titleWidth, setTitleWidth] = useState(130);

  const headerMaxHeight = top + 76;
  const headerMinHeight = top + 50;

  const onTitleLayout = useCallback((e: LayoutChangeEvent) => {
    setTitleWidth(e.nativeEvent.layout.width);
  }, []);

  const centerTranslateX = useMemo(() => {
    return SCREEN_WIDTH / 2 - 16 - titleWidth / 2;
  }, [titleWidth]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, scrollDistance],
      [headerMaxHeight, headerMinHeight],
      "clamp",
    ),
  }));

  const blurAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, scrollDistance], [0, 1], "clamp"),
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const transX = interpolate(
      scrollY.value,
      [0, scrollDistance],
      [0, centerTranslateX],
      "clamp",
    );
    const scale = interpolate(
      scrollY.value,
      [0, scrollDistance],
      [1, 0.8],
      "clamp",
    );
    return {
      transform: [{ translateX: transX }, { scale }],
    };
  });

  return (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      <Animated.View style={[StyleSheet.absoluteFill, blurAnimatedStyle]}>
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
      </Animated.View>
      <Animated.View
        onLayout={onTitleLayout}
        style={[styles.titleContainer, titleAnimatedStyle]}
      >
        <Text style={styles.title}>{title}</Text>
      </Animated.View>
      {rightContent && (
        <View style={styles.rightContainer}>{rightContent}</View>
      )}
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
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  titleContainer: {
    position: "absolute",
    left: 16,
    bottom: 12,
  },
  title: {
    color: colors.neutral900,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 28,
  },
  rightContainer: {
    position: "absolute",
    right: 16,
    bottom: 12,
  },
}));
