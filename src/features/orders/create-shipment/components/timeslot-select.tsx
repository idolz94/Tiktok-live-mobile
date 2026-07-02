import { memo, useCallback, useMemo, useState } from "react";
import { FlatList, Modal, Pressable, Text } from "react-native";
import { useThemes } from "@hooks/use-theme";
import type { SpxTimeslot } from "../types/shipment";
import { shipmentStyles } from "./shipment-styles";

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

export const TimeslotSelect = memo(function TimeslotSelect({
  timeslots,
  selectedKey,
  onSelect,
}: TimeslotSelectProps) {
  const { colors, textPresets } = useThemes();
  const [open, setOpen] = useState(false);
  const items = useMemo(() => flattenTimeslots(timeslots), [timeslots]);
  const selected = useMemo(() => items.find((i) => i.key === selectedKey), [items, selectedKey]);
  const orderedItems = useMemo(() => {
    if (!selectedKey) return items;
    const idx = items.findIndex((i) => i.key === selectedKey);
    if (idx <= 0) return items;
    return [items[idx], ...items.slice(0, idx), ...items.slice(idx + 1)];
  }, [items, selectedKey]);

  const renderItem = useCallback(
    ({ item }: { item: FlatSlot }) => (
      <Pressable
        onPress={() => {
          onSelect(item.id, item.key, item.pickupTime);
          setOpen(false);
        }}
        style={[
          shipmentStyles.selectItem,
          item.key === selectedKey && {
            backgroundColor: colors.primaryLight,
          },
        ]}
      >
        <Text
          style={[
            textPresets.fs14_400,
            {
              color: item.key === selectedKey ? colors.primary : colors.neutral900,
            },
          ]}
        >
          {item.label}
        </Text>
      </Pressable>
    ),
    [colors.neutral900, colors.primary, colors.primaryLight, onSelect, selectedKey, textPresets.fs14_400],
  );

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          shipmentStyles.selectTrigger,
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
        <Text style={[{ color: colors.neutral400 }, textPresets.fs14_500]}>⌄</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={shipmentStyles.sheetOverlay}
          onPress={() => setOpen(false)}
        >
          <Pressable
            style={[
              shipmentStyles.selectDropdown,
              { backgroundColor: colors.surface, borderColor: colors.border10 },
            ]}
            onPress={() => {}}
          >
            <Pressable
              onPress={() => setOpen(false)}
              style={[
                shipmentStyles.selectCloseRow,
                { borderBottomColor: colors.border10 },
              ]}
            >
              <Text style={[textPresets.fs14_400, { color: colors.neutral500 }]}>Khung giờ lấy hàng</Text>
              <Text style={[textPresets.fs18_700, { color: colors.neutral400, lineHeight: 22 }]}>×</Text>
            </Pressable>
            <FlatList
              data={orderedItems}
              keyExtractor={(item) => item.key}
              keyboardShouldPersistTaps="handled"
              renderItem={renderItem}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
});
