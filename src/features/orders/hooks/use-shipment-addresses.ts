import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@components/toast";
import {
  CustomerAddress,
  ShopAddress,
  listCustomerAddressesApi,
  listShopAddressesApi,
} from "../service/create-shipment-api";
import { OrderWithTikTok } from "@app-types/index";


export function useShipmentAddresses(order: OrderWithTikTok | null) {
  const mountedRef = useRef(true);
  const toast = useToast();

  const [shopAddresses, setShopAddresses] = useState<ShopAddress[]>([]);
  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>([]);
  const [selectedSender, setSelectedSender] = useState<ShopAddress | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<CustomerAddress | null>(null);
  const [isLoadingSender, setIsLoadingSender] = useState(false);
  const [isLoadingRecipient, setIsLoadingRecipient] = useState(false);

  const reloadShopAddresses = useCallback(async () => {
    setIsLoadingSender(true);
    try {
      const rows = await listShopAddressesApi();
      if (!mountedRef.current) return;
      setShopAddresses(rows);
      setSelectedSender((current) => {
        if (current) return rows.find((item) => item.id === current.id) ?? rows.find((item) => item.isDefault) ?? rows[0] ?? null;
        return rows.find((item) => item.isDefault) ?? rows[0] ?? null;
      });
    } catch {
      toast.error({ title: "Không tải được địa chỉ", description: "Vui lòng thử lại sau." });
    } finally {
      if (mountedRef.current) setIsLoadingSender(false);
    }
  }, []);

  const reloadCustomerAddresses = useCallback(async () => {
    if (!order?.customerId) return;
    setIsLoadingRecipient(true);
    try {
      const rows = await listCustomerAddressesApi(order.customerId);
      if (!mountedRef.current) return;
      setCustomerAddresses(rows);
      setSelectedRecipient((current) => {
        if (current) return rows.find((item) => item.id === current.id) ?? null;
        return rows.find((item) => item.id === order.customerAddressId) ?? rows.find((item) => item.isDefault) ?? rows[0] ?? null;
      });
    } catch {
      toast.error({ title: "Không tải được địa chỉ", description: "Vui lòng thử lại sau." });
    } finally {
      if (mountedRef.current) setIsLoadingRecipient(false);
    }
  }, [order?.customerId, order?.customerAddressId]);

  useEffect(() => {
    mountedRef.current = true;
    reloadShopAddresses();
    reloadCustomerAddresses();
    return () => { mountedRef.current = false; };
  }, [reloadShopAddresses, reloadCustomerAddresses]);

  return {
    shopAddresses,
    customerAddresses,
    selectedSender,
    setSelectedSender,
    selectedRecipient,
    setSelectedRecipient,
    isLoadingSender,
    isLoadingRecipient,
    reloadShopAddresses,
    reloadCustomerAddresses,
  };
}
