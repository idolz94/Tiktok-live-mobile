import { Lottie, LottieTypes } from "@assets/lotties";
import { Tabs } from "expo-router";
import { ComponentProps } from "react";

type BaseScreenProps = ComponentProps<typeof Tabs.Screen>;

type BaseOptions = BaseScreenProps["options"] extends (
  ...args: any[]
) => infer R
  ? R
  : NonNullable<BaseScreenProps["options"]>;

type WithLottie = {
  lottie?: LottieTypes;
};

export function tabOptions<T extends BaseOptions & WithLottie>(
  options: T,
): Omit<T, "lottie"> {
  const { lottie, ...rest } = options;

  if (!lottie) {
    return rest as Omit<T, "lottie">;
  }

  return {
    ...rest,
    tabBarIcon: ({ size, focused }: { size: number; focused: boolean }) => (
      <Lottie name={lottie} size={size} focused={focused} />
    ),
  } as Omit<T, "lottie">;
}
