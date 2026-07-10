import { colors } from "./colors";
import { shadows } from "./shadow";
import { textPresets } from "./typography";

export type Colors = keyof typeof colors;
export type TextPreset = keyof typeof textPresets;
export type Shadows = keyof typeof shadows;
