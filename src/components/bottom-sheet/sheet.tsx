import {
  BottomSheet,
  type BottomSheetMethods,
} from "@expo/ui/community/bottom-sheet";
import { useThemes } from "@hooks/use-theme";
import { memo, ReactNode, Ref } from "react";
import { StyleProp, ViewStyle, View } from "react-native";

type Props = {
  sheetRef?: Ref<BottomSheetMethods | null>;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  snapPoints?: (string | number)[];
  showDragIndicator?: boolean;
  backgroundStyle?: StyleProp<ViewStyle>;
  enablePanDownToClose?: boolean;
  hasNestedChild?: boolean;
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
    hasNestedChild = false,
  }: Props) => {
    const { colors } = useThemes();

    const resolvedSnapPoints =
      snapPoints?.length ? snapPoints : hasNestedChild ? ["90%"] : undefined;

    return (
      <BottomSheet
        ref={sheetRef}
        index={open ? 0 : -1}
        onClose={onClose}
        snapPoints={resolvedSnapPoints}
        handleComponent={showDragIndicator ? undefined : null}
        backgroundStyle={
          backgroundStyle || { backgroundColor: colors.neutral100 }
        }
        enablePanDownToClose={enablePanDownToClose}
        enableDynamicSizing={!hasNestedChild && !resolvedSnapPoints?.length}
      >
        <View style={{ flex: 1 }}>{children}</View>
      </BottomSheet>
    );
  },
);

AppBottomSheet.displayName = "AppBottomSheet";
