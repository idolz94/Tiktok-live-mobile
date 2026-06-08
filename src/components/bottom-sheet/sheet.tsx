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
};

export const AppBottomSheet = memo(
  ({
    open,
    onClose,
    children,
    snapPoints,
    showDragIndicator = true,
    backgroundStyle,
  }: Props) => {
    const { colors } = useThemes();

    return (
      <BottomSheet
        index={open ? 0 : -1}
        onClose={onClose}
        snapPoints={snapPoints}
        handleComponent={showDragIndicator ? undefined : null}
        backgroundStyle={backgroundStyle || { backgroundColor: colors.white }}
        enablePanDownToClose
        enableDynamicSizing
        style={{ zIndex: 99 }}
      >
        {children}
      </BottomSheet>
    );
  },
);

AppBottomSheet.displayName = "AppBottomSheet";
