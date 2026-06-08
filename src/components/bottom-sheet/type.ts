import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";

export type BottomSheetOptions = {
  content: ReactNode;

  snapPoints?: (string | number)[];

  showDragIndicator?: boolean;

  backgroundStyle?: StyleProp<ViewStyle>;
};

export type BottomSheetContextType = {
  show: (options: BottomSheetOptions) => void;

  hide: () => void;

  isVisible: boolean;
};
