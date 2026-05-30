import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { DEFAULT_WS_URL } from "@/constants/config";
import { normalizeTikTokUsername } from "@/utils/comment";

export default function SettingsView({
  username,
  tiktokUsername,
  isConnected,
  status,
  onChangeTikTokUsername,
  onLogout
}: {
  username?: string;
  tiktokUsername: string;
  isConnected: boolean;
  status: string;
  onChangeTikTokUsername: (username: string) => Promise<boolean> | boolean;
  onLogout: () => void;
}) {
  const [inputUsername, setInputUsername] = useState(tiktokUsername);

  async function submitTikTokUsername() {
    const nextUsername = normalizeTikTokUsername(inputUsername);
    const ok = await onChangeTikTokUsername(nextUsername);
    if (ok) Alert.alert("Đã đổi LIVE", nextUsername);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cài đặt</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Tài khoản</Text>
        <Text style={styles.value}>{username || "User"}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>TikTok username</Text>
        <TextInput style={styles.input} value={inputUsername} onChangeText={setInputUsername} autoCapitalize="none" />
        <TouchableOpacity style={styles.button} onPress={submitTikTokUsername}>
          <Text style={styles.buttonText}>Kết nối / Đổi username</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Server SSE</Text>
        <Text style={styles.value}>{DEFAULT_WS_URL}</Text>
        <Text style={styles.value}>{isConnected ? "Đã kết nối" : "Chưa kết nối"}</Text>
        <Text style={styles.muted}>{status}</Text>
      </View>
      <TouchableOpacity style={styles.logout} onPress={onLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "900", color: "#273044", marginBottom: 16 },
  card: { marginBottom: 14, borderRadius: 18, backgroundColor: "#fff", padding: 16 },
  label: { color: "#64748b", fontWeight: "800", marginBottom: 8 },
  value: { color: "#273044", fontWeight: "800", marginBottom: 6 },
  muted: { color: "#64748b" },
  input: { minHeight: 48, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, paddingHorizontal: 12, color: "#273044", backgroundColor: "#f8fafc" },
  button: { marginTop: 12, minHeight: 48, borderRadius: 12, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#fff", fontWeight: "900" },
  logout: { minHeight: 48, borderRadius: 12, backgroundColor: "#fee2e2", alignItems: "center", justifyContent: "center" },
  logoutText: { color: "#dc2626", fontWeight: "900" }
});
