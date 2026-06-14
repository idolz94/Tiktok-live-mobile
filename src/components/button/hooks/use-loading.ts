import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { ButtonProps } from "../type";

const DURATION = 220;

export function useLoadingButton({
  loading = false,
  loadingType = "side",
}: Pick<ButtonProps, "loading" | "loadingType">) {
  const spinOpacity = useSharedValue(0);
  const spinScale = useSharedValue(0.6);
  const textOpacity = useSharedValue(1);
  const textScale = useSharedValue(1);

  useEffect(() => {
    if (loading) {
      spinOpacity.value = withTiming(1, { duration: DURATION });
      spinScale.value = withSpring(1, { damping: 14, stiffness: 180 });
      if (loadingType === "center") {
        textOpacity.value = withTiming(0, { duration: DURATION });
        textScale.value = withTiming(0.8, { duration: DURATION });
      }
    } else {
      spinOpacity.value = withTiming(0, { duration: DURATION });
      spinScale.value = withTiming(0.6, { duration: DURATION });
      textOpacity.value = withTiming(1, { duration: DURATION });
      textScale.value = withSpring(1, { damping: 14, stiffness: 180 });
    }
  }, [loading, loadingType]);

  const spinnerStyle = useAnimatedStyle(() => ({
    opacity: spinOpacity.value,
    transform: [{ scale: spinScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  return { spinnerStyle, textStyle };
}
