import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Icon } from "@components/icon";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { SectionBlock, FigmaAddressCard, OptionChip, MoneyField, ShipmentInput, ShippingOptions, SpxOptions, SummaryRow, shipmentStyles } from "./components/ShipmentComponents";
import { AddressPickerSheet } from "./components/AddressPickerSheet";
import { AddressFormModal } from "./components/AddressFormModal";
import { PackageDimModal } from "./components/PackageDimModal";
import { VoucherSelectSheet } from "./components/VoucherSelectSheet";
import { formInitialValues } from "./utils";
import type { AddrFormValues } from "./types";
import { useCreateShipment } from "./use-create-shipment";

export default function CreateShipmentScreen() {
  const { colors, textPresets } = useThemes();
  const { show, hide } = useBottomSheet();
  const {
    order,
    isManualProvider,
    isSpxProvider,
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
    setAddrFormTarget,
    editingAddr,
    setEditingAddr,
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
    shippingFee,
    codAmountDisplay,
    goodsValueDisplay,
    totalCollected,
    manualShippingFee,
    setManualShippingFee,
    manualNote,
    setManualNote,
    manualCodAmount: _manualCodAmount,
    setManualCodAmount,
    note,
    setNote,
    isSubmitting,
    handleDeleteAddress,
    handleSelectRecipient,
    handleSaveAddress,
    handleSubmitShipment,
    submitState,
    handleRetryOutcomeUnknown,
    // SPX
    collectType,
    setCollectType,
    pickupTimeRangeId,
    pickupTimeKey,
    setPickupTime,
    parcelItemName,
    setParcelItemName,
    declaredValue,
    setDeclaredValue,
    timeslots,
    timeslotsLoading,
    timeslotsError,
    vouchers,
    vouchersLoading,
    vouchersError,
    selectedVoucherCode,
    setSelectedVoucherCode,
    feeLoading,
    feeError,
  } = useCreateShipment();

  const openAddressForm = (target: "sender" | "recipient", addr?: typeof editingAddr) => {
    const title = addr
      ? target === "sender" ? "Sửa địa chỉ người gửi" : "Sửa địa chỉ người nhận"
      : target === "sender" ? "Thêm địa chỉ người gửi" : "Thêm địa chỉ người nhận";
    setAddrFormTarget(target);
    if (addr) setEditingAddr(addr);
    const defaultValues: Partial<AddrFormValues> = addr
      ? (formInitialValues(addr) ?? {})
      : {};
    show({
      content: (
        <AddressFormModal
          title={title}
          initialValues={defaultValues}
          onClose={() => { hide(); setAddrFormTarget(null); setEditingAddr(null); }}
          onSave={async (vals) => { await handleSaveAddress(vals, target, addr ?? null); hide(); }}
        />
      ),
    });
  };

  const openSenderSheet = () => {
    show({
      content: (
        <AddressPickerSheet
          title="Chọn người gửi"
          addresses={shopAddresses}
          selectedId={selectedSender?.id}
          loading={isLoadingSender}
          onClose={hide}
          onSelect={(addr) => { setSelectedSender(addr); hide(); }}
          onAddPress={() => { hide(); setTimeout(() => openAddressForm("sender"), 350); }}
          onEditPress={(addr) => { hide(); setTimeout(() => openAddressForm("sender", addr), 350); }}
          onDeletePress={(addr) => handleDeleteAddress("sender", addr)}
        />
      ),
    });
  };

  const openRecipientSheet = () => {
    show({
      content: (
        <AddressPickerSheet
          title="Chọn người nhận"
          addresses={customerAddresses}
          selectedId={selectedRecipient?.id}
          loading={isLoadingRecipient}
          onClose={hide}
          onSelect={(addr) => { handleSelectRecipient(addr); hide(); }}
          onAddPress={() => { hide(); setTimeout(() => openAddressForm("recipient"), 350); }}
          onEditPress={(addr) => { hide(); setTimeout(() => openAddressForm("recipient", addr), 350); }}
          onDeletePress={(addr) => handleDeleteAddress("recipient", addr)}
        />
      ),
    });
  };

  const openDimensions = () => {
    show({
      content: (
        <PackageDimModal
          dimLength={dimLength}
          dimWidth={dimWidth}
          dimHeight={dimHeight}
          weightInput={weightInput}
          autoScale={autoScale}
          onChangeDimLength={setDimLength}
          onChangeDimWidth={setDimWidth}
          onChangeDimHeight={setDimHeight}
          onChangeWeightInput={setWeightInput}
          onToggleAutoScale={() => setAutoScale((v) => !v)}
          onClose={hide}
        />
      ),
    });
  };

  const openVoucherSheet = () => {
    show({
      content: (
        <VoucherSelectSheet
          vouchers={vouchers}
          loading={vouchersLoading}
          error={vouchersError}
          selectedCode={selectedVoucherCode}
          onSelect={(code) => {
            setSelectedVoucherCode(code);
            hide();
          }}
          onClose={hide}
        />
      ),
    });
  };

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
          <FigmaAddressCard address={selectedSender} loading={isLoadingSender} onChangePress={openSenderSheet} onAddPress={() => openAddressForm("sender")} />
        </SectionBlock>
        <View style={[shipmentStyles.divider, { backgroundColor: colors.neutral50 }]} />

        <SectionBlock title="Thông tin người nhận">
          <FigmaAddressCard address={selectedRecipient} loading={isLoadingRecipient} onChangePress={openRecipientSheet} onAddPress={() => openAddressForm("recipient")} />
        </SectionBlock>
        <View style={[shipmentStyles.divider, { backgroundColor: colors.neutral50 }]} />

        {!isManualProvider ? (
          <SectionBlock title="Thông tin đơn hàng" actionLabel="Kích thước" onActionPress={openDimensions}>
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
                { label: "Khối lượng", value: `${((parseInt(weightInput.replace(/\D/g, ""), 10) || 0) / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 3 })} kg` },
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
          ) : isSpxProvider ? (
            <SpxOptions
              collectType={collectType}
              setCollectType={setCollectType}
              pickupTimeRangeId={pickupTimeRangeId}
              pickupTimeKey={pickupTimeKey}
              setPickupTime={setPickupTime}
              timeslots={timeslots}
              timeslotsLoading={timeslotsLoading}
              timeslotsError={timeslotsError}
              vouchers={vouchers}
              vouchersLoading={vouchersLoading}
              vouchersError={vouchersError}
              selectedVoucherCode={selectedVoucherCode}
              onOpenVoucherSheet={openVoucherSheet}
              parcelItemName={parcelItemName}
              setParcelItemName={setParcelItemName}
              declaredValue={declaredValue}
              setDeclaredValue={setDeclaredValue}
              note={note}
              setNote={setNote}
            />
          ) : (
            <>
              <ShippingOptions viewCondition={viewCondition} setViewCondition={setViewCondition} deliveryPolicy={deliveryPolicy} setDeliveryPolicy={setDeliveryPolicy} refusalFee={refusalFee} setRefusalFee={setRefusalFee} pickupOption={pickupOption} setPickupOption={setPickupOption} />
              <ShipmentInput label="Ghi chú" value={note} onChangeText={setNote} placeholder="Nhập ghi chú" multiline topSpacing />
            </>
          )}
        </SectionBlock>
        <View style={{ height: 24 }} />
      </ScrollView>

      {submitState === "outcome_unknown" && (
        <View style={[screenStyles.outcomeUnknownBanner, { backgroundColor: "#FFF7E6", borderColor: "#FBBF24" }]}>
          <Text style={[textPresets.fs12_400, { color: "#92400E", flex: 1 }]}>
            Không xác nhận được trạng thái. Đơn có thể đã được tạo. Kiểm tra lại hoặc thử lại.
          </Text>
          <Pressable onPress={handleRetryOutcomeUnknown} hitSlop={8}>
            <Text style={[textPresets.fs14_500, { color: "#D97706" }]}>Thử lại</Text>
          </Pressable>
        </View>
      )}

      <View style={[screenStyles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border10 }]}>
        <View style={screenStyles.footerSummary}>
          <SummaryRow label="Tiền hàng" value={`${orderTotal.toLocaleString("vi-VN")}đ`} />
          <View style={screenStyles.summaryRow}>
            <Text style={[textPresets.fs12_400, { color: colors.neutral500 }]}>Phí vận chuyển</Text>
            {feeLoading ? (
              <Text style={[textPresets.fs14_500, { color: colors.neutral400 }]}>Đang tính...</Text>
            ) : feeError ? (
              <Text style={[textPresets.fs12_400, { color: colors.error }]}>{feeError}</Text>
            ) : (
              <Text style={[textPresets.fs14_500, { color: colors.neutral900 }]}>{shippingFee.toLocaleString("vi-VN")}đ</Text>
            )}
          </View>
          <View style={[screenStyles.summaryRow, screenStyles.summaryRowTotal]}>
            <Text style={[textPresets.fs14_500, { color: colors.neutral900 }]}>Shipper thu</Text>
            <Text style={[textPresets.fs14_500, { color: colors.primary }]}>{totalCollected.toLocaleString("vi-VN")}đ</Text>
          </View>
        </View>
        <Pressable
          onPress={handleSubmitShipment}
          disabled={
            isSubmitting ||
            !selectedSender ||
            !selectedRecipient ||
            (isSpxProvider &&
              (!parcelItemName.trim() ||
                weightInput.trim() === "" ||
                (collectType === 1 && !pickupTimeRangeId)))
          }
          style={[
            screenStyles.submitButton,
            {
              backgroundColor:
                isSubmitting ||
                !selectedSender ||
                !selectedRecipient ||
                (isSpxProvider &&
                  (!parcelItemName.trim() ||
                    weightInput.trim() === "" ||
                    (collectType === 1 && !pickupTimeRangeId)))
                  ? colors.neutral300
                  : colors.primary,
            },
          ]}
        >
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={[{ color: "#fff" }, textPresets.fs16_500]}>Tạo vận đơn</Text>}
        </Pressable>
      </View>

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
  outcomeUnknownBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
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
