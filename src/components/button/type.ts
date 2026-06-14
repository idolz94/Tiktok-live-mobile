import { GradientType } from "@components/linear-gradient/type";
import { Colors } from "@themes/type";
import { StyleProp, TextStyle, ViewStyle } from "react-native";

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
   * 'side'   — default spinner absolute bên phải, text vẫn hiện;
   * 'center' — text fade out, spinner xuất hiện ở giữa
   */
  loadingType?: "side" | "center";
  txtBtnStyle?: StyleProp<TextStyle>;
}
