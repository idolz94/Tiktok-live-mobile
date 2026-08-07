import { OrderWithTikTok } from "@app-types/index";
import { useCallback, useState } from "react";
import { useToast } from "@components/toast";
import { router } from "expo-router";
import {
  CustomerAddress,
  ShopAddress,
  submitManualShippingApi,
  submitSpxApi,
  updateSpxApi,
} from "../service/create-shipment-api";
import { PaymentSide, PickupOption, Transport, ServiceType, CollectType } from "../types/shipment";

type Deps = {
  order: OrderWithTikTok | null;
  isManualProvider: boolean;
  isSpxProvider: boolean;
  isEditMode: boolean;
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
  paymentRole?: 1 | 2;
  allowMutualCheck?: 0 | 1;
  allowTryOn?: 0 | 1;
  allowPartialDelivery?: 0 | 1;
  codCollection?: 0 | 1;
  // success screen data
  pickupTimeLabel?: string;
  shippingFee?: number;
  codAmount?: number;
  voucherAmount?: number;
};

type SubmitState = "idle" | "submitting" | "success" | "outcome_unknown" | "error";

export function useSubmitShipment(deps: Deps) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [lastError, setLastError] = useState<string | null>(null);
  const toast = useToast();

  const handleSubmitShipment = useCallback(async () => {
    const {
      order,
      isManualProvider,
      isSpxProvider,
      isEditMode,
      selectedSender,
      selectedRecipient,
      paymentSide,
      note,
      manualShippingFee,
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
      paymentRole,
      allowMutualCheck,
      allowTryOn,
      allowPartialDelivery,
      codCollection,
    } = deps;

    if (!order || !selectedSender || !selectedRecipient) {
      toast.warning({ title: "Thiếu thông tin", description: "Vui lòng chọn đầy đủ địa chỉ người gửi và người nhận." });
      return;
    }
    if (isSpxProvider && !selectedRecipient.address?.trim()) {
      toast.warning({ title: "Thiếu địa chỉ chi tiết", description: "Vui lòng bổ sung số nhà, tên đường hoặc địa chỉ chi tiết của người nhận." });
      return;
    }

    setSubmitState("submitting");
    setLastError(null);

    try {
      if (isManualProvider) {
        const codAmount = deps.codAmount ?? 0;
        if (codAmount < 0) {
          setSubmitState("idle");
          toast.warning({ title: "Thông tin chưa hợp lệ", description: "Tiền thu hộ (COD) không được âm." });
          return;
        }
        await submitManualShippingApi(order.id, {
          paymentSide,
          shippingFee: manualShippingFee.trim() ? manualFee : undefined,
          codAmount,
          note: manualNote.trim() || undefined,
          idempotencyKey,
          senderAddressId: selectedSender.id,
          customerAddressId: selectedRecipient.id,
        });
        setSubmitState("success");
        router.replace({
          pathname: "/order-detail/create-shipment/success" as never,
          params: {
            orderId: order.id,
            provider: "manual",
            codAmount: String(deps.codAmount ?? 0),
            shippingFee: String(deps.shippingFee ?? 0),
            voucherAmount: String(deps.voucherAmount ?? 0),
            paymentSide: String(paymentSide),
            note: manualNote.trim(),
          },
        });
        return;
      } else if (isSpxProvider) {
        if (!senderAddressId || !serviceType || !collectType || !weightGram) {
          setSubmitState("idle");
          toast.warning({ title: "Thiếu thông tin", description: "Vui lòng điền đầy đủ thông tin SPX." });
          return;
        }
        if (collectType === 1 && !pickupTimeRangeId) {
          setSubmitState("idle");
          toast.warning({ title: "Thiếu thông tin", description: "Vui lòng chọn khung giờ lấy hàng." });
          return;
        }
        const spxPayload = {
          providerCode: "spx" as const,
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
          ...(isEditMode ? {} : { declaredValue }),
          note,
          idempotencyKey,
          voucherCode,
          customerAddressId,
          paymentRole,
          allowMutualCheck,
          allowTryOn,
          allowPartialDelivery,
          codCollection,
        };
        await (isEditMode ? updateSpxApi : submitSpxApi)(order.id, spxPayload);
        setSubmitState("success");
        router.replace({
          pathname: "/order-detail/create-shipment/success" as never,
          params: {
            orderId: order.id,
            provider: "spx",
            mode: isEditMode ? "edit" : "create",
            serviceType: String(serviceType ?? ""),
            collectType: String(collectType ?? ""),
            pickupTimeLabel: deps.pickupTimeLabel ?? "",
            codAmount: String(deps.codAmount ?? 0),
            shippingFee: String(deps.shippingFee ?? 0),
            voucherAmount: String(deps.voucherAmount ?? 0),
            paymentSide: String(paymentSide),
            note: note?.trim() ?? "",
          },
        });
        return;
      } else {
        toast.warning({ title: "Thiếu thông tin", description: "Vui lòng chọn phương thức vận chuyển." });
        setSubmitState("idle");
        return;
      }
    } catch (err) {
      const isNetworkTimeout =
        err instanceof Error &&
        (err.message.includes("timeout") || err.message.includes("Network"));

      if (isNetworkTimeout && isSpxProvider) {
        setSubmitState("outcome_unknown");
        setLastError("Không thể xác nhận trạng thái. Vui lòng thử lại hoặc quay lại kiểm tra.");
      } else {
        // ponytail: capture msg before setState — lastError is stale in the same render cycle
        const msg =
          err instanceof Error
            ? err.message
            : "Tạo vận đơn thất bại. Vui lòng kiểm tra thông tin và thử lại.";
        setSubmitState("idle");
        setLastError(msg);
        toast.error({ title: isEditMode ? "Chỉnh sửa đơn hàng thất bại" : "Tạo vận đơn thất bại", description: msg });
      }
    }
  }, [deps, toast]);

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
