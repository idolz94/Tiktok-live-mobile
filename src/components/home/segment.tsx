import PulsingDot from "@components/pulsing-dot";
import { useEffect, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface SegmentControlProps {
  tabs: string[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export function SegmentControl({
  tabs,
  activeIndex,
  onTabPress,
}: SegmentControlProps) {
  const [tabWidth, setTabWidth] = useState(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (tabWidth > 0) {
      translateX.value = withTiming(activeIndex * tabWidth, {
        duration: 200,
        easing: Easing.linear,
      });
    }
  }, [activeIndex, tabWidth]);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const containerWidth = e.nativeEvent.layout.width;
    setTabWidth((containerWidth - 8) / tabs.length);
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: tabWidth,
  }));

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
      {tabs.map((tab, i) => (
        <Pressable key={tab} onPress={() => onTabPress(i)} style={styles.tab}>
          {i === 0 && <PulsingDot size={10} color="white" ringCount={2} />}
          <Text
            style={[styles.tabText, activeIndex === i && styles.tabTextActive]}
          >
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 99,
    backgroundColor: "white",
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 99,
    backgroundColor: "pink",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    columnGap: 8,
  },
  tabText: {
    fontWeight: "400",
  },
  tabTextActive: {
    fontWeight: "700",
  },
});
