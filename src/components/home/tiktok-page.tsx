import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
import { SegmentControl } from "./segment";

const SUB_TABS = ["Live", "Đơn đã tạo"];

export function TiktokPage() {
  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onTabPress = (i: number) => {
    setActiveIndex(i);
    pagerRef.current?.setPage(i);
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
        <View style={styles.page} key="live">
          <Text>live here</Text>
        </View>
        <View style={styles.page} key="orders">
          <Text>order here</Text>
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
