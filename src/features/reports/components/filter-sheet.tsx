import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import type { ReportFilter } from "../types";

const PRESETS: { id: "7d" | "1m" | "6m" | "1y"; label: string }[] = [
  { id: "7d", label: "7 ngày qua" },
  { id: "1m", label: "30 ngày qua" },
  { id: "6m", label: "6 tháng qua" },
  { id: "1y", label: "1 năm qua" },
];

const DEPOSIT_OPTIONS: { id: ReportFilter["depositStatus"]; label: string }[] = [
  { id: null, label: "Tất cả" },
  { id: "paid", label: "Đã thanh toán" },
  { id: "deposited", label: "Đã cọc" },
  { id: "unpaid", label: "Chưa thanh toán" },
  { id: "refunded", label: "Đã hoàn tiền" },
];

const ORDER_STATUS_OPTIONS: { id: ReportFilter["status"]; label: string }[] = [
  { id: null, label: "Tất cả" },
  { id: "confirmed", label: "Đã xác nhận" },
  { id: "packed", label: "Đã đóng gói" },
  { id: "shipping", label: "Đang giao" },
  { id: "completed", label: "Hoàn thành" },
  { id: "canceled", label: "Đã huỷ" },
  { id: "returned", label: "Hoàn trả" },
];

type Props = {
  filter: ReportFilter;
  onApply: (f: ReportFilter, preset?: "7d" | "1m" | "6m" | "1y") => void;
  onCustomDate: () => void;
};

export function FilterSheet({ filter, onApply, onCustomDate }: Props) {
  const { colors } = useThemes();
  const [draft, setDraft] = useState<ReportFilter>(filter);

  function patch(update: Partial<ReportFilter>) {
    setDraft((prev) => ({ ...prev, ...update }));
  }

  return (
    <View style={styles.sheet}>
      <View style={styles.dragBar} />

      <Text style={[styles.title, { color: colors.neutral900 }]}>Bộ lọc báo cáo</Text>

      <Text style={[styles.sectionLabel, { color: colors.neutral400 }]}>Khoảng thời gian nhanh</Text>
      <View style={styles.chipRow}>
        {PRESETS.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => onApply(draft, p.id)}
            style={[styles.chip, { backgroundColor: colors.neutral50, borderColor: colors.border10 }]}
          >
            <Text style={[styles.chipText, { color: colors.neutral900 }]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={onCustomDate}
        style={[styles.customDateRow, { borderColor: colors.border10, backgroundColor: colors.neutral50 }]}
      >
        <Text style={[styles.chipText, { color: colors.neutral900 }]}>
          {draft.customFrom && draft.customTo
            ? `${fmtDate(draft.customFrom)} – ${fmtDate(draft.customTo)}`
            : "Chọn ngày tuỳ chỉnh…"}
        </Text>
        <Text style={[styles.chipText, { color: colors.primary }]}>Chỉnh</Text>
      </Pressable>

      <Text style={[styles.sectionLabel, { color: colors.neutral400 }]}>Trạng thái cọc</Text>
      <View style={styles.chipRow}>
        {DEPOSIT_OPTIONS.map((o) => {
          const active = draft.depositStatus === o.id;
          return (
            <Pressable
              key={String(o.id)}
              onPress={() => patch({ depositStatus: o.id })}
              style={[
                styles.chip,
                active
                  ? { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                  : { backgroundColor: colors.neutral50, borderColor: colors.border10 },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? colors.primary : colors.neutral900 }]}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.neutral400 }]}>Trạng thái đơn</Text>
      <View style={styles.chipRow}>
        {ORDER_STATUS_OPTIONS.map((o) => {
          const active = draft.status === o.id;
          return (
            <Pressable
              key={String(o.id)}
              onPress={() => patch({ status: o.id })}
              style={[
                styles.chip,
                active
                  ? { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                  : { backgroundColor: colors.neutral50, borderColor: colors.border10 },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? colors.primary : colors.neutral900 }]}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            const reset: ReportFilter = { depositStatus: null, status: null, customFrom: null, customTo: null };
            setDraft(reset);
            onApply(reset);
          }}
          style={[styles.btnOutline, { borderColor: colors.border10 }]}
        >
          <Text style={[styles.btnText, { color: colors.neutral500 }]}>Đặt lại</Text>
        </Pressable>
        <Pressable
          onPress={() => onApply(draft)}
          style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.btnText, { color: "#fff" }]}>Áp dụng</Text>
        </Pressable>
      </View>
    </View>
  );
}

function fmtDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const styles = createStyles(({ textPresets }) => ({
  sheet: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
  dragBar: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    marginBottom: 4,
    marginTop: 8,
  },
  title: {
    ...textPresets.fs16_600,
    marginBottom: 4,
  },
  sectionLabel: {
    ...textPresets.fs12_400,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    ...textPresets.fs12_500,
  },
  customDateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
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
