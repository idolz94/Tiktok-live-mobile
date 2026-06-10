import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useRef, useState } from "react";
import { Text, View } from "react-native";
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
import { fakeDataChannel, FakeDataType } from "./fake";

const SUB_TABS = ["Live", "Đơn đã tạo"];

const ANIMATION_DURATION = 250;
const INITIAL_OFFSET = 48;

export const TiktokPage = memo(() => {
  const pagerRef = useRef<PagerView>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [channels, setChannels] = useState<FakeDataType[]>(fakeDataChannel);

  const selectedChannel = channels.find((c) => c.isSelected);

  const translateY = useSharedValue(INITIAL_OFFSET);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {
        translateY: translateY.value,
      },
    ],
  }));

  const onSelectChannel = useCallback((selectedItem: FakeDataType) => {
    setChannels((prev) =>
      prev.map((c) => ({
        ...c,
        isSelected: c.key === selectedItem.key,
      })),
    );
  }, []);

  const onConnectAccount = useCallback(
    (selectedItem: FakeDataType) => {
      onSelectChannel(selectedItem);

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
    },
    [visible, onSelectChannel],
  );

  const onDisconnectAccount = useCallback(() => {
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
            fakeDataChannel.map((c) => ({ ...c, isSelected: false })),
          );
        }
      },
    );
  }, []);

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
          <UnConnectedLive channels={channels} onConnect={onConnectAccount} />
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
            channels={channels}
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
