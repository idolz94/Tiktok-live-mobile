import {
  createShopAddressApi,
  listShopAddressesApi,
  ShopAddress,
  updateShopAddressApi,
} from "@features/settings/service/shop-addresses-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";
import {
  AddressForm,
  addressFormSchema,
  buildAddressPayload,
  emptyAddressForm,
} from "../schemas/shipping-address-form-schema";
import { useShippingGeoPicker } from "./use-shipping-geo-picker";

export function useShippingSettings(opts?: { afterSave?: () => void }) {
  const [addresses, setAddresses] = useState<ShopAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShopAddress | null>(null);
  const [isAddressModalVisible, setAddressModalVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [useOldAddressFormat, setUseOldAddressFormat] = useState(false);
  const form = useForm<AddressForm>({
    defaultValues: emptyAddressForm,
    mode: "onChange",
    resolver: zodResolver(addressFormSchema),
  });

  const addressForm = form.watch();
  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) ?? addresses[0] ?? null,
    [addresses],
  );

  const setAddressField = (key: "province" | "ward", value: string) => {
    form.setValue(key, value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    setFormError(null);
  };

  const geo = useShippingGeoPicker({
    province: addressForm.province,
    ward: addressForm.ward,
    setAddressField,
  });

  const loadAddresses = async ({ refreshing = false } = {}) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoadingAddresses(true);
    }

    try {
      const rows = await listShopAddressesApi();
      setAddresses(rows);
    } catch {
      Alert.alert("Không tải được địa chỉ kho", "Vui lòng thử lại sau.");
    } finally {
      setIsLoadingAddresses(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const openCreateAddressModal = () => {
    setEditingAddress(null);
    setFormError(null);
    setUseOldAddressFormat(false);
    geo.resetGeoSelection();
    form.reset({
      ...emptyAddressForm,
      isDefault: addresses.length === 0,
    });
    setAddressModalVisible(true);
  };

  const openEditAddressModal = (address: ShopAddress) => {
    setEditingAddress(address);
    setFormError(null);
    setUseOldAddressFormat(false);
    geo.setInitialGeoSelection(address.province);
    form.reset({
      label: address.label ?? "Kho hàng",
      name: address.name ?? "",
      phone: address.phone ?? "",
      address: address.address ?? "",
      province: address.province ?? "",
      ward: address.ward ?? "",
      isDefault: address.isDefault,
    });
    setAddressModalVisible(true);
  };

  const closeAddressModal = () => {
    if (isSavingAddress) return;

    setAddressModalVisible(false);
  };

  const forceCloseAddressModal = () => {
    setAddressModalVisible(false);
  };

  const handleSaveAddress = form.handleSubmit(async (values) => {
    setFormError(null);
    setIsSavingAddress(true);

    try {
      const payload = buildAddressPayload(values);
      const savedAddress = editingAddress
        ? await updateShopAddressApi(editingAddress.id, payload)
        : await createShopAddressApi(payload);

      setAddresses((current) => syncSavedAddress(current, savedAddress, editingAddress));
      setAddressModalVisible(false);
      opts?.afterSave?.();
    } catch {
      Alert.alert("Không lưu được địa chỉ kho", "Vui lòng kiểm tra thông tin và thử lại.");
    } finally {
      setIsSavingAddress(false);
    }
  });

  return {
    addresses,
    addressForm,
    closeAddressModal,
    forceCloseAddressModal,
    defaultAddress,
    editingAddress,
    form,
    formError,
    geoPicker: geo.geoPicker,
    handleSaveAddress,
    isAddressModalVisible,
    isLoadingAddresses,
    isRefreshing,
    isSavingAddress,
    loadAddresses,
    openCreateAddressModal,
    openEditAddressModal,
    openProvincePicker: geo.openProvincePicker,
    openWardPicker: geo.openWardPicker,
    selectGeoItem: geo.selectGeoItem,
    setFormError,
    setGeoPicker: geo.setGeoPicker,
    setUseOldAddressFormat,
    useOldAddressFormat,
  };
}

function syncSavedAddress(
  current: ShopAddress[],
  savedAddress: ShopAddress,
  editingAddress: ShopAddress | null,
) {
  const next = editingAddress
    ? current.map((address) => (address.id === savedAddress.id ? savedAddress : address))
    : [savedAddress, ...current];

  return savedAddress.isDefault
    ? next.map((address) => ({ ...address, isDefault: address.id === savedAddress.id }))
    : next;
}
