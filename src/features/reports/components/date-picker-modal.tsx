import { useCallback, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { createStyles } from "@utils/createStyles";
import { useThemes } from "@hooks/use-theme";

type Props = {
  visible: boolean;
  initialFrom: Date | null;
  initialTo: Date | null;
  onConfirm: (from: Date, to: Date) => void;
  onClose: () => void;
};

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const MONTHS = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];

function useDatePicker(init: Date | null) {
  const now = new Date();
  const d = init ?? now;
  const [day, setDay] = useState(d.getDate());
  const [month, setMonth] = useState(d.getMonth() + 1);
  const [year, setYear] = useState(d.getFullYear());

  const maxDay = new Date(year, month, 0).getDate();
  const safeDay = Math.min(day, maxDay);

  const date = new Date(year, month - 1, safeDay);

  return { day: safeDay, month, year, setDay, setMonth, setYear, date, maxDay };
}

function WheelColumn({
  items,
  selected,
  onSelect,
  display,
}: {
  items: number[];
  selected: number;
  onSelect: (v: number) => void;
  display?: (v: number) => string;
}) {
  const { colors } = useThemes();
  const ITEM_H = 40;

  return (
    <ScrollView
      style={styles.wheel}
      contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_H}
      decelerationRate="fast"
      onMomentumScrollEnd={(e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
        if (idx >= 0 && idx < items.length) onSelect(items[idx]!);
      }}
    >
      {items.map((item) => (
        <Pressable
          key={item}
          style={[styles.wheelItem, { height: ITEM_H }]}
          onPress={() => onSelect(item)}
        >
          <Text
            style={[
              styles.wheelItemText,
              { color: selected === item ? colors.primary : colors.neutral400 },
              selected === item && styles.wheelItemTextSelected,
            ]}
          >
            {display ? display(item) : String(item).padStart(2, "0")}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function DatePickerModal({ visible, initialFrom, initialTo, onConfirm, onClose }: Props) {
  const { colors } = useThemes();
  const [tab, setTab] = useState<"from" | "to">("from");

  const from = useDatePicker(initialFrom);
  const to = useDatePicker(initialTo);

  const active = tab === "from" ? from : to;

  const years = range(2020, new Date().getFullYear() + 1);

  const handleConfirm = useCallback(() => {
    const f = new Date(from.year, from.month - 1, from.day);
    f.setHours(0, 0, 0, 0);
    const t = new Date(to.year, to.month - 1, to.day);
    t.setHours(23, 59, 59, 999);
    if (f > t) return;
    onConfirm(f, t);
  }, [from, to, onConfirm]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <View style={styles.handle} />

        <Text style={[styles.title, { color: colors.neutral900 }]}>Chọn ngày tuỳ chỉnh</Text>

        {/* Tab */}
        <View style={[styles.tabs, { borderColor: colors.border10 }]}>
          <Pressable
            onPress={() => setTab("from")}
            style={[styles.tabBtn, tab === "from" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: tab === "from" ? colors.primary : colors.neutral400 }]}>
              Từ ngày
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("to")}
            style={[styles.tabBtn, tab === "to" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: tab === "to" ? colors.primary : colors.neutral400 }]}>
              Đến ngày
            </Text>
          </Pressable>
        </View>

        {/* Wheels */}
        <View style={styles.wheels}>
          <View style={[styles.wheelHighlight, { borderColor: colors.border10, backgroundColor: colors.neutral50 }]} />
          <WheelColumn
            items={range(1, active.maxDay)}
            selected={active.day}
            onSelect={active.setDay}
          />
          <WheelColumn
            items={range(1, 12)}
            selected={active.month}
            onSelect={active.setMonth}
            display={(v) => MONTHS[v - 1] ?? String(v)}
          />
          <WheelColumn
            items={years}
            selected={active.year}
            onSelect={active.setYear}
            display={(v) => String(v)}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={onClose}
            style={[styles.btnOutline, { borderColor: colors.border10 }]}
          >
            <Text style={[styles.btnText, { color: colors.neutral500 }]}>Huỷ</Text>
          </Pressable>
          <Pressable
            onPress={handleConfirm}
            style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.btnText, { color: "#fff" }]}>Xác nhận</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = createStyles(({ textPresets }) => ({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    marginTop: 10,
    marginBottom: 12,
  },
  title: {
    ...textPresets.fs16_600,
    marginBottom: 12,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabText: {
    ...textPresets.fs14_500,
  },
  wheels: {
    flexDirection: "row",
    height: 200,
    justifyContent: "center",
    position: "relative",
  },
  wheelHighlight: {
    position: "absolute",
    top: "50%",
    left: 16,
    right: 16,
    height: 40,
    marginTop: -20,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 0,
  },
  wheel: {
    flex: 1,
  },
  wheelItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  wheelItemText: {
    ...textPresets.fs14_500,
  },
  wheelItemTextSelected: {
    ...textPresets.fs16_600,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  btnOutline: {
    flex: 1,
    height: 44,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    flex: 2,
    height: 44,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    ...textPresets.fs14_500,
  },
}));
