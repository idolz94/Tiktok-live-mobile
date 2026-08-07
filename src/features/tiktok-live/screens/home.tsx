/**
 * HomeScreen — màn hình chính (tab index).
 * Di chuyển từ `src/app/(tabs)/index.tsx` sang feature theo cấu trúc route-mỏng/feature-dày.
 * (PROJECT_GUIDE mục 4 & 8)
 */
import { HomeHeader } from "@components/home/header";
import { LinearGradient } from "@components/linear-gradient";
import { TiktokPage } from "@features/tiktok-live/components/tiktok-page";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { useRef, useState } from "react";
import { Text, View } from "react-native";
import PagerView from "react-native-pager-view";

export type TopTab = "connect" | "history";

export function HomeScreen() {
  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { colors, textPresets } = useThemes();

  const onTabPress = (i: number) => {
    setActiveIndex(i);
    pagerRef.current?.setPage(i);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <HomeHeader activeIndex={activeIndex} onTabPress={onTabPress} />
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        <TiktokPage key="tiktok" />
        <View style={styles.page} key="facebook">
          <Text style={[{ color: colors.neutral400 }, textPresets.fs14_400]}>
            Facebook sắp ra mắt
          </Text>
        </View>
      </PagerView>
    </View>
  );
}

const styles = createStyles(() => ({
  root: {
    flex: 1,
  },
  bg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
}));
