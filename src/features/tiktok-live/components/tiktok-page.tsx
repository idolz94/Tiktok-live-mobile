import { createStyles } from "@utils/createStyles";
import { memo, useRef } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { AccountConnected } from "./account-connected";
import { Segment } from "./segment";
import { UnConnectedLive } from "./unconnected-live";
import { ConnectedLive } from "./connected-live";
import { Orders } from "@features/orders/screens/orders";
import { useTiktokPage } from "./use-tiktok-page";

export type TikTokLiveChannel = {
  id: string;
  username: string;
  isDefault: boolean;
  displayName?: string | null;
  avatarUrl?: string | null;
  followerCount?: number | null;
};

const SUB_TABS = ["Live", "Đơn đã tạo"];

export const TiktokPage = memo(() => {
  const pagerRef = useRef<PagerView>(null);
  const {
    orderManager,
    activeIndex,
    visible,
    localChannels,
    selectedChannel,
    opacity,
    translateY,
    fetchChannels,
    connectSelectedChannel,
    addChannel,
    onDisconnectAccount,
    onTabPress,
    handlePageSelected,
    navigateToOrders,
  } = useTiktokPage(pagerRef);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Segment tabs={SUB_TABS} activeIndex={activeIndex} onTabPress={onTabPress} />

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
              onNavigateToOrders={navigateToOrders}
            />
          ) : (
            <UnConnectedLive
              channels={localChannels}
              onConnect={connectSelectedChannel}
              onAddChannel={addChannel}
              onRefreshChannels={fetchChannels}
            />
          )}
        </View>

        <View style={{ flex: 1 }} key="orders">
          <Orders orderManager={orderManager} />
        </View>
      </PagerView>

      <Animated.View
        pointerEvents={visible ? "box-none" : "none"}
        style={[styles.accountOverlay, animatedStyle]}
      >
        {visible && (
          <AccountConnected
            onClose={onDisconnectAccount}
            selectedChannel={selectedChannel}
          />
        )}
      </Animated.View>
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
