import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";

export type BottomSheetOptions = {
  content: ReactNode;

  snapPoints?: (string | number)[];

  showDragIndicator?: boolean;

  backgroundStyle?: StyleProp<ViewStyle>;

  enablePanDownToClose?: boolean;

  /** Called when the sheet is dismissed by swipe-down or backdrop tap (not by calling hide()). */
  onDismiss?: () => void;
};

export type BottomSheetContextType = {
  show: (options: BottomSheetOptions) => void;

  hide: () => void;

  update: (options: Partial<BottomSheetOptions>) => void;

  isVisible: boolean;
};
