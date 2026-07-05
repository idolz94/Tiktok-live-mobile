import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Icon } from "@components/icon";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import {
  SectionBlock,
  FigmaAddressCard,
  MoneyField,
  ShipmentInput,
  ShippingOptions,
  SpxOptions,
  SummaryRow,
} from "@features/orders/components/create-shipment";
import { PackageDimModal } from "@features/orders/components/create-shipment/package-dim-modal";
import { ParcelInfoSheet } from "@features/orders/components/create-shipment/parcel-info-sheet";
import { useAddressPageStore } from "@features/orders/stores/address-page-store";
import { VoucherSelectSheet } from "@features/orders/components/create-shipment/voucher-select-sheet";
import { formInitialValues } from "@features/orders/utils/shipment";
import type { AddrFormValues, PaymentSide } from "@features/orders/types/shipment";
import { useCreateShipment } from "@features/orders/hooks/use-create-shipment";

const dimIcons = {
  length: require("../../../assets/images/dim-icons/length.png"),
  width: require("../../../assets/images/dim-icons/width.png"),
  height: require("../../../assets/images/dim-icons/height.png"),
  weight: require("../../../assets/images/dim-icons/weight.png"),
};

export default function CreateShipmentScreen() {
  const { colors, textPresets } = useThemes();
  const { show, hide } = useBottomSheet();
  const {
    order,
    isManualProvider,
    isSpxProvider,
    primaryProduct: _primaryProduct,
    displayQuantity,
    orderTotal: _orderTotal,
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
    serviceType,
    setServiceType,
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
    estimatedDelivery,
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
    let id: string;
    const close = () => hide(id);
    id = show({
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
          onClose={close}
        />
      ),
      showDragIndicator: false,
    });
  };

  const openParcelSheet = () => {
    let id: string;
    const close = () => hide(id);
    id = show({
      content: (
        <ParcelInfoSheet
          weightInput={weightInput}
          onChangeWeightInput={setWeightInput}
          dimLength={dimLength}
          dimWidth={dimWidth}
          dimHeight={dimHeight}
          onChangeDimLength={setDimLength}
          onChangeDimWidth={setDimWidth}
          onChangeDimHeight={setDimHeight}
          declaredValue={declaredValue}
          setDeclaredValue={setDeclaredValue}
          parcelItemName={parcelItemName}
          setParcelItemName={setParcelItemName}
          note={note}
          setNote={setNote}
          allowTryOn={allowTryOn}
          setAllowTryOn={setAllowTryOn}
          allowPartialDelivery={allowPartialDelivery}
          setAllowPartialDelivery={setAllowPartialDelivery}
          allowMutualCheck={allowMutualCheck}
          setAllowMutualCheck={setAllowMutualCheck}
          onClose={close}
        />
      ),
      showDragIndicator: false,
      snapPoints: ["90%"],
    });
  };

  const openVoucherSheet = () => {
    let id: string;
    const close = () => hide(id);
    id = show({
      content: (
        <VoucherSelectSheet
          vouchers={vouchers}
          loading={vouchersLoading}
          error={vouchersError}
          selectedCode={selectedVoucherCode}
          onSelect={(code) => {
            setSelectedVoucherCode(code);
            close();
          }}
          onClose={close}
        />
      ),
    });
  };

  const openServicePoint = () => {
    void WebBrowser.openBrowserAsync(
      "https://spx.vn/service-point?service_type=support_sending_non_shopee_parcel&hide_header=true",
    );
  };

  const openPaymentSheet = () => {
    let id: string;
    const close = () => hide(id);
    id = show({
      content: (
        <>
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border10 }]}>
            <Text style={[{ color: colors.neutral900 }, textPresets.fs16_500]}>Người thanh toán</Text>
            <Pressable onPress={close} hitSlop={12}>
              <Text style={{ color: colors.neutral500, fontSize: 20 }}>×</Text>
            </Pressable>
          </View>
          {([
            { label: "Người gửi thanh toán phí", value: 1 as PaymentSide },
            { label: "Người nhận thanh toán phí", value: 0 as PaymentSide },
          ]).map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => { setPaymentSide(opt.value); close(); }}
              style={[
                styles.selectItem,
                paymentSide === opt.value && { backgroundColor: colors.primaryLight },
              ]}
            >
              <Text
                style={[
                  paymentSide === opt.value ? { color: colors.primary } : { color: colors.neutral900 },
                  textPresets.fs14_400,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </>
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
          <Icon name="close" size={20} tintColor="neutral900" />
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

        {!isManualProvider && !isSpxProvider ? (
          <SectionBlock title="Thông tin đơn hàng">
            <Pressable
              onPress={openDimensions}
              style={[styles.dimCard, { backgroundColor: colors.neutral50, borderColor: colors.border10 }]}
            >
              {[
                { label: "Dài", value: dimLength, unit: "cm", icon: dimIcons.length },
                { label: "Rộng", value: dimWidth, unit: "cm", icon: dimIcons.width },
                { label: "Cao", value: dimHeight, unit: "cm", icon: dimIcons.height },
                {
                  label: "Khối lượng",
                  value: String(parseInt(weightInput.replace(/\D/g, ""), 10) || 0),
                  unit: "gram",
                  icon: dimIcons.weight,
                },
              ].map((row) => (
                <View key={row.label} style={styles.dimRow}>
                  <View style={styles.dimRowLeft}>
                    <Image source={row.icon} style={styles.dimRowIcon} />
                    <Text style={[{ color: colors.neutral400 }, textPresets.fs14_400]}>{row.label}</Text>
                  </View>
                  <Text style={[{ color: colors.neutral900 }, textPresets.fs14_500]}>
                    {row.value} {row.unit}
                  </Text>
                </View>
              ))}
            </Pressable>
          </SectionBlock>
        ) : null}
        {!isManualProvider && !isSpxProvider ? (
          <View style={[styles.divider, { backgroundColor: colors.neutral50 }]} />
        ) : null}

        <SectionBlock title="Thông tin vận chuyển">
          <MoneyField
            label="Tiền thu hộ (COD)"
            value={codAmountDisplay}
            onChangeText={setManualCodAmount}
            editable={isManualProvider}
          />
          {!isSpxProvider && (
            <>
              <Text style={[{ color: colors.neutral400 }, textPresets.fs14_400]}>Tùy chọn thanh toán</Text>
              <View style={styles.radioGroup}>
                {([
                  { label: "Bên gửi trả phí", value: 1 },
                  { label: "Bên nhận trả phí", value: 0 },
                ] as const).map((opt) => (
                  <Pressable
                    key={opt.label}
                    onPress={() => setPaymentSide(opt.value)}
                    style={[styles.radioCard, { borderColor: paymentSide === opt.value ? colors.primary : colors.border10 }]}
                  >
                    <View style={[styles.radioOuter, { borderColor: paymentSide === opt.value ? colors.primary : colors.neutral300 }]}>
                      {paymentSide === opt.value && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                    </View>
                    <Text style={[{ color: colors.neutral900 }, textPresets.fs14_400]}>{opt.label}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
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
              serviceType={serviceType}
              setServiceType={setServiceType}
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
              paymentSide={paymentSide}
              onOpenPaymentSheet={openPaymentSheet}
              onOpenServicePoint={openServicePoint}
              onOpenVoucherSheet={openVoucherSheet}
              estimatedDelivery={estimatedDelivery}
              feeLoading={feeLoading}
              parcelInfoSlot={
                <Pressable
                  onPress={openParcelSheet}
                  style={[styles.parcelRow, { backgroundColor: colors.neutral50, borderColor: colors.border10 }]}
                >
                  <Text style={[{ color: colors.neutral900 }, textPresets.fs14_500]}>
                    Thông tin bưu gửi{" "}
                    <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Text style={[{ color: colors.neutral500 }, textPresets.fs12_400]}>
                    {displayQuantity} Sản phẩm, {((parseInt(weightInput.replace(/\D/g, ""), 10) || 0) / 1000).toFixed(1)} KG
                  </Text>
                  <Text style={[{ color: colors.neutral400 }, textPresets.fs18_500]}>›</Text>
                </Pressable>
              }
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
            value={`${declaredValue.toLocaleString("vi-VN")}đ`}
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
  dimCard: { borderRadius: 16, borderWidth: 0.5, padding: 16, gap: 8 },
  dimRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 40 },
  dimRowLeft: { flex: 1, flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  dimRowIcon: { width: 18, height: 18 },
  parcelRow: { borderRadius: 12, borderWidth: 0.5, padding: 16, flexDirection: "row" as const, alignItems: "center" as const, gap: 10 },
  optionGrid: { gap: 10 },
  radioGroup: { gap: 12 },
  sheetHeader: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  selectItem: { marginHorizontal: 8, marginVertical: 4, paddingHorizontal: 12, paddingVertical: 14, borderRadius: 10 },
  radioCard: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderRadius: 8 },
  radioOuter: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center" as const, justifyContent: "center" as const },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
}));
