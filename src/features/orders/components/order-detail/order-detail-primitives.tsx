import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { Icon } from "@components/icon";
import { OrderWithTikTok } from "@app-types/index";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { statusLabel } from "@features/orders/utils/order";

type SectionProps = {
  children: React.ReactNode;
};

export function Divider() {
  return <View style={styles.divider} />;
}

export function Section({ children }: SectionProps) {
  return <View style={styles.section}>{children}</View>;
}

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
};

export function SectionHeader({ title, actionLabel, onAction, loading }: SectionHeaderProps) {
  const { colors } = useThemes();
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {loading ? (
        <View style={styles.sectionAction}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.sectionActionText, { color: colors.neutral400 }]}>
            Đang cập nhật...
          </Text>
        </View>
      ) : actionLabel ? (
        <Pressable style={styles.sectionAction} onPress={onAction}>
          <Icon name="plus_circle" size={18} tintColor="primary" />
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type MoneyRowProps = {
  label: string;
  value: string;
  primary?: boolean;
};

export function MoneyRow({ label, value, primary }: MoneyRowProps) {
  const { colors } = useThemes();

  return (
    <View style={styles.moneyRow}>
      <Text style={styles.moneyLabel}>{label}</Text>
      <Text style={[styles.moneyValue, primary ? { color: colors.primary } : null]}>
        {value}
      </Text>
    </View>
  );
}

export function StatusTag({ status }: { status: OrderWithTikTok["status"] }) {
  return (
    <View style={styles.statusTag}>
      <Text style={styles.statusTagText}>{statusLabel(status)}</Text>
    </View>
  );
}

type CurrencyInputRowProps = {
  label: string;
  value: string;
  onChangeAmount: (amount: number, display: string) => void;
  editable?: boolean;
};

export function CurrencyInputRow({ label, value, onChangeAmount, editable = true }: CurrencyInputRowProps) {
  const { colors } = useThemes();
  const inputValueDigits = value.replace(/\D/g, "");
  const inputValue = inputValueDigits ? Number(inputValueDigits).toLocaleString("vi-VN") : "";

  return (
    <View style={styles.shippingInputRow}>
      <Text style={[styles.shippingInputLabel, { color: colors.neutral400 }]}>
        {label}
      </Text>
      <View style={[styles.shippingInputBox, { borderColor: colors.border10, backgroundColor: editable ? undefined : colors.neutral50 }]}>
        <TextInput
          style={[styles.shippingInput, { color: editable ? colors.neutral900 : colors.neutral400 }]}
          value={inputValue}
          onChangeText={(text) => {
            const digits = text.replace(/\D/g, "");
            const amount = digits ? Number(digits) : 0;
            onChangeAmount(amount, digits ? amount.toLocaleString("vi-VN") : "");
          }}
          placeholder="0"
          placeholderTextColor={colors.neutral300}
          keyboardType="numeric"
          textAlign="right"
          editable={editable}
        />
        <View style={[styles.shippingInputSuffix, { borderLeftColor: colors.border10, backgroundColor: colors.neutral50 }]}>
          <Text style={[styles.shippingInputSuffixText, { color: colors.neutral400 }]}>VNĐ</Text>
        </View>
      </View>
    </View>
  );
}

export const styles = createStyles(({ colors, textPresets, shadows }) => ({
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    rowGap: 16,
    ...shadows.sd2,
  },
  divider: { height: 0 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { color: colors.neutral900, ...textPresets.fs16_600 },
  sectionAction: { flexDirection: "row", alignItems: "center", columnGap: 4 },
  sectionActionText: { color: colors.primary, ...textPresets.fs14_500 },
  statusTag: {
    alignSelf: "flex-start",
    height: 24,
    borderRadius: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral50,
  },
  statusTagText: { color: colors.neutral500, ...textPresets.fs12_500 },
  moneyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 16,
  },
  moneyLabel: { color: colors.neutral400, ...textPresets.fs14_500 },
  moneyValue: { color: colors.neutral900, ...textPresets.fs14_500 },
  shippingInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 12,
  },
  shippingInputLabel: {
    ...textPresets.fs14_500,
    flex: 1,
  },
  shippingInputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    flex: 1,
  },
  shippingInput: {
    flex: 1,
    paddingHorizontal: 10,
    height: "100%",
    ...textPresets.fs14_500,
    textAlign: "right" as const,
  },
  shippingInputSuffix: {
    height: "100%",
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
  },
  shippingInputSuffixText: {
    ...textPresets.fs12_500,
  },
}));
