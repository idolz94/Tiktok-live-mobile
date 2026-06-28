import { Pressable, Text, View } from "react-native";
import { Icon } from "@components/icon";
import { OrderWithTikTok } from "@app-types/index";
import { formatMoney } from "@features/orders/utils/order";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { CurrencyInputRow, MoneyRow, Section, SectionHeader } from "./OrderDetailPrimitives";
import { type ShippingProvider } from "@features/orders/components/shipping-provider-sheet";

type OrderDetailShippingSectionProps = {
  order: OrderWithTikTok;
  selectedProvider: ShippingProvider;
  shippingFeeDisplay: string;
  prepaidDisplay: string;
  remain: number;
  onOpenProvider: () => void;
  onChangeShippingFee: (amount: number, display: string) => void;
  onChangePrepaid: (amount: number, display: string) => void;
};

export function OrderDetailShippingSection({
  order,
  selectedProvider,
  shippingFeeDisplay,
  prepaidDisplay,
  remain,
  onOpenProvider,
  onChangeShippingFee,
  onChangePrepaid,
}: OrderDetailShippingSectionProps) {
  const { colors } = useThemes();

  return (
    <Section>
      <SectionHeader title="Phương thức vận chuyển" />
      <Pressable
        style={[styles.providerCard, { backgroundColor: colors.neutral50 }]}
        onPress={onOpenProvider}
      >
        <View
          style={[
            styles.providerIcon,
            {
              backgroundColor: selectedProvider === "spx" ? "#ffb000" : "#2ca87b",
            },
          ]}
        >
          <Text style={styles.providerInitial}>
            {selectedProvider === "spx" ? "S" : "M"}
          </Text>
        </View>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>
            {selectedProvider === "spx" ? "Shopee Express" : "Vận chuyển thủ công"}
          </Text>
          {order.trackingCode ? (
            <Text style={styles.providerCode}>{order.trackingCode}</Text>
          ) : null}
        </View>
        <Icon name="arrow_down" size={18} tintColor="neutral400" />
      </Pressable>

      <CurrencyInputRow
        label="Phí vận chuyển"
        value={shippingFeeDisplay}
        onChangeAmount={onChangeShippingFee}
      />

      <CurrencyInputRow
        label="Khách trả trước"
        value={prepaidDisplay}
        onChangeAmount={onChangePrepaid}
      />

      <MoneyRow label="Còn lại" value={formatMoney(remain)} primary />
    </Section>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.neutral50,
  },
  providerIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  providerInitial: {
    color: "#fff",
    fontWeight: "700" as const,
    fontSize: 16,
  },
  providerInfo: { flex: 1, rowGap: 2 },
  providerName: { color: colors.neutral900, ...textPresets.fs14_500 },
  providerCode: { color: colors.neutral400, ...textPresets.fs12_400 },
}));
