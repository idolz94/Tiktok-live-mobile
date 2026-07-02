import { useEffect, useState } from "react";
import {
  getShippingFeeApi,
  getSpxTimeslotsApi,
  getSpxVouchersApi,
  type CustomerAddress,
  type ShopAddress,
  type SpxVoucher,
} from "../service/create-shipment-api";
import type { CollectType, ServiceType, SpxTimeslot } from "../types/shipment";

type UseSpxShippingParams = {
  enabled: boolean;
  orderId?: string | null;
  serviceType: ServiceType;
  collectType: CollectType;
  pickupTimeRangeId: number | null;
  pickupTimeKey: string | null;
  selectedSender: ShopAddress | null;
  selectedRecipient: CustomerAddress | null;
  weightInput: string;
  selectedVoucherCode: string | null;
  setSelectedVoucherCode: (value: string | null) => void;
};

export function useSpxShipping({
  enabled,
  orderId,
  serviceType,
  collectType,
  pickupTimeRangeId,
  pickupTimeKey,
  selectedSender,
  selectedRecipient,
  weightInput,
  selectedVoucherCode,
  setSelectedVoucherCode,
}: UseSpxShippingParams) {
  const [timeslots, setTimeslots] = useState<SpxTimeslot[]>([]);
  const [timeslotsLoading, setTimeslotsLoading] = useState(false);
  const [timeslotsError, setTimeslotsError] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<SpxVoucher[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [vouchersError, setVouchersError] = useState<string | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setVouchers([]);
      setVouchersError(null);
      setSelectedVoucherCode(null);
      return;
    }
    let cancelled = false;
    setVouchersLoading(true);
    setVouchersError(null);
    getSpxVouchersApi()
      .then((res) => {
        if (cancelled) return;
        setVouchers(res.vouchers ?? []);
        setVouchersLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("[SPX vouchers]", err);
        setVouchers([]);
        setVouchersError("Không tải được voucher. Thử lại.");
        setVouchersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, setSelectedVoucherCode]);

  useEffect(() => {
    if (!enabled || collectType !== 1) {
      setTimeslots([]);
      setTimeslotsError(null);
      return;
    }
    let cancelled = false;
    setTimeslotsLoading(true);
    setTimeslotsError(null);
    getSpxTimeslotsApi(serviceType)
      .then((res) => {
        if (cancelled) return;
        setTimeslots(res.timeslots ?? []);
        setTimeslotsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("[SPX timeslots]", err);
        setTimeslots([]);
        setTimeslotsError("Không tải được khung giờ. Thử lại.");
        setTimeslotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, collectType, serviceType]);

  useEffect(() => {
    if (!enabled || !orderId) return;
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
      getShippingFeeApi(orderId, {
        providerCode: "spx",
        pickProvince: senderProvince,
        pickWard: senderWard,
        pickAddress: selectedSender?.address ?? undefined,
        receiverProvince,
        receiverWard,
        receiverAddress: selectedRecipient?.address ?? undefined,
        weightGram,
      })
        .then((res) => {
          if (cancelled) return;
          setEstimatedFee(res.fee?.fee ?? null);
          setFeeLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setFeeError("Không tính được phí");
          setFeeLoading(false);
        });
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    enabled,
    orderId,
    selectedSender,
    selectedRecipient,
    weightInput,
    collectType,
    pickupTimeRangeId,
    pickupTimeKey,
  ]);

  return {
    timeslots,
    timeslotsLoading,
    timeslotsError,
    vouchers,
    vouchersLoading,
    vouchersError,
    selectedVoucherCode,
    estimatedFee,
    feeLoading,
    feeError,
  };
}
