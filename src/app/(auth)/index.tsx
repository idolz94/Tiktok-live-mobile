import { Mode } from "@app-types/auth";
import { Header } from "@components/auth/header";
import { Login } from "@components/auth/login";
import { Register } from "@components/auth/register";
import { LinearGradient } from "@components/linear-gradient";
import { Screen } from "@components/screen";
import { HairlineWidth } from "@themes";
import { createStyles } from "@utils/createStyles";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function AuthScreen() {
  const params = useLocalSearchParams<{ mode?: Mode }>();
  const progress = useSharedValue(0);

  const [mode, setMode] = useState<Mode>(
    params.mode === "register" ? params.mode : "login",
  );

  const isLogin = mode === "login";

  const loginStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));

  const registerStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const switchToRegister = () => {
    setMode("register");
    console.log("first");

    progress.value = withTiming(1, {
      duration: 300,
    });
  };

  const switchToLogin = () => {
    setMode("login");

    progress.value = withTiming(0, {
      duration: 300,
    });
  };

  return (
    <Screen>
      <LinearGradient type="gra_primary" style={StyleSheet.absoluteFill} />
      <View style={styles.safeArea}>
        <Header />
        <View style={styles.mainContent}>
          <View style={{ rowGap: 8 }}>
            <Text style={styles.title}>
              {isLogin ? "Đăng nhập" : "Đăng ký"}
            </Text>
            {!isLogin && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={styles.registerText}>Bạn đã có tài khoản?</Text>
                <Pressable onPress={switchToLogin}>
                  <Text style={styles.loginTextNav}>{` Đăng nhập ngay!`}</Text>
                </Pressable>
              </View>
            )}
          </View>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <Login
              switchToRegister={switchToRegister}
              animatedStyle={loginStyle}
            />
            <Register
              animatedStyle={registerStyle}
              onRegisterSuccess={switchToLogin}
            />
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Screen>
  );
}

const styles = createStyles(({ colors, shadows, textPresets }) => ({
  safeArea: {
    flex: 1,
    paddingTop: 40,
  },
  mainContent: {
    flex: 1,
    marginTop: 32,
    backgroundColor: colors.neutral100,
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    rowGap: 20,
  },
  title: {
    textAlign: "center",
    color: colors.neutral900,
    ...textPresets.fs18_500,
  },
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
    color: colors.neutral900,
    ...textPresets.fs14_400,
    textAlign: "center",
  },
  loginTextNav: {
    color: colors.primary,
  },
}));
