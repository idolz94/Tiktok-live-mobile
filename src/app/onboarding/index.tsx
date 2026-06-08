import { images } from "@assets/images";
import { Image } from "@components/image";
import { LinearGradient } from "@components/linear-gradient";
import { Screen } from "@components/screen";
import { createStyles } from "@utils/createStyles";
import { saveBoolean, STORAGE_KEYS } from "@utils/storage";
import { router } from "expo-router";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

export default function Onboarding() {
  const nextFlow = (mode?: "login" | "register") => {
    saveBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED, true);

    const route = {
      pathname: "/(auth)" as const,
      ...(mode && { params: { mode } }),
    };

    router.replace(route);
  };

  return (
    <Screen>
      <Image source={images.onboarding_img_bg} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.sloganText}>{`Sáng comment\nSáng doanh thu`}</Text>
        <View style={{ rowGap: 16 }}>
          <Pressable
            style={styles.registerBtn}
            onPress={() => {
              nextFlow("register");
            }}
          >
            <LinearGradient
              type="gra_primary"
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.textBtn}>Đăng ký</Text>
          </Pressable>
          <Pressable
            style={styles.loginBtn}
            onPress={() => {
              nextFlow("login");
            }}
          >
            <Text style={styles.textBtn}>Đăng nhập</Text>
          </Pressable>
          <Pressable
            style={{
              paddingVertical: 8,
            }}
            onPress={() => nextFlow()}
          >
            <Text style={styles.tryText}>Trải nghiệm dùng thử</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  image: {
    width: "100%",
    height: "100%",
    ...StyleSheet.absoluteFill,
  },
  sloganText: {
    color: colors.neutral900,
    ...textPresets.fs40_600,
  },
  textBtn: {
    color: colors.neutral900,
    ...textPresets.fs16_500,
    textAlign: "center",
  },
  tryText: {
    color: colors.neutral900,
    ...textPresets.fs16_500,
    textAlign: "center",
  },
  content: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: Dimensions.get("screen").height / 2,
    maxHeight: 344,
    paddingHorizontal: 24,
    paddingVertical: 8,
    rowGap: 32,
  },
  registerBtn: {
    paddingVertical: 16,
    borderRadius: 99,
    overflow: "hidden",
  },
  loginBtn: {
    paddingVertical: 16,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
  },
}));
