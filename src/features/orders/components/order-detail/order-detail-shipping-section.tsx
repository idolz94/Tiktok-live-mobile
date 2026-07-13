import { Image, Pressable, Text, View } from "react-native";
import { images } from "@assets/images";
import { Icon } from "@components/icon";
import { OrderWithTikTok } from "@app-types/index";
import { formatMoney } from "@features/orders/utils/order";
import { createStyles } from "@utils/createStyles";
import { useThemes } from "@hooks/use-theme";
import { CurrencyInputRow, MoneyRow, Section, SectionHeader } from "./order-detail-primitives";
import { type ShippingProvider } from "@features/orders/components/shipping-provider-sheet";

type OrderDetailShippingSectionProps = {
  order: OrderWithTikTok;
  selectedProvider: ShippingProvider;
  shippingFeeDisplay: string;
  prepaidDisplay: string;
  remain: number;
  isEditable?: boolean;
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
  isEditable = true,
  onOpenProvider,
  onChangeShippingFee,
  onChangePrepaid,
}: OrderDetailShippingSectionProps) {
  const { colors } = useThemes();
  // Khi đã có vận đơn, ưu tiên provider thật từ shipment thay vì state UI cục bộ
  const displayProvider: ShippingProvider =
    order.trackingCode && order.providerName
      ? order.providerName === "spx"
        ? "spx"
        : "manual"
      : selectedProvider;
  const isSpx = displayProvider === "spx";

  return (
    <Section>
      <SectionHeader
        title="Phương thức vận chuyển"
        actionLabel={order.status !== "draft" ? "Theo dõi" : undefined}
      />
      <Pressable
        style={styles.providerCard}
        onPress={isEditable ? onOpenProvider : undefined}
        disabled={!isEditable}
      >
        <View
          style={[
            styles.providerIcon,
            {
              backgroundColor: isSpx ? "#fff" : "#2ca87b",
              borderWidth: isSpx ? 1 : 0,
              borderColor: colors.border10,
            },
          ]}
        >
          {isSpx ? (
            <Image source={images.logo_spx} style={styles.providerLogo} resizeMode="contain" />
          ) : (
            <Text style={styles.providerInitial}>M</Text>
          )}
        </View>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>
            {isSpx ? "Shopee Express" : "Vận chuyển thủ công"}
          </Text>
          {order.trackingCode ? (
            <Text style={styles.providerCode}>{order.trackingCode}</Text>
          ) : null}
        </View>
        <Icon name="chevron_down" size={16} tintColor="neutral400" />
      </Pressable>

      <CurrencyInputRow
        label="Phí vận chuyển"
        value={shippingFeeDisplay}
        onChangeAmount={onChangeShippingFee}
        editable={isEditable}
      />

      <CurrencyInputRow
        label="Khách trả trước"
        value={prepaidDisplay}
        onChangeAmount={onChangePrepaid}
        editable={isEditable}
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
    backgroundColor: "#f7f8fa",
  },
  providerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  providerInitial: {
    color: "#fff",
    fontWeight: "700" as const,
    fontSize: 16,
  },
  providerLogo: { width: 32, height: 32 },
  providerInfo: { flex: 1, rowGap: 2 },
  providerName: { color: colors.neutral900, ...textPresets.fs14_500 },
  providerCode: { color: colors.neutral400, ...textPresets.fs12_400 },
}));
