import { useAuth } from "@features/auth/hooks/use-auth";
import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import { normalizeTikTokUsername } from "@features/tiktok-live/utils/comment";
import { useState } from "react";
import { Alert } from "react-native";
import { SettingsScreen } from "@features/settings/components/settings-screen";

export default function SettingsTab() {
  const { user, logout } = useAuth();
  const { tiktokUsername, isConnected, status, changeTikTokUsername } =
    useTikTokLiveSocketContext();

  const username = user?.fullName || user?.username || "User";
  const accountName =
    user?.username || user?.phone || tiktokUsername || "Lumi Live";
  const [inputUsername, setInputUsername] = useState(tiktokUsername);

  async function submitTikTokUsername() {
    const nextUsername = normalizeTikTokUsername(inputUsername);
    const ok = await changeTikTokUsername(nextUsername);
    if (ok) Alert.alert("Đã đổi LIVE", nextUsername);
  }

  return (
    <SettingsScreen
      username={username}
      accountName={accountName}
      tiktokUsername={tiktokUsername}
      isConnected={isConnected}
      status={status}
      inputUsername={inputUsername}
      setInputUsername={setInputUsername}
      onSubmitTikTokUsername={submitTikTokUsername}
      onLogout={logout}
    />
  );
}
