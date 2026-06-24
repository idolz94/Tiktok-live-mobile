import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Icon } from "@components/icon";
import { OrderWithTikTok } from "@app-types/index";
import {
  CustomerAddress,
  ShopAddress,
  SubmitShippingPayload,
  submitManualShippingApi,
  submitOrderToGhtkApi,
  createShopAddressApi,
  updateShopAddressApi,
  deleteShopAddressApi,
  createCustomerAddressApi,
  updateCustomerAddressApi,
  deleteCustomerAddressApi,
  patchOrderApi,
  getShippingFeeApi,
} from "./create-shipment-api";
import { getOrderTotal } from "@features/orders/utils/order";
import { SectionBlock, FigmaAddressCard, OptionChip, MoneyField, ShipmentInput, ShippingOptions, SummaryRow, shipmentStyles } from "./components/ShipmentComponents";
import { AddressPickerSheet } from "./components/AddressPickerSheet";
import { AddressFormModal } from "./components/AddressFormModal";
import { PackageDimModal } from "./components/PackageDimModal";
import { AddrFormValues, Transport, PaymentSide, ViewCondition, PickupOption, DeliveryPolicy, RefusalFee } from "./types";
import { useShipmentAddresses } from "./hooks/use-shipment-addresses";
import { parseLocaleNumber, formatLocaleInput, formInitialValues, addressPayload } from "./utils";

export default function CreateShipmentScreen() {
  const { colors, textPresets } = useThemes();
  const params = useLocalSearchParams<{ order?: string; shippingFee?: string; provider?: string }>();
  const [order, setOrder] = useState<OrderWithTikTok | null>(() => {
    if (!params.order) return null;
    try {
      return JSON.parse(params.order) as OrderWithTikTok;
    } catch {
      return null;
    }
  });

  const [senderSheetVisible, setSenderSheetVisible] = useState(false);
  const [recipientSheetVisible, setRecipientSheetVisible] = useState(false);
  const [addrFormTarget, setAddrFormTarget] = useState<"sender" | "recipient" | null>(null);
  const [addrFormMode, setAddrFormMode] = useState<"add" | "edit">("add");
  const [editingAddr, setEditingAddr] = useState<ShopAddress | CustomerAddress | null>(null);
  const [isSavingAddr, setIsSavingAddr] = useState(false);
  const [transport, setTransport] = useState<Transport>("road");
  const [paymentSide, setPaymentSide] = useState<PaymentSide>(0);
  const [viewCondition, setViewCondition] = useState<ViewCondition>("viewable");
  const [pickupOption, setPickupOption] = useState<PickupOption>("cod");
  const [deliveryPolicy, setDeliveryPolicy] = useState<DeliveryPolicy>("full");
  const [refusalFee, setRefusalFee] = useState<RefusalFee>("free");
  const [weightInput, setWeightInput] = useState("500");
  const [manualNote, setManualNote] = useState("");
  const [manualShippingFee, setManualShippingFee] = useState(() => formatLocaleInput(String(params.shippingFee ?? "")));
  const [dimLength, setDimLength] = useState("40");
  const [dimWidth, setDimWidth] = useState("40");
  const [dimHeight, setDimHeight] = useState("10");
  const [autoScale, setAutoScale] = useState(true);
  const [dimensionsOpen, setDimensionsOpen] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState<string | null>(null);
  const [note, setNote] = useState(order?.note ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mountedRef = useRef(true);

  const orderProducts = order?.products ?? [];
  const primaryProduct = orderProducts[0];
  const displayQuantity = orderProducts.reduce((sum, item) => sum + (item.quantity || 0), 0) || order?.quantity || 1;
  const isManualProvider = params.provider === "manual";
  const orderTotal = useMemo(() => getOrderTotal(orderProducts), [orderProducts]);
  const [manualCodAmount, setManualCodAmount] = useState(() => formatLocaleInput(String(order?.codAmount ?? orderTotal)));
  const manualFee = useMemo(() => parseLocaleNumber(manualShippingFee), [manualShippingFee]);
  const shippingFee = isManualProvider ? manualFee : estimatedFee ?? parseLocaleNumber(String(params.shippingFee ?? ""));
  const codAmount = isManualProvider ? parseLocaleNumber(manualCodAmount) : order?.codAmount ?? orderTotal;
  const codAmountDisplay = useMemo(() => isManualProvider ? manualCodAmount : formatLocaleInput(String(codAmount)), [codAmount, isManualProvider, manualCodAmount]);
  const totalCollected = paymentSide === 0 ? codAmount + shippingFee : codAmount;
  const goodsValueDisplay = useMemo(() => formatLocaleInput(String(orderTotal)), [orderTotal]);
  const formTitle = addrFormTarget === "sender"
    ? addrFormMode === "add" ? "Thêm địa chỉ người gửi" : "Sửa địa chỉ người gửi"
    : addrFormMode === "add" ? "Thêm địa chỉ người nhận" : "Sửa địa chỉ người nhận";

  const {
    shopAddresses,
    customerAddresses,
    selectedSender,
    setSelectedSender,
    selectedRecipient,
    setSelectedRecipient,
    isLoadingSender,
    isLoadingRecipient,
    reloadShopAddresses,
    reloadCustomerAddresses,
  } = useShipmentAddresses(order);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchEstimatedFee = useCallback(async () => {
    if (isManualProvider || !order || !selectedSender?.province || !selectedSender?.district || !selectedRecipient?.province || !selectedRecipient?.district) {
      setEstimatedFee(null);
      return;
    }
    setFeeLoading(true);
    setFeeError(null);
    try {
      const result = await getShippingFeeApi(order.id, {
        pickProvince: selectedSender.province,
        pickDistrict: selectedSender.district,
        pickWard: selectedSender.ward ?? undefined,
        pickAddress: selectedSender.address ?? undefined,
        receiverProvince: selectedRecipient.province,
        receiverDistrict: selectedRecipient.district,
        receiverWard: selectedRecipient.ward ?? undefined,
        receiverAddress: selectedRecipient.address ?? undefined,
        weight: parseLocaleNumber(weightInput) || undefined,
        transport,
      });
      if (!mountedRef.current) return;
      setEstimatedFee(result.fee.fee);
    } catch {
      if (!mountedRef.current) return;
      setEstimatedFee(null);
      setFeeError("Không tính được phí ship.");
    } finally {
      if (mountedRef.current) setFeeLoading(false);
    }
  }, [isManualProvider, order, selectedRecipient, selectedSender, transport, weightInput]);

  useEffect(() => {
    void fetchEstimatedFee();
  }, [fetchEstimatedFee]);

  const handleAddAddress = useCallback((target: "sender" | "recipient") => {
    if (target === "recipient" && !order?.customerId) {
      Alert.alert("Không thể thêm địa chỉ", "Đơn hàng chưa có khách hàng.");
      return;
    }
    setEditingAddr(null);
    setAddrFormMode("add");
    setAddrFormTarget(target);
  }, [order?.customerId]);

  const handleEditAddress = useCallback((target: "sender" | "recipient", addr: ShopAddress | CustomerAddress) => {
    setEditingAddr(addr);
    setAddrFormMode("edit");
    setAddrFormTarget(target);
  }, []);

  const handleDeleteAddress = useCallback((target: "sender" | "recipient", addr: ShopAddress | CustomerAddress) => {
    Alert.alert("Xoá địa chỉ", "Bạn có chắc muốn xoá địa chỉ này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            if (target === "sender") {
              await deleteShopAddressApi(addr.id);
              if (selectedSender?.id === addr.id) setSelectedSender(null);
              await reloadShopAddresses();
              return;
            }
            if (!order?.customerId) return;
            await deleteCustomerAddressApi(order.customerId, addr.id);
            if (selectedRecipient?.id === addr.id) setSelectedRecipient(null);
            await reloadCustomerAddresses();
          } catch {
            Alert.alert("Xoá thất bại", "Không thể xoá địa chỉ. Vui lòng thử lại.");
          }
        },
      },
    ]);
  }, [order?.customerId, reloadCustomerAddresses, reloadShopAddresses, selectedRecipient?.id, selectedSender?.id]);

  const handleSelectRecipient = useCallback((addr: CustomerAddress) => {
    if (!order) return;
    setSelectedRecipient(addr);
    patchOrderApi(order.id, { customerAddressId: addr.id }).catch(() => {});
    setOrder({ ...order, customerAddressId: addr.id, customerAddressData: addr });
  }, [order]);

  const handleSaveAddress = useCallback(async (values: AddrFormValues) => {
    if (!addrFormTarget || !order) return;
    if (addrFormTarget === "recipient" && !order.customerId) {
      Alert.alert("Không thể lưu", "Đơn hàng chưa có khách hàng.");
      return;
    }
    const payload = addressPayload(values);
    setIsSavingAddr(true);
    try {
      if (addrFormTarget === "sender") {
        const saved = addrFormMode === "edit" && editingAddr
          ? await updateShopAddressApi(editingAddr.id, payload)
          : await createShopAddressApi(payload);
        setSelectedSender(saved);
        await reloadShopAddresses();
      } else if (order.customerId) {
        const saved = addrFormMode === "edit" && editingAddr
          ? await updateCustomerAddressApi(order.customerId, editingAddr.id, payload)
          : await createCustomerAddressApi(order.customerId, payload);
        setSelectedRecipient(saved);
        await patchOrderApi(order.id, { customerAddressId: saved.id });
        setOrder({ ...order, customerAddressId: saved.id, customerAddressData: saved });
        await reloadCustomerAddresses();
      }
      setAddrFormTarget(null);
      setEditingAddr(null);
    } catch {
      Alert.alert("Lưu thất bại", "Không thể lưu địa chỉ. Vui lòng thử lại.");
    } finally {
      setIsSavingAddr(false);
    }
  }, [addrFormMode, addrFormTarget, editingAddr, order, reloadCustomerAddresses, reloadShopAddresses]);

  const handleSubmitShipment = useCallback(async () => {
    if (!order || !selectedSender || !selectedRecipient) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn đầy đủ địa chỉ người gửi và người nhận.");
      return;
    }
    const payload: SubmitShippingPayload = {
      pickName: selectedSender.name ?? "",
      pickAddress: selectedSender.address ?? "",
      pickProvince: selectedSender.province ?? "",
      pickDistrict: selectedSender.district ?? "",
      pickWard: selectedSender.ward ?? undefined,
      pickTel: selectedSender.phone ?? "",
      receiverName: selectedRecipient.name ?? "",
      receiverAddress: selectedRecipient.address ?? "",
      receiverProvince: selectedRecipient.province ?? "",
      receiverDistrict: selectedRecipient.district ?? "",
      receiverWard: selectedRecipient.ward ?? "",
      receiverTel: selectedRecipient.phone ?? "",
      note,
      isFreeShip: paymentSide,
      transport,
      pickOption: pickupOption,
    };
    setIsSubmitting(true);
    try {
      if (isManualProvider) {
        await submitManualShippingApi(order.id, {
          paymentSide,
          shippingFee: manualShippingFee.trim() ? manualFee : undefined,
          codAmount: manualCodAmount.trim() ? parseLocaleNumber(manualCodAmount) : undefined,
          note: manualNote.trim() || undefined,
        });
      } else {
        await submitOrderToGhtkApi(order.id, payload);
      }
      Alert.alert("Tạo vận đơn thành công", "Đơn hàng đã được gửi sang đơn vị vận chuyển.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Tạo vận đơn thất bại", "Vui lòng kiểm tra thông tin và thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isManualProvider, manualCodAmount, manualFee, manualNote, manualShippingFee, note, order, paymentSide, pickupOption, selectedRecipient, selectedSender, transport]);

  if (!order) {
    return (
      <SafeAreaView style={[screenStyles.safeArea, { backgroundColor: colors.neutral100 }]}>
        <View style={screenStyles.centerBox}>
          <Text style={[{ color: colors.neutral900 }, textPresets.fs16_500]}>Không tìm thấy đơn hàng</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[screenStyles.safeArea, { backgroundColor: colors.neutral100 }]}>
      <View style={screenStyles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={[screenStyles.headerButton, { backgroundColor: colors.neutral50 }]}>
          <View style={screenStyles.backIcon}>
            <Icon name="arrow_down" size={22} tintColor="neutral900" />
          </View>
        </Pressable>
        <Pressable hitSlop={12} style={[screenStyles.headerButton, { backgroundColor: colors.neutral50 }]}>
          <Icon name="settings" size={22} tintColor="neutral900" />
        </Pressable>
      </View>
      <Text style={[screenStyles.screenTitle, { color: colors.neutral900 }]}>Tạo đơn hàng</Text>

      <ScrollView style={screenStyles.scroll} contentContainerStyle={screenStyles.scrollContent} keyboardShouldPersistTaps="handled">
        <SectionBlock title="Thông tin người gửi">
          <FigmaAddressCard address={selectedSender} loading={isLoadingSender} onChangePress={() => setSenderSheetVisible(true)} onAddPress={() => handleAddAddress("sender")} />
        </SectionBlock>
        <View style={[shipmentStyles.divider, { backgroundColor: colors.neutral50 }]} />

        <SectionBlock title="Thông tin người nhận">
          <FigmaAddressCard address={selectedRecipient} loading={isLoadingRecipient} onChangePress={() => setRecipientSheetVisible(true)} onAddPress={() => handleAddAddress("recipient")} />
        </SectionBlock>
        <View style={[shipmentStyles.divider, { backgroundColor: colors.neutral50 }]} />

        {!isManualProvider ? (
          <SectionBlock title="Thông tin đơn hàng" actionLabel="Kích thước" onActionPress={() => setDimensionsOpen(true)}>
            <View style={[shipmentStyles.orderCard, { backgroundColor: colors.neutral50 }]}>
            <View style={shipmentStyles.orderMetaRow}>
              <View style={shipmentStyles.productTitle}>
                <Text style={[{ color: colors.neutral900 }, textPresets.fs14_500]} numberOfLines={2}>{primaryProduct?.name ?? order.productName ?? "—"}</Text>
                {primaryProduct?.variantName ? <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400]}>{primaryProduct.variantName}</Text> : null}
              </View>
            </View>
            <View style={shipmentStyles.detailGrid}>
              {[
                { label: "Dài", value: dimLength ? `${dimLength} cm` : "—" },
                { label: "Rộng", value: dimWidth ? `${dimWidth} cm` : "—" },
                { label: "Cao", value: dimHeight ? `${dimHeight} cm` : "—" },
                { label: "Khối lượng", value: `${weightInput} gram` },
              ].map((cell) => (
                <View key={cell.label} style={[shipmentStyles.detailCell, { backgroundColor: colors.surface }]}>
                  <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400]}>{cell.label}</Text>
                  <Text style={[{ color: colors.neutral900 }, textPresets.fs14_500]}>{cell.value}</Text>
                </View>
              ))}
            </View>
            <View style={shipmentStyles.quantityRow}>
              <Text style={[{ color: colors.neutral900 }, textPresets.fs14_500]}>Số lượng</Text>
              <View style={[shipmentStyles.stepper, { backgroundColor: colors.surface, borderColor: colors.border10, borderWidth: 1 }]}>
                <Pressable hitSlop={8} style={shipmentStyles.stepperBtn} onPress={() => { const w = parseLocaleNumber(weightInput); if (w > 100) setWeightInput(formatLocaleInput(String(w - 100))); }}>
                  <Text style={[{ color: colors.neutral900 }, textPresets.fs18_700]}>−</Text>
                </Pressable>
                <Text style={[shipmentStyles.stepperValue, { color: colors.neutral900 }, textPresets.fs14_500]}>{displayQuantity}</Text>
                <Pressable hitSlop={8} style={shipmentStyles.stepperBtn} onPress={() => { const w = parseLocaleNumber(weightInput); setWeightInput(formatLocaleInput(String(w + 100))); }}>
                  <Text style={[{ color: colors.neutral900 }, textPresets.fs18_700]}>+</Text>
                </Pressable>
              </View>
            </View>
            </View>
          </SectionBlock>
        ) : null}
        {!isManualProvider ? <View style={[shipmentStyles.divider, { backgroundColor: colors.neutral50 }]} /> : null}

        <SectionBlock title="Thông tin thanh toán">
          <MoneyField
            label="Tiền thu hộ (COD)"
            value={codAmountDisplay}
            onChangeText={(text) => setManualCodAmount(formatLocaleInput(text))}
            editable={isManualProvider}
          />
          <MoneyField label="Tổng giá trị hàng hóa" value={goodsValueDisplay} editable={false} />
          <View style={shipmentStyles.optionGrid}>
            <OptionChip label="Bên nhận trả phí" selected={paymentSide === 0} onPress={() => setPaymentSide(0)} />
            <OptionChip label="Bên gửi trả phí" selected={paymentSide === 1} onPress={() => setPaymentSide(1)} />
          </View>
        </SectionBlock>
        <View style={[shipmentStyles.divider, { backgroundColor: colors.neutral50 }]} />

        <SectionBlock title="Thông tin vận chuyển">
          {isManualProvider ? (
            <>
              <ShipmentInput label="Phí vận chuyển" value={manualShippingFee} onChangeText={(text) => setManualShippingFee(formatLocaleInput(text))} placeholder="0" keyboardType="numeric" />
              <ShipmentInput label="Ghi chú" value={manualNote} onChangeText={setManualNote} placeholder="Nhập ghi chú" multiline />
            </>
          ) : (
            <>
              <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400]}>Phương thức dịch vụ</Text>
              <View style={shipmentStyles.optionGrid}>
                <OptionChip label="GHTK hàng không" selected={transport === "fly"} onPress={() => setTransport("fly")} />
                <OptionChip label="GHTK đường bộ" selected={transport === "road"} onPress={() => setTransport("road")} />
              </View>
              <View style={[shipmentStyles.feeBox, { backgroundColor: colors.neutral50, borderColor: colors.border10, marginTop: 8 }]}>
                {feeLoading ? <ActivityIndicator size="small" color={colors.primary} /> : feeError ? <Text style={[textPresets.fs12_400, { color: colors.error }]}>{feeError}</Text> : estimatedFee !== null ? (
                  <View style={shipmentStyles.feeBoxRow}>
                    <Text style={[textPresets.fs12_400, { color: colors.neutral500 }]}>Phí vận chuyển ước tính</Text>
                    <Text style={[textPresets.fs14_500, { color: colors.neutral900 }]}>{estimatedFee.toLocaleString("vi-VN")}đ</Text>
                  </View>
                ) : <Text style={[textPresets.fs12_400, { color: colors.neutral400 }]}>Chọn địa chỉ gửi và nhận để tính phí</Text>}
              </View>
              <ShippingOptions viewCondition={viewCondition} setViewCondition={setViewCondition} deliveryPolicy={deliveryPolicy} setDeliveryPolicy={setDeliveryPolicy} refusalFee={refusalFee} setRefusalFee={setRefusalFee} pickupOption={pickupOption} setPickupOption={setPickupOption} />
              <ShipmentInput label="Ghi chú" value={note} onChangeText={setNote} placeholder="Nhập ghi chú" multiline topSpacing />
            </>
          )}
        </SectionBlock>
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={[screenStyles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border10 }]}>
        <View style={screenStyles.footerSummary}>
          <SummaryRow label="Tiền hàng" value={`${orderTotal.toLocaleString("vi-VN")}đ`} />
          <View style={screenStyles.summaryRow}>
            <Text style={[textPresets.fs12_400, { color: colors.neutral500 }]}>Phí vận chuyển</Text>
            {feeLoading && !isManualProvider ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={[textPresets.fs14_500, { color: colors.neutral900 }]}>{shippingFee.toLocaleString("vi-VN")}đ</Text>}
          </View>
          <View style={[screenStyles.summaryRow, screenStyles.summaryRowTotal]}>
            <Text style={[textPresets.fs14_500, { color: colors.neutral900 }]}>Shipper thu</Text>
            <Text style={[textPresets.fs14_500, { color: colors.primary }]}>{totalCollected.toLocaleString("vi-VN")}đ</Text>
          </View>
        </View>
        <Pressable onPress={handleSubmitShipment} disabled={isSubmitting || !selectedSender || !selectedRecipient} style={[screenStyles.submitButton, { backgroundColor: !isSubmitting && selectedSender && selectedRecipient ? colors.primary : colors.neutral300 }]}>
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={[{ color: "#fff" }, textPresets.fs16_500]}>Tạo vận đơn</Text>}
        </Pressable>
      </View>

      <AddressPickerSheet visible={senderSheetVisible} title="Chọn người gửi" addresses={shopAddresses} selectedId={selectedSender?.id} loading={isLoadingSender} onClose={() => setSenderSheetVisible(false)} onSelect={setSelectedSender} onAddPress={() => handleAddAddress("sender")} onEditPress={(addr) => handleEditAddress("sender", addr)} onDeletePress={(addr) => handleDeleteAddress("sender", addr)} />
      <AddressPickerSheet visible={recipientSheetVisible} title="Chọn người nhận" addresses={customerAddresses} selectedId={selectedRecipient?.id} loading={isLoadingRecipient} onClose={() => setRecipientSheetVisible(false)} onSelect={handleSelectRecipient} onAddPress={() => handleAddAddress("recipient")} onEditPress={(addr) => handleEditAddress("recipient", addr)} onDeletePress={(addr) => handleDeleteAddress("recipient", addr)} />
      <AddressFormModal visible={addrFormTarget !== null} title={formTitle} initialValues={formInitialValues(editingAddr)} isSaving={isSavingAddr} onClose={() => { setAddrFormTarget(null); setEditingAddr(null); }} onSave={handleSaveAddress} />
      <PackageDimModal visible={dimensionsOpen} dimLength={dimLength} dimWidth={dimWidth} dimHeight={dimHeight} weightInput={weightInput} autoScale={autoScale} onChangeDimLength={setDimLength} onChangeDimWidth={setDimWidth} onChangeDimHeight={setDimHeight} onChangeWeightInput={setWeightInput} onToggleAutoScale={() => setAutoScale((v) => !v)} onClose={() => setDimensionsOpen(false)} />
    </SafeAreaView>
  );
}

const screenStyles = createStyles(() => ({
  safeArea: { flex: 1 },
  centerBox: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  backIcon: {
    transform: [{ rotate: "-90deg" }],
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 28,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    height: 50,
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  footerSummary: {
    gap: 8,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  summaryRowTotal: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
}));
