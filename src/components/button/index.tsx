import { memo } from "react";
import {
  Pressable,
  StyleSheet,
  StyleSheet as RNStyleSheet,
} from "react-native";
import Animated from "react-native-reanimated";
import { LinearGradient } from "@components/linear-gradient";
import { createStyles } from "@utils/createStyles";
import { ButtonProps } from "./type";
import { useLoadingButton } from "./hooks/use-loading";
import { Spinner } from "./spinner";
import { Colors } from "@themes/type";

export const Button = memo(
  ({
    title,
    onPress,
    disabled,
    icon,
    gradientType,
    containerStyle,
    loading,
    loadingType = "side",
    loadingColor,
    txtBtnStyle,
  }: ButtonProps) => {
    const { spinnerStyle, textStyle } = useLoadingButton({
      loading,
      loadingType,
    });

    // flatten để đọc fontSize và color từ txtBtnStyle
    const flatTxtStyle = RNStyleSheet.flatten([styles.text, txtBtnStyle]);
    const spinnerSize = flatTxtStyle.fontSize ?? styles.text.fontSize;
    const spinnerColor =
      loadingColor ?? flatTxtStyle.color ?? styles.text.color;

    const isDisabled = disabled || loading;

    return (
      <Pressable
        style={[
          styles.container,
          isDisabled && { opacity: 0.5 },
          containerStyle,
        ]}
        disabled={isDisabled}
        onPress={onPress}
      >
        {!!gradientType && (
          <LinearGradient type={gradientType} style={StyleSheet.absoluteFill} />
        )}

        {loadingType === "side" ? (
          <Animated.View style={styles.row}>
            <Animated.View style={[styles.spinnerSlot, spinnerStyle]}>
              <Spinner size={spinnerSize} color={spinnerColor as Colors} />
            </Animated.View>
            <Animated.Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={[styles.text, txtBtnStyle, textStyle]}
            >
              {title}
            </Animated.Text>
          </Animated.View>
        ) : (
          <>
            <Animated.Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={[styles.text, txtBtnStyle, textStyle]}
            >
              {title}
            </Animated.Text>
            <Animated.View
              style={[styles.spinnerBase, styles.spinnerCenter, spinnerStyle]}
            >
              <Spinner size={spinnerSize} color={spinnerColor as Colors} />
            </Animated.View>
          </>
        )}
      </Pressable>
    );
  },
);

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.neutral900,
    ...textPresets.fs16_500,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  spinnerSlot: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerBase: {
    position: "absolute",
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  spinnerCenter: { left: 0, right: 0, alignItems: "center" },
}));
