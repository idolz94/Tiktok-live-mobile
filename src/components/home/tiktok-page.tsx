import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, View } from "react-native";
import PagerView from "react-native-pager-view";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useTikTokLiveSocketContext } from "@contexts/tiktok-live-socket";
import {
  createTikTokChannelApi,
  getTikTokChannelsApi,
} from "@modules/auth/services/api";
import { useOrderManager } from "@modules/orders/hooks/use-order-manager";
import { useAuth } from "@modules/auth/hooks/use-auth";
import { normalizeTikTokUsername } from "@utils/comment";
import { AccountConnected } from "./account-connected";
import { Segment } from "./segment";
import { UnConnectedLive } from "./unconnected-live";
import { ConnectedLive } from "./connected-live";
import { Orders } from "./orders";

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
  const [localChannels, setLocalChannels] = useState<TikTokLiveChannel[]>([]);

  const channels = useMemo<TikTokLiveChannel[]>(() => {
    if (user?.tiktokChannels?.length) {
      return user.tiktokChannels.map((c) => ({
        id: c.id,
        username: normalizeTikTokUsername(c.tiktokUsername),
        isDefault: c.isDefault,
      }));
    }
    return localChannels;
  }, [user?.tiktokChannels, localChannels]);

  const alertShownRef = useRef(false);

  const resetToInitial = useCallback(() => {
    opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
    translateY.value = withTiming(
      INITIAL_OFFSET,
      { duration: ANIMATION_DURATION },
      (finished) => {
        if (finished) runOnJS(setVisible)(false);
      },
    );
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
          resetToInitial();
        },
      },
    ]);
  }, [liveError, clearLiveError, resetToInitial]);

  const fetchChannels = useCallback(async (): Promise<TikTokLiveChannel[]> => {
    try {
      const data = await getTikTokChannelsApi();
      const options: TikTokLiveChannel[] = data.map((channel) => ({
        id: channel.id,
        username: normalizeTikTokUsername(channel.tiktokUsername),
        isDefault: channel.isDefault,
      }));

      if (options.length > 0) {
        setLocalChannels(options);
      }

      return options;
    } catch (error) {
      if (__DEV__) console.error("fetchChannels error:", error);
      return [];
    }
  }, []);

  const selectedChannel = channels?.find(
    (c) =>
      normalizeTikTokUsername(c.username) ===
      normalizeTikTokUsername(tiktokUsername),
  );

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
    try {
      await stopLiveSession();
    } catch (error) {
      if (__DEV__) {
        console.error("Disconnect error:", error);
      }
    }

    opacity.value = withTiming(0, {
      duration: ANIMATION_DURATION,
    });

    translateY.value = withTiming(
      INITIAL_OFFSET,
      {
        duration: ANIMATION_DURATION,
      },
      (finished) => {
        if (finished) {
          runOnJS(setVisible)(false);
        }
      },
    );
  }, [stopLiveSession]);

  const onTabPress = (index: number) => {
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
  };

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
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
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
              channels={channels || []}
              onConnect={connectSelectedChannel}
              onAddChannel={onAddChannel}
            />
          )}
        </View>

        <View style={{ flex: 1 }} key="orders">
          <Orders orderManager={orderManager} />
        </View>
      </PagerView>

      {visible && (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.accountOverlay, animatedStyle]}
        >
          <AccountConnected
            onClose={onDisconnectAccount}
            selectedChannel={selectedChannel}
            channels={channels || []}
            onSelectChannel={onSelectChannel}
          />
        </Animated.View>
      )}
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
