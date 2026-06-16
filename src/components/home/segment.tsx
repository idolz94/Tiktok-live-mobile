import { Icon } from "@components/icon";
import { PulsingDot } from "@components/pulsing-dot";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { memo, useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type SegmentControlProps = {
  tabs: string[];
  activeIndex: number;
  onTabPress: (index: number) => void;
};

export const Segment = memo(
  ({ tabs, activeIndex, onTabPress }: SegmentControlProps) => {
    const { colors } = useThemes();
    const translateX = useSharedValue(0);

    const [tabWidth, setTabWidth] = useState(0);

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
            {i === 0 ? (
              <PulsingDot
                size={10}
                color={activeIndex === 0 ? colors.neutral100 : colors.primary}
                ringCount={2}
              />
            ) : (
              <Icon
                name="clipboard_check"
                size={20}
                tintColor={activeIndex === i ? "white" : "neutral300"}
              />
            )}
            <Text
              style={[
                styles.tabText,
                activeIndex === i && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  },
);

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 99,
    backgroundColor: colors.neutral100,
    marginHorizontal: 16,
  },
  indicator: {
    position: "absolute",
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 99,
    backgroundColor: colors.primary,
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
    ...textPresets.fs14_500,
    color: colors.neutral300,
  },
  tabTextActive: {
    ...textPresets.fs14_500,
    color: colors.neutral100,
  },
}));
