import { ShippingAddressModal } from "@features/settings/components/shipping-address-modal";
import { useShippingSettings } from "@features/settings/hooks/use-shipping-settings";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { shippingSettingsStyles as styles } from "@features/settings/components/shipping-settings.styles";

export default function ShippingAddressFormPage() {
  const { addressId } = useLocalSearchParams<{ addressId?: string }>();
  const s = useShippingSettings({ afterSave: () => router.back() });

  useEffect(() => {
    s.loadAddresses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (s.isLoadingAddresses) return;
    if (addressId) {
      const addr = s.addresses.find((a) => a.id === addressId);
      if (addr) s.openEditAddressModal(addr);
    } else {
      s.openCreateAddressModal();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.isLoadingAddresses]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: "#fff" }]} edges={["top", "left", "right", "bottom"]}>
      <ShippingAddressModal
        editingAddress={s.editingAddress}
        form={s.form}
        addressForm={s.addressForm}
        formError={s.formError}
        geoPicker={s.geoPicker}
        isSavingAddress={s.isSavingAddress}
        useOldAddressFormat={s.useOldAddressFormat}
        onClose={() => router.back()}
        onSave={s.handleSaveAddress}
        onSelectGeoItem={s.selectGeoItem}
        onOpenProvincePicker={s.openProvincePicker}
        onOpenWardPicker={s.openWardPicker}
        setFormError={s.setFormError}
        setGeoPicker={s.setGeoPicker}
        setUseOldAddressFormat={s.setUseOldAddressFormat}
        variant="page"
      />
    </SafeAreaView>
  );
}
