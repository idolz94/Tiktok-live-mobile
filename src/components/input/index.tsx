import { AnimatedErrorText } from "@components/animated-error-text";
import { useThemes } from "@hooks/use-theme";
import { HairlineWidth } from "@themes";
import { createStyles } from "@utils/createStyles";
import { forwardRef, useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
  containerStyle?: ViewStyle;
};

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, rightElement, containerStyle, style, onFocus, onBlur, editable = true, ...rest }, ref) => {
    const { colors } = useThemes();
    const [focused, setFocused] = useState(false);

    const wrapStyle = [
      styles.wrap,
      focused && { borderColor: colors.primary },
      !!error && { borderColor: colors.error },
      !editable && { backgroundColor: colors.neutral50, opacity: 0.6 },
    ];

    return (
      <View style={containerStyle}>
        {!!label && <Text style={styles.label}>{label}</Text>}
        <View style={wrapStyle}>
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={colors.neutral300}
            editable={editable}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />
          {rightElement}
        </View>
        <AnimatedErrorText message={error} />
      </View>
    );
  },
);

const styles = createStyles(({ colors, textPresets }) => ({
  label: {
    color: colors.neutral900,
    ...textPresets.fs14_400,
    marginBottom: 8,
  },
  wrap: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: HairlineWidth * 3,
    borderColor: colors.border10,
    backgroundColor: colors.neutral100,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: colors.neutral900,
    ...textPresets.fs14_400,
  },
}));
