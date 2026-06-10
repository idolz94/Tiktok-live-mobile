import { images } from "@assets/images";
import { Icon } from "@components/icon";
import { Image } from "@components/image";
import { createStyles } from "@utils/createStyles";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PLATFORM_TABS = ["Tiktok", "Facebook"];

type Props = {
  activeIndex: number;
  onTabPress: (index: number) => void;
};

export const HomeHeader = ({ activeIndex, onTabPress }: Props) => {
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
        <Icon name="search" size={20} tintColor="#000000" />
      </Pressable>
    </View>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    flexDirection: "row",
    paddingBottom: 12,
    paddingHorizontal: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoButton: {
    padding: 8,
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
    ...textPresets.fs16_500,
    color: colors.transparent50,
  },
  tabTextActive: {
    ...textPresets.fs16_500,
    color: colors.primary,
  },
  tabIndicator: {
    height: 3,
    backgroundColor: "transparent",
  },
  tabIndicatorActive: {
    backgroundColor: colors.primary,
  },
}));
