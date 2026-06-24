import { OrderWithTikTok } from "@app-types/index";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import {
  CustomerAddress,
  ShopAddress,
  SubmitShippingPayload,
  submitManualShippingApi,
  submitOrderToGhtkApi,
} from "../create-shipment-api";
import { PaymentSide, PickupOption, Transport } from "../types";
import { parseLocaleNumber } from "../utils";

type Deps = {
  order: OrderWithTikTok | null;
  isManualProvider: boolean;
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
};

export function useSubmitShipment(deps: Deps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitShipment = useCallback(async () => {
    const { order, isManualProvider, selectedSender, selectedRecipient, paymentSide, transport, pickupOption, note, manualShippingFee, manualCodAmount, manualNote, manualFee } = deps;

    if (!order || !selectedSender || !selectedRecipient) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn đầy đủ địa chỉ người gửi và người nhận.");
      return;
    }
    const payload: SubmitShippingPayload = {
      pickName: selectedSender.name ?? "",
      pickAddress: selectedSender.address ?? "",
      pickProvince: selectedSender.province ?? "",
      pickDistrict: selectedSender.district ?? "",
      pickWard: selectedSender.ward ?? undefined,
      pickTel: selectedSender.phone ?? "",
      receiverName: selectedRecipient.name ?? "",
      receiverAddress: selectedRecipient.address ?? "",
      receiverProvince: selectedRecipient.province ?? "",
      receiverDistrict: selectedRecipient.district ?? "",
      receiverWard: selectedRecipient.ward ?? "",
      receiverTel: selectedRecipient.phone ?? "",
      note,
      isFreeShip: paymentSide,
      transport,
      pickOption: pickupOption,
    };
    setIsSubmitting(true);
    try {
      if (isManualProvider) {
        await submitManualShippingApi(order.id, {
          paymentSide,
          shippingFee: manualShippingFee.trim() ? manualFee : undefined,
          codAmount: manualCodAmount.trim() ? parseLocaleNumber(manualCodAmount) : undefined,
          note: manualNote.trim() || undefined,
        });
      } else {
        await submitOrderToGhtkApi(order.id, payload);
      }
      Alert.alert("Tạo vận đơn thành công", "Đơn hàng đã được gửi sang đơn vị vận chuyển.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Tạo vận đơn thất bại", "Vui lòng kiểm tra thông tin và thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }, [deps]);

  return { isSubmitting, handleSubmitShipment };
}
