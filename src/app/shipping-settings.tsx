import { Header } from "@components/header";
import { LinearGradient } from "@components/linear-gradient";
import { SpxConnectSheet } from "@features/settings/components/spx-connect-sheet";
import { ShippingAddressSection } from "@features/settings/components/shipping-address-section";
import { ShippingPartnersSection } from "@features/settings/components/shipping-partners-section";
import { useShippingSettings } from "@features/settings/hooks/use-shipping-settings";
import { useSpxAccount } from "@features/settings/hooks/use-spx-account";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { useToast } from "@components/toast";
import { createStyles } from "@utils/createStyles";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Alert, RefreshControl, ScrollView, View } from "react-native";

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
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Header
        title="Cấu hình vận chuyển"
        onBackPress={handleBack}
        rightIcon="settings-outline"
        transparent
      />

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

        <ShippingPartnersSection
          spxConnected={spx.connected}
          onConnectSpx={handleConnectSpx}
          onDisconnectSpx={handleDisconnectSpx}
        />
      </ScrollView>
    </View>
  );
}

const styles = createStyles(() => ({
  root: { flex: 1 },
  bg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
}));
