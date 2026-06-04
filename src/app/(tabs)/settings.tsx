import { DEFAULT_WS_URL } from "@constants/config";
import { useTikTokLiveSocketContext } from "@contexts/tiktok-live-socket";
import { useAuth } from "@modules/auth/hooks/use-auth";
import { normalizeTikTokUsername } from "@utils/comment";
import { createStyles } from "@utils/createStyles";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsTab() {
  const { user, logout } = useAuth();
  const { tiktokUsername, isConnected, status, changeTikTokUsername } =
    useTikTokLiveSocketContext();

  const username = user?.fullName || user?.username;
  const currentTiktokUsername = tiktokUsername;

  const [inputUsername, setInputUsername] = useState(currentTiktokUsername);

  async function submitTikTokUsername() {
    const nextUsername = normalizeTikTokUsername(inputUsername);
    const ok = await changeTikTokUsername(nextUsername);
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
        <TextInput
          style={styles.input}
          value={inputUsername}
          onChangeText={setInputUsername}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={submitTikTokUsername}>
          <Text style={styles.buttonText}>Kết nối / Đổi username</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Server SSE</Text>
        <Text style={styles.value}>{DEFAULT_WS_URL}</Text>
        <Text style={styles.value}>
          {isConnected ? "Đã kết nối" : "Chưa kết nối"}
        </Text>
        <Text style={styles.muted}>{status}</Text>
      </View>
      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  container: { padding: 18, paddingBottom: 40 },
  title: {
    color: colors.text,
    marginBottom: 16,
    ...textPresets.fs26_900,
  },
  card: {
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 16,
  },
  label: {
    color: colors.textMuted,
    ...textPresets.fs14_800,
    marginBottom: 8,
  },
  value: {
    color: colors.text,
    ...textPresets.fs14_800,
    marginBottom: 6,
  },
  muted: {
    color: colors.textMuted,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  button: {
    marginTop: 12,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: colors.white, ...textPresets.fs15_900 },
  logout: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.dangerBg,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: { color: colors.dangerDark, ...textPresets.fs15_900 },
}));
