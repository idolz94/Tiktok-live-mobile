import { Header } from "@features/auth/components/header";
import { Login } from "@features/auth/components/login";
import { Register } from "@features/auth/components/register";
import { LinearGradient } from "@components/linear-gradient";
import { Screen } from "@components/screen";
import { createStyles } from "@utils/createStyles";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Mode } from "@features/auth/schemas";

export default function AuthScreen() {
  const params = useLocalSearchParams<{ mode?: Mode }>();
  const initialMode = params.mode === "register" ? "register" : "login";

  const [mode, setMode] = useState<Mode>(initialMode);

  const isLogin = mode === "login";

  const switchToRegister = () => setMode("register");
  const switchToLogin = () => setMode("login");

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
              <View style={styles.titleContent}>
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
          >
            {isLogin ? (
              <Login switchToRegister={switchToRegister} />
            ) : (
              <Register />
            )}
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Screen>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
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
