import { ReactNode, RefObject } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { type BottomSheetMethods } from "@expo/ui/community/bottom-sheet";

export type BottomSheetId = string;

export type BottomSheetOptions = {
  content: ReactNode;

  snapPoints?: (string | number)[];

  showDragIndicator?: boolean;

  backgroundStyle?: StyleProp<ViewStyle>;

  enablePanDownToClose?: boolean;

  /** Called when the sheet is dismissed by swipe-down or backdrop tap (not by calling hide()). */
  onDismiss?: () => void;
};

export type BottomSheetEntry = BottomSheetOptions & {
  id: BottomSheetId;
  sheetRef: RefObject<BottomSheetMethods | null>;
};

export type BottomSheetDisplayEntry = BottomSheetEntry & { open: boolean };

export type BottomSheetUpdate = {
  (options: Partial<BottomSheetOptions>): void;
  (id: BottomSheetId, options: Partial<BottomSheetOptions>): void;
};

export type BottomSheetContextType = {
  push: (options: BottomSheetOptions) => BottomSheetId;

  pop: (id?: BottomSheetId) => void;

  replace: (options: BottomSheetOptions, id?: BottomSheetId) => BottomSheetId;

  dismissAll: () => void;

  update: BottomSheetUpdate;

  peek: () => BottomSheetEntry | undefined;

  show: (options: BottomSheetOptions) => BottomSheetId;

  hide: (id?: BottomSheetId) => void;

  hideAll: () => void;

  isVisible: boolean;
};
