import { useEffect, useMemo, useState, ReactNode } from "react";
import {
  Keyboard,
  LayoutChangeEvent,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { PopoverEntry } from "./types";
import { computePosition } from "./positioning";
import { measureAnchorRef } from "./hooks/use-anchor-measure";
import { DEFAULT_OFFSET, DEFAULT_SCREEN_PADDING, DEFAULT_ARROW_SIZE } from "./constants";

interface FloatingContainerProps {
  entry: PopoverEntry;
  contentOverride?: ReactNode;
  onClose: () => void;
  onExitComplete: () => void;
}

export function FloatingContainer({ entry, contentOverride, onClose, onExitComplete }: FloatingContainerProps) {
  const { colors } = useThemes();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [anchorRect, setAnchorRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [contentSize, setContentSize] = useState<{ width: number; height: number } | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Measure anchor position on mount and whenever window dimensions change
  const measureAnchor = () => {
    measureAnchorRef(entry.anchorRef)
      .then((rect) => {
        setAnchorRect(rect);
      })
      .catch((_err) => {
        // Safe fail: if ref is not measured yet, try again after a small frame
        requestAnimationFrame(() => {
          measureAnchorRef(entry.anchorRef)
            .then(setAnchorRect)
            .catch(() => {});
        });
      });
  };

  useEffect(() => {
    measureAnchor();
  }, [entry.anchorRef, windowWidth, windowHeight]);

  // Listen to keyboard show/hide to adjust viewport height
  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      measureAnchor();
    });
    const hideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
      measureAnchor();
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setContentSize({ width, height });
    }
  };

  // Compute position once anchor layout and content dimensions are available
  const position = useMemo(() => {
    if (!anchorRect || !contentSize) return null;
    return computePosition({
      anchor: anchorRect,
      contentSize,
      viewport: {
        width: windowWidth,
        height: windowHeight - keyboardHeight,
      },
      insets,
      placement: entry.placement ?? "auto",
      offset: entry.offset ?? DEFAULT_OFFSET,
      padding: DEFAULT_SCREEN_PADDING,
      arrowSize: entry.arrowSize ?? DEFAULT_ARROW_SIZE,
    });
  }, [anchorRect, contentSize, windowWidth, windowHeight, keyboardHeight, insets, entry]);

  // Reanimated values for animations
  const animOpacity = useSharedValue(0);
  const animScale = useSharedValue(0.85);

  const duration = entry.animationDuration ?? 150;

  // Manage animations based on open state
  useEffect(() => {
    if (position && entry.open) {
      animOpacity.value = withTiming(1, { duration });
      animScale.value = withSpring(1, {
        damping: 18,
        stiffness: 350,
        mass: 0.8,
      });
    } else if (!entry.open) {
      animOpacity.value = withTiming(0, { duration: duration * 0.8 }, (finished) => {
        if (finished) {
          runOnJS(onExitComplete)();
        }
      });
      animScale.value = withTiming(0.85, { duration: duration * 0.8 });
    }
  }, [position, entry.open, duration]);

  // Animated styles for popover container
  const popoverAnimatedStyle = useAnimatedStyle(() => {
    if (!position || !contentSize) {
      // Invisible, but absolute rendering offscreen to measure layout dimensions
      return {
        position: "absolute",
        left: -9999,
        top: -9999,
        opacity: 0,
      };
    }

    const transform: any[] = [{ scale: animScale.value }];

    // Transform origin based on placement — scale from the anchor side
    let transformOrigin: string = "center center";
    if (position.placement === "top") {
      transformOrigin = "center bottom";
    } else if (position.placement === "bottom") {
      transformOrigin = "center top";
    } else if (position.placement === "left") {
      transformOrigin = "right center";
    } else if (position.placement === "right") {
      transformOrigin = "left center";
    }

    return {
      position: "absolute",
      left: position.x,
      top: position.y,
      width: contentSize.width,
      height: contentSize.height,
      opacity: animOpacity.value,
      transform,
      transformOrigin,
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animOpacity.value,
    };
  });

  const arrowSize = entry.arrowSize ?? DEFAULT_ARROW_SIZE;
  const showArrow = entry.showArrow !== false;

  const arrowStyle = useMemo(() => {
    if (!position) return null;

    // A rotated square creates the triangle pointing out
    const baseStyle = {
      position: "absolute" as const,
      width: arrowSize,
      height: arrowSize,
      backgroundColor: colors.neutral100,
      transform: [{ rotate: "45deg" }],
      zIndex: -1, // Render behind the popover border/content
    };

    if (position.placement === "top" || position.placement === "bottom") {
      return {
        ...baseStyle,
        left: position.arrowX,
        top: position.arrowY,
      };
    } else {
      return {
        ...baseStyle,
        left: position.arrowX,
        top: position.arrowY,
      };
    }
  }, [position, arrowSize, colors]);

  const renderBackdrop = () => {
    const isDismissible = entry.closeOnOutsidePress !== false;
    const isVisibleBackdrop = entry.showBackdrop !== false;

    if (!isDismissible && !isVisibleBackdrop) return null;

    return (
      <Animated.View
        style={[
          styles.backdrop,
          isVisibleBackdrop ? styles.backdropVisible : styles.backdropTransparent,
          entry.backdropStyle,
          backdropAnimatedStyle,
        ]}
      >
        <Pressable
          style={styles.backdropPressable}
          onPress={isDismissible ? onClose : undefined}
          importantForAccessibility="no"
          accessibilityElementsHidden={true}
        />
      </Animated.View>
    );
  };

  return (
    <>
      {renderBackdrop()}
      <Animated.View
        style={[styles.popoverContainer, entry.contentStyle, popoverAnimatedStyle]}
        onLayout={contentSize ? undefined : handleLayout}
        accessibilityRole="menu"
      >
        {contentOverride ?? entry.content}
        {showArrow && position && arrowStyle && <View style={arrowStyle} />}
      </Animated.View>
    </>
  );
}

const styles = createStyles(({ colors, shadows }) => ({
  backdrop: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  backdropVisible: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  backdropTransparent: {
    backgroundColor: "transparent",
  },
  backdropPressable: {
    flex: 1,
  },
  popoverContainer: {
    zIndex: 1000,
    backgroundColor: colors.neutral100,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    padding: 4,
    minWidth: 40,
    ...shadows.sd4,
  },
}));
