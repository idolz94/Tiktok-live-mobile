import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Icon } from "@components/icon";

type Props = {
  codAmount: number;
  shippingFee: number;
  voucherAmount: number;
  totalCollected: number;
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
  onSubmit: () => void;
  onClose: () => void;
};

function fmt(n: number) {
  return n.toLocaleString("vi-VN");
}

export function FeeDetailSheet({ codAmount, shippingFee, voucherAmount, totalCollected, isSubmitting, isSubmitDisabled, onSubmit, onClose }: Props) {
  const { colors, textPresets } = useThemes();
  const totalDiscount = voucherAmount;

  return (
    <View style={[fStyles.sheet, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={fStyles.header}>
        <Text style={[textPresets.fs18_500, { color: colors.neutral900 }]}>
          Ước tính phí thanh toán
        </Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Icon name="close" size={20} tintColor="neutral400" />
        </Pressable>
      </View>

      {/* Disclaimer */}
      <Text style={[textPresets.fs12_400, fStyles.disclaimer, { color: colors.neutral500 }]}>
        Phí vận chuyển thực tế phụ thuộc vào mức cước được SPX Express đối soát chính thức.
      </Text>

      {/* COD section */}
      <View style={[fStyles.section, { borderBottomColor: colors.border10 }]}>
        <View style={fStyles.row}>
          <Text style={[textPresets.fs14_500, { color: colors.neutral900 }]}>Tiền thu hộ (COD)</Text>
          <Text style={[textPresets.fs14_500, { color: colors.neutral900 }]}>
            đ{fmt(codAmount)}
          </Text>
        </View>
      </View>

      {/* Shipping fee section */}
      <View style={[fStyles.section, { borderBottomColor: colors.border10 }]}>
        <View style={fStyles.row}>
          <Text style={[textPresets.fs14_500, { color: colors.neutral900 }]}>Phí vận chuyển</Text>
          <Text style={[textPresets.fs14_500, { color: colors.neutral900 }]}>
            đ{fmt(shippingFee)}
          </Text>
        </View>
      </View>

      {/* Discount section */}
      {totalDiscount > 0 && (
        <View style={fStyles.section}>
          <View style={fStyles.row}>
            <Text style={[textPresets.fs14_500, { color: colors.neutral900 }]}>Tổng giảm giá</Text>
            <Text style={[textPresets.fs14_500, { color: colors.primary }]}>
              -{fmt(totalDiscount)}đ
            </Text>
          </View>
          <View style={fStyles.row}>
            <Text style={[textPresets.fs12_400, { color: colors.neutral500 }]}>
              Mã giảm phí vận chuyển
            </Text>
            <Text style={[textPresets.fs12_400, { color: colors.primary }]}>
              -{fmt(voucherAmount)}đ
            </Text>
          </View>
        </View>
      )}

      {/* Footer: Shipper thu + submit */}
      <View style={fStyles.footerRow}>
        <Text style={[textPresets.fs14_500, { color: colors.neutral900 }]}>Shipper thu</Text>
        <Text style={[textPresets.fs14_500, { color: colors.primary }]}>
          {totalCollected.toLocaleString("vi-VN")}đ
        </Text>
      </View>
      <Pressable
        onPress={onSubmit}
        disabled={isSubmitting || isSubmitDisabled}
        style={[
          fStyles.submitButton,
          { backgroundColor: isSubmitting || isSubmitDisabled ? colors.neutral300 : colors.primary },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Icon name="truck" size={18} tintColor="white" />
          )}
          <Text style={[{ color: "#fff" }, textPresets.fs16_500]}>Tạo vận đơn</Text>
        </View>
      </Pressable>
    </View>
  );
}

const fStyles = createStyles(({ colors }) => ({
  sheet: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  disclaimer: {
    lineHeight: 18,
  },
  section: {
    gap: 8,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  submitButton: {
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
}));
