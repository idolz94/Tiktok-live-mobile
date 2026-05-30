import { colors } from "./colors";
import { shadows } from "./shadow";
import { FontStyle } from "./typography";

export type Colors = keyof typeof colors;
export type FontStyle = keyof typeof FontStyle;
export type Shadows = keyof typeof shadows;
