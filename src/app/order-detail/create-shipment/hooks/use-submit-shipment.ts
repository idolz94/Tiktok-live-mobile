import { OrderWithTikTok } from "@app-types/index";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import {
  CustomerAddress,
  ShopAddress,
  submitManualShippingApi,
  submitSpxApi,
} from "../create-shipment-api";
import { PaymentSide, PickupOption, Transport, ServiceType, CollectType } from "../types";
import { parseLocaleNumber } from "../utils";

type Deps = {
  order: OrderWithTikTok | null;
  isManualProvider: boolean;
  isSpxProvider: boolean;
  selectedSender: ShopAddress | null;
  selectedRecipient: CustomerAddress | null;
  paymentSide: PaymentSide;
  transport: Transport;
  pickupOption: PickupOption;
  note: string;
  manualShippingFee: string;
  manualCodAmount: string;
  manualNote: string;
  manualFee: number;
  // SPX fields
  senderAddressId?: string;
  serviceType?: ServiceType;
  collectType?: CollectType;
  pickupTimeRangeId?: number;
  pickupTime?: number;
  parcelItemName?: string;
  declaredValue?: number;
  weightGram?: number;
  dimLength?: number;
  dimWidth?: number;
  dimHeight?: number;
  idempotencyKey: string;
  voucherCode?: string;
  customerAddressId?: string;
};

type SubmitState = "idle" | "submitting" | "success" | "outcome_unknown" | "error";

export function useSubmitShipment(deps: Deps) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [lastError, setLastError] = useState<string | null>(null);

  const handleSubmitShipment = useCallback(async () => {
    const {
      order,
      isManualProvider,
      isSpxProvider,
      selectedSender,
      selectedRecipient,
      paymentSide,
      note,
      manualShippingFee,
      manualCodAmount,
      manualNote,
      manualFee,
      senderAddressId,
      serviceType,
      collectType,
      pickupTimeRangeId,
      pickupTime,
      parcelItemName,
      declaredValue,
      weightGram,
      dimLength,
      dimWidth,
      dimHeight,
      idempotencyKey,
      voucherCode,
      customerAddressId,
    } = deps;

    if (!order || !selectedSender || !selectedRecipient) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn đầy đủ địa chỉ người gửi và người nhận.");
      return;
    }

    setSubmitState("submitting");
    setLastError(null);

    try {
      if (isManualProvider) {
        await submitManualShippingApi(order.id, {
          paymentSide,
          shippingFee: manualShippingFee.trim() ? manualFee : undefined,
          codAmount: manualCodAmount.trim() ? parseLocaleNumber(manualCodAmount) : undefined,
          note: manualNote.trim() || undefined,
        });
        setSubmitState("success");
      } else if (isSpxProvider) {
        if (!senderAddressId || !serviceType || !collectType || !weightGram) {
          setSubmitState("idle");
          Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin SPX.");
          return;
        }
        if (collectType === 1 && !pickupTimeRangeId) {
          setSubmitState("idle");
          Alert.alert("Thiếu thông tin", "Vui lòng chọn khung giờ lấy hàng.");
          return;
        }
        await submitSpxApi(order.id, {
          providerCode: "spx",
          senderAddressId,
          serviceType,
          collectType,
          pickupTimeRangeId,
          pickupTime,
          parcelWeightGram: weightGram,
          parcelLengthCm: dimLength,
          parcelWidthCm: dimWidth,
          parcelHeightCm: dimHeight,
          parcelItemName,
          declaredValue,
          note,
          idempotencyKey,
          voucherCode,
          customerAddressId,
        });
        setSubmitState("success");
      } else {
        Alert.alert("Thiếu thông tin", "Vui lòng chọn phương thức vận chuyển.");
        setSubmitState("idle");
        return;
      }

      Alert.alert("Tạo vận đơn thành công", "Đơn hàng đã được gửi sang đơn vị vận chuyển.", [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "/(tabs)/shipping",
              params: { refreshShipping: String(Date.now()) },
            }),
        },
      ]);
    } catch (err) {
      const isNetworkTimeout =
        err instanceof Error &&
        (err.message.includes("timeout") || err.message.includes("Network"));

      if (isNetworkTimeout && isSpxProvider) {
        setSubmitState("outcome_unknown");
        setLastError("Không thể xác nhận trạng thái. Vui lòng thử lại hoặc quay lại kiểm tra.");
      } else {
        setSubmitState("idle");
        setLastError(
          err instanceof Error
            ? err.message
            : "Tạo vận đơn thất bại. Vui lòng kiểm tra thông tin và thử lại."
        );
        Alert.alert("Tạo vận đơn thất bại", lastError || "Vui lòng kiểm tra thông tin và thử lại.");
      }
    }
  }, [deps, lastError]);

  const handleRetryOutcomeUnknown = useCallback(async () => {
    setSubmitState("submitting");
    await handleSubmitShipment();
  }, [handleSubmitShipment]);

  return {
    isSubmitting: submitState === "submitting",
    submitState,
    lastError,
    handleSubmitShipment,
    handleRetryOutcomeUnknown,
  };
}
