import { memo } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  StyleSheet as RNStyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";
import Animated from "react-native-reanimated";
import { LinearGradient } from "@components/linear-gradient";
import { createStyles } from "@utils/createStyles";
import { ButtonProps, ButtonType } from "./type";
import { useLoadingButton } from "./hooks/use-loading";
import { Spinner } from "./spinner";
import { Colors } from "@themes/type";

export const Button = memo(
  ({
    title,
    onPress,
    disabled,
    icon,
    type,
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

    // 'gradient' type defaults to the primary gradient khi không truyền gradientType
    const resolvedGradient =
      gradientType ?? (type === "gradient" ? "gra_primary" : undefined);
    const variantContainerStyle = type ? variantStyles[type].container : null;
    const variantTextStyle = type ? variantStyles[type].text : null;

    // flatten để đọc fontSize và color từ txtBtnStyle
    const flatTxtStyle = RNStyleSheet.flatten([
      styles.text,
      variantTextStyle,
      txtBtnStyle,
    ]);
    const spinnerSize = flatTxtStyle.fontSize ?? styles.text.fontSize;
    const spinnerColor =
      loadingColor ?? flatTxtStyle.color ?? styles.text.color;

    const isDisabled = disabled || loading;

    const label = (
      <Animated.Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={[styles.text, variantTextStyle, txtBtnStyle, textStyle]}
      >
        {title}
      </Animated.Text>
    );

    return (
      <Pressable
        style={[
          styles.container,
          variantContainerStyle,
          isDisabled && { opacity: 0.5 },
          containerStyle,
        ]}
        disabled={isDisabled}
        onPress={onPress}
      >
        {!!resolvedGradient && (
          <LinearGradient
            type={resolvedGradient}
            style={StyleSheet.absoluteFill}
          />
        )}

        {loadingType === "side" ? (
          <Animated.View style={styles.row}>
            {loading && (
              <Animated.View style={[styles.spinnerSlot, spinnerStyle]}>
                <Spinner size={spinnerSize} color={spinnerColor as Colors} />
              </Animated.View>
            )}
            {!!icon && icon}
            {label}
          </Animated.View>
        ) : (
          <>
            <Animated.View style={styles.row}>
              {!!icon && icon}
              {label}
            </Animated.View>
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

const variantSheet = createStyles(({ colors }) => ({
  gradientContainer: {
    borderRadius: 999,
    overflow: "hidden",
  },
  gradientText: {
    color: colors.neutral900,
  },
  softContainer: {
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  softText: {
    color: colors.primary,
  },
  outlineContainer: {
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border10,
  },
  outlineText: {
    color: colors.neutral500,
  },
  outlineDashedContainer: {
    borderRadius: 12,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border20,
  },
  outlineDashedText: {
    color: colors.neutral500,
  },
}));

const variantStyles: Record<
  ButtonType,
  { container: StyleProp<ViewStyle>; text: StyleProp<TextStyle> }
> = {
  gradient: {
    container: variantSheet.gradientContainer,
    text: variantSheet.gradientText,
  },
  soft: {
    container: variantSheet.softContainer,
    text: variantSheet.softText,
  },
  outline: {
    container: variantSheet.outlineContainer,
    text: variantSheet.outlineText,
  },
  "outline-dashed": {
    container: variantSheet.outlineDashedContainer,
    text: variantSheet.outlineDashedText,
  },
};
