import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { shadows } from "./shadow";
import { FontStyle } from "./typography";

export const HairlineWidth = Math.min(StyleSheet.hairlineWidth, 0.333);

export const theme = {
  type: "light",
  dark: false,
  colors: colors,
  shadows: shadows,
  textPresets: FontStyle,
} as const;

export type AppTheme = typeof theme;
