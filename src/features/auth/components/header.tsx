import { images } from "@assets/images";
import { Image } from "@components/image";
import { createStyles } from "@utils/createStyles";
import { memo } from "react";
import { Dimensions, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PathLine } from "./path";

const flows = [
  {
    title: "Gom comment",
    image: images.comment,
    rotate: "15deg",
  },
  {
    title: "Xác nhận đơn",
    image: images.order,
    rotate: "-15deg",
  },
  {
    title: "Gửi vận chuyển",
    image: images.ship,
    rotate: "15deg",
  },
] as const;

export const Header = memo(() => {
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <Text style={styles.title}>{`3 bước đơn giản,\nchốt đơn dễ dàng`}</Text>
      <View style={styles.flowContainer}>
        <PathLine containerStyle={styles.dashLine} />
        {flows.map((step) => (
          <View key={step.title} style={styles.itemContainer}>
            <View
              style={[
                styles.imgContainer,
                { transform: [{ rotate: step.rotate }] },
              ]}
            >
              <Image
                source={step.image}
                resizeMode="contain"
                style={styles.img}
              />
            </View>
            <Text style={styles.textItem}>{step.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  container: {
    rowGap: 24,
  },
  title: {
    color: colors.neutral900,
    ...textPresets.fs20_600,
    textAlign: "center",
  },
  flowContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  itemContainer: {
    alignItems: "center",
    justifyContent: "center",
    rowGap: 16,
  },
  imgContainer: {
    width: 72,
    height: 72,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.neutral100,
    zIndex: 1,
    ...shadows.sd1,
  },
  img: {
    width: 60,
    height: 60,
  },
  dashLine: {
    position: "absolute",
    top: 0,
    zIndex: 0,
    maxWidth: Dimensions.get("window").width - 58 - 144,
  },
  textItem: {
    color: colors.neutral900,
    ...textPresets.fs14_400,
  },
}));
