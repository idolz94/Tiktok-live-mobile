import { Colors } from "@themes/type";
import { memo, useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const DURATION = 1000;
const RING_STEP = 5;

type PulsingDotProps = {
  size?: number;
  color?: Colors | string;
  /**
   * @param {number} ringCount - The number of rings excepted dot core.
   */
  ringCount?: number;
  style?: ViewStyle;
};

type RingProps = {
  size: number;
  color: Colors | string;
  delay: number;
};

const RingView = ({ size, color, delay }: RingProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: DURATION,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );

    return () => cancelAnimation(progress);
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [0.08, 0.45]),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

export const PulsingDot = memo(
  ({
    size = 8.3,
    color = "primary",
    ringCount = 3,
    style,
  }: PulsingDotProps) => {
    const ringSizes = Array.from(
      { length: ringCount },
      (_, i) => size + RING_STEP * (i + 1),
    );

    const containerSize = ringSizes[ringSizes.length - 1] + 4;
    const ringDelay = DURATION / ringCount;

    return (
      <View
        style={[
          {
            width: containerSize,
            height: containerSize,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        {ringSizes.map((ringSize, index) => (
          <RingView
            key={index}
            size={ringSize}
            color={color}
            delay={index * ringDelay}
          />
        ))}

        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          }}
        />
      </View>
    );
  },
);
