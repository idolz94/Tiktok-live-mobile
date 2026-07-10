import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { shadows } from "./shadow";
import { textPresets } from "./typography";

export const HairlineWidth = Math.min(StyleSheet.hairlineWidth, 0.333);

export const theme = {
  type: "light",
  dark: false,
  colors: colors,
  shadows: shadows,
  textPresets,
} as const;

export type AppTheme = typeof theme;
