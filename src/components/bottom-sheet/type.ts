import { SnapPoint } from "@expo/ui";
import { ReactNode } from "react";

export type BottomSheetOptions = {
  content: ReactNode;

  snapPoints?: SnapPoint[];

  showDragIndicator?: boolean;

  testID?: string;
};

export type BottomSheetContextType = {
  show: (options: BottomSheetOptions) => void;

  hide: () => void;

  isVisible: boolean;
};
