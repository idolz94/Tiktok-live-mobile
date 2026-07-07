import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { widthScreen } from "@utils/platform";
import { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useScrollToTopStore } from "@hooks/use-tab-scroll-to-top";

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors } = useThemes();

  const tabWidth = widthScreen / state.routes.length;

  const translateX = useSharedValue(state.index * tabWidth);

  useEffect(() => {
    translateX.value = withTiming(state.index * tabWidth, {
      duration: 250,
    });
  }, [state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.indicatorContainer,
          {
            width: tabWidth,
          },
          indicatorStyle,
        ]}
      >
        <View style={styles.indicator} />
      </Animated.View>

      <View style={styles.tabs}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          const focused = state.index === index;

          const color = focused ? colors.primary : colors.neutral300;

          const label = options.tabBarLabel ?? options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!event.defaultPrevented) {
              useScrollToTopStore.getState().triggerScrollToTop(route.name);

              if (!focused) {
                navigation.navigate(route.name);
              }
            }
          };

          const icon =
            typeof options.tabBarIcon === "function"
              ? options.tabBarIcon({
                  focused,
                  color,
                  size: 24,
                })
              : null;

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab}>
              {icon}
              <Text
                style={[
                  styles.text,
                  {
                    color,
                  },
                ]}
              >
                {/* @ts-ignore */}
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    backgroundColor: colors.neutral100,
    paddingTop: 8,
    paddingBottom: 24,
    elevation: 8,
  },
  tabs: {
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
  },
  indicator: {
    width: 40,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignSelf: "center",
  },
  text: {
    ...textPresets.fs10_500,
  },
}));
