import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Icon } from "@components/icon";
import type { SpxVoucher } from "../service/create-shipment-api";

type Props = {
  vouchers: SpxVoucher[];
  loading?: boolean;
  error?: string | null;
  selectedCode: string | null;
  onSelect: (code: string | null) => void;
  onClose: () => void;
};

function fmtVND(raw: string) {
  const n = Number(raw);
  return isNaN(n) || n === 0 ? null : n.toLocaleString("vi-VN") + "đ";
}

function fmtPercent(raw: string) {
  const n = Number(raw);
  return isNaN(n) || n === 0 ? null : `${n}%`;
}

function discountLabel(v: SpxVoucher) {
  // discountBy: 1 = fixed, 2 = percent
  if (v.discountBy === 2) return fmtPercent(v.voucherAmount) ?? v.voucherName;
  return fmtVND(v.voucherAmount) ?? v.voucherName;
}

function now() {
  return Math.floor(Date.now() / 1000);
}

export function VoucherSelectSheet({ vouchers, loading, error, selectedCode, onSelect, onClose }: Props) {
  const { colors, textPresets } = useThemes();
  const ts = now();

  return (
    <View style={[vStyles.sheet, { backgroundColor: colors.surface }]}>
      <View style={vStyles.header}>
        <Text style={[{ color: colors.neutral900 }, textPresets.fs18_500]}>Chọn Voucher SPX</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Icon name="close" size={20} tintColor="neutral400" />
        </Pressable>
      </View>

      {loading ? (
        <View style={vStyles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={vStyles.center}>
          <Text style={[{ color: colors.error }, textPresets.fs14_400]}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(v) => v.voucherCode}
          contentContainerStyle={vStyles.list}
          ListHeaderComponent={
            <Pressable
              onPress={() => { onSelect(null); onClose(); }}
              style={[vStyles.row, { borderColor: !selectedCode ? colors.primary : colors.border10, backgroundColor: !selectedCode ? colors.primaryLight : colors.neutral50 }]}
            >
              <View style={[vStyles.radio, { borderColor: !selectedCode ? colors.primary : colors.border20 }]}>
                {!selectedCode && <View style={[vStyles.radioDot, { backgroundColor: colors.primary }]} />}
              </View>
              <Text style={[{ color: colors.neutral900 }, textPresets.fs14_500]}>Không dùng voucher</Text>
            </Pressable>
          }
          renderItem={({ item: v }) => {
            const selected = selectedCode === v.voucherCode;
            const expired = v.validEndTime > 0 && ts > v.validEndTime;
            const notYet = v.validStartTime > 0 && ts < v.validStartTime;
            const disabled = expired || notYet;
            const discount = discountLabel(v);
            const cap = fmtVND(v.voucherCap);
            const minSpend = fmtVND(v.minSpend);

            return (
              <Pressable
                disabled={disabled}
                onPress={() => { onSelect(v.voucherCode); onClose(); }}
                style={[
                  vStyles.row,
                  {
                    borderColor: selected ? colors.primary : colors.border10,
                    backgroundColor: disabled ? colors.neutral100 : selected ? colors.primaryLight : colors.surface,
                    opacity: disabled ? 0.55 : 1,
                  },
                ]}
              >
                <View style={[vStyles.radio, { borderColor: selected ? colors.primary : colors.border20 }]}>
                  {selected && <View style={[vStyles.radioDot, { backgroundColor: colors.primary }]} />}
                </View>
                <View style={vStyles.info}>
                  <View style={vStyles.topRow}>
                    {!!discount && (
                      <View style={[vStyles.discountBadge, { backgroundColor: colors.primary }]}>
                        <Text style={[textPresets.fs12_500, { color: "#fff" }]}>{discount}</Text>
                      </View>
                    )}
                    <Text style={[vStyles.name, { color: disabled ? colors.neutral400 : colors.neutral900 }, textPresets.fs14_500]} numberOfLines={1}>
                      {v.voucherName || v.voucherCode}
                    </Text>
                  </View>
                  <View style={vStyles.metaRow}>
                    {!!minSpend && (
                      <Text style={[{ color: colors.neutral500 }, textPresets.fs12_400]}>Tối thiểu {minSpend}</Text>
                    )}
                    {!!cap && (
                      <Text style={[{ color: colors.neutral500 }, textPresets.fs12_400]}>Giảm tối đa {cap}</Text>
                    )}
                  </View>
                  {disabled && (
                    <Text style={[{ color: colors.error }, textPresets.fs11_400]}>
                      {expired ? "Voucher đã hết hạn" : "Chưa đến thời gian áp dụng"}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text style={[vStyles.empty, { color: colors.neutral400 }, textPresets.fs14_400]}>
              Không có voucher khả dụng
            </Text>
          }
        />
      )}
    </View>
  );
}

const vStyles = createStyles(() => ({
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: 560,
    overflow: "hidden" as const,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  center: {
    minHeight: 140,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
  },
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  info: { flex: 1, gap: 4 },
  topRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    flexWrap: "wrap" as const,
  },
  discountBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  name: { flexShrink: 1 },
  metaRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  empty: {
    textAlign: "center" as const,
    paddingVertical: 24,
  },
}));
