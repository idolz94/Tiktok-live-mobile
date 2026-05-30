import { LinearGradient as BaseLinearGradient } from "expo-linear-gradient";
import { memo, useMemo } from "react";
import isEqual from "react-fast-compare";
import Animated from "react-native-reanimated";
import { GradientProps } from "./type";
import { linearGradients } from "@/themes/colors";

export const LinearGradient = memo(
  ({ style, type, children, start, end }: GradientProps) => {
    const _styles = useMemo(() => {
      let _start = start ?? { x: 0, y: 0 };
      let _end = end ?? { x: 1, y: 0 };

      return { colors: linearGradients[type], start: _start, end: _end };
    }, [type, start, end]);

    return (
      <BaseLinearGradient
        start={_styles.start}
        end={_styles.end}
        //@ts-ignore
        colors={_styles.colors}
        style={style}
      >
        {children}
      </BaseLinearGradient>
    );
  },
  isEqual,
);

LinearGradient.displayName = "LinearGradient";

export const AnimatedLinearGradient =
  Animated.createAnimatedComponent(LinearGradient);
