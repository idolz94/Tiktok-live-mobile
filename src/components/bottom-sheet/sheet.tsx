import { BottomSheet, type BottomSheetMethods } from "@expo/ui/community/bottom-sheet";
import { useThemes } from "@hooks/use-theme";
import { memo, ReactNode, Ref } from "react";
import { StyleProp, ViewStyle } from "react-native";

const NoBackdrop = () => null;

type Props = {
  sheetRef?: Ref<BottomSheetMethods | null>;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  snapPoints?: (string | number)[];
  showDragIndicator?: boolean;
  backgroundStyle?: StyleProp<ViewStyle>;
  enablePanDownToClose?: boolean;
  isTop?: boolean;
};

export const AppBottomSheet = memo(
  ({
    sheetRef,
    open,
    onClose,
    children,
    snapPoints,
    showDragIndicator = true,
    backgroundStyle,
    enablePanDownToClose = true,
    isTop = true,
  }: Props) => {
    const { colors } = useThemes();

    return (
      <BottomSheet
        ref={sheetRef}
        index={open ? 0 : -1}
        onClose={isTop ? onClose : undefined}
        snapPoints={snapPoints}
        handleComponent={showDragIndicator ? undefined : null}
        backgroundStyle={
          backgroundStyle || { backgroundColor: colors.neutral100 }
        }
        enablePanDownToClose={enablePanDownToClose}
        enableDynamicSizing={!snapPoints?.length}
        backdropComponent={isTop ? undefined : NoBackdrop}
        style={{ zIndex: 99 }}
      >
        {children}
      </BottomSheet>
    );
  },
);

AppBottomSheet.displayName = "AppBottomSheet";
