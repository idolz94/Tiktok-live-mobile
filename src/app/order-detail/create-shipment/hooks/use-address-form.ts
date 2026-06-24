import { OrderWithTikTok } from "@app-types/index";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import {
  CustomerAddress,
  ShopAddress,
  createCustomerAddressApi,
  createShopAddressApi,
  deleteCustomerAddressApi,
  deleteShopAddressApi,
  patchOrderApi,
  updateCustomerAddressApi,
  updateShopAddressApi,
} from "../create-shipment-api";
import { AddrFormValues } from "../types";
import { addressPayload } from "../utils";

type Deps = {
  order: OrderWithTikTok | null;
  setOrder: (o: OrderWithTikTok) => void;
  selectedSender: ShopAddress | null;
  setSelectedSender: (a: ShopAddress | null) => void;
  selectedRecipient: CustomerAddress | null;
  setSelectedRecipient: (a: CustomerAddress | null) => void;
  reloadShopAddresses: () => Promise<void>;
  reloadCustomerAddresses: () => Promise<void>;
};

export function useAddressForm(deps: Deps) {
  const { order, setOrder, selectedSender, setSelectedSender, selectedRecipient, setSelectedRecipient, reloadShopAddresses, reloadCustomerAddresses } = deps;

  const [addrFormTarget, setAddrFormTarget] = useState<"sender" | "recipient" | null>(null);
  const [addrFormMode, setAddrFormMode] = useState<"add" | "edit">("add");
  const [editingAddr, setEditingAddr] = useState<ShopAddress | CustomerAddress | null>(null);
  const [isSavingAddr, setIsSavingAddr] = useState(false);

  const formTitle = useMemo(() => {
    if (addrFormTarget === "sender") return addrFormMode === "add" ? "Thêm địa chỉ người gửi" : "Sửa địa chỉ người gửi";
    return addrFormMode === "add" ? "Thêm địa chỉ người nhận" : "Sửa địa chỉ người nhận";
  }, [addrFormTarget, addrFormMode]);

  const handleAddAddress = useCallback((target: "sender" | "recipient") => {
    if (target === "recipient" && !order?.customerId) {
      Alert.alert("Không thể thêm địa chỉ", "Đơn hàng chưa có khách hàng.");
      return;
    }
    setEditingAddr(null);
    setAddrFormMode("add");
    setAddrFormTarget(target);
  }, [order?.customerId]);

  const handleEditAddress = useCallback((target: "sender" | "recipient", addr: ShopAddress | CustomerAddress) => {
    setEditingAddr(addr);
    setAddrFormMode("edit");
    setAddrFormTarget(target);
  }, []);

  const handleDeleteAddress = useCallback((target: "sender" | "recipient", addr: ShopAddress | CustomerAddress) => {
    Alert.alert("Xoá địa chỉ", "Bạn có chắc muốn xoá địa chỉ này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            if (target === "sender") {
              await deleteShopAddressApi(addr.id);
              if (selectedSender?.id === addr.id) setSelectedSender(null);
              await reloadShopAddresses();
              return;
            }
            if (!order?.customerId) return;
            await deleteCustomerAddressApi(order.customerId, addr.id);
            if (selectedRecipient?.id === addr.id) setSelectedRecipient(null);
            await reloadCustomerAddresses();
          } catch {
            Alert.alert("Xoá thất bại", "Không thể xoá địa chỉ. Vui lòng thử lại.");
          }
        },
      },
    ]);
  }, [order?.customerId, reloadCustomerAddresses, reloadShopAddresses, selectedRecipient?.id, selectedSender?.id, setSelectedRecipient, setSelectedSender]);

  const handleSelectRecipient = useCallback((addr: CustomerAddress) => {
    if (!order) return;
    setSelectedRecipient(addr);
    patchOrderApi(order.id, { customerAddressId: addr.id }).catch(() => {});
    setOrder({ ...order, customerAddressId: addr.id, customerAddressData: addr });
  }, [order, setOrder, setSelectedRecipient]);

  const handleSaveAddress = useCallback(async (values: AddrFormValues) => {
    if (!addrFormTarget || !order) return;
    if (addrFormTarget === "recipient" && !order.customerId) {
      Alert.alert("Không thể lưu", "Đơn hàng chưa có khách hàng.");
      return;
    }
    const payload = addressPayload(values);
    setIsSavingAddr(true);
    try {
      if (addrFormTarget === "sender") {
        const saved = addrFormMode === "edit" && editingAddr
          ? await updateShopAddressApi(editingAddr.id, payload)
          : await createShopAddressApi(payload);
        setSelectedSender(saved);
        await reloadShopAddresses();
      } else if (order.customerId) {
        const saved = addrFormMode === "edit" && editingAddr
          ? await updateCustomerAddressApi(order.customerId, editingAddr.id, payload)
          : await createCustomerAddressApi(order.customerId, payload);
        setSelectedRecipient(saved);
        await patchOrderApi(order.id, { customerAddressId: saved.id });
        setOrder({ ...order, customerAddressId: saved.id, customerAddressData: saved });
        await reloadCustomerAddresses();
      }
      setAddrFormTarget(null);
      setEditingAddr(null);
    } catch {
      Alert.alert("Lưu thất bại", "Không thể lưu địa chỉ. Vui lòng thử lại.");
    } finally {
      setIsSavingAddr(false);
    }
  }, [addrFormMode, addrFormTarget, editingAddr, order, reloadCustomerAddresses, reloadShopAddresses, setOrder, setSelectedRecipient, setSelectedSender]);

  return {
    addrFormTarget,
    setAddrFormTarget,
    editingAddr,
    setEditingAddr,
    isSavingAddr,
    formTitle,
    handleAddAddress,
    handleEditAddress,
    handleDeleteAddress,
    handleSelectRecipient,
    handleSaveAddress,
  };
}
