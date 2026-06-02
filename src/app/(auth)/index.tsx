import { images } from "@assets/images";
import { Image } from "@components/image";
import { Screen } from "@components/screen";
import { Separator } from "@components/separator";
import { HairlineWidth } from "@themes";
import { createStyles } from "@utils/createStyles";
import { BlurView } from "expo-blur";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Login } from "@components/auth/login";
import { Register } from "@components/auth/register";
import { Footer } from "@components/auth/footer";
import { Mode } from "@app-types/auth";

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("login");

  const isLogin = mode === "login";

  return (
    <Screen>
      <View style={styles.safeArea}>
        <Image
          source={images.logo_banner}
          style={styles.imgBlur}
          resizeMode="cover"
        />
        <BlurView
          intensity={50}
          style={StyleSheet.absoluteFill}
          tint="light"
          blurMethod="dimezisBlurViewSdk31Plus"
        />
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.banner}>
            <Image
              source={images.logo_banner}
              style={styles.bannerImg}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Trải nghiệm miễn phí</Text>
            {isLogin ? (
              <>
                <Pressable
                  style={styles.registerButton}
                  onPress={() => setMode("register")}
                  disabled={!isLogin}
                >
                  <Text style={styles.registerText}>ĐĂNG KÝ NGAY</Text>
                </Pressable>

                <View style={styles.dividerRow}>
                  <Separator
                    type="horizontal"
                    size={2}
                    containerStyle={styles.flex}
                  />
                  <Text style={styles.dividerText}>hoặc đăng nhập</Text>
                  <Separator
                    type="horizontal"
                    size={2}
                    containerStyle={styles.flex}
                  />
                </View>

                <Login />
              </>
            ) : (
              <Register onRegisterSuccess={() => setMode("login")} />
            )}
            <Footer isLogin={isLogin} setMode={setMode} />
          </View>
        </KeyboardAwareScrollView>
      </View>
    </Screen>
  );
}

const styles = createStyles(({ colors, shadows, textPresets }) => ({
  safeArea: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 10,
  },
  imgBlur: {
    width: "100%",
    height: "100%",
    position: "absolute",
    opacity: 0.5,
  },
  banner: {
    borderWidth: HairlineWidth * 2,
    borderColor: colors.white,
    height: 266,
    marginHorizontal: 8,
    borderRadius: 24,
    overflow: "hidden",
    ...shadows.sd1,
  },
  bannerImg: {
    width: "100%",
    height: "100%",
  },
  card: {
    marginTop: -50,
    borderRadius: 24,
    backgroundColor: colors.white,
    marginHorizontal: 18,
    paddingHorizontal: 12,
    paddingVertical: 24,
    rowGap: 16,
    ...shadows.sd2,
  },
  title: {
    textAlign: "center",
    color: colors.text,
    ...textPresets.fs23_900,
  },
  flex: { flex: 1 },
  registerButton: {
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: HairlineWidth * 4,
    borderColor: colors.primaryDark,
    backgroundColor: colors.warningBgLight,
    alignItems: "center",
    justifyContent: "center",
  },
  registerText: {
    color: colors.primaryDark,
    ...textPresets.fs18_900,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
  },
  dividerText: {
    color: colors.text,
    ...textPresets.fs14_800,
  },
}));
