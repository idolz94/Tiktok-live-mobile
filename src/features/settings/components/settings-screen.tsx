import { DEFAULT_WS_URL } from "@constants/config";
import { createStyles } from "@utils/createStyles";
import { ScrollView, View } from "react-native";
import { AVATAR_URL, SETTINGS_COPY } from "../constants";
import { ProfileHero } from "./profile-hero";
import { SettingsSection } from "./settings-section";
import { SubscriptionCard } from "./subscription-card";
import { TikTokConnectionCard } from "./tiktok-connection-card";

type SettingsScreenProps = {
  username: string;
  accountName: string;
  tiktokUsername: string;
  isConnected: boolean;
  status: string;
  inputUsername: string;
  setInputUsername: (value: string) => void;
  onSubmitTikTokUsername: () => void;
  onLogout: () => void;
};

export function SettingsScreen({
  username,
  accountName,
  tiktokUsername,
  isConnected,
  status,
  inputUsername,
  setInputUsername,
  onSubmitTikTokUsername,
  onLogout,
}: SettingsScreenProps) {
  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <ProfileHero
          avatarUrl={AVATAR_URL}
          name={username}
          nickname={accountName}
        />

        <View style={styles.content}>
          <SubscriptionCard
            title={SETTINGS_COPY.subscriptionTitle}
            subtitle={SETTINGS_COPY.subscriptionSubtitle}
            upgradeLabel={SETTINGS_COPY.upgrade}
          />

          <TikTokConnectionCard
            label={SETTINGS_COPY.tiktokLabel}
            connectionText={`${isConnected ? SETTINGS_COPY.connected : SETTINGS_COPY.disconnected} · ${status}`}
            value={inputUsername}
            onChangeText={setInputUsername}
            onSubmit={onSubmitTikTokUsername}
            serverText={DEFAULT_WS_URL}
            placeholder="Nhập TikTok username"
            placeholderTextColor="#BDBDBD"
            connectLabel={SETTINGS_COPY.connectButton}
          />

          <SettingsSection
            logoutLabel={SETTINGS_COPY.logout}
            onLogout={onLogout}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = createStyles(({ colors }) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.neutral100,
  },
  container: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
}));
