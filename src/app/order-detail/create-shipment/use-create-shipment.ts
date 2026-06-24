import { OrderWithTikTok } from "@app-types/index";
import { getOrderTotal } from "@features/orders/utils/order";
import { useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Transport, PaymentSide, ViewCondition, PickupOption, DeliveryPolicy, RefusalFee } from "./types";
import { useShipmentAddresses } from "./hooks/use-shipment-addresses";
import { useAddressForm } from "./hooks/use-address-form";
import { useShippingFee } from "./hooks/use-shipping-fee";
import { useSubmitShipment } from "./hooks/use-submit-shipment";
import { formatLocaleInput, parseLocaleNumber } from "./utils";

export function useCreateShipment() {
  const params = useLocalSearchParams<{ order?: string; shippingFee?: string; provider?: string }>();

  const [order, setOrder] = useState<OrderWithTikTok | null>(() => {
    if (!params.order) return null;
    try { return JSON.parse(params.order) as OrderWithTikTok; } catch { return null; }
  });

  const isManualProvider = params.provider === "manual";
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
  const [dimensionsOpen, setDimensionsOpen] = useState(false);
  const [note, setNote] = useState(order?.note ?? "");
  const [manualNote, setManualNote] = useState("");
  const [manualShippingFee, setManualShippingFee] = useState(() => formatLocaleInput(String(params.shippingFee ?? "")));
  const [manualCodAmount, setManualCodAmount] = useState(() => formatLocaleInput(String(order?.codAmount ?? orderTotal)));

  const addresses = useShipmentAddresses(order);
  const { shopAddresses, customerAddresses, selectedSender, setSelectedSender, selectedRecipient, setSelectedRecipient, isLoadingSender, isLoadingRecipient, reloadShopAddresses, reloadCustomerAddresses } = addresses;

  const [senderSheetVisible, setSenderSheetVisible] = useState(false);
  const [recipientSheetVisible, setRecipientSheetVisible] = useState(false);

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

  const { estimatedFee, feeLoading, feeError } = useShippingFee(
    order, isManualProvider, selectedSender, selectedRecipient, weightInput, transport,
  );

  const manualFee = useMemo(() => parseLocaleNumber(manualShippingFee), [manualShippingFee]);
  const shippingFee = isManualProvider ? manualFee : estimatedFee ?? parseLocaleNumber(String(params.shippingFee ?? ""));
  const codAmount = isManualProvider ? parseLocaleNumber(manualCodAmount) : order?.codAmount ?? orderTotal;
  const codAmountDisplay = useMemo(() => isManualProvider ? manualCodAmount : formatLocaleInput(String(codAmount)), [codAmount, isManualProvider, manualCodAmount]);
  const goodsValueDisplay = useMemo(() => formatLocaleInput(String(orderTotal)), [orderTotal]);
  const totalCollected = paymentSide === 0 ? codAmount + shippingFee : codAmount;

  const { isSubmitting, handleSubmitShipment } = useSubmitShipment({
    order, isManualProvider, selectedSender, selectedRecipient,
    paymentSide, transport, pickupOption, note,
    manualShippingFee, manualCodAmount, manualNote, manualFee,
  });

  return {
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
    setManualShippingFee: (text: string) => setManualShippingFee(formatLocaleInput(text)),
    manualNote,
    setManualNote,
    manualCodAmount,
    setManualCodAmount: (text: string) => setManualCodAmount(formatLocaleInput(text)),
    note,
    setNote,
    isSubmitting,
    handleSubmitShipment,
  };
}
