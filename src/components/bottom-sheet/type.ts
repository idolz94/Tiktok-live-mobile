import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";

export type BottomSheetOptions = {
  content: ReactNode;

  snapPoints?: (string | number)[];

  showDragIndicator?: boolean;

  backgroundStyle?: StyleProp<ViewStyle>;

  enablePanDownToClose?: boolean;
};

export type BottomSheetContextType = {
  show: (options: BottomSheetOptions) => void;

  hide: () => void;

  update: (options: Partial<BottomSheetOptions>) => void;

  isVisible: boolean;
};
