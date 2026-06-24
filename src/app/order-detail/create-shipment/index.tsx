import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Icon } from "@components/icon";
import { SectionBlock, FigmaAddressCard, OptionChip, MoneyField, ShipmentInput, ShippingOptions, SummaryRow, shipmentStyles } from "./components/ShipmentComponents";
import { AddressPickerSheet } from "./components/AddressPickerSheet";
import { AddressFormModal } from "./components/AddressFormModal";
import { PackageDimModal } from "./components/PackageDimModal";
import { formInitialValues } from "./utils";
import { useCreateShipment } from "./use-create-shipment";

export default function CreateShipmentScreen() {
  const { colors, textPresets } = useThemes();
  const {
    order,
    isManualProvider,
    primaryProduct,
    displayQuantity,
    orderTotal,
    shopAddresses,
    customerAddresses,
    selectedSender,
    setSelectedSender,
    selectedRecipient,
    isLoadingSender,
    isLoadingRecipient,
    senderSheetVisible,
    setSenderSheetVisible,
    recipientSheetVisible,
    setRecipientSheetVisible,
    addrFormTarget,
    setAddrFormTarget,
    editingAddr,
    setEditingAddr,
    isSavingAddr,
    formTitle,
    transport,
    setTransport,
    paymentSide,
    setPaymentSide,
    viewCondition,
    setViewCondition,
    pickupOption,
    setPickupOption,
    deliveryPolicy,
    setDeliveryPolicy,
    refusalFee,
    setRefusalFee,
    weightInput,
    setWeightInput,
    dimLength,
    setDimLength,
    dimWidth,
    setDimWidth,
    dimHeight,
    setDimHeight,
    autoScale,
    setAutoScale,
    dimensionsOpen,
    setDimensionsOpen,
    estimatedFee,
    feeLoading,
    feeError,
    shippingFee,
    codAmountDisplay,
    goodsValueDisplay,
    totalCollected,
    manualShippingFee,
    setManualShippingFee,
    manualNote,
    setManualNote,
    manualCodAmount,
    setManualCodAmount,
    note,
    setNote,
    isSubmitting,
    handleAddAddress,
    handleEditAddress,
    handleDeleteAddress,
    handleSelectRecipient,
    handleSaveAddress,
    handleSubmitShipment,
  } = useCreateShipment();

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
                <Pressable hitSlop={8} style={shipmentStyles.stepperBtn} onPress={() => { const w = parseInt(weightInput.replace(/\D/g, ""), 10) || 0; if (w > 100) setWeightInput(String(w - 100)); }}>
                  <Text style={[{ color: colors.neutral900 }, textPresets.fs18_700]}>−</Text>
                </Pressable>
                <Text style={[shipmentStyles.stepperValue, { color: colors.neutral900 }, textPresets.fs14_500]}>{displayQuantity}</Text>
                <Pressable hitSlop={8} style={shipmentStyles.stepperBtn} onPress={() => { const w = parseInt(weightInput.replace(/\D/g, ""), 10) || 0; setWeightInput(String(w + 100)); }}>
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
            onChangeText={setManualCodAmount}
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
              <ShipmentInput label="Phí vận chuyển" value={manualShippingFee} onChangeText={setManualShippingFee} placeholder="0" keyboardType="numeric" />
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
