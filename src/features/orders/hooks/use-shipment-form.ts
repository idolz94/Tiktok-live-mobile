import { useCallback, useState } from "react";
import type { OrderWithTikTok } from "@app-types/index";
import type {
  CollectType,
  DeliveryPolicy,
  PaymentSide,
  PickupOption,
  RefusalFee,
  ServiceType,
  Transport,
  ViewCondition,
} from "../types/shipment";
import { formatLocaleInput } from "../utils/shipment";

const generateUuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

type UseShipmentFormParams = {
  order: OrderWithTikTok | null;
  orderTotal: number;
  primaryProductName?: string;
  initialShippingFee?: string | string[];
};

export function useShipmentForm({
  order,
  orderTotal,
  primaryProductName,
  initialShippingFee,
}: UseShipmentFormParams) {
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
  const [manualShippingFee, setManualShippingFeeRaw] = useState(() =>
    formatLocaleInput(String(initialShippingFee ?? "")),
  );
  const [manualCodAmount, setManualCodAmountRaw] = useState(() =>
    formatLocaleInput(String(order?.codAmount ?? orderTotal)),
  );

  const [serviceType, setServiceType] = useState<ServiceType>(1);
  const [collectType, setCollectType] = useState<CollectType>(1);
  const [pickupTimeRangeId, setPickupTimeRangeId] = useState<number | null>(null);
  const [pickupTimeKey, setPickupTimeKey] = useState<string | null>(null);
  const [pickupTimestamp, setPickupTimestamp] = useState<number | null>(null);
  const setPickupTime = useCallback((id: number, key: string, pickupTime: number) => {
    setPickupTimeRangeId(id);
    setPickupTimeKey(key);
    setPickupTimestamp(pickupTime);
  }, []);
  const [parcelItemName, setParcelItemName] = useState(() => primaryProductName ?? "");
  const [declaredValue, setDeclaredValue] = useState(() => orderTotal);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(null);
  const [allowMutualCheck, setAllowMutualCheck] = useState<0 | 1>(0);
  const [allowTryOn, setAllowTryOn] = useState<0 | 1>(0);
  const [allowPartialDelivery, setAllowPartialDelivery] = useState<0 | 1>(0);
  const [idempotencyKey] = useState(() => generateUuid());

  const setManualShippingFee = useCallback((text: string) => {
    setManualShippingFeeRaw(formatLocaleInput(text));
  }, []);

  const setManualCodAmount = useCallback((text: string) => {
    setManualCodAmountRaw(formatLocaleInput(text));
  }, []);

  return {
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
    note,
    setNote,
    manualNote,
    setManualNote,
    manualShippingFee,
    setManualShippingFee,
    manualCodAmount,
    setManualCodAmount,
    serviceType,
    setServiceType,
    collectType,
    setCollectType,
    pickupTimeRangeId,
    pickupTimeKey,
    pickupTimestamp,
    setPickupTime,
    parcelItemName,
    setParcelItemName,
    declaredValue,
    setDeclaredValue,
    selectedVoucherCode,
    setSelectedVoucherCode,
    allowMutualCheck,
    setAllowMutualCheck,
    allowTryOn,
    setAllowTryOn,
    allowPartialDelivery,
    setAllowPartialDelivery,
    idempotencyKey,
  };
}
