import { BottomSheet, SnapPoint } from "@expo/ui";
import { memo, ReactNode } from "react";

type Props = {
  open: boolean;

  onClose: () => void;

  children: ReactNode;

  snapPoints?: SnapPoint[];

  showDragIndicator?: boolean;

  testID?: string;
};

export const AppBottomSheet = memo(
  ({
    open,
    onClose,
    children,
    snapPoints,
    showDragIndicator = true,
    testID,
  }: Props) => {
    return (
      <BottomSheet
        isPresented={open}
        onDismiss={onClose}
        snapPoints={snapPoints}
        showDragIndicator={showDragIndicator}
        testID={testID}
      >
        {children}
      </BottomSheet>
    );
  },
);

AppBottomSheet.displayName = "AppBottomSheet";
