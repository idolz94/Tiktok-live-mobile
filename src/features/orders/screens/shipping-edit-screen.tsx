import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useToast } from "@components/toast";
import { LinearGradient } from "@components/linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import {
  SectionBlock,
  ShipmentInput,
  OptionChip,
} from "@features/orders/components/create-shipment";
import type { ShippingOrder } from "../hooks/use-shipping-tab";

export default function ShippingEditScreen() {
  const toast = useToast();
  const { order: orderParam } = useLocalSearchParams<{ order: string }>();
  const { colors, textPresets } = useThemes();
  const { top, bottom } = useSafeAreaInsets();

  const order = orderParam
    ? (() => {
        try {
          return JSON.parse(orderParam) as ShippingOrder;
        } catch {
          return null;
        }
      })()
    : null;

  const [customerName, setCustomerName] = useState(order?.customerName ?? "");
  const [customerPhone, setCustomerPhone] = useState(
    order?.customerPhone ?? "",
  );
  const [address, setAddress] = useState(
    [
      order?.customerAddressData?.address,
      order?.customerAddressData?.ward,
      order?.customerAddressData?.district,
      order?.customerAddressData?.province,
    ]
      .filter(Boolean)
      .join(", ") ?? "",
  );
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

  return (
    <View style={styles.root}>
      <LinearGradient type="gra_background" style={StyleSheet.absoluteFill} />
      {/* Header */}
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.neutral900} />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            { color: colors.neutral900, fontSize: 24, fontWeight: "600" },
          ]}
        >
          Chỉnh sửa vận đơn
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Người nhận */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SectionBlock title="Thông tin người nhận">
            <ShipmentInput
              label="Họ và tên"
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Nhập tên người nhận"
              required
            />
            <ShipmentInput
              label="Số điện thoại"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="Nhập số điện thoại"
              keyboardType="numeric"
              required
            />
            <ShipmentInput
              label="Địa chỉ"
              value={address}
              onChangeText={setAddress}
              placeholder="Nhập địa chỉ giao hàng"
              multiline
            />
          </SectionBlock>
        </View>

        {/* Thông tin đơn hàng */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
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
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
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
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
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
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
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
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
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

      {/* Submit bar */}
      <View
        style={[
          styles.submitBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border10,
            paddingBottom: Math.max(bottom, 16),
          },
        ]}
      >
        <Pressable
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text
            style={[
              styles.submitBtnText,
              { color: "#fff", ...textPresets.fs16_600 },
            ]}
          >
            Lưu thay đổi
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = createStyles(({ colors }) => ({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 4,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  headerTitle: { flex: 1 },
  scrollContent: { gap: 12, paddingTop: 12, paddingHorizontal: 16 },
  card: { borderRadius: 12, overflow: "hidden" },
  dimRow: { flexDirection: "row", gap: 8 },
  dimField: { flex: 1 },
  submitBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {},
}));
