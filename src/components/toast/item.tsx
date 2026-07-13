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

// ponytail: variant config table — icon char + pill color per variant
const VARIANT_CONFIG: Record<
  string,
  { char: string; color: string }
> = {
  success: { char: "✓", color: "#2ca87b" },
  error:   { char: "✕", color: "#ff4242" },
  warning: { char: "!",  color: "#ffa800" },
  info:    { char: "i",  color: "#468adf" },
  loading: { char: "",   color: "#ff6b8a" },
};

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

  const cfg = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.info;

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

  const renderIcon = () => {
    if (icon) return typeof icon === "string" ? null : icon;

    if (variant === "loading") {
      return (
        <View style={[styles.iconPill, { backgroundColor: cfg.color }]}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      );
    }

    return (
      <View style={[styles.iconPill, { backgroundColor: cfg.color }]}>
        <Text style={styles.iconChar}>{cfg.char}</Text>
      </View>
    );
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
          animatedStyle,
          { zIndex: 100 - index },
        ]}
        accessibilityRole={(toast.accessibilityRole as any) || "alert"}
        accessibilityLiveRegion="polite"
      >
        <View style={styles.contentRow}>
          {/* Icon */}
          {renderIcon()}

          {/* Text Contents */}
          <View style={styles.textContainer}>
            {typeof title === "string" ? (
              <Text
                style={styles.title}
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
                    style={styles.description}
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
              <Text style={styles.actionLabel}>
                {action.label}
              </Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = createStyles(() => ({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 52,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  iconChar: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    lineHeight: 18,
  },
  descWrapper: {
    marginTop: 2,
  },
  description: {
    fontSize: 12,
    fontWeight: "400",
    color: "rgba(255,255,255,0.7)",
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
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
}));
