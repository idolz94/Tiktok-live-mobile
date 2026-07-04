import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Icon } from "@components/icon";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import {
  SectionBlock,
  FigmaAddressCard,
  OptionChip,
  MoneyField,
  ShipmentInput,
  ShippingOptions,
  SpxOptions,
  SummaryRow,
} from "@features/orders/components/create-shipment";
import { PackageDimModal } from "@features/orders/components/create-shipment/package-dim-modal";
import { useAddressPageStore } from "@features/orders/stores/address-page-store";
import { VoucherSelectSheet } from "@features/orders/components/create-shipment/voucher-select-sheet";
import { formInitialValues } from "@features/orders/utils/shipment";
import type { AddrFormValues } from "@features/orders/types/shipment";
import { useCreateShipment } from "@features/orders/hooks/use-create-shipment";

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
    allowMutualCheck,
    setAllowMutualCheck,
    allowTryOn,
    setAllowTryOn,
    allowPartialDelivery,
    setAllowPartialDelivery,
    feeLoading,
    feeError,
  } = useCreateShipment();

  const { setPicker, setForm } = useAddressPageStore();

  const openAddressForm = (
    target: "sender" | "recipient",
    addr?: typeof editingAddr,
  ) => {
    const title = addr
      ? target === "sender"
        ? "Sửa địa chỉ người gửi"
        : "Sửa địa chỉ người nhận"
      : target === "sender"
        ? "Thêm địa chỉ người gửi"
        : "Thêm địa chỉ người nhận";
    setAddrFormTarget(target);
    if (addr) setEditingAddr(addr);
    const defaultValues: Partial<AddrFormValues> = addr
      ? (formInitialValues(addr) ?? {})
      : {
          isDefault:
            target === "sender"
              ? shopAddresses.length === 0
              : customerAddresses.length === 0,
        };
    setForm({
      title,
      initialValues: defaultValues,
      disableDefaultToggle:
        !addr &&
        (target === "sender"
          ? shopAddresses.length === 0
          : customerAddresses.length === 0),
      onSave: async (vals: AddrFormValues) => {
        await handleSaveAddress(vals, target, addr ?? null);
      },
      onClose: () => {
        setAddrFormTarget(null);
        setEditingAddr(null);
      },
    });
    router.push("/order-detail/create-shipment/address-form");
  };

  const openSenderSheet = () => {
    setPicker({
      title: "Chọn người gửi",
      addresses: shopAddresses,
      selectedId: selectedSender?.id,
      loading: isLoadingSender,
      onSelect: (addr) => {
        setSelectedSender(addr as (typeof shopAddresses)[0]);
      },
      onAddPress: () => {
        router.back();
        setTimeout(() => openAddressForm("sender"), 100);
      },
      onEditPress: (addr) => {
        router.back();
        setTimeout(
          () => openAddressForm("sender", addr as (typeof shopAddresses)[0]),
          100,
        );
      },
    });
    router.push("/order-detail/create-shipment/address-picker");
  };

  const openRecipientSheet = () => {
    setPicker({
      title: "Chọn người nhận",
      addresses: customerAddresses,
      selectedId: selectedRecipient?.id,
      loading: isLoadingRecipient,
      onSelect: (addr) => {
        handleSelectRecipient(addr as (typeof customerAddresses)[0]);
      },
      onAddPress: () => {
        router.back();
        setTimeout(() => openAddressForm("recipient"), 100);
      },
      onEditPress: (addr) => {
        router.back();
        setTimeout(
          () =>
            openAddressForm("recipient", addr as (typeof customerAddresses)[0]),
          100,
        );
      },
    });
    router.push("/order-detail/create-shipment/address-picker");
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
      showDragIndicator: false,
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
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.neutral100 }]}
      >
        <View style={styles.centerBox}>
          <Text style={[{ color: colors.neutral900 }, textPresets.fs16_500]}>
            Không tìm thấy đơn hàng
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.neutral100 }]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={[styles.headerButton, { backgroundColor: colors.neutral50 }]}
        >
          <View style={styles.backIcon}>
            <Icon name="arrow_down" size={22} tintColor="neutral900" />
          </View>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.neutral900 }]}>
          Tạo đơn hàng
        </Text>
        <View style={styles.headerActions}>
          <Pressable
            hitSlop={12}
            style={[styles.headerButton, { backgroundColor: colors.neutral50 }]}
          >
            <Icon name="settings" size={22} tintColor="neutral900" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <SectionBlock title="Thông tin người gửi">
          <FigmaAddressCard
            address={selectedSender}
            loading={isLoadingSender}
            onChangePress={openSenderSheet}
            onAddPress={() => openAddressForm("sender")}
          />
        </SectionBlock>
        <View style={[styles.divider, { backgroundColor: colors.neutral50 }]} />

        <SectionBlock title="Thông tin người nhận">
          <FigmaAddressCard
            address={selectedRecipient}
            loading={isLoadingRecipient}
            onChangePress={openRecipientSheet}
            onAddPress={() => openAddressForm("recipient")}
          />
        </SectionBlock>
        <View style={[styles.divider, { backgroundColor: colors.neutral50 }]} />

        {!isManualProvider ? (
          <SectionBlock
            title="Thông tin đơn hàng"
            actionLabel="Kích thước"
            onActionPress={openDimensions}
          >
            <View
              style={[styles.orderCard, { backgroundColor: colors.neutral50 }]}
            >
              <View style={styles.orderMetaRow}>
                <View style={styles.productTitle}>
                  <Text
                    style={[{ color: colors.neutral900 }, textPresets.fs14_500]}
                    numberOfLines={2}
                  >
                    {primaryProduct?.name || primaryProduct?.code || order.productName || "—"}
                  </Text>
                  {primaryProduct?.variantName ? (
                    <Text
                      style={[
                        { color: colors.neutral400 },
                        textPresets.fs12_400,
                      ]}
                    >
                      {primaryProduct.variantName}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.detailGrid}>
                {[
                  { label: "Dài", value: dimLength ? `${dimLength} cm` : "—" },
                  { label: "Rộng", value: dimWidth ? `${dimWidth} cm` : "—" },
                  { label: "Cao", value: dimHeight ? `${dimHeight} cm` : "—" },
                  {
                    label: "Khối lượng",
                    value: `${((parseInt(weightInput.replace(/\D/g, ""), 10) || 0) / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 3 })} kg`,
                  },
                ].map((cell) => (
                  <View
                    key={cell.label}
                    style={[
                      styles.detailCell,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <Text
                      style={[
                        { color: colors.neutral400 },
                        textPresets.fs12_400,
                      ]}
                    >
                      {cell.label}
                    </Text>
                    <Text
                      style={[
                        { color: colors.neutral900 },
                        textPresets.fs14_500,
                      ]}
                    >
                      {cell.value}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.quantityRow}>
                <Text
                  style={[{ color: colors.neutral900 }, textPresets.fs14_500]}
                >
                  Số lượng
                </Text>
                <View
                  style={[
                    styles.stepper,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border10,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Pressable
                    hitSlop={8}
                    style={styles.stepperBtn}
                    onPress={() => {
                      const w =
                        parseInt(weightInput.replace(/\D/g, ""), 10) || 0;
                      if (w > 100) setWeightInput(String(w - 100));
                    }}
                  >
                    <Text
                      style={[
                        { color: colors.neutral900 },
                        textPresets.fs18_700,
                      ]}
                    >
                      −
                    </Text>
                  </Pressable>
                  <Text
                    style={[
                      styles.stepperValue,
                      { color: colors.neutral900 },
                      textPresets.fs14_500,
                    ]}
                  >
                    {displayQuantity}
                  </Text>
                  <Pressable
                    hitSlop={8}
                    style={styles.stepperBtn}
                    onPress={() => {
                      const w =
                        parseInt(weightInput.replace(/\D/g, ""), 10) || 0;
                      setWeightInput(String(w + 100));
                    }}
                  >
                    <Text
                      style={[
                        { color: colors.neutral900 },
                        textPresets.fs18_700,
                      ]}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </SectionBlock>
        ) : null}
        {!isManualProvider ? (
          <View
            style={[styles.divider, { backgroundColor: colors.neutral50 }]}
          />
        ) : null}

        <SectionBlock title="Thông tin thanh toán">
          <MoneyField
            label="Tiền thu hộ (COD)"
            value={codAmountDisplay}
            onChangeText={setManualCodAmount}
            editable={isManualProvider}
          />
          <View style={styles.optionGrid}>
            <OptionChip
              label="Bên nhận trả phí"
              selected={paymentSide === 0}
              onPress={() => setPaymentSide(0)}
            />
            <OptionChip
              label="Bên gửi trả phí"
              selected={paymentSide === 1}
              onPress={() => setPaymentSide(1)}
            />
          </View>
        </SectionBlock>
        <View style={[styles.divider, { backgroundColor: colors.neutral50 }]} />

        <SectionBlock title="Thông tin vận chuyển">
          {isManualProvider ? (
            <>
              <ShipmentInput
                label="Phí vận chuyển"
                value={manualShippingFee}
                onChangeText={setManualShippingFee}
                placeholder="0"
                keyboardType="numeric"
                money
              />
              <ShipmentInput
                label="Ghi chú"
                value={manualNote}
                onChangeText={setManualNote}
                placeholder="Nhập ghi chú"
                multiline
              />
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
              allowMutualCheck={allowMutualCheck}
              setAllowMutualCheck={setAllowMutualCheck}
              allowTryOn={allowTryOn}
              setAllowTryOn={setAllowTryOn}
              allowPartialDelivery={allowPartialDelivery}
              setAllowPartialDelivery={setAllowPartialDelivery}
            />
          ) : (
            <>
              <ShippingOptions
                viewCondition={viewCondition}
                setViewCondition={setViewCondition}
                deliveryPolicy={deliveryPolicy}
                setDeliveryPolicy={setDeliveryPolicy}
                refusalFee={refusalFee}
                setRefusalFee={setRefusalFee}
                pickupOption={pickupOption}
                setPickupOption={setPickupOption}
              />
              <ShipmentInput
                label="Ghi chú"
                value={note}
                onChangeText={setNote}
                placeholder="Nhập ghi chú"
                multiline
                topSpacing
              />
            </>
          )}
        </SectionBlock>
        <View style={{ height: 24 }} />
      </ScrollView>

      {submitState === "outcome_unknown" && (
        <View
          style={[
            styles.outcomeUnknownBanner,
            { backgroundColor: "#FFF7E6", borderColor: "#FBBF24" },
          ]}
        >
          <Text style={[textPresets.fs12_400, { color: "#92400E", flex: 1 }]}>
            Không xác nhận được trạng thái. Đơn có thể đã được tạo. Kiểm tra lại
            hoặc thử lại.
          </Text>
          <Pressable onPress={handleRetryOutcomeUnknown} hitSlop={8}>
            <Text style={[textPresets.fs14_500, { color: "#D97706" }]}>
              Thử lại
            </Text>
          </Pressable>
        </View>
      )}

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.surface, borderTopColor: colors.border10 },
        ]}
      >
        <View style={styles.footerSummary}>
          <SummaryRow
            label="Tiền hàng"
            value={`${orderTotal.toLocaleString("vi-VN")}đ`}
          />
          <View style={styles.summaryRow}>
            <Text style={[textPresets.fs12_400, { color: colors.neutral500 }]}>
              Phí vận chuyển
            </Text>
            {feeLoading ? (
              <Text
                style={[textPresets.fs14_500, { color: colors.neutral400 }]}
              >
                Đang tính...
              </Text>
            ) : feeError ? (
              <Text style={[textPresets.fs12_400, { color: colors.error }]}>
                {feeError}
              </Text>
            ) : (
              <Text
                style={[textPresets.fs14_500, { color: colors.neutral900 }]}
              >
                {shippingFee.toLocaleString("vi-VN")}đ
              </Text>
            )}
          </View>
          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={[textPresets.fs14_500, { color: colors.neutral900 }]}>
              Shipper thu
            </Text>
            <Text style={[textPresets.fs14_500, { color: colors.primary }]}>
              {totalCollected.toLocaleString("vi-VN")}đ
            </Text>
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
            styles.submitButton,
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
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Icon name="truck" size={18} tintColor="white" />
            )}
            <Text style={[{ color: "#fff" }, textPresets.fs16_500]}>
              Tạo vận đơn
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = createStyles(({ textPresets }) => ({
  safeArea: { flex: 1 },
  centerBox: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  headerTitle: {
    flex: 1,
    textAlign: "center" as const,
    ...textPresets.fs20_600,
  },
  headerActions: {
    width: 44,
    flexDirection: "row" as const,
    justifyContent: "flex-end" as const,
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
  divider: { height: 8 },
  orderCard: { borderRadius: 16, padding: 14, gap: 12 },
  orderMetaRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: 12,
  },
  productTitle: { flex: 1 },
  detailGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  detailCell: { width: "48%" as const, borderRadius: 12, padding: 12, gap: 4 },
  quantityRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  stepper: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderRadius: 18,
    overflow: "hidden" as const,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  stepperValue: { minWidth: 42, textAlign: "center" as const },
  optionGrid: { gap: 10 },
}));
