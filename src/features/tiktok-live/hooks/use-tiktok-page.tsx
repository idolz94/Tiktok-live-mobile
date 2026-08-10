/**
 * useTiktokPage — hook điều phối trang TikTok live (channels, connect, pager).
 * Di chuyển từ `tiktok-live/components/use-tiktok-page.tsx` sang `hooks/`
 * theo quy tắc "hook không nằm trong components/" (PROJECT_GUIDE mục 4.3).
 * Giữ đuôi `.tsx` vì bottom-sheet content trả về JSX. Hành vi giữ nguyên.
 */
import { useAuth } from "@features/auth/hooks/use-auth";
import { createTikTokChannelApi, getTikTokChannelsApi } from "@features/auth/services/api";
import { useAuthStore } from "@features/auth/stores";
import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import { normalizeTikTokUsername } from "@features/tiktok-live/utils/comment";
import { useOrderManager } from "@features/orders/hooks/use-order-manager";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { useToast } from "@components/toast";
import { listProductPresetsApi } from "@features/settings/service/product-presets-api";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import type PagerView from "react-native-pager-view";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { useThemes } from "@hooks/use-theme";
import type { PagerViewOnPageSelectedEvent } from "react-native-pager-view";
import { TikTokLiveChannel } from "@features/tiktok-live/components/tiktok-page";

const ANIMATION_DURATION = 250;
const INITIAL_OFFSET = 48;

export function useTiktokPage(pagerRef: React.RefObject<PagerView | null>) {
  const { colors } = useThemes();
  const toast = useToast();
  const translateY = useSharedValue(INITIAL_OFFSET);
  const opacity = useSharedValue(0);

  const {
    isConnected,
    tiktokUsername,
    changeTikTokUsername,
    stopLiveSession,
    liveError,
    clearLiveError,
    comments,
    currentLiveSessionId,
  } = useTikTokLiveSocketContext();

  const { show, hide } = useBottomSheet();
  const { user } = useAuth();
  const patchTiktokChannels = useAuthStore((state) => state.patchTiktokChannels);
  const { ordersTab, refreshOrders } = useLocalSearchParams<{
    ordersTab?: string;
    refreshOrders?: string;
  }>();
  const handledRefreshOrdersRef = useRef<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const ordersTabEnabled = activeIndex === 1;
  const orderManager = useOrderManager({
    comments,
    liveSessionId: currentLiveSessionId,
    hasOrders: user?.hasOrders ?? false,
    enabled: ordersTabEnabled,
    allStatuses: true,
  });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (ordersTab !== "created" || !refreshOrders || handledRefreshOrdersRef.current === refreshOrders) return;

    handledRefreshOrdersRef.current = refreshOrders;
    setActiveIndex(1);
    pagerRef.current?.setPage(1);
    if (ordersTabEnabled) void orderManager.reloadOrders();
  }, [orderManager, ordersTab, ordersTabEnabled, pagerRef, refreshOrders]);

  const [localChannels, setLocalChannels] = useState<TikTokLiveChannel[]>(() =>
    (user?.tiktokChannels ?? []).map((c) => ({
      id: c.id,
      username: normalizeTikTokUsername(c.tiktokUsername),
      isDefault: c.isDefault,
      displayName: c.displayName ?? null,
      avatarUrl: c.avatarUrl ?? null,
      followerCount: c.followerCount ?? null,
    })),
  );

  const alertShownRef = useRef(false);
  const fetchRequestIdRef = useRef(0);

  const hideConnectedView = useCallback(() => {
    opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
    translateY.value = withTiming(INITIAL_OFFSET, { duration: ANIMATION_DURATION }, (finished) => {
      if (finished) scheduleOnRN(setVisible, false);
    });
  }, [opacity, translateY]);

  useEffect(() => {
    if (isConnected) {
      setVisible(true);
      opacity.value = 1;
      translateY.value = 0;
    }
  // ponytail: run once on mount to restore connected view if SSE session persists across tab switch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!liveError || alertShownRef.current) return;
    alertShownRef.current = true;
    Alert.alert("Phiên live kết thúc", liveError, [
      {
        text: "OK",
        onPress: () => {
          alertShownRef.current = false;
          clearLiveError();
          hideConnectedView();
        },
      },
    ]);
  }, [liveError, clearLiveError, hideConnectedView]);

  const fetchChannels = useCallback(async (): Promise<TikTokLiveChannel[]> => {
    const requestId = ++fetchRequestIdRef.current;
    try {
      const data = await getTikTokChannelsApi();
      if (__DEV__) console.log("[tiktok] fetchChannels raw data:", JSON.stringify(data));
      if (requestId !== fetchRequestIdRef.current) return [];
      const options: TikTokLiveChannel[] = data.map((c) => ({
        id: c.id,
        username: normalizeTikTokUsername(c.tiktokUsername),
        isDefault: c.isDefault,
        displayName: c.displayName ?? null,
        avatarUrl: c.avatarUrl ?? null,
        followerCount: c.followerCount ?? null,
      }));
      if (__DEV__) {
        console.log("[tiktok] fetchChannels mapped:", options.map((c) => `${c.username}→avatarUrl:${c.avatarUrl ?? "null"}`));
      }
      if (options.length > 0) setLocalChannels(options);
      return options;
    } catch (error) {
      if (__DEV__) console.error("fetchChannels error:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    if (isConnected) void fetchChannels();
  }, [isConnected, fetchChannels]);

  useEffect(() => {
    if (!user?.tiktokChannels?.length) return;
    setLocalChannels(
      user.tiktokChannels.map((c) => ({
        id: c.id,
        username: normalizeTikTokUsername(c.tiktokUsername),
        isDefault: c.isDefault,
        displayName: c.displayName ?? null,
        avatarUrl: c.avatarUrl ?? null,
        followerCount: c.followerCount ?? null,
      })),
    );
  }, [user?.tiktokChannels]);

  useEffect(() => {
    if (activeIndex !== 0) {
      opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
      translateY.value = withTiming(INITIAL_OFFSET, { duration: ANIMATION_DURATION });
    } else if (visible) {
      opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
      translateY.value = withTiming(0, { duration: ANIMATION_DURATION });
    }
  }, [activeIndex, visible, opacity, translateY]);

  const selectedChannel = useMemo(() => {
    const found = localChannels.find(
      (c) => normalizeTikTokUsername(c.username) === normalizeTikTokUsername(tiktokUsername),
    );
    if (__DEV__) {
      console.log("[tiktok] selectedChannel:", found?.username, "avatarUrl:", found?.avatarUrl ?? "(null)");
    }
    return found;
  }, [localChannels, tiktokUsername]);

  const connectSelectedChannel = useCallback(
    async (item?: TikTokLiveChannel): Promise<boolean> => {
      const nextUsername = normalizeTikTokUsername(item ? item.username : tiktokUsername);
      if (!nextUsername) return false;

      try {
        const presets = await listProductPresetsApi();
        if (presets.length === 0) {
          show({
            content: (
              <View style={{ padding: 24, gap: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.neutral900 }}>
                  Yêu cầu cài đặt thông tin sản phẩm
                </Text>
                <Text style={{ fontSize: 14, color: colors.neutral500, lineHeight: 22 }}>
                  Bạn cần thêm ít nhất một sản phẩm trước khi kết nối live.
                </Text>
                <Pressable
                  onPress={() => { hide(); router.push("/product-info-setup"); }}
                  style={{ backgroundColor: colors.primary, borderRadius: 12, height: 48, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ color: colors.neutral100, fontSize: 15, fontWeight: "600" }}>
                    Cài đặt thông tin SP
                  </Text>
                </Pressable>
              </View>
            ),
            showDragIndicator: true,
          });
          return false;
        }
      } catch {
        // không block nếu check fail
      }

      // TODO: bật lại khi cần validate địa chỉ kho hàng trước khi kết nối TikTok Live
      // try {
      //   const addresses = await listShopAddressesApi();
      //   const hasDefault = addresses.some((a: { isDefault: boolean }) => a.isDefault);
      //   if (!hasDefault) {
      //     show({
      //       content: (
      //         <View style={{ padding: 24, gap: 16 }}>
      //           <Text style={{ fontSize: 16, fontWeight: "600", color: colors.neutral900 }}>
      //             Yêu cầu cài đặt địa chỉ Kho Hàng
      //           </Text>
      //           <Text style={{ fontSize: 14, color: colors.neutral500, lineHeight: 22 }}>
      //             Bạn cần thiết lập địa chỉ kho hàng mặc định trước khi kết nối live.
      //           </Text>
      //           <Pressable
      //             onPress={() => { hide(); router.push("/shipping-settings"); }}
      //             style={{ backgroundColor: colors.primary, borderRadius: 12, height: 48, alignItems: "center", justifyContent: "center" }}
      //           >
      //             <Text style={{ color: colors.white, fontSize: 15, fontWeight: "600" }}>
      //               Cài Đặt Cấu Hình Vận Chuyển
      //             </Text>
      //           </Pressable>
      //         </View>
      //       ),
      //       showDragIndicator: true,
      //     });
      //     return false;
      //   }
      // } catch {
      //   // nếu check fail, vẫn cho connect tiếp — không block user vì lỗi mạng
      // }

      try {
        const success = await changeTikTokUsername(nextUsername);
        if (!success) {
          toast.error({ title: "Lỗi", description: "Không thể kết nối đến TikTok Live. Vui lòng kiểm tra lại username." });
          return false;
        }

        setLocalChannels((prev) =>
          prev.map((c) => ({ ...c, isDefault: normalizeTikTokUsername(c.username) === nextUsername })),
        );

        if (visible) return true;

        setVisible(true);
        opacity.value = 0;
        translateY.value = INITIAL_OFFSET;
        opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
        translateY.value = withTiming(0, { duration: ANIMATION_DURATION });
        return true;
      } catch (error) {
        if (__DEV__) console.error("Connect channel error:", error);
        return false;
      }
    },
    [tiktokUsername, visible, changeTikTokUsername, opacity, translateY, show, hide, colors],
  );

  const onSelectChannel = useCallback(
    (selectedItem: TikTokLiveChannel) => {
      setLocalChannels((prev) =>
        prev.map((c) => ({ ...c, isDefault: c.id === selectedItem.id })),
      );
      const nextUsername = normalizeTikTokUsername(selectedItem.username);
      if (nextUsername) {
        changeTikTokUsername(nextUsername)
          .then(() => fetchChannels())
          .catch((err) => {
            if (__DEV__) console.error("Change channel error:", err);
          });
      }
    },
    [changeTikTokUsername, fetchChannels],
  );

  const addChannel = useCallback(
    async (name: string): Promise<boolean> => {
      const normalizedName = normalizeTikTokUsername(name);
      if (!normalizedName) return false;

      const created = await createTikTokChannelApi({ tiktokUsername: normalizedName });
      const nextChannel: TikTokLiveChannel = {
        id: created.id,
        username: normalizeTikTokUsername(created.tiktokUsername),
        isDefault: created.isDefault,
        displayName: created.displayName ?? null,
        avatarUrl: created.avatarUrl ?? null,
        followerCount: created.followerCount ?? null,
      };
      setLocalChannels((prev) => [...prev, nextChannel]);

      getTikTokChannelsApi()
        .then((fresh) => patchTiktokChannels(fresh))
        .catch(() => { /* non-blocking */ });

      return connectSelectedChannel(nextChannel);
    },
    [connectSelectedChannel, patchTiktokChannels],
  );

  const onDisconnectAccount = useCallback(async () => {
    try {
      await stopLiveSession();
    } catch (error) {
      if (__DEV__) console.error("Disconnect error:", error);
    }
    hideConnectedView();
  }, [stopLiveSession, hideConnectedView]);

  const onTabPress = useCallback(
    (index: number) => {
      setActiveIndex(index);
      pagerRef.current?.setPage(index);
    },
    [pagerRef],
  );

  const handlePageSelected = useCallback((e: PagerViewOnPageSelectedEvent) => {
    setActiveIndex(e.nativeEvent.position);
  }, []);

  const navigateToOrders = useCallback(() => {
    setActiveIndex(1);
    pagerRef.current?.setPage(1);
  }, [pagerRef]);

  return {
    orderManager,
    activeIndex,
    visible,
    localChannels,
    selectedChannel,
    opacity,
    translateY,
    fetchChannels,
    connectSelectedChannel,
    onSelectChannel,
    addChannel,
    onDisconnectAccount,
    onTabPress,
    handlePageSelected,
    navigateToOrders,
  };
}
