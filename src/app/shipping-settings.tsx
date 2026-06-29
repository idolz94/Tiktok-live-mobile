import { icons } from "@assets/icons";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { ShippingAddressModal } from "@features/settings/components/shipping-address-modal";
import { ShippingAddressSection } from "@features/settings/components/shipping-address-section";
import { ShippingPartnersSection } from "@features/settings/components/shipping-partners-section";
import { shippingSettingsStyles as styles } from "@features/settings/components/shipping-settings.styles";
import { useShippingSettings } from "@features/settings/hooks/use-shipping-settings";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ShippingSettingsScreen() {
  const s = useShippingSettings();
  const { show, hide, update, isVisible } = useBottomSheet();

  const buildContent = () => (
    <ShippingAddressModal
      editingAddress={s.editingAddress}
      form={s.form}
      addressForm={s.addressForm}
      formError={s.formError}
      geoPicker={s.geoPicker}
      isSavingAddress={s.isSavingAddress}
      useOldAddressFormat={s.useOldAddressFormat}
      onClose={() => { s.closeAddressModal(); hide(); }}
      onSave={s.handleSaveAddress}
      onSelectGeoItem={s.selectGeoItem}
      onOpenProvincePicker={s.openProvincePicker}
      onOpenWardPicker={s.openWardPicker}
      setFormError={s.setFormError}
      setGeoPicker={s.setGeoPicker}
      setUseOldAddressFormat={s.setUseOldAddressFormat}
    />
  );

  useEffect(() => {
    if (s.isAddressModalVisible && !isVisible) {
      show({ content: buildContent(), onDismiss: s.forceCloseAddressModal });
    } else if (s.isAddressModalVisible && isVisible) {
      update({ content: buildContent() });
    } else if (!s.isAddressModalVisible && isVisible) {
      hide();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.isAddressModalVisible, s.editingAddress, s.addressForm, s.formError, s.geoPicker, s.isSavingAddress, s.useOldAddressFormat]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton} activeOpacity={0.8}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cấu hình vận chuyển</Text>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
          <Image source={icons.settings} style={styles.headerIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={s.isRefreshing}
            onRefresh={() => s.loadAddresses({ refreshing: true })}
          />
        }
      >
        <ShippingAddressSection
          address={s.defaultAddress}
          isLoading={s.isLoadingAddresses}
          onAdd={s.openCreateAddressModal}
          onEdit={s.openEditAddressModal}
        />

        <View style={styles.breakLine} />

        <ShippingPartnersSection />
      </ScrollView>
    </SafeAreaView>
  );
}
