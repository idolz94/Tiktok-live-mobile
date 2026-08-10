import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Icon } from "@components/icon";
import { Button } from "@components/button";
import { LinearGradient } from "@components/linear-gradient";
import { Header } from "@components/header";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import {
  SectionBlock,
  FigmaAddressCard,
  ShipmentInput,
  ShippingOptions,
  SpxOptions,
  FeeDetailSheet,
} from "@features/orders/components/create-shipment";
import { PackageDimModal } from "@features/orders/components/create-shipment/package-dim-modal";
import { ParcelInfoSheet } from "@features/orders/components/create-shipment/parcel-info-sheet";
import { useAddressPageStore } from "@features/orders/stores/address-page-store";
import { VoucherSelectSheet } from "@features/orders/components/create-shipment/voucher-select-sheet";
import { formInitialValues } from "@features/orders/utils/shipment";
import type {
  AddrFormValues,
  PaymentSide,
} from "@features/orders/types/shipment";
import { useCreateShipment } from "@features/orders/hooks/use-create-shipment";
import { useAuth } from "@features/auth/hooks/use-auth";

const dimIcons = {
  length: require("../../../assets/images/dim-icons/length.png"),
  width: require("../../../assets/images/dim-icons/width.png"),
  height: require("../../../assets/images/dim-icons/height.png"),
  weight: require("../../../assets/images/dim-icons/weight.png"),
};

export default function CreateShipmentScreen() {
  const { colors, textPresets } = useThemes();
  const { bottom } = useSafeAreaInsets();
  const { show, hide } = useBottomSheet();
  const { user } = useAuth();
  const {
    order,
    isManualProvider,
    isSpxProvider,
    isEditMode,
    displayQuantity,
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
    codAmount,
    totalCollected,
    voucherAmount,
    manualShippingFee,
    setManualShippingFee,
    manualNote,
    setManualNote,
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
          ...(target === "sender" && user?.fullName
            ? { name: user.fullName }
            : {}),
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
      showDragIndicator: true,
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

  const openFeeDetailSheet = () => {
    let id: string;
    const close = () => hide(id);
    id = show({
      content: (
        <FeeDetailSheet
          codAmount={codAmount}
          shippingFee={shippingFee}
          voucherAmount={voucherAmount}
          totalCollected={totalCollected}
          isSubmitting={isSubmitting}
          isSubmitDisabled={submitDisabled}
          hideSubmit={isEditMode}
          onSubmit={() => {
            close();
            handleSubmitShipment();
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

  const spxEditLimit = order?.spxEditLimit ?? 3;
  const spxEditCount = order?.spxEditCount ?? 0;
  const spxEditRemaining = order?.spxEditRemaining ?? Math.max(0, spxEditLimit - spxEditCount);
  const isSpxEditLimitReached = isEditMode && isSpxProvider && spxEditRemaining <= 0;

  const submitDisabled =
    isSubmitting ||
    isSpxEditLimitReached ||
    !selectedSender ||
    !selectedRecipient ||
    (isSpxProvider &&
      (!parcelItemName.trim() ||
        weightInput.trim() === "" ||
        (collectType === 1 && !pickupTimeRangeId)));

  if (!order) {
    return (
      <View style={styles.root}>
        <View style={styles.centerBox}>
          <Text style={[{ color: colors.neutral900 }, textPresets.fs16_500]}>
            Không tìm thấy đơn hàng
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Header
        title={isEditMode ? "Chỉnh sửa đơn hàng" : "Tạo đơn hàng"}
        rightIcon="settings-outline"
        onRightPress={() => router.push("/shipping-settings")}
        transparent
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {isEditMode ? (
          <View style={styles.editNotice}>
            <Text style={[{ color: colors.error }, textPresets.fs14_500]}>
              {isSpxEditLimitReached
                ? `Đơn hàng SPX đã đạt giới hạn chỉnh sửa ${spxEditLimit} lần.`
                : `Mỗi đơn hàng được chỉnh sửa tối đa ${spxEditRemaining} lần.`}
            </Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <FigmaAddressCard
            type="sender"
            address={selectedSender}
            loading={isLoadingSender}
            onChangePress={openSenderSheet}
            onAddPress={() => openAddressForm("sender")}
          />
          <View style={styles.addressDivider} />
          <FigmaAddressCard
            type="recipient"
            address={selectedRecipient}
            loading={isLoadingRecipient}
            onChangePress={openRecipientSheet}
            onAddPress={() => openAddressForm("recipient")}
          />
        </View>
        {!isManualProvider && !isSpxProvider ? (
          <SectionBlock title="Thông tin đơn hàng" noPaddingHorizontal>
            <Pressable
              onPress={openDimensions}
              style={[
                styles.dimCard,
                {
                  backgroundColor: colors.neutral50,
                  borderColor: colors.border10,
                },
              ]}
            >
              {[
                {
                  label: "Dài",
                  value: dimLength,
                  unit: "cm",
                  icon: dimIcons.length,
                },
                {
                  label: "Rộng",
                  value: dimWidth,
                  unit: "cm",
                  icon: dimIcons.width,
                },
                {
                  label: "Cao",
                  value: dimHeight,
                  unit: "cm",
                  icon: dimIcons.height,
                },
                {
                  label: "Khối lượng",
                  value: String(
                    parseInt(weightInput.replace(/\D/g, ""), 10) || 0,
                  ),
                  unit: "gram",
                  icon: dimIcons.weight,
                },
              ].map((row) => (
                <View key={row.label} style={styles.dimRow}>
                  <View style={styles.dimRowLeft}>
                    <Image source={row.icon} style={styles.dimRowIcon} />
                    <Text
                      style={[
                        { color: colors.neutral400 },
                        textPresets.fs14_400,
                      ]}
                    >
                      {row.label}
                    </Text>
                  </View>
                  <Text
                    style={[{ color: colors.neutral900 }, textPresets.fs14_500]}
                  >
                    {row.value} {row.unit}
                  </Text>
                </View>
              ))}
            </Pressable>
          </SectionBlock>
        ) : null}
        <SectionBlock title="Thông tin vận chuyển" noPaddingHorizontal>
          <View style={styles.card}>
            {!isSpxProvider && (
              <>
                <Text
                  style={[{ color: colors.neutral400 }, textPresets.fs14_400]}
                >
                  Tùy chọn thanh toán
                </Text>
                <View style={styles.radioGroup}>
                  {[
                    { label: "Bên gửi trả phí", value: 1 },
                    { label: "Bên nhận trả phí", value: 0 },
                  ].map((opt) => (
                    <Pressable
                      key={opt.label}
                      onPress={() => setPaymentSide(opt.value as PaymentSide)}
                      style={[
                        styles.radioCard,
                        {
                          borderColor:
                            paymentSide === opt.value
                              ? colors.primary
                              : colors.border10,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.radioOuter,
                          {
                            borderColor:
                              paymentSide === opt.value
                                ? colors.primary
                                : colors.neutral300,
                          },
                        ]}
                      >
                        {paymentSide === opt.value && (
                          <View
                            style={[
                              styles.radioInner,
                              { backgroundColor: colors.primary },
                            ]}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          { color: colors.neutral900 },
                          textPresets.fs14_400,
                        ]}
                      >
                        {opt.label}
                      </Text>
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
                setPaymentSide={setPaymentSide}
                onOpenServicePoint={openServicePoint}
                onOpenVoucherSheet={openVoucherSheet}
                estimatedDelivery={estimatedDelivery}
                feeLoading={feeLoading}
                parcelInfoSlot={
                  <Pressable
                    onPress={openParcelSheet}
                    style={[
                      styles.parcelRow,
                      {
                        backgroundColor: colors.neutral50,
                        borderColor: colors.border10,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        { color: colors.neutral900 },
                        textPresets.fs14_500,
                      ]}
                    >
                      Thông tin bưu gửi{" "}
                      <Text style={{ color: colors.error }}>*</Text>
                    </Text>
                    <View style={styles.parcelRowRight}>
                      <Text
                        style={[
                          { color: colors.neutral500 },
                          textPresets.fs12_400,
                        ]}
                      >
                        {displayQuantity} Sản phẩm,{" "}
                        {(
                          (parseInt(weightInput.replace(/\D/g, ""), 10) || 0) /
                          1000
                        ).toFixed(1)}{" "}
                        KG
                      </Text>
                      <Icon
                        name="arrow_down"
                        size={14}
                        tintColor={colors.neutral400}
                      />
                    </View>
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
          </View>
        </SectionBlock>
        <View style={styles.spacer} />
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
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border10,
            paddingBottom: Math.max(bottom, 16),
          },
        ]}
      >
        <Pressable onPress={openFeeDetailSheet} style={styles.footerRow}>
          <Text style={[textPresets.fs14_500, { color: colors.neutral900 }]}>
            Shipper thu {totalCollected.toLocaleString("vi-VN")}đ
          </Text>
          <Text style={[textPresets.fs14_500, { color: colors.neutral500 }]}>
            Chi tiết ▲
          </Text>
        </Pressable>
        <Button
          title={isEditMode ? "Chỉnh Sửa Đơn Hàng" : "Tạo vận đơn"}
          type="gradient"
          loading={isSubmitting}
          disabled={submitDisabled}
          onPress={handleSubmitShipment}
          containerStyle={styles.footerButton}
        />
      </View>
    </View>
  );
}

const styles = createStyles(({ colors }) => ({
  root: { flex: 1 },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.neutral100,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border10,
    padding: 16,
    gap: 12,
  },
  addressDivider: {
    height: 0.5,
    backgroundColor: colors.border10,
    marginLeft: 56,
  },
  editNotice: {
    backgroundColor: colors.neutral100,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border10,
    padding: 12,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  spacer: { height: 24 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  outcomeUnknownBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerButton: {
    marginHorizontal: 16,
    marginTop: 8,
    height: 50,
    borderRadius: 14,
  },
  dimCard: { borderRadius: 16, borderWidth: 0.5, padding: 16, gap: 8 },
  dimRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 40,
  },
  dimRowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dimRowIcon: { width: 18, height: 18 },
  parcelRow: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  parcelRowRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    columnGap: 4,
  },
  radioGroup: { gap: 12 },
  radioCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  bg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
}));
