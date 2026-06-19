import LottieView, { LottieViewProps } from "lottie-react-native";
import { useEffect, useMemo, useRef } from "react";
import { useThemes } from "@hooks/use-theme";

export const lotties = {
  chart: require("./sources/chart.json"),
  customer: require("./sources/customer.json"),
  home: require("./sources/home.json"),
  live_red: require("./sources/live_red.json"),
  live_white: require("./sources/live_white.json"),
  settings: require("./sources/settings.json"),
  time: require("./sources/time.json"),
  truck: require("./sources/truck.json"),
};

export type LottieTypes = keyof typeof lotties;

// ---start: keypath map — all top-level layer names per lottie file for colorFilters---
const lottieKeypaths: Record<LottieTypes, string[]> = {
  home: ["Layer 3", "Layer 2", "Layer 1"],
  chart: ["Group 14", "Group 9", "Group 3", "Group 4", "Group 12", "Group 13", "Elastic Control Layer", "Layer 3", "Layer 1"],
  customer: ["Group 11", "Group 5", "Group 8"],
  truck: ["M", "L"],
  settings: ["Layer 8"],
  live_red: ["1", "5", "6", "7", "2"],
  live_white: ["1", "5", "6", "7", "2"],
  time: ["Layer 1"],
};
// ---end: keypath map---

const DEFAULT_SIZE = 24;

type Props = Omit<LottieViewProps, "source" | "autoPlay" | "loop" | "colorFilters"> & {
  name: LottieTypes;
  size?: number;
  focused?: boolean;
};

export function Lottie({
  name,
  size = DEFAULT_SIZE,
  focused = false,
  style,
  ...rest
}: Props) {
  const ref = useRef<LottieView>(null);
  const { colors } = useThemes();

  // ---start: play once on focus, reset to frame 0 when unfocused---
  useEffect(() => {
    if (focused) {
      ref.current?.play();
    } else {
      ref.current?.reset();
    }
  }, [focused]);
  // ---end: play once on focus---

  const colorFilters = useMemo(() => {
    const color = focused ? colors.primary : colors.neutral300;
    return lottieKeypaths[name].map((keypath) => ({ keypath, color }));
  }, [focused, name, colors.primary, colors.neutral300]);

  return (
    <LottieView
      ref={ref}
      source={lotties[name]}
      autoPlay={false}
      loop={false}
      resizeMode="contain"
      colorFilters={colorFilters}
      style={[{ width: size, height: size }, style]}
      {...rest}
    />
  );
}
