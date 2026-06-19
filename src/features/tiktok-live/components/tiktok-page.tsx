import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, View } from "react-native";
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import {
  createTikTokChannelApi,
  getTikTokChannelsApi,
} from "@features/auth/services/api";
import { useOrderManager } from "@features/orders/hooks/use-order-manager";
import { useAuth } from "@features/auth/hooks/use-auth";
import { normalizeTikTokUsername } from "@features/tiktok-live/utils/comment";
import { AccountConnected } from "./account-connected";
import { Segment } from "./segment";
import { UnConnectedLive } from "./unconnected-live";
import { ConnectedLive } from "./connected-live";
import { Orders } from "@features/orders/components/orders";

export type TikTokLiveChannel = {
  id: string;
  username: string;
  isDefault: boolean;
};

const SUB_TABS = ["Live", "Đơn đã tạo"];

const ANIMATION_DURATION = 250;
const INITIAL_OFFSET = 48;

export const TiktokPage = memo(() => {
  const pagerRef = useRef<PagerView>(null);

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

  const { user } = useAuth();

  const orderManager = useOrderManager({
    comments,
    liveSessionId: currentLiveSessionId,
    hasOrders: user?.hasOrders ?? false,
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  // ---start: localChannels seeds from user.tiktokChannels, then stays authoritative after any fetch/add---
  const [localChannels, setLocalChannels] = useState<TikTokLiveChannel[]>(() =>
    (user?.tiktokChannels ?? []).map((c) => ({
      id: c.id,
      username: normalizeTikTokUsername(c.tiktokUsername),
      isDefault: c.isDefault,
    })),
  );

  const channels = localChannels;
  // ---end: localChannels---

  const alertShownRef = useRef(false);
  // ---start: requestIdRef — prevent stale fetchChannels overwriting newer state---
  const fetchRequestIdRef = useRef(0);
  // ---end: requestIdRef---

  // ---start: hideConnectedView — shared animation for resetToInitial and onDisconnectAccount---
  const hideConnectedView = useCallback(() => {
    opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
    translateY.value = withTiming(
      INITIAL_OFFSET,
      { duration: ANIMATION_DURATION },
      (finished) => {
        if (finished) runOnJS(setVisible)(false);
      },
    );
  }, [opacity, translateY]);
  // ---end: hideConnectedView---

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
      const options: TikTokLiveChannel[] = data.map((channel) => ({
        id: channel.id,
        username: normalizeTikTokUsername(channel.tiktokUsername),
        isDefault: channel.isDefault,
      }));
      if (options.length > 0) setLocalChannels(options);
      return options;
    } catch (error) {
      if (__DEV__) console.error("fetchChannels error:", error);
      return [];
    }
  }, []);

  // ---start: selectedChannel memoized---
  const selectedChannel = useMemo(
    () =>
      channels.find(
        (c) =>
          normalizeTikTokUsername(c.username) ===
          normalizeTikTokUsername(tiktokUsername),
      ),
    [channels, tiktokUsername],
  );
  // ---end: selectedChannel memoized---

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {
        translateY: translateY.value,
      },
    ],
  }));

  const onSelectChannel = useCallback(
    (selectedItem: TikTokLiveChannel) => {
      setLocalChannels((prev) =>
        prev?.map((c) => ({
          ...c,
          isDefault: c.id === selectedItem.id,
        })),
      );

      const targetUsername = selectedItem.username;
      const nextUsername = normalizeTikTokUsername(targetUsername);
      if (nextUsername) {
        changeTikTokUsername(nextUsername).catch((err) => {
          if (__DEV__) console.error("Change channel error:", err);
        });
      }
    },
    [changeTikTokUsername],
  );

  const connectSelectedChannel = useCallback(
    async (item?: TikTokLiveChannel): Promise<boolean> => {
      const targetUsername = item ? item.username : tiktokUsername;
      const nextUsername = normalizeTikTokUsername(targetUsername);

      if (!nextUsername) return false;

      try {
        const success = await changeTikTokUsername(nextUsername);
        if (!success) {
          Alert.alert(
            "Lỗi",
            "Không thể kết nối đến TikTok Live. Vui lòng kiểm tra lại username.",
          );
          return false;
        }

        setLocalChannels((prev) =>
          prev?.map((c) => ({
            ...c,
            isDefault: normalizeTikTokUsername(c.username) === nextUsername,
          })),
        );

        if (visible) return true;

        setVisible(true);

        opacity.value = 0;
        translateY.value = INITIAL_OFFSET;

        opacity.value = withTiming(1, {
          duration: ANIMATION_DURATION,
        });

        translateY.value = withTiming(0, {
          duration: ANIMATION_DURATION,
        });

        return true;
      } catch (error) {
        if (__DEV__) {
          console.error("Connect channel error:", error);
        }
        return false;
      }
    },
    [tiktokUsername, visible, changeTikTokUsername],
  );

  const onAddChannel = useCallback(
    async (name: string): Promise<boolean> => {
      const created = await createTikTokChannelApi({
        tiktokUsername: name,
        isDefault: false,
      });
      const freshChannels = await fetchChannels();
      const normalizedName = normalizeTikTokUsername(name);

      let newChannel = freshChannels.find(
        (c) => normalizeTikTokUsername(c.username) === normalizedName,
      );

      if (!newChannel) {
        newChannel = {
          id: created.id,
          username: normalizeTikTokUsername(created.tiktokUsername),
          isDefault: false,
        };
        setLocalChannels((prev) => [...prev, newChannel!]);
      }

      return connectSelectedChannel(newChannel);
    },
    [fetchChannels, connectSelectedChannel],
  );

  const onDisconnectAccount = useCallback(async () => {
    // const username = tiktokUsername;
    try {
      await stopLiveSession();
    } catch (error) {
      if (__DEV__) console.error("Disconnect error:", error);
    }
    hideConnectedView();
    // Alert.alert("Đã rời phiên live", `Bạn đã rời khỏi phiên live của ${username}`);
  }, [stopLiveSession, hideConnectedView, tiktokUsername]);

  // ---start: onTabPress + handlePageSelected stable callbacks---
  const onTabPress = useCallback((index: number) => {
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
  }, []);

  const handlePageSelected = useCallback((e: PagerViewOnPageSelectedEvent) => {
    setActiveIndex(e.nativeEvent.position);
  }, []);
  // ---end: stable callbacks---

  return (
    <View style={styles.container}>
      <Segment
        tabs={SUB_TABS}
        activeIndex={activeIndex}
        onTabPress={onTabPress}
      />

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        <View style={{ flex: 1 }} key="live">
          {visible ? (
            <ConnectedLive
              orderManager={orderManager}
              onNavigateToOrders={() => {
                setActiveIndex(1);
                pagerRef.current?.setPage(1);
              }}
            />
          ) : (
            <UnConnectedLive
              channels={channels}
              onConnect={connectSelectedChannel}
              onAddChannel={onAddChannel}
              onRefreshChannels={fetchChannels}
            />
          )}
        </View>

        <View style={{ flex: 1 }} key="orders">
          <Orders orderManager={orderManager} />
        </View>
      </PagerView>

      {/* ---start: always mounted overlay, pointerEvents controls interaction, content only renders when visible--- */}
      <Animated.View
        pointerEvents={visible ? "box-none" : "none"}
        style={[styles.accountOverlay, animatedStyle]}
      >
        {visible && (
          <AccountConnected
            onClose={onDisconnectAccount}
            selectedChannel={selectedChannel}
            channels={channels}
            onSelectChannel={onSelectChannel}
          />
        )}
      </Animated.View>
      {/* ---end: always mounted overlay--- */}
    </View>
  );
});

const styles = createStyles(({ shadows }) => ({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  accountOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    ...shadows.sd3,
  },
}));
