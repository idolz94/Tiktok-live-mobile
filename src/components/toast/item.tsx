import { Ionicons } from "@expo/vector-icons";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  AppState,
  LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { ToastData } from "./type";

interface ToastItemProps {
  toast: ToastData;
  index: number;
  visibleIds: string[];
  toastHeights: SharedValue<Record<string, number>>;
  onDismiss: (id: string) => void;
  onRemove: (id: string) => void;
}

export const ToastItem = React.memo(function ToastItem({
  toast,
  index,
  visibleIds,
  toastHeights,
  onDismiss,
  onRemove,
}: ToastItemProps) {
  const {
    id,
    title,
    description,
    variant,
    duration,
    placement,
    icon,
    action,
    persistent,
    visible,
  } = toast;

  const { colors, shadows } = useThemes();

  // Animations shared values
  const translateX = useSharedValue(0);
  const localHeight = useSharedValue(0);
  const progress = useSharedValue(0); // 0 = fully hidden, 1 = fully shown

  // Reduced motion support
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotionEnabled);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotionEnabled,
    );
    return () => {
      if (subscription && typeof subscription.remove === "function") {
        subscription.remove();
      }
    };
  }, []);

  // Timeouts & Pause/Resume timers
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef<number | null>(null);
  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissSelf = useCallback(() => {
    onDismiss(id);
  }, [id, onDismiss]);

  const startTimer = useCallback(() => {
    if (persistent || duration <= 0) return;
    startTimeRef.current = Date.now();
    timerIdRef.current = setTimeout(() => {
      dismissSelf();
    }, remainingTimeRef.current);
  }, [persistent, duration, dismissSelf]);

  const pauseTimer = useCallback(() => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    if (startTimeRef.current !== null) {
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(
        0,
        remainingTimeRef.current - elapsed,
      );
    }
  }, []);

  const resumeTimer = useCallback(() => {
    if (persistent || remainingTimeRef.current <= 0) return;
    startTimer();
  }, [persistent, startTimer]);

  // Restart timer if duration or persistence changes (e.g. after updating from loading state)
  useEffect(() => {
    remainingTimeRef.current = duration;
    startTimeRef.current = null;
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }

    if (visible) {
      startTimer();
    }

    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
    };
  }, [duration, persistent, visible, startTimer]);

  // AppState listening to pause/resume timer
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        resumeTimer();
      } else {
        pauseTimer();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [pauseTimer, resumeTimer]);

  // Measure content height and sync to container
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      if (height > 0) {
        if (localHeight.value === 0) {
          localHeight.value = height;
        } else if (localHeight.value !== height) {
          localHeight.value = reduceMotionEnabled
            ? height
            : withSpring(height, { damping: 15, stiffness: 120 });
        }
      }
    },
    [localHeight, reduceMotionEnabled],
  );

  // Sync our local height changes to the container's toastHeights map
  useAnimatedReaction(
    () => localHeight.value,
    (current) => {
      toastHeights.value = {
        ...toastHeights.value,
        [id]: current,
      };
    },
  );

  // Handle visibility state changes (Entrance and Exit)
  useEffect(() => {
    if (!visible) {
      // Exit animation
      progress.value = withTiming(0, { duration: 120 }, (finished) => {
        if (finished) {
          runOnJS(onRemove)(id);
        }
      });
      localHeight.value = withTiming(0, { duration: 120 });
    } else {
      // Entrance animation
      progress.value = withTiming(1, { duration: 100 });
    }
  }, [visible, id, onRemove, progress, localHeight, reduceMotionEnabled]);

  // Swipe to dismiss gestures
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Don't intercept vertical scrolling
    .onBegin(() => {
      runOnJS(pauseTimer)();
    })
    .onUpdate((event: any) => {
      translateX.value = event.translationX;
    })
    .onEnd((event: any) => {
      const threshold = 120;
      const velocityThreshold = 200;

      if (
        Math.abs(event.translationX) > threshold ||
        Math.abs(event.velocityX) > velocityThreshold
      ) {
        const direction = Math.sign(event.translationX);
        const target = direction * 200; // Fly off screen horizontally

        translateX.value = withTiming(target, { duration: 150 }, (finished) => {
          if (finished) {
            runOnJS(dismissSelf)();
          }
        });
      } else {
        // Snap back to center
        translateX.value = withTiming(0, { duration: 100 });
        runOnJS(resumeTimer)();
      }
    });

  // Calculate coordinates & animations style
  const animatedStyle = useAnimatedStyle(() => {
    const idx = visibleIds.indexOf(id);
    if (idx === -1) {
      return { opacity: 0 };
    }

    // Stack configuration: newest at index 0 is fully visible.
    // Older ones are scaled down and shifted slightly towards the edge.
    const targetScale = reduceMotionEnabled
      ? 1
      : Math.max(0.85, 1 - idx * 0.05);
    const targetOpacity =
      idx === 0 ? progress.value : Math.max(0, progress.value - idx * 0.25);
    const targetY = placement.startsWith("top") ? idx * -8 : idx * 8;

    const baseSlide = placement.startsWith("top") ? -40 : 40;
    const slideOffset = (1 - progress.value) * baseSlide;

    return {
      opacity: targetOpacity,
      transform: [
        { translateX: translateX.value },
        { translateY: withTiming(targetY + slideOffset, { duration: 150 }) },
        { scale: withTiming(targetScale, { duration: 150 }) },
      ],
    };
  });

  // Render variant-specific icons
  const renderIcon = () => {
    if (icon) {
      if (typeof icon === "string") {
        return <Ionicons name={icon as any} size={22} color={getIconColor()} />;
      }
      return icon;
    }

    switch (variant) {
      case "success":
        return (
          <Ionicons name="checkmark-circle" size={22} color={colors.success} />
        );
      case "error":
        return <Ionicons name="close-circle" size={22} color={colors.error} />;
      case "warning":
        return <Ionicons name="warning" size={22} color={colors.warning} />;
      case "info":
        return (
          <Ionicons name="information-circle" size={22} color={colors.info} />
        );
      case "loading":
        return <ActivityIndicator size="small" color={colors.primary} />;
      default:
        return null;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "success":
        return colors.success;
      case "error":
        return colors.error;
      case "warning":
        return colors.warning;
      case "info":
        return colors.info;
      default:
        return colors.text;
    }
  };

  const horizontalStyle = React.useMemo(() => {
    if (
      placement === "top" ||
      placement === "bottom" ||
      placement === "center"
    ) {
      return { left: 16, right: 16, width: undefined };
    }
    if (placement.endsWith("left")) {
      return { left: 0, right: undefined, width: 340 };
    }
    return { right: 0, left: undefined, width: 340 };
  }, [placement]);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        onLayout={handleLayout}
        style={[
          styles.container,
          horizontalStyle,
          shadows.sd3,
          animatedStyle,
          {
            borderColor: colors.borderLight,
            zIndex: 100 - index,
          },
        ]}
        accessibilityRole={(toast.accessibilityRole as any) || "alert"}
        accessibilityLiveRegion="polite"
      >
        <View style={styles.contentRow}>
          {/* Icon */}
          <View style={styles.iconContainer}>{renderIcon()}</View>

          {/* Text Contents */}
          <View style={styles.textContainer}>
            {typeof title === "string" ? (
              <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={2}
              >
                {title}
              </Text>
            ) : (
              title
            )}
            {description && (
              <View style={styles.descWrapper}>
                {typeof description === "string" ? (
                  <Text
                    style={[styles.description, { color: colors.textMuted }]}
                    numberOfLines={3}
                  >
                    {description}
                  </Text>
                ) : (
                  description
                )}
              </View>
            )}
          </View>

          {/* Action button */}
          {action && (
            <Pressable
              onPress={() => {
                if (action.callback) {
                  action.callback(id);
                }
                if (action.closeOnPress !== false) {
                  dismissSelf();
                }
              }}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={[styles.actionLabel, { color: colors.primary }]}>
                {action.label}
              </Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = createStyles(({ textPresets }) => ({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 52,
    justifyContent: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    ...textPresets.fs14_500,
    lineHeight: 18,
  },
  descWrapper: {
    marginTop: 2,
  },
  description: {
    ...textPresets.fs12_400,
    lineHeight: 16,
  },
  actionButton: {
    paddingLeft: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    ...textPresets.fs14_500,
  },
}));
