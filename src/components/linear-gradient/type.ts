import { LinearGradientProps } from "expo-linear-gradient";

export const GradientType = {
  gra_primary: "gra_primary",
  gra_info: "gra_info",
  gra_success: "gra_success",
  gra_warning: "gra_warning",
  gra_social: "gra_social",
  gra_neutralDark: "gra_neutralDark",
} as const;

export type GradientType = keyof typeof GradientType;

export type GradientProps = {
  type: GradientType;
} & Omit<LinearGradientProps, "colors">;
