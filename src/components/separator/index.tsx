import isNil from "lodash.isnil";
import React, { memo, useMemo } from "react";
import { View, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { SeparatorProps } from "./type";
import { useThemes } from "@/hooks/useThemes";
import { HairlineWidth } from "@/themes";

export const Separator = memo(
  (props: SeparatorProps) => {
    const {
      type,
      height,
      width,
      opacity,
      color = "borderGray",
      size = 3,
      style: customStyle,
      containerStyle,
      ...subProps
    } = props;

    const { colors } = useThemes();

    const style = useMemo(() => {
      const _styles: Array<ViewStyle> = [{ flex: 1 }];

      if (type === "horizontal") {
        _styles.push({ justifyContent: "center" });
      } else {
        _styles.push({ alignItems: "center" });
      }

      if (typeof height === "number") {
        _styles.push({ height: height });
      }

      if (typeof width === "number") {
        _styles.push({ width: width });
      }

      //@ts-ignore
      return _styles;
    }, [height, width, type]);

    const styleContainer = useMemo(() => {
      const _styles = [];
      if (type === "horizontal") {
        _styles.push({ width: "100%" });
      } else {
        _styles.push({ height: "100%" });
      }

      //@ts-ignore
      return _styles;
    }, [type]);

    const backgroundColor = useMemo(() => {
      return `${colors[color]}${
        // @ts-ignore
        isNil(opacity) ? "" : opacityTheme[opacity]
      }`;
    }, [color, opacity]);

    return (
      <View
        //@ts-ignore
        style={[styleContainer, containerStyle]}
      >
        <View
          {...subProps}
          //@ts-ignore
          style={[style, customStyle]}
        >
          {type === "vertical" ? (
            <View
              style={{
                backgroundColor,
                width: HairlineWidth * size,
                height: "100%",
              }}
            />
          ) : (
            <View
              style={{
                backgroundColor,
                height: HairlineWidth * size,
                width: "100%",
              }}
            />
          )}
        </View>
      </View>
    );
  },
  () => true,
);

export const AnimatedSeparator = Animated.createAnimatedComponent(Separator);

Separator.displayName = "Separator";
