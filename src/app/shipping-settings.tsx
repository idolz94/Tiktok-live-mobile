import { icons } from "@assets/icons";
import { SpxConnectSheet } from "@features/settings/components/spx-connect-sheet";
import { ShippingAddressSection } from "@features/settings/components/shipping-address-section";
import { ShippingPartnersSection } from "@features/settings/components/shipping-partners-section";
import { shippingSettingsStyles as styles } from "@features/settings/components/shipping-settings.styles";
import { useShippingSettings } from "@features/settings/hooks/use-shipping-settings";
import { useSpxAccount } from "@features/settings/hooks/use-spx-account";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { useToast } from "@components/toast";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Alert, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ShippingSettingsScreen() {
  const s = useShippingSettings();
  const spx = useSpxAccount();
  const { show, hide } = useBottomSheet();
  const toast = useToast();

  useFocusEffect(
    useCallback(() => {
      s.loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

  const handleConnectSpx = useCallback(() => {
    let id: string;
    const close = () => hide(id);
    id = show({
      content: (
        <SpxConnectSheet
          submitting={spx.submitting}
          onSubmit={async (data) => {
            const ok = await spx.connect(data);
            if (ok) {
              close();
              toast.success("Đã kết nối tài khoản SPX");
            } else toast.error({ title: "Lỗi", description: "Không thể kết nối tài khoản SPX. Vui lòng thử lại." });
          }}
          onClose={close}
        />
      ),
      enablePanDownToClose: false,
    });
  }, [show, hide, spx, toast]);

  const handleDisconnectSpx = useCallback(() => {
    Alert.alert("Ngắt kết nối SPX", "Bạn có chắc muốn ngắt kết nối tài khoản SPX?", [
      { text: "Huỷ" },
      {
        text: "Ngắt kết nối",
        style: "destructive",
        onPress: () => {
          void spx.disconnect().then((ok) => {
            if (!ok) toast.error({ title: "Lỗi", description: "Không thể ngắt kết nối. Vui lòng thử lại." });
          });
        },
      },
    ]);
  }, [spx]);

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
          onAdd={() => router.push("/shipping-address-form")}
          onEdit={(address) => router.push({ pathname: "/shipping-address-form", params: { addressId: address.id } })}
        />

        <View style={styles.breakLine} />

        <ShippingPartnersSection
          spxConnected={spx.connected}
          onConnectSpx={handleConnectSpx}
          onDisconnectSpx={handleDisconnectSpx}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
