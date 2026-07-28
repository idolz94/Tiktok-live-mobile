import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Icon } from "@components/icon";
import type { SpxVoucher } from "../../service/create-shipment-api";

type Props = {
  vouchers: SpxVoucher[];
  loading?: boolean;
  error?: string | null;
  selectedCode: string | null;
  onSelect: (code: string | null) => void;
  onClose: () => void;
};

const PANEL_COLOR = "#ff3911"; // ponytail: kept for border/radio, panel bg now uses colors.primary

function fmtVND(raw: string) {
  const n = Number(raw);
  if (isNaN(n) || n === 0) return null;
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function fmtPercent(raw: string) {
  const n = Number(raw);
  return isNaN(n) || n === 0 ? null : `${n}%`;
}

function discountLabel(v: SpxVoucher): { value: string; isPercent: boolean } | null {
  if (v.discountBy === 1) {
    const pct = fmtPercent(v.voucherAmount);
    return pct ? { value: pct, isPercent: true } : null;
  }
  const vnd = fmtVND(v.voucherAmount);
  return vnd ? { value: vnd, isPercent: false } : null;
}

function now() {
  return Math.floor(Date.now() / 1000);
}

export function VoucherSelectSheet({ vouchers, loading, error, selectedCode, onSelect, onClose }: Props) {
  const { colors, textPresets } = useThemes();
  const ts = now();
  const [localSelected, setLocalSelected] = useState(selectedCode);

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
            vouchers.length > 0 ? (
              <Text style={[vStyles.sectionTitle, { color: colors.neutral500 }, textPresets.fs12_500]}>
                Mã khuyến mãi khả dụng
              </Text>
            ) : null
          }
          renderItem={({ item: v }) => {
            const selected = localSelected === v.voucherCode;
            const expired = v.validEndTime > 0 && ts > v.validEndTime;
            const notYet = v.validStartTime > 0 && ts < v.validStartTime;
            const disabled = expired || notYet;
            const discount = discountLabel(v);
            const minSpend = fmtVND(v.minSpend);
            const isNew = /mới|new/i.test(v.voucherName);
            const panelBg = disabled ? colors.neutral300 : colors.primary;

            return (
              <Pressable
                disabled={disabled}
                onPress={() => {
                  const next = selected ? null : v.voucherCode;
                  setLocalSelected(next);
                  onSelect(next);
                }}
                style={[vStyles.card, {
                  borderColor: selected ? PANEL_COLOR : colors.border10,
                  opacity: disabled ? 0.55 : 1,
                  backgroundColor: colors.surface,
                }]}
              >
                <View style={[vStyles.leftPanel, { backgroundColor: panelBg }]}>
                  <View style={vStyles.discountRow}>
                    {discount ? (
                      discount.isPercent ? (
                        <Text style={[vStyles.discountAmount, textPresets.fs16_900]} numberOfLines={1}>
                          {discount.value}
                        </Text>
                      ) : (
                        <Text style={vStyles.discountAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                          <Text style={{ fontSize: 10, fontWeight: "900" }}>đ </Text>
                          <Text style={{ fontSize: 18, fontWeight: "900" }}>{discount.value}</Text>
                        </Text>
                      )
                    ) : null}
                    <Text style={[vStyles.discountSub, textPresets.fs12_400]}>
                      {disabled ? (expired ? "Hết hạn" : "Chưa mở") : "Ước tính giảm giá"}
                    </Text>
                  </View>
                </View>
                <View style={vStyles.content}>
                  <Text
                    style={[{ color: disabled ? colors.neutral400 : colors.neutral900 }, textPresets.fs14_500]}
                    numberOfLines={2}
                  >
                    {v.voucherName || v.voucherCode}
                  </Text>
                  {!!minSpend && (
                    <Text style={[{ color: colors.neutral500 }, textPresets.fs12_400]}>
                      Phí vận chuyển tối thiểu đ{minSpend}
                    </Text>
                  )}
                  {isNew && !disabled && (
                    <View style={[vStyles.newTag, { borderColor: PANEL_COLOR }]}>
                      <Text style={[{ color: PANEL_COLOR }, textPresets.fs11_400]}>Dành cho tài khoản mới</Text>
                    </View>
                  )}
                </View>
                <View style={[vStyles.radio, { borderColor: selected ? PANEL_COLOR : colors.border20, marginRight: 12, alignSelf: "center" }]}>
                  {selected && <View style={[vStyles.radioDot, { backgroundColor: PANEL_COLOR }]} />}
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 32,
    minHeight: 200,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  center: {
    padding: 32,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 4,
  },
  card: {
    flexDirection: "row" as const,
    alignItems: "stretch" as const,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden" as const,
  },
  leftPanel: {
    width: 128,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 4,
  },
  discountRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flexWrap: "wrap" as const,
    justifyContent: "center" as const,
    gap: 4,
  },
  discountAmount: {
    color: "#fff",
    textAlign: "center" as const,
  },
  discountSub: {
    color: "rgba(255,255,255,0.85)",
    textAlign: "center" as const,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 4,
  },
  newTag: {
    alignSelf: "flex-start" as const,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
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
  empty: {
    textAlign: "center" as const,
    paddingVertical: 24,
  },
}));
