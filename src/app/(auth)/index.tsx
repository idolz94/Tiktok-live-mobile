import { Header } from "@features/auth/components/header";
import { ForgotPass } from "@features/auth/components/forgot-pass";
import { Login } from "@features/auth/components/login";
import { Register } from "@features/auth/components/register";
import { LinearGradient } from "@components/linear-gradient";
import { createStyles } from "@utils/createStyles";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Mode } from "@features/auth/schemas";

export default function AuthScreen() {
  const params = useLocalSearchParams<{ mode?: Mode }>();
  const initialMode = params.mode === "register" ? "register" : "login";

  const [mode, setMode] = useState<Mode>(initialMode);

  const isLogin = mode === "login";
  const isRegister = mode === "register";

  const switchToRegister = () => setMode("register");
  const switchToLogin = () => setMode("login");
  const switchToForgot = () => setMode("forgot");

  return (
    <View style={styles.root}>
      <LinearGradient type="gra_primary" style={styles.bg} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
      <View style={styles.safeArea}>
        <Header />
        <View style={styles.mainContent}>
          <View style={{ rowGap: 8 }}>
            <Text style={styles.title}>
              {isLogin ? "Đăng nhập" : isRegister ? "Đăng ký" : "Quên mật khẩu?"}
            </Text>
            {isRegister && (
              <View style={styles.titleContent}>
                <Text style={styles.registerText}>Bạn đã có tài khoản?</Text>
                <Pressable onPress={switchToLogin}>
                  <Text style={styles.loginTextNav}>{` Đăng nhập ngay!`}</Text>
                </Pressable>
              </View>
            )}
            {!isLogin && !isRegister && (
              <View style={styles.titleContent}>
                <Pressable onPress={switchToLogin}>
                  <Text style={styles.loginTextNav}>Đăng nhập</Text>
                </Pressable>
                <Text style={styles.registerText}>{` / `}</Text>
                <Pressable onPress={switchToRegister}>
                  <Text style={styles.loginTextNav}>Đăng ký</Text>
                </Pressable>
              </View>
            )}
          </View>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {isLogin ? (
              <Login switchToRegister={switchToRegister} switchToForgot={switchToForgot} />
            ) : isRegister ? (
              <Register />
            ) : (
              <ForgotPass onClose={switchToLogin} />
            )}
          </KeyboardAwareScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
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
  registerText: {
    color: colors.neutral900,
    ...textPresets.fs14_400,
    textAlign: "center",
  },
  loginTextNav: {
    color: colors.primary,
  },
  titleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
}));
