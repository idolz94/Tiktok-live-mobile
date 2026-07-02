import { OrderWithTikTok } from "@app-types/index";
import { getOrderTotal } from "@features/orders/utils/order";
import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Transport, PaymentSide, ViewCondition, PickupOption, DeliveryPolicy, RefusalFee, ServiceType, CollectType } from "./types";
import { useShipmentAddresses } from "../hooks/use-shipment-addresses";
import { useAddressForm } from "../hooks/use-address-form";
import { useSubmitShipment } from "../hooks/use-submit-shipment";
import { getSpxTimeslotsApi, getSpxVouchersApi, getShippingFeeApi } from "./create-shipment-api";
import type { SpxVoucher } from "./create-shipment-api";
import type { SpxTimeslot } from "./types";
import { formatLocaleInput, parseLocaleNumber } from "./utils";

const generateUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function useCreateShipment() {
  const params = useLocalSearchParams<{ order?: string; shippingFee?: string; provider?: string }>();

  const [order, setOrder] = useState<OrderWithTikTok | null>(() => {
    if (!params.order) return null;
    try { return JSON.parse(params.order) as OrderWithTikTok; } catch { return null; }
  });

  const isManualProvider = params.provider === "manual";
  const isSpxProvider = params.provider === "spx";
  const orderProducts = order?.products ?? [];
  const primaryProduct = orderProducts[0];
  const displayQuantity = orderProducts.reduce((sum, p) => sum + (p.quantity || 0), 0) || order?.quantity || 1;
  const orderTotal = useMemo(() => getOrderTotal(orderProducts), [orderProducts]);

  const [transport, setTransport] = useState<Transport>("road");
  const [paymentSide, setPaymentSide] = useState<PaymentSide>(0);
  const [viewCondition, setViewCondition] = useState<ViewCondition>("viewable");
  const [pickupOption, setPickupOption] = useState<PickupOption>("cod");
  const [deliveryPolicy, setDeliveryPolicy] = useState<DeliveryPolicy>("full");
  const [refusalFee, setRefusalFee] = useState<RefusalFee>("free");
  const [weightInput, setWeightInput] = useState("500");
  const [dimLength, setDimLength] = useState("40");
  const [dimWidth, setDimWidth] = useState("40");
  const [dimHeight, setDimHeight] = useState("10");
  const [autoScale, setAutoScale] = useState(true);
  const [note, setNote] = useState(order?.note ?? "");
  const [manualNote, setManualNote] = useState("");
  const [manualShippingFee, setManualShippingFee] = useState(() => formatLocaleInput(String(params.shippingFee ?? "")));
  const [manualCodAmount, setManualCodAmount] = useState(() => formatLocaleInput(String(order?.codAmount ?? orderTotal)));

  // SPX state
  const serviceType: ServiceType = 1;
  const [collectType, setCollectType] = useState<CollectType>(1);
  const [pickupTimeRangeId, setPickupTimeRangeId] = useState<number | null>(null);
  const [pickupTimeKey, setPickupTimeKey] = useState<string | null>(null);
  const [pickupTimestamp, setPickupTimestamp] = useState<number | null>(null);
  const setPickupTime = (id: number, key: string, pickupTime: number) => {
    setPickupTimeRangeId(id);
    setPickupTimeKey(key);
    setPickupTimestamp(pickupTime);
  };
  const [parcelItemName, setParcelItemName] = useState(() => primaryProduct?.name ?? "");
  const [declaredValue, setDeclaredValue] = useState(() => orderTotal);
  const [timeslots, setTimeslots] = useState<SpxTimeslot[]>([]);
  const [timeslotsLoading, setTimeslotsLoading] = useState(false);
  const [timeslotsError, setTimeslotsError] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<SpxVoucher[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [vouchersError, setVouchersError] = useState<string | null>(null);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => generateUuid());

  // SPX estimated fee
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSpxProvider) {
      setVouchers([]);
      setVouchersError(null);
      setSelectedVoucherCode(null);
      return;
    }
    let cancelled = false;
    setVouchersLoading(true);
    setVouchersError(null);
    getSpxVouchersApi().then((res) => {
      if (cancelled) return;
      setVouchers(res.vouchers ?? []);
      setVouchersLoading(false);
    }).catch((err: unknown) => {
      if (cancelled) return;
      console.error("[SPX vouchers]", err);
      setVouchers([]);
      setVouchersError("Không tải được voucher. Thử lại.");
      setVouchersLoading(false);
    });
    return () => { cancelled = true; };
  }, [isSpxProvider]);

  useEffect(() => {
    if (!isSpxProvider || collectType !== 1) {
      setTimeslots([]);
      setTimeslotsError(null);
      return;
    }
    let cancelled = false;
    setTimeslotsLoading(true);
    setTimeslotsError(null);
    getSpxTimeslotsApi(serviceType).then((res) => {
      if (cancelled) return;
      setTimeslots(res.timeslots ?? []);
      setTimeslotsLoading(false);
    }).catch((err: unknown) => {
      if (cancelled) return;
      console.error("[SPX timeslots]", err);
      setTimeslots([]);
      setTimeslotsError("Không tải được khung giờ. Thử lại.");
      setTimeslotsLoading(false);
    });
    return () => { cancelled = true; };
  }, [isSpxProvider, collectType, serviceType]);

  const addresses = useShipmentAddresses(order);
  const { shopAddresses, customerAddresses, selectedSender, setSelectedSender, selectedRecipient, setSelectedRecipient, isLoadingSender, isLoadingRecipient, reloadShopAddresses, reloadCustomerAddresses } = addresses;

  useEffect(() => {
    if (!isSpxProvider || !order?.id) return;
    if (collectType === 1 && !pickupTimeRangeId) {
      setEstimatedFee(null);
      setFeeError("Vui lòng chọn khung giờ lấy hàng");
      return;
    }
    const senderProvince = selectedSender?.province;
    const senderWard = selectedSender?.ward;
    const receiverProvince = selectedRecipient?.province;
    const receiverWard = selectedRecipient?.ward;
    if (!senderProvince || !senderWard || !receiverProvince || !receiverWard) {
      setEstimatedFee(null);
      if (!senderWard) {
        setFeeError("Địa chỉ lấy hàng chưa đủ Phường/Xã");
      } else if (!receiverWard) {
        setFeeError("Địa chỉ giao hàng chưa đủ Phường/Xã");
      } else {
        setFeeError(null);
      }
      return;
    }
    const weightGram = parseInt(weightInput.replace(/\D/g, ""), 10) || undefined;
    let cancelled = false;
    const timer = setTimeout(() => {
      setFeeLoading(true);
      setFeeError(null);
      getShippingFeeApi(order.id, {
        providerCode: "spx",
        pickProvince: senderProvince,
        pickWard: senderWard,
        pickAddress: selectedSender?.address ?? undefined,
        receiverProvince,
        receiverWard,
        receiverAddress: selectedRecipient?.address ?? undefined,
        weightGram,
      }).then((res) => {
        if (cancelled) return;
        setEstimatedFee(res.fee?.fee ?? null);
        setFeeLoading(false);
      }).catch(() => {
        if (cancelled) return;
        setFeeError("Không tính được phí");
        setFeeLoading(false);
      });
    }, 600);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [isSpxProvider, order?.id, selectedSender, selectedRecipient, weightInput, collectType, pickupTimeRangeId, pickupTimeKey]);

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

  const manualFee = useMemo(() => parseLocaleNumber(manualShippingFee), [manualShippingFee]);
  const shippingFee = isManualProvider ? manualFee : isSpxProvider ? (estimatedFee ?? 0) : parseLocaleNumber(String(params.shippingFee ?? ""));
  const orderCodAmount = Math.max(0, Number(order?.totalAmount ?? orderTotal) - Number(order?.depositAmount ?? 0));
  const codAmount = isManualProvider ? parseLocaleNumber(manualCodAmount) : orderCodAmount;
  const codAmountDisplay = useMemo(() => isManualProvider ? manualCodAmount : formatLocaleInput(String(codAmount)), [codAmount, isManualProvider, manualCodAmount]);
  const goodsValueDisplay = useMemo(() => formatLocaleInput(String(orderTotal)), [orderTotal]);
  const totalCollected = isSpxProvider
    ? codAmount + shippingFee
    : paymentSide === 0 ? codAmount + shippingFee : codAmount;

  const { isSubmitting, submitState, handleSubmitShipment, handleRetryOutcomeUnknown } = useSubmitShipment({
    order, isManualProvider, isSpxProvider, selectedSender, selectedRecipient,
    paymentSide, transport, pickupOption, note,
    manualShippingFee, manualCodAmount, manualNote, manualFee,
    // SPX
    senderAddressId: selectedSender?.id,
    serviceType: isSpxProvider ? serviceType : undefined,
    collectType: isSpxProvider ? collectType : undefined,
    pickupTimeRangeId: isSpxProvider ? pickupTimeRangeId ?? undefined : undefined,
    pickupTime: isSpxProvider ? pickupTimestamp ?? undefined : undefined,
    parcelItemName: isSpxProvider ? parcelItemName || undefined : undefined,
    declaredValue: isSpxProvider ? declaredValue || undefined : undefined,
    weightGram: isSpxProvider ? (parseInt(weightInput.replace(/\D/g, ""), 10) || undefined) : undefined,
    dimLength: isSpxProvider ? (parseInt(dimLength.replace(/\D/g, ""), 10) || undefined) : undefined,
    dimWidth: isSpxProvider ? (parseInt(dimWidth.replace(/\D/g, ""), 10) || undefined) : undefined,
    dimHeight: isSpxProvider ? (parseInt(dimHeight.replace(/\D/g, ""), 10) || undefined) : undefined,
    idempotencyKey,
    voucherCode: selectedVoucherCode ?? undefined,
    customerAddressId: selectedRecipient?.id,
  });

  return {
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
    ...addrForm,
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
    shippingFee,
    codAmountDisplay,
    goodsValueDisplay,
    totalCollected,
    manualShippingFee,
    setManualShippingFee: (text: string) => setManualShippingFee(formatLocaleInput(text)),
    manualNote,
    setManualNote,
    manualCodAmount,
    setManualCodAmount: (text: string) => setManualCodAmount(formatLocaleInput(text)),
    note,
    setNote,
    isSubmitting,
    submitState,
    handleSubmitShipment,
    handleRetryOutcomeUnknown,
    // SPX
    serviceType,
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
    idempotencyKey,
    estimatedFee,
    feeLoading,
    feeError,
  };
}
