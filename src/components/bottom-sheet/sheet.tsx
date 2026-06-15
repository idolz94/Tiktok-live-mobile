import { BottomSheet } from "@expo/ui/community/bottom-sheet";
import { useThemes } from "@hooks/use-theme";
import { memo, ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";

type Props = {
  open: boolean;

  onClose: () => void;

  children: ReactNode;

  snapPoints?: (string | number)[];

  showDragIndicator?: boolean;

  backgroundStyle?: StyleProp<ViewStyle>;

  enablePanDownToClose?: boolean;
};

export const AppBottomSheet = memo(
  ({
    open,
    onClose,
    children,
    snapPoints,
    showDragIndicator = true,
    backgroundStyle,
    enablePanDownToClose = true,
  }: Props) => {
    const { colors } = useThemes();

    return (
      <BottomSheet
        index={open ? 0 : -1}
        onClose={onClose}
        snapPoints={snapPoints}
        handleComponent={showDragIndicator ? undefined : null}
        backgroundStyle={
          backgroundStyle || { backgroundColor: colors.neutral100 }
        }
        enablePanDownToClose={enablePanDownToClose}
        enableDynamicSizing
        style={{ zIndex: 99 }}
      >
        {children}
      </BottomSheet>
    );
  },
);

AppBottomSheet.displayName = "AppBottomSheet";
