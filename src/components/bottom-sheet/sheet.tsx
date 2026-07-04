import {
  BottomSheet,
  type BottomSheetMethods,
  type BottomSheetBackdropProps,
} from "@expo/ui/community/bottom-sheet";
import { useThemes } from "@hooks/use-theme";
import { memo, ReactNode, Ref, useCallback } from "react";
import { StyleProp, ViewStyle, View, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";

// Extracted as a component so useAnimatedStyle is a proper hook call (not inside useCallback)
function SheetBackdrop({
  animatedIndex,
  onClose,
  open,
}: {
  animatedIndex: SharedValue<number>;
  onClose: () => void;
  open: boolean;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [-1, 0], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      pointerEvents={open ? "auto" : "none"}
      style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.4)" }, animatedStyle]}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
    </Animated.View>
  );
}

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

    const backdrop = useCallback(
      ({ animatedIndex }: BottomSheetBackdropProps) =>
        animatedIndex
          ? <SheetBackdrop animatedIndex={animatedIndex as unknown as SharedValue<number>} onClose={onClose} open={open} />
          : null,
      [onClose, open],
    );

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
        backdropComponent={backdrop}
      >
        <View style={{ flex: 1 }}>{children}</View>
      </BottomSheet>
    );
  },
);

AppBottomSheet.displayName = "AppBottomSheet";
