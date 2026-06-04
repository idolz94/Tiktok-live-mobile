import { createStyles } from "@utils/createStyles";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { router } from "expo-router";

export default function test2() {
  return (
    <View style={styles.root}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => router.back()}
      />
      <Animated.View
        style={styles.container}
        entering={FadeInDown}
        exiting={FadeOutDown}
      >
        <Text>test2</Text>
      </Animated.View>
    </View>
  );
}

const styles = createStyles(({ colors, shadows }) => ({
  content: {
    width: 300,
    padding: 20,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  root: {
    flex: 1,
    backgroundColor: "rgba(255, 0, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    rowGap: 12,
    width: "100%",
    maxWidth: 370,
    backgroundColor: colors.surfaceGray,
    padding: 16,
    borderRadius: 24,
    overflow: "hidden",
    ...shadows.sd3,
  },
}));
