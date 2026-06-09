import { images } from "@assets/images";
import { Image } from "@components/image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PLATFORM_TABS = ["Tiktok", "Facebook"];

type Props = {
  activeIndex: number;
  onTabPress: (index: number) => void;
};

export function HomeHeader({ activeIndex, onTabPress }: Props) {
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: top + 12 }]}>
      <Pressable style={styles.logoButton}>
        <Image source={images.logo_app} style={styles.logo} />
      </Pressable>

      <View style={styles.tabs}>
        {PLATFORM_TABS.map((tab, i) => (
          <Pressable key={tab} onPress={() => onTabPress(i)} style={styles.tab}>
            <Text
              style={[
                styles.tabText,
                activeIndex === i && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
            <View
              style={[
                styles.tabIndicator,
                activeIndex === i && styles.tabIndicatorActive,
              ]}
            />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logoButton}>
        <Image source={images.logo_app} style={styles.logo} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingBottom: 12,
    paddingHorizontal: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoButton: {
    width: 44,
    height: 44,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    overflow: "hidden",
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 99,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 40,
  },
  tab: {
    rowGap: 8,
    justifyContent: "center",
  },
  tabText: {
    fontWeight: "400",
  },
  tabTextActive: {
    fontWeight: "700",
  },
  tabIndicator: {
    height: 2,
    backgroundColor: "transparent",
  },
  tabIndicatorActive: {
    backgroundColor: "pink",
  },
});
