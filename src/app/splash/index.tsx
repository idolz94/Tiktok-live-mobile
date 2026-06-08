import { images } from "@assets/images";
import { Image } from "@components/image";
import { createStyles } from "@utils/createStyles";
import * as SplashScreen from "expo-splash-screen";
import { useRef } from "react";
import { Text } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function Splash() {
  const hiddenRef = useRef(false);

  return (
    <Animated.View
      style={styles.container}
      entering={FadeIn.duration(800)}
      exiting={FadeOut.duration(300)}
      onLayout={async () => {
        if (hiddenRef.current) return;

        hiddenRef.current = true;

        try {
          await SplashScreen.hideAsync();
        } catch {}
      }}
    >
      <Image source={images.logo_app} style={styles.logoImg} />
      <Text style={styles.logoTitle}>Lumi Live</Text>
    </Animated.View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    rowGap: 24,
  },
  logoImg: {
    width: 96,
    height: 96,
  },
  logoTitle: {
    color: colors.text,
    ...textPresets.fs18_500,
  },
}));
