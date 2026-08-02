import { OrderWithTikTok } from "@app-types/index";
import { getOrderTotal } from "@features/orders/utils/order";
import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useShipmentAddresses } from "./use-shipment-addresses";
import { useAddressForm } from "./use-address-form";
import { useSubmitShipment } from "./use-submit-shipment";
import { useShipmentForm } from "./use-shipment-form";
import { useSpxShipping } from "./use-spx-shipping";
import { parseLocaleNumber, formatLocaleInput } from "../utils/shipment";

export function useCreateShipment() {
  const params = useLocalSearchParams<{ order?: string; shippingFee?: string; provider?: string; prepaid?: string; mode?: string }>();

  const [order, setOrder] = useState<OrderWithTikTok | null>(() => {
    if (!params.order) return null;
    try { return JSON.parse(params.order) as OrderWithTikTok; } catch { return null; }
  });

  const isManualProvider = params.provider === "manual";
  const isSpxProvider = params.provider === "spx";
  const isEditMode = params.mode === "edit";
  const orderProducts = order?.products ?? [];
  const primaryProduct = orderProducts[0];
  const displayQuantity = orderProducts.reduce((sum, p) => sum + (p.quantity || 0), 0) || order?.quantity || 1;
  const orderTotal = useMemo(() => getOrderTotal(orderProducts), [orderProducts]);

  const form = useShipmentForm({
    order,
    orderTotal,
    primaryProductName: primaryProduct?.name ?? undefined,
    initialShippingFee: params.shippingFee,
    initialPrepaid: params.prepaid != null ? Number(params.prepaid) : undefined,
  });

  const addresses = useShipmentAddresses(order);
  const { selectedSender, setSelectedSender, selectedRecipient, setSelectedRecipient, reloadShopAddresses, reloadCustomerAddresses } = addresses;

  const spx = useSpxShipping({
    enabled: isSpxProvider,
    orderId: order?.id,
    serviceType: form.serviceType,
    collectType: form.collectType,
    pickupTimeRangeId: form.pickupTimeRangeId,
    pickupTimeKey: form.pickupTimeKey,
    selectedSender,
    selectedRecipient,
    weightInput: form.weightInput,
    selectedVoucherCode: form.selectedVoucherCode,
    setSelectedVoucherCode: form.setSelectedVoucherCode,
  });

  const addrForm = useAddressForm({
    order,
    setOrder,
    selectedSender,
    setSelectedSender,
    selectedRecipient,
    setSelectedRecipient,
    reloadShopAddresses,
    reloadCustomerAddresses,
  });

  const manualFee = useMemo(() => parseLocaleNumber(form.manualShippingFee), [form.manualShippingFee]);
  const shippingFee = isManualProvider ? manualFee : isSpxProvider ? (spx.estimatedFee ?? 0) : parseLocaleNumber(String(params.shippingFee ?? ""));
  const orderCodAmount = Math.max(0, Number(order?.totalAmount ?? orderTotal) - Number(order?.depositAmount ?? 0));
  const spxCodAmount = Math.max(0, form.declaredValue - Number(order?.depositAmount ?? 0));
  const codAmount = isManualProvider ? parseLocaleNumber(form.manualCodAmount) : isSpxProvider ? spxCodAmount : orderCodAmount;
  const codAmountDisplay = useMemo(() => isManualProvider ? form.manualCodAmount : formatLocaleInput(String(codAmount)), [codAmount, isManualProvider, form.manualCodAmount]);
  const goodsValueDisplay = useMemo(() => formatLocaleInput(String(orderTotal)), [orderTotal]);
  const selectedVoucher = spx.vouchers.find(v => v.voucherCode === form.selectedVoucherCode);
  const voucherAmount = selectedVoucher ? Math.round(parseFloat(selectedVoucher.voucherAmount)) : 0;

  const totalCollected = isSpxProvider
    ? form.paymentSide === 0
      ? codAmount + shippingFee - voucherAmount
      : codAmount - voucherAmount
    : form.paymentSide === 0 ? codAmount + shippingFee : codAmount;

  const pickupTimeLabel = useMemo(() => {
    if (!isSpxProvider || !form.pickupTimeRangeId || !spx.timeslots.length) return "";
    for (const day of spx.timeslots) {
      const slot = day.slots.find(s => s.id === form.pickupTimeRangeId);
      if (slot) {
        const [y, m, d] = day.date.split("-");
        return `${d}/${m}/${y} ${slot.range}`;
      }
    }
    return "";
  }, [isSpxProvider, form.pickupTimeRangeId, spx.timeslots]);

  useEffect(() => {
    if (!isSpxProvider || !spx.timeslots.length || form.pickupTimeRangeId) return;
    for (let gi = 0; gi < spx.timeslots.length; gi++) {
      const day = spx.timeslots[gi];
      const slot = day.slots[0];
      if (slot) {
        const key = `${day.pickupTime}-${slot.id}-${gi}-0`;
        form.setPickupTime(slot.id, key, day.pickupTime);
        break;
      }
    }
  }, [isSpxProvider, spx.timeslots, form.pickupTimeRangeId]);

  const { isSubmitting, submitState, handleSubmitShipment, handleRetryOutcomeUnknown } = useSubmitShipment({
    order, isManualProvider, isSpxProvider, isEditMode, selectedSender, selectedRecipient,
    paymentSide: form.paymentSide, transport: form.transport, pickupOption: form.pickupOption, note: form.note,
    manualShippingFee: form.manualShippingFee, manualCodAmount: form.manualCodAmount, manualNote: form.manualNote, manualFee,
    senderAddressId: selectedSender?.id,
    serviceType: isSpxProvider ? form.serviceType : undefined,
    collectType: isSpxProvider ? form.collectType : undefined,
    pickupTimeRangeId: isSpxProvider ? form.pickupTimeRangeId ?? undefined : undefined,
    pickupTime: isSpxProvider ? form.pickupTimestamp ?? undefined : undefined,
    parcelItemName: isSpxProvider ? form.parcelItemName || undefined : undefined,
    declaredValue: isSpxProvider ? form.declaredValue || undefined : undefined,
    weightGram: isSpxProvider ? (parseInt(form.weightInput.replace(/\D/g, ""), 10) || undefined) : undefined,
    dimLength: isSpxProvider ? (parseInt(form.dimLength.replace(/\D/g, ""), 10) || undefined) : undefined,
    dimWidth: isSpxProvider ? (parseInt(form.dimWidth.replace(/\D/g, ""), 10) || undefined) : undefined,
    dimHeight: isSpxProvider ? (parseInt(form.dimHeight.replace(/\D/g, ""), 10) || undefined) : undefined,
    idempotencyKey: form.idempotencyKey,
    voucherCode: form.selectedVoucherCode ?? undefined,
    customerAddressId: selectedRecipient?.id,
    paymentRole: isSpxProvider ? (form.paymentSide === 0 ? 2 : 1) : undefined,
    allowMutualCheck: isSpxProvider ? form.allowMutualCheck : undefined,
    allowTryOn: isSpxProvider ? form.allowTryOn : undefined,
    allowPartialDelivery: isSpxProvider ? form.allowPartialDelivery : undefined,
    codCollection: isSpxProvider ? (spxCodAmount > 0 ? 1 : 0) : undefined,
    pickupTimeLabel,
    shippingFee,
    codAmount,
    voucherAmount,
  });

  return {
    order,
    isManualProvider,
    isSpxProvider,
    isEditMode,
    primaryProduct,
    displayQuantity,
    orderTotal,
    ...addresses,
    ...addrForm,
    ...form,
    ...spx,
    shippingFee,
    codAmount,
    codAmountDisplay,
    goodsValueDisplay,
    totalCollected,
    voucherAmount,
    isSubmitting,
    submitState,
    handleSubmitShipment,
    handleRetryOutcomeUnknown,
  };
}
