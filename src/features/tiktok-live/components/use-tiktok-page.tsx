import { useAuth } from "@features/auth/hooks/use-auth";
import { getTikTokChannelsApi } from "@features/auth/services/api";
import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import { normalizeTikTokUsername } from "@features/tiktok-live/utils/comment";
import { useOrderManager } from "@features/orders/hooks/use-order-manager";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import type PagerView from "react-native-pager-view";
import { router } from "expo-router";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { listShopAddressesApi } from "@features/settings/service/shop-addresses-api";
import { useThemes } from "@hooks/use-theme";
import type { PagerViewOnPageSelectedEvent } from "react-native-pager-view";
import { TikTokLiveChannel } from "./tiktok-page";

const ANIMATION_DURATION = 250;
const INITIAL_OFFSET = 48;

export function useTiktokPage(pagerRef: React.RefObject<PagerView | null>) {
  const { colors } = useThemes();
  const translateY = useSharedValue(INITIAL_OFFSET);
  const opacity = useSharedValue(0);

  const {
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
  const orderManager = useOrderManager({
    comments,
    liveSessionId: currentLiveSessionId,
    hasOrders: user?.hasOrders ?? false,
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [localChannels, setLocalChannels] = useState<TikTokLiveChannel[]>(() =>
    (user?.tiktokChannels ?? []).map((c) => ({
      id: c.id,
      username: normalizeTikTokUsername(c.tiktokUsername),
      isDefault: c.isDefault,
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
      if (requestId !== fetchRequestIdRef.current) return [];
      const options: TikTokLiveChannel[] = data.map((c) => ({
        id: c.id,
        username: normalizeTikTokUsername(c.tiktokUsername),
        isDefault: c.isDefault,
      }));
      if (options.length > 0) setLocalChannels(options);
      return options;
    } catch (error) {
      if (__DEV__) console.error("fetchChannels error:", error);
      return [];
    }
  }, []);

  const selectedChannel = useMemo(
    () =>
      localChannels.find(
        (c) => normalizeTikTokUsername(c.username) === normalizeTikTokUsername(tiktokUsername),
      ),
    [localChannels, tiktokUsername],
  );

  const connectSelectedChannel = useCallback(
    async (item?: TikTokLiveChannel): Promise<boolean> => {
      const nextUsername = normalizeTikTokUsername(item ? item.username : tiktokUsername);
      if (!nextUsername) return false;

      try {
        const addresses = await listShopAddressesApi();
        const hasDefault = addresses.some((a: { isDefault: boolean }) => a.isDefault);
        if (!hasDefault) {
          show({
            content: (
              <View style={{ padding: 24, gap: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.neutral900 }}>
                  Yêu cầu cài đặt địa chỉ Kho Hàng
                </Text>
                <Text style={{ fontSize: 14, color: colors.neutral500, lineHeight: 22 }}>
                  Bạn cần thiết lập địa chỉ kho hàng mặc định trước khi kết nối live.
                </Text>
                <Pressable
                  onPress={() => { hide(); router.push("/shipping-settings"); }}
                  style={{ backgroundColor: colors.primary, borderRadius: 12, height: 48, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ color: colors.white, fontSize: 15, fontWeight: "600" }}>
                    Cài Đặt Cấu Hình Vận Chuyển
                  </Text>
                </Pressable>
              </View>
            ),
            showDragIndicator: true,
          });
          return false;
        }
      } catch {
        // ponytail: nếu check fail, vẫn cho connect tiếp — không block user vì lỗi mạng
      }

      try {
        const success = await changeTikTokUsername(nextUsername);
        if (!success) {
          Alert.alert("Lỗi", "Không thể kết nối đến TikTok Live. Vui lòng kiểm tra lại username.");
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
        changeTikTokUsername(nextUsername).catch((err) => {
          if (__DEV__) console.error("Change channel error:", err);
        });
      }
    },
    [changeTikTokUsername],
  );

  const addChannel = useCallback(
    async (name: string): Promise<boolean> => {
      const normalizedName = normalizeTikTokUsername(name);
      if (!normalizedName) return false;
      const nextChannel: TikTokLiveChannel = { id: `${Date.now()}`, username: normalizedName, isDefault: false };
      setLocalChannels((prev) => [...prev, nextChannel]);
      return connectSelectedChannel(nextChannel);
    },
    [connectSelectedChannel],
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
