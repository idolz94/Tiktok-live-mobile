import { icons } from "@assets/icons";
import { ShippingAddressModal } from "@features/settings/components/shipping-address-modal";
import { ShippingAddressSection } from "@features/settings/components/shipping-address-section";
import { ShippingPartnersSection } from "@features/settings/components/shipping-partners-section";
import { shippingSettingsStyles as styles } from "@features/settings/components/shipping-settings.styles";
import { useShippingSettings } from "@features/settings/hooks/use-shipping-settings";
import { router } from "expo-router";
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ShippingSettingsScreen() {
  const shippingSettings = useShippingSettings();

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
            refreshing={shippingSettings.isRefreshing}
            onRefresh={() => shippingSettings.loadAddresses({ refreshing: true })}
          />
        }
      >
        <ShippingAddressSection
          address={shippingSettings.defaultAddress}
          isLoading={shippingSettings.isLoadingAddresses}
          onAdd={shippingSettings.openCreateAddressModal}
          onEdit={shippingSettings.openEditAddressModal}
        />

        <View style={styles.breakLine} />

        <ShippingPartnersSection />
      </ScrollView>

      <ShippingAddressModal
        visible={shippingSettings.isAddressModalVisible}
        editingAddress={shippingSettings.editingAddress}
        form={shippingSettings.form}
        addressForm={shippingSettings.addressForm}
        formError={shippingSettings.formError}
        geoPicker={shippingSettings.geoPicker}
        isSavingAddress={shippingSettings.isSavingAddress}
        selectedDistrict={shippingSettings.selectedDistrict}
        selectedProvince={shippingSettings.selectedProvince}
        useOldAddressFormat={shippingSettings.useOldAddressFormat}
        onClose={shippingSettings.closeAddressModal}
        onSave={shippingSettings.handleSaveAddress}
        onSelectGeoItem={shippingSettings.selectGeoItem}
        onOpenDistrictPicker={shippingSettings.openDistrictPicker}
        onOpenProvincePicker={shippingSettings.openProvincePicker}
        onOpenWardPicker={shippingSettings.openWardPicker}
        setFormError={shippingSettings.setFormError}
        setGeoPicker={shippingSettings.setGeoPicker}
        setUseOldAddressFormat={shippingSettings.setUseOldAddressFormat}
      />
    </SafeAreaView>
  );
}
