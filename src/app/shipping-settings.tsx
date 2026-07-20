import { icons } from "@assets/icons";
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
import { Alert, Image, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ShippingSettingsScreen() {
  const { top } = useSafeAreaInsets();
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

      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Cấu hình vận chuyển</Text>
        <Pressable style={styles.headerButton} hitSlop={8}>
          <Image source={icons.settings} style={styles.headerIcon} resizeMode="contain" />
        </Pressable>
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

        <ShippingPartnersSection
          spxConnected={spx.connected}
          onConnectSpx={handleConnectSpx}
          onDisconnectSpx={handleDisconnectSpx}
        />
      </ScrollView>
    </View>
  );
}

const styles = createStyles(({ colors }) => ({
  root: { flex: 1 },
  bg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  header: {
    minHeight: 119,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "300",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: colors.text,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 28,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  headerIcon: { width: 20, height: 20, tintColor: colors.text },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
}));
