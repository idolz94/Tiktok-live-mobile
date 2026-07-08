import { useBottomSheet } from "@components/bottom-sheet/hook";
import { Icon } from "@components/icon";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import type { SpxTimeslot } from "../../types/shipment";

type TimeslotSelectProps = {
  timeslots: SpxTimeslot[];
  selectedKey: string | null;
  onSelect: (id: number, key: string, pickupTime: number) => void;
};

type FlatSlot = { key: string; id: number; label: string; pickupTime: number };

function flattenTimeslots(ts: SpxTimeslot[]): FlatSlot[] {
  if (!Array.isArray(ts)) return [];

  return ts.flatMap((g, groupIndex) => {
    if (!Array.isArray(g.slots)) return [];

    return g.slots.map((s, slotIndex) => ({
      key: `${g.pickupTime}-${s.id}-${groupIndex}-${slotIndex}`,
      id: s.id,
      label: `${g.date} ${s.range}`,
      pickupTime: g.pickupTime,
    }));
  });
}

export const TimeslotSelect = memo(
  ({ timeslots, selectedKey, onSelect }: TimeslotSelectProps) => {
    const { colors, textPresets } = useThemes();
    const { show, hide } = useBottomSheet();
    const items = useMemo(() => flattenTimeslots(timeslots), [timeslots]);
    const selected = useMemo(
      () => items.find((i) => i.key === selectedKey),
      [items, selectedKey],
    );
    const orderedItems = useMemo(() => {
      if (!selectedKey) return items;
      const idx = items.findIndex((i) => i.key === selectedKey);
      if (idx <= 0) return items;
      return [items[idx], ...items.slice(0, idx), ...items.slice(idx + 1)];
    }, [items, selectedKey]);

    const openSheet = useCallback(() => {
      // ponytail: sheetId assigned synchronously before close() can ever be called
      let sheetId!: string;
      const close = () => hide(sheetId);
      sheetId = show({
        content: (
          <TimeslotSheetContent
            items={orderedItems}
            selectedKey={selectedKey}
            onSelect={onSelect}
            onClose={close}
          />
        ),
        showDragIndicator: true,
      });
    }, [show, hide, orderedItems, selectedKey, onSelect]);

    return (
      <Pressable
        onPress={openSheet}
        style={[
          styles.selectTrigger,
          { borderColor: colors.border10, backgroundColor: colors.neutral50 },
        ]}
      >
        <Text
          style={[
            {
              color: selected ? colors.neutral900 : colors.neutral300,
              flex: 1,
            },
            textPresets.fs14_400,
          ]}
          numberOfLines={1}
        >
          {selected ? selected.label : "Chọn khung giờ lấy hàng"}
        </Text>
        <Icon name="arrow_down" size={14} tintColor={colors.neutral400} />
      </Pressable>
    );
  },
);

const TimeslotSheetContent = memo(
  ({
    items,
    selectedKey,
    onSelect,
    onClose,
  }: {
    items: FlatSlot[];
    selectedKey: string | null;
    onSelect: (id: number, key: string, pickupTime: number) => void;
    onClose: () => void;
  }) => {
    const { colors, textPresets } = useThemes();

    const renderItem = useCallback(
      ({ item }: { item: FlatSlot }) => (
        <Pressable
          onPress={() => {
            onSelect(item.id, item.key, item.pickupTime);
            onClose();
          }}
          style={[
            styles.selectItem,
            item.key === selectedKey && {
              backgroundColor: colors.primaryLight,
            },
          ]}
        >
          <Text
            style={[
              textPresets.fs14_400,
              {
                color:
                  item.key === selectedKey ? colors.primary : colors.neutral900,
              },
            ]}
          >
            {item.label}
          </Text>
        </Pressable>
      ),
      [
        colors.neutral900,
        colors.primary,
        colors.primaryLight,
        onClose,
        onSelect,
        selectedKey,
        textPresets.fs14_400,
      ],
    );

    return (
      <View style={styles.sheetContainer}>
        <View
          style={[
            styles.selectCloseRow,
            { borderBottomColor: colors.border10 },
          ]}
        >
          <Text style={[textPresets.fs14_400, { color: colors.neutral500 }]}>
            Khung giờ lấy hàng
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text
              style={[
                textPresets.fs18_700,
                { color: colors.neutral400, lineHeight: 22 },
              ]}
            >
              ×
            </Text>
          </Pressable>
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => item.key}
          keyboardShouldPersistTaps="handled"
          renderItem={renderItem}
          style={styles.sheetList}
        />
      </View>
    );
  },
);

const styles = createStyles(() => ({
  selectTrigger: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    marginTop: 8,
  },
  sheetContainer: {
    maxHeight: 400,
  },
  sheetList: {
    flexGrow: 0,
  },
  selectCloseRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  selectItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
}));
