import { BottomSheet } from "@expo/ui/community/bottom-sheet";
import { useThemes } from "@hooks/use-theme";
import { memo, ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";

// Empty backdrop disables the dimmed overlay + tap-to-close for background sheets
const NoBackdrop = () => null;

type Props = {
  open: boolean;
  onClose: () => void;
  onAnimationClose?: () => void;
  children: ReactNode;
  snapPoints?: (string | number)[];
  showDragIndicator?: boolean;
  backgroundStyle?: StyleProp<ViewStyle>;
  enablePanDownToClose?: boolean;
  isTop?: boolean;
};

export const AppBottomSheet = memo(
  ({
    open,
    onClose,
    onAnimationClose,
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
        index={open ? 0 : -1}
        onClose={isTop ? onClose : undefined}
        onChange={(index) => { if (index === -1) onAnimationClose?.(); }}
        snapPoints={snapPoints}
        handleComponent={showDragIndicator ? undefined : null}
        backgroundStyle={
          backgroundStyle || { backgroundColor: colors.neutral100 }
        }
        enablePanDownToClose={enablePanDownToClose}
        enableDynamicSizing={!snapPoints?.length}
        // non-top sheets sit behind and don't intercept backdrop taps
        backdropComponent={isTop ? undefined : NoBackdrop}
        style={{ zIndex: 99 }}
      >
        {children}
      </BottomSheet>
    );
  },
);

AppBottomSheet.displayName = "AppBottomSheet";
