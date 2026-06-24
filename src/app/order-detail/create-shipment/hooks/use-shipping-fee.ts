import { OrderWithTikTok } from "@app-types/index";
import { useCallback, useEffect, useRef, useState } from "react";
import { CustomerAddress, ShopAddress, getShippingFeeApi } from "../create-shipment-api";
import { Transport } from "../types";
import { parseLocaleNumber } from "../utils";

export function useShippingFee(
  order: OrderWithTikTok | null,
  isManualProvider: boolean,
  selectedSender: ShopAddress | null,
  selectedRecipient: CustomerAddress | null,
  weightInput: string,
  transport: Transport,
) {
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchEstimatedFee = useCallback(async () => {
    if (
      isManualProvider ||
      !order ||
      !selectedSender?.province ||
      !selectedSender?.district ||
      !selectedRecipient?.province ||
      !selectedRecipient?.district
    ) {
      setEstimatedFee(null);
      return;
    }
    setFeeLoading(true);
    setFeeError(null);
    try {
      const result = await getShippingFeeApi(order.id, {
        pickProvince: selectedSender.province,
        pickDistrict: selectedSender.district,
        pickWard: selectedSender.ward ?? undefined,
        pickAddress: selectedSender.address ?? undefined,
        receiverProvince: selectedRecipient.province,
        receiverDistrict: selectedRecipient.district,
        receiverWard: selectedRecipient.ward ?? undefined,
        receiverAddress: selectedRecipient.address ?? undefined,
        weight: parseLocaleNumber(weightInput) || undefined,
        transport,
      });
      if (!mountedRef.current) return;
      setEstimatedFee(result.fee.fee);
    } catch {
      if (!mountedRef.current) return;
      setEstimatedFee(null);
      setFeeError("Không tính được phí ship.");
    } finally {
      if (mountedRef.current) setFeeLoading(false);
    }
  }, [isManualProvider, order, selectedRecipient, selectedSender, transport, weightInput]);

  useEffect(() => {
    void fetchEstimatedFee();
  }, [fetchEstimatedFee]);

  return { estimatedFee, feeLoading, feeError };
}
