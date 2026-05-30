import { Colors } from "@/themes/type";
import { StyleProp, ViewProps, ViewStyle } from "react-native";

export type SeparatorProps = Omit<ViewProps, "width" | "height"> & {
  type: "horizontal" | "vertical";
  height?: number;
  width?: number;
  /**
   * StyleSheet.hairLineWidth * size
   * @default 3
   */
  size?: 1 | 2 | 3 | 4;

  // /**
  //  *
  //  * @default false
  //  */
  // usePercent?: boolean;

  /**
   * @default borderGray
   */
  color?: Colors;

  opacity?: number;

  containerStyle?: StyleProp<ViewStyle>;
};

