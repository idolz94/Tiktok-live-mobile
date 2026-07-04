import { ReactNode } from "react";
import { View } from "react-native";
import { AppBottomSheet } from "./sheet";
import { BottomSheetDisplayEntry, BottomSheetId } from "./type";

type Props = {
  entries: BottomSheetDisplayEntry[];
  onClose: (id: BottomSheetId) => void;
};

export const BottomSheetRenderer = ({ entries, onClose }: Props) => {
  const renderEntry = (index: number): ReactNode => {
    const entry = entries[index];
    if (!entry) return null;

    const hasNestedChild = index < entries.length - 1;

    return (
      <AppBottomSheet
        key={entry.id}
        sheetRef={entry.sheetRef}
        open={entry.open}
        onClose={() => onClose(entry.id)}
        snapPoints={entry.snapPoints}
        showDragIndicator={entry.showDragIndicator}
        backgroundStyle={entry.backgroundStyle}
        enablePanDownToClose={entry.enablePanDownToClose ?? true}
        hasNestedChild={hasNestedChild}
      >
        <View style={{ flex: 1 }}>
          {entry.content}
          {renderEntry(index + 1)}
        </View>
      </AppBottomSheet>
    );
  };

  return <>{renderEntry(0)}</>;
};
