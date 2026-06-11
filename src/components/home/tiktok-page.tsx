import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { AccountConnected } from "./account-connected";
import { SegmentControl } from "./segment";
import { UnConnectedLive } from "./unconnected-live";
import { images } from "@assets/images";
import { useAuth } from "@modules/auth/hooks/use-auth";
import { normalizeTikTokUsername } from "@utils/comment";
import { useTikTokLiveSocketContext } from "@contexts/tiktok-live-socket";
import { TIKTOK_USERNAME } from "@constants/config";

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

  const { user } = useAuth();
  const { tiktokUsername, changeTikTokUsername, stopLiveSession } =
    useTikTokLiveSocketContext();

  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const channelOptions = useMemo<TikTokLiveChannel[]>(() => {
    const options: TikTokLiveChannel[] =
      user?.tiktokChannels?.map((channel) => ({
        id: channel.id,
        username: normalizeTikTokUsername(channel.tiktokUsername),
        isDefault: channel.isDefault,
      })) || [];

    const normalizedCurrent = normalizeTikTokUsername(
      user?.tiktokUsername ?? "",
    );

    if (
      normalizedCurrent &&
      !options.some((option) => option.username === normalizedCurrent)
    ) {
      options.unshift({
        id: "current",
        username: normalizedCurrent,
        isDefault: true,
      });
    }

    // DEV fallback: remove this block after backend returns tiktokChannels/default channel on login.
    if (__DEV__ && options.length === 0) {
      const devUsername = normalizeTikTokUsername(TIKTOK_USERNAME);

      if (devUsername) {
        options.unshift({
          id: "dev-current",
          username: devUsername,
          isDefault: true,
        });
      }
    }

    return options;
  }, [user]);

  const [channels, setChannels] = useState<TikTokLiveChannel[] | undefined>(
    channelOptions,
  );

  useEffect(() => {
    setChannels(channelOptions);
  }, [channelOptions]);

  const selectedChannel = channels?.find((c) => c.isDefault);

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
      setChannels((prev) =>
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
    async (item?: TikTokLiveChannel) => {
      const targetUsername = item ? item.username : tiktokUsername;
      const nextUsername = normalizeTikTokUsername(targetUsername);

      if (!nextUsername) return;

      try {
        const success = await changeTikTokUsername(nextUsername);
        if (!success) {
          Alert.alert(
            "Lỗi",
            "Không thể kết nối đến TikTok Live. Vui lòng kiểm tra lại username.",
          );
          return;
        }

        setChannels((prev) =>
          prev?.map((c) => ({
            ...c,
            isDefault: normalizeTikTokUsername(c.username) === nextUsername,
          })),
        );

        if (visible) return;

        setVisible(true);

        opacity.value = 0;
        translateY.value = INITIAL_OFFSET;

        opacity.value = withTiming(1, {
          duration: ANIMATION_DURATION,
        });

        translateY.value = withTiming(0, {
          duration: ANIMATION_DURATION,
        });
      } catch (error) {
        if (__DEV__) {
          console.error("Connect channel error:", error);
        }
      }
    },
    [tiktokUsername, visible, changeTikTokUsername],
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
          runOnJS(setChannels)(
            channelOptions?.map((c) => ({ ...c, isDefault: false })),
          );
        }
      },
    );
  }, [stopLiveSession, channelOptions]);

  const onTabPress = (index: number) => {
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
  };

  return (
    <View style={styles.container}>
      <SegmentControl
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
          <UnConnectedLive
            channels={channels || []}
            onConnect={connectSelectedChannel}
          />
        </View>

        <View style={{ flex: 1 }} key="orders">
          <Text>order here</Text>
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
