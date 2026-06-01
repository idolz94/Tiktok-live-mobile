import { Colors } from "@/themes/type";
import { PropsWithChildren } from "react";

export type ScreenProps = PropsWithChildren<{
  backgroundColorTheme?: Colors;

  /**
   * Status bar style
   * @default light-content
   */
  statusBarStyle?: "light-content" | "dark-content";
}>;
