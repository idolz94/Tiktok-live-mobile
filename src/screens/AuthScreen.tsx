import { LinearGradient } from "@/components/linear-gradient";
import { Separator } from "@/components/separator";
import { useAuth } from "@/hooks/useAuth";
import { HairlineWidth } from "@/themes";
import { createStyles } from "@/utils/createStyles";
import { isIos } from "@/utils/platform";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Mode = "login" | "register";

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("0816507286");
  const [password, setPassword] = useState("123456");
  const [remember, setRemember] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isLogin = mode === "login";

  function submit() {
    const result = isLogin ? login(phone, password) : register(phone, password);
    if (!result.ok)
      Alert.alert(
        isLogin ? "Đăng nhập thất bại" : "Đăng ký thất bại",
        result.message || "",
      );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={isIos ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.flex}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.banner}>
            <LinearGradient
              type="gra_warning"
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.bannerText}>TikTok Live Tools</Text>
            <Text style={styles.bannerSub}>Chốt đơn nhanh từ comment live</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Trải nghiệm miễn phí</Text>
            <Pressable
              style={styles.registerButton}
              onPress={() => setMode("register")}
              disabled={mode === "register"}
            >
              <Text style={styles.registerText}>ĐĂNG KÝ NGAY</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <Separator
                type="horizontal"
                size={1}
                containerStyle={styles.flex}
              />
              <Text style={styles.dividerText}>hoặc đăng nhập</Text>
              <Separator
                type="horizontal"
                size={1}
                containerStyle={styles.flex}
              />
            </View>

            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                placeholder="Nhập số điện thoại"
                style={styles.input}
              />
              <Text style={styles.check}>✓</Text>
            </View>

            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                placeholder="Nhập mật khẩu"
                style={styles.input}
              />
              <Pressable
                onPress={() => setIsPasswordVisible((value) => !value)}
              >
                <Text style={styles.eye}>
                  {isPasswordVisible ? "Ẩn" : "Hiện"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.rememberRow}
              onPress={() => setRemember((value) => !value)}
            >
              <View
                style={[styles.checkbox, remember && styles.checkboxActive]}
              >
                {remember ? <Text style={styles.checkboxText}>✓</Text> : null}
              </View>
              <Text style={styles.rememberText}>Lưu đăng nhập</Text>
            </Pressable>

            <Pressable style={styles.submitButton} onPress={submit}>
              <Text style={styles.submitText}>
                {isLogin ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                setMode((current) =>
                  current === "login" ? "register" : "login",
                )
              }
            >
              <Text style={styles.toggle}>
                {isLogin
                  ? "Chưa có tài khoản? Đăng ký"
                  : "Đã có tài khoản? Đăng nhập"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.surfaceGray, paddingTop: 72 },
  banner: {
    height: 250,
    marginHorizontal: 14,
    borderRadius: 24,
    backgroundColor: colors.warningGold,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    rowGap: 10,
  },
  bannerText: { color: colors.text, ...textPresets.display_fs30_black },
  bannerSub: {
    color: colors.text,
    ...textPresets.text_fs14_extrabold,
  },
  card: {
    marginTop: -55,
    borderRadius: 28,
    backgroundColor: colors.white,
    marginHorizontal: 28,
    padding: 20,
    ...shadows.sd2,
  },
  title: {
    textAlign: "center",
    color: colors.text,
    ...textPresets.title_fs23_black,
  },
  registerButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: HairlineWidth * 6,
    borderColor: colors.primaryDark,
    backgroundColor: colors.warningBgLight,
    alignItems: "center",
    justifyContent: "center",
  },
  registerText: {
    color: colors.primaryDark,
    ...textPresets.title_fs18_black,
  },
  dividerRow: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
  },
  dividerText: {
    color: colors.text,
    ...textPresets.text_fs14_extrabold,
  },
  label: {
    marginTop: 20,
    marginBottom: 8,
    color: colors.text,
    ...textPresets.text_fs16_black,
  },
  inputWrap: {
    padding: 12,
    borderRadius: 13,
    borderWidth: HairlineWidth * 3,
    borderColor: colors.text,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
  },
  input: { flex: 1, color: colors.text, ...textPresets.title_fs18_bold },
  check: { color: colors.greenSuccess, ...textPresets.title_fs18_black },
  eye: { color: colors.primaryDark, ...textPresets.title_fs18_black },
  rememberRow: { marginTop: 18, flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.warningAlt,
    borderColor: colors.warningAlt,
  },
  checkboxText: { fontWeight: "900", color: colors.text },
  rememberText: { marginLeft: 10, color: colors.text, fontWeight: "700" },
  submitButton: {
    marginTop: 22,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: colors.warningAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: colors.text, fontSize: 17, fontWeight: "900" },
  toggle: {
    marginTop: 20,
    textAlign: "center",
    color: colors.primaryDark,
    fontWeight: "900",
  },
}));
