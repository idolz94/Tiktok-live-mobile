import { GradientType } from "@components/linear-gradient/type";
import { Colors } from "@themes/type";
import { StyleProp, TextStyle, ViewStyle } from "react-native";

/**
 * Button visual variants:
 * - 'gradient'       — gradient fill, pill shape (primary action)
 * - 'soft'           — light tonal background with matching text
 * - 'outline'        — solid border, white background
 * - 'outline-dashed' — dashed border, transparent background
 */
export type ButtonType = "gradient" | "soft" | "outline" | "outline-dashed";

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  gradientType?: GradientType;
  containerStyle?: StyleProp<ViewStyle>;
  loadingColor?: Colors;
  loading?: boolean;

  /**
   * Visual variant of the button.
   * When set, applies preset styling for background, border, and text.
   * Can be combined with `gradientType` for the 'gradient' type.
   */
  type?: ButtonType;

  /**
   * 'side'   — spinner appears beside text;
   * 'center' — text fades out, spinner appears centered
   */
  loadingType?: "side" | "center";
  txtBtnStyle?: StyleProp<TextStyle>;
}
