import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/hooks/useAuth";

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
    if (!result.ok) Alert.alert(isLogin ? "Đăng nhập thất bại" : "Đăng ký thất bại", result.message || "");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.banner}>
            <Text style={styles.bannerText}>TikTok Live Tools</Text>
            <Text style={styles.bannerSub}>Chốt đơn nhanh từ comment live</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Trải nghiệm miễn phí</Text>
            <TouchableOpacity style={styles.registerButton} onPress={() => setMode("register")}>
              <Text style={styles.registerText}>ĐĂNG KÝ NGAY</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>hoặc đăng nhập</Text>
              <View style={styles.divider} />
            </View>

            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputWrap}>
              <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoCapitalize="none" placeholder="Nhập số điện thoại" style={styles.input} />
              <Text style={styles.check}>✓</Text>
            </View>

            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputWrap}>
              <TextInput value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} placeholder="Nhập mật khẩu" style={styles.input} />
              <TouchableOpacity onPress={() => setIsPasswordVisible((value) => !value)}>
                <Text style={styles.eye}>{isPasswordVisible ? "Ẩn" : "Hiện"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.rememberRow} onPress={() => setRemember((value) => !value)}>
              <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                {remember ? <Text style={styles.checkboxText}>✓</Text> : null}
              </View>
              <Text style={styles.rememberText}>Lưu đăng nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={submit}>
              <Text style={styles.submitText}>{isLogin ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMode((current) => (current === "login" ? "register" : "login"))}>
              <Text style={styles.toggle}>{isLogin ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: "#f3f4f6" },
  container: { minHeight: "100%", padding: 14, paddingBottom: 40 },
  banner: { height: 250, borderRadius: 24, backgroundColor: "#f2c233", alignItems: "center", justifyContent: "center" },
  bannerText: { fontSize: 30, fontWeight: "900", color: "#273044" },
  bannerSub: { marginTop: 10, color: "#273044", fontWeight: "800" },
  card: { marginTop: -55, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.96)", padding: 20, shadowColor: "#0f172a", shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
  title: { textAlign: "center", fontSize: 23, fontWeight: "900", color: "#273044" },
  registerButton: { marginTop: 24, minHeight: 60, borderRadius: 31, borderWidth: 2, borderColor: "#070f66", backgroundColor: "#fffef5", alignItems: "center", justifyContent: "center" },
  registerText: { color: "#070f66", fontSize: 18, fontWeight: "900" },
  dividerRow: { marginTop: 28, flexDirection: "row", alignItems: "center" },
  divider: { flex: 1, height: 1, backgroundColor: "#d1d5db" },
  dividerText: { marginHorizontal: 12, color: "#273044", fontWeight: "800" },
  label: { marginTop: 20, marginBottom: 8, fontSize: 16, fontWeight: "900", color: "#273044" },
  inputWrap: { minHeight: 56, borderRadius: 13, borderWidth: 1, borderColor: "#a3a8b0", backgroundColor: "#fff", paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
  input: { flex: 1, fontSize: 18, color: "#273044" },
  check: { color: "#4caf50", fontSize: 22, fontWeight: "900" },
  eye: { color: "#070f66", fontWeight: "900" },
  rememberRow: { marginTop: 18, flexDirection: "row", alignItems: "center" },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: "#273044", alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: "#f2c300", borderColor: "#f2c300" },
  checkboxText: { fontWeight: "900", color: "#273044" },
  rememberText: { marginLeft: 10, color: "#273044", fontWeight: "700" },
  submitButton: { marginTop: 22, minHeight: 56, borderRadius: 18, backgroundColor: "#f2c300", alignItems: "center", justifyContent: "center" },
  submitText: { color: "#273044", fontSize: 17, fontWeight: "900" },
  toggle: { marginTop: 20, textAlign: "center", color: "#070f66", fontWeight: "900" }
});
