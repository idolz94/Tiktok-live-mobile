import { ScrollView, Text, View } from "react-native";
import { useToast } from "@components/toast";
import { LinearGradient } from "@components/linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Header } from "@components/header";
import { Button } from "@components/button";
import {
  SectionBlock,
  ShipmentInput,
  OptionChip,
  FigmaAddressCard,
} from "@features/orders/components/create-shipment";
import type { ShippingOrder } from "../hooks/use-shipping-tab";

export default function ShippingEditScreen() {
  const toast = useToast();
  const { order: orderParam } = useLocalSearchParams<{ order: string }>();
  const { colors, textPresets } = useThemes();
  const { bottom } = useSafeAreaInsets();

  const order = orderParam
    ? (() => {
        try {
          return JSON.parse(orderParam) as ShippingOrder;
        } catch {
          return null;
        }
      })()
    : null;

  const [cod, setCod] = useState(
    order?.codAmount != null ? String(order.codAmount) : "",
  );
  const [shippingFee, setShippingFee] = useState(
    order?.shippingFee != null ? String(order.shippingFee) : "",
  );
  const [note, setNote] = useState("");
  const [weight, setWeight] = useState("");
  const [dimL, setDimL] = useState("");
  const [dimW, setDimW] = useState("");
  const [dimH, setDimH] = useState("");
  // 1 = Tiêu chuẩn, 2 = Hỏa tốc
  const [serviceType, setServiceType] = useState<1 | 2>(1);
  // 1 = Lấy tại shop, 2 = Gửi điểm dịch vụ
  const [collectType, setCollectType] = useState<1 | 2>(1);
  // 1 = Người gửi, 0 = Người nhận
  const [paymentRole, setPaymentRole] = useState<0 | 1>(1);

  if (!order) {
    return (
      <View
        style={[
          styles.root,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: colors.neutral500 }}>
          Không tìm thấy đơn hàng.
        </Text>
      </View>
    );
  }

  const handleSave = () => {
    // ponytail: stub — wire to update API when backend endpoint available
    toast.success({
      title: "Đã lưu",
      description: "Thông tin vận đơn đã được cập nhật.",
    });
    router.back();
  };

  const recipientAddress = order.customerAddressData
    ? {
        id: order.customerAddressData.id,
        customerId: order.customerId ?? "",
        name: order.customerName ?? null,
        phone: order.customerPhone ?? null,
        address: order.customerAddressData.address ?? null,
        province: order.customerAddressData.province ?? null,
        district: order.customerAddressData.district ?? null,
        ward: order.customerAddressData.ward ?? null,
        label: null,
        isDefault: false,
        createdAt: "",
        updatedAt: "",
      }
    : null;

  return (
    <View style={styles.root}>
      <LinearGradient type="gra_background" style={styles.bg} />
      <Header title="Chỉnh sửa đơn hàng" transparent />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Người nhận */}
        <View style={[styles.card, { backgroundColor: colors.neutral100, borderColor: colors.border10 }]}>
          <FigmaAddressCard
            type="recipient"
            address={recipientAddress}
            loading={false}
            onChangePress={() => {}}
            onAddPress={() => {}}
          />
        </View>

        {/* Thông tin đơn hàng */}
        <View style={[styles.card, { backgroundColor: colors.neutral100, borderColor: colors.border10 }]}>
          <SectionBlock title="Thông tin đơn hàng">
            <ShipmentInput
              label="Tiền thu hộ (COD)"
              value={cod}
              onChangeText={setCod}
              placeholder="0"
              keyboardType="numeric"
              money
            />
            <ShipmentInput
              label="Phí vận chuyển"
              value={shippingFee}
              onChangeText={setShippingFee}
              placeholder="0"
              keyboardType="numeric"
              money
            />
            <ShipmentInput
              label="Ghi chú"
              value={note}
              onChangeText={setNote}
              placeholder="Ghi chú cho shipper..."
              multiline
            />
          </SectionBlock>
        </View>

        {/* Kích thước */}
        <View style={[styles.card, { backgroundColor: colors.neutral100, borderColor: colors.border10 }]}>
          <SectionBlock title="Kích thước kiện hàng">
            <View style={styles.dimRow}>
              <View style={styles.dimField}>
                <ShipmentInput
                  label="Dài (cm)"
                  value={dimL}
                  onChangeText={setDimL}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.dimField}>
                <ShipmentInput
                  label="Rộng (cm)"
                  value={dimW}
                  onChangeText={setDimW}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.dimField}>
                <ShipmentInput
                  label="Cao (cm)"
                  value={dimH}
                  onChangeText={setDimH}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <ShipmentInput
              label="Cân nặng (gram)"
              value={weight}
              onChangeText={setWeight}
              placeholder="0"
              keyboardType="numeric"
            />
          </SectionBlock>
        </View>

        {/* Loại dịch vụ */}
        <View style={[styles.card, { backgroundColor: colors.neutral100, borderColor: colors.border10 }]}>
          <SectionBlock title="Loại dịch vụ">
            <OptionChip
              label="Giao hàng Tiêu Chuẩn"
              selected={serviceType === 1}
              onPress={() => setServiceType(1)}
            />
            <OptionChip
              label="Giao hàng Hỏa Tốc"
              selected={serviceType === 2}
              onPress={() => setServiceType(2)}
            />
          </SectionBlock>
        </View>

        {/* Hình thức lấy hàng */}
        <View style={[styles.card, { backgroundColor: colors.neutral100, borderColor: colors.border10 }]}>
          <SectionBlock title="Hình thức lấy hàng">
            <OptionChip
              label="Lấy hàng tại shop"
              selected={collectType === 1}
              onPress={() => setCollectType(1)}
            />
            <OptionChip
              label="Gửi tại điểm dịch vụ"
              selected={collectType === 2}
              onPress={() => setCollectType(2)}
            />
          </SectionBlock>
        </View>

        {/* Người thanh toán */}
        <View style={[styles.card, { backgroundColor: colors.neutral100, borderColor: colors.border10 }]}>
          <SectionBlock title="Người thanh toán">
            <OptionChip
              label="Người gửi"
              selected={paymentRole === 1}
              onPress={() => setPaymentRole(1)}
            />
            <OptionChip
              label="Người nhận"
              selected={paymentRole === 0}
              onPress={() => setPaymentRole(0)}
            />
          </SectionBlock>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border10,
            paddingBottom: Math.max(bottom, 16),
          },
        ]}
      >
        <Button
          title="Chỉnh Sửa Đơn Hàng"
          type="gradient"
          onPress={handleSave}
          containerStyle={styles.footerButton}
        />
      </View>
    </View>
  );
}

const styles = createStyles(({ colors }) => ({
  root: { flex: 1 },
  bg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  scrollContent: { gap: 12, paddingTop: 12, paddingHorizontal: 16 },
  card: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 16,
    gap: 12,
    overflow: "hidden",
  },
  dimRow: { flexDirection: "row", gap: 8 },
  dimField: { flex: 1 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  footerButton: {
    height: 50,
    borderRadius: 14,
  },
}));
