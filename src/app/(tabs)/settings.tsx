import { LinearGradient } from "@components/linear-gradient";
import { useAuth } from "@features/auth/hooks/use-auth";
import { getTikTokChannelsApi } from "@features/auth/services/api";
import { createStyles } from "@utils/createStyles";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const AVATAR_URL = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&q=80";

const settingGroups = [
  [
    { icon: "♪", label: "Quản lý kênh Tiktok" },
    { icon: "f", label: "Quản lý kênh Facebook" },
  ],
  [
    { icon: "⚙", label: "Cài đặt chung" },
    { icon: "⌘", label: "Cài đặt máy in" },
    { icon: "⇄", label: "Cấu hình vận chuyển" },
  ],
  [
    { icon: "文", label: "Ngôn ngữ" },
    { icon: "?", label: "Hỗ trợ" },
  ],
];

export default function SettingsTab() {
  const { user, logout } = useAuth();
  const username = user?.fullName || user?.username || "User";
  const accountName = user?.username || user?.phone || "Lumi Live";

  const [channels, setChannels] = useState<
    { id: string; username: string; isDefault: boolean }[]
  >([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [channelError, setChannelError] = useState<string | null>(null);

  const loadChannels = useCallback(async () => {
    setLoadingChannels(true);
    setChannelError(null);
    try {
      const data = await getTikTokChannelsApi();
      setChannels(
        data.map((channel) => ({
          id: channel.id,
          username: channel.tiktokUsername,
          isDefault: channel.isDefault,
        })),
      );
    } catch (error) {
      setChannelError(error instanceof Error ? error.message : "Không tải được danh sách kênh TikTok");
    } finally {
      setLoadingChannels(false);
    }
  }, []);

  useEffect(() => {
    void loadChannels();
  }, [loadChannels]);

  const defaultChannel = useMemo(
    () => channels.find((channel) => channel.isDefault) ?? channels[0],
    [channels],
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.hero}>
          <Image source={{ uri: AVATAR_URL }} blurRadius={18} style={styles.heroImage} />
          <View style={styles.heroOverlay} />

          <View style={styles.topBar}>
            <Text style={styles.title}>Hồ sơ</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.roundButton} activeOpacity={0.8}>
                <Text style={styles.roundButtonIcon}>⌕</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.roundButton} activeOpacity={0.8}>
                <Text style={styles.roundButtonIcon}>⚙</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
            </View>
            <Text style={styles.name}>{username}</Text>
            <Text style={styles.nickname}>{accountName}</Text>

            <View style={styles.socialRow}>
              <SocialButton label="f" />
              <SocialButton label="♪" />
              <SocialButton label="▶" />
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionInfoRow}>
              <LinearGradient type="gra_primary" style={styles.appIcon}>
                <Text style={styles.appIconText}>▣</Text>
              </LinearGradient>
              <View style={styles.subscriptionTextWrap}>
                <Text style={styles.subscriptionTitle}>Gói Lumi Live Mini</Text>
                <Text style={styles.subscriptionSubtitle}>1172-2700 đơn</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
            <TouchableOpacity activeOpacity={0.85}>
              <LinearGradient type="gra_primary" style={styles.upgradeButton}>
                <Text style={styles.upgradeText}>Nâng cấp</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.tiktokCard}>
            <View style={styles.tiktokHeader}>
              <View style={styles.tiktokHeaderCopy}>
                <Text style={styles.cardLabel}>Quản lý kênh TikTok</Text>
                <Text style={styles.connectionText}>
                  {loadingChannels
                    ? "Đang tải danh sách..."
                    : `${channels.length} kênh${defaultChannel ? ` · mặc định @${defaultChannel.username}` : ""}`}
                </Text>
              </View>
              <TouchableOpacity style={styles.reloadPill} onPress={loadChannels} activeOpacity={0.85}>
                <Text style={styles.reloadPillText}>Tải lại</Text>
              </TouchableOpacity>
            </View>

            {channelError ? <Text style={styles.errorText}>{channelError}</Text> : null}

            {loadingChannels ? (
              <View style={styles.loadingWrap}>
                <Text style={styles.connectionText}>Đang tải kênh TikTok...</Text>
              </View>
            ) : channels.length ? (
              <View style={styles.channelList}>
                {channels.map((channel) => (
                  <View key={channel.id} style={styles.channelItem}>
                    <View style={styles.channelAvatar}>
                      <Text style={styles.channelAvatarText}>
                        {channel.username.slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.channelMeta}>
                      <View style={styles.channelTitleRow}>
                        <Text style={styles.channelName}>@{channel.username}</Text>
                        {channel.isDefault ? (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Mặc định</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.channelSub}>Kênh TikTok đã liên kết</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Chưa có kênh TikTok nào.</Text>
                <Text style={styles.emptyHint}>Danh sách sẽ hiển thị khi backend trả về dữ liệu kênh.</Text>
              </View>
            )}
          </View>

          <View style={styles.settingsContainer}>
            {settingGroups.map((group, groupIndex) => (
              <View key={groupIndex} style={styles.settingsGroupWrap}>
                <View style={styles.settingsGroup}>
                  {group.map((item) => (
                    <SettingItem key={item.label} icon={item.icon} label={item.label} />
                  ))}
                </View>
                <View style={styles.divider} />
              </View>
            ))}
            <TouchableOpacity activeOpacity={0.7} style={styles.settingItem} onPress={logout}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconBox}>
                  <Text style={styles.settingIcon}>↗</Text>
                </View>
                <Text style={styles.settingText}>Đăng xuất</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SocialButton({ label }: { label: string }) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.socialButton}>
      <Text style={styles.socialIcon}>{label}</Text>
    </TouchableOpacity>
  );
}

function SettingItem({ icon, label }: { icon: string; label: string }) {
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconBox}>
          <Text style={styles.settingIcon}>{icon}</Text>
        </View>
        <Text style={styles.settingText}>{label}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.neutral100,
  },
  container: {
    paddingBottom: 40,
  },
  hero: {
    minHeight: 360,
    overflow: "hidden",
  },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    width: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: colors.neutral900,
    lineHeight: 28,
    ...textPresets.fs24_900,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral50,
  },
  roundButtonIcon: {
    color: colors.neutral900,
    fontSize: 20,
    fontWeight: "600",
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  avatarWrap: {
    width: 98,
    height: 98,
    borderRadius: 49,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: colors.neutral50,
  },
  avatar: {
    width: 98,
    height: 98,
    borderRadius: 49,
  },
  name: {
    width: 273,
    color: colors.neutral900,
    textAlign: "center",
    lineHeight: 24,
    ...textPresets.fs18_500,
  },
  nickname: {
    width: 273,
    color: "rgba(0,0,0,0.6)",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 4,
    ...textPresets.fs14_400,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 24,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral100,
  },
  socialIcon: {
    color: colors.neutral900,
    fontSize: 22,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  subscriptionCard: {
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border10,
    backgroundColor: colors.neutral100,
    ...shadows.sd2,
  },
  subscriptionInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  appIconText: {
    color: colors.neutral100,
    fontSize: 22,
    fontWeight: "800",
  },
  subscriptionTextWrap: {
    flex: 1,
    gap: 2,
  },
  subscriptionTitle: {
    color: colors.neutral900,
    lineHeight: 22,
    ...textPresets.fs14_500,
  },
  subscriptionSubtitle: {
    color: colors.neutral400,
    lineHeight: 22,
    ...textPresets.fs14_400,
  },
  chevron: {
    color: colors.neutral900,
    fontSize: 28,
    lineHeight: 28,
    fontWeight: "300",
  },
  upgradeButton: {
    height: 40,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeText: {
    color: colors.neutral900,
    lineHeight: 22,
    ...textPresets.fs14_500,
  },
  tiktokCard: {
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border10,
    backgroundColor: colors.neutral100,
    ...shadows.sd1,
  },
  tiktokHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  tiktokHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  reloadPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.neutral50,
    borderWidth: 0.5,
    borderColor: colors.border10,
  },
  reloadPillText: {
    color: colors.neutral900,
    ...textPresets.fs12_400,
  },
  cardLabel: {
    color: colors.neutral900,
    lineHeight: 22,
    ...textPresets.fs14_500,
  },
  connectionText: {
    color: colors.neutral400,
    lineHeight: 20,
    marginTop: 2,
    ...textPresets.fs12_400,
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  errorText: {
    color: "#d92d20",
    ...textPresets.fs12_400,
  },
  channelList: {
    gap: 10,
  },
  channelItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.neutral50,
    borderRadius: 12,
  },
  channelAvatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#010101",
    alignItems: "center",
    justifyContent: "center",
  },
  channelAvatarText: {
    color: colors.neutral100,
    ...textPresets.fs16_500,
  },
  channelMeta: {
    flex: 1,
    gap: 2,
  },
  channelTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  channelName: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  defaultBadgeText: {
    color: colors.neutral100,
    ...textPresets.fs11_400,
  },
  channelSub: {
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
  emptyState: {
    paddingVertical: 16,
    alignItems: "center",
    gap: 4,
  },
  emptyText: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  emptyHint: {
    color: colors.neutral400,
    textAlign: "center",
    ...textPresets.fs12_400,
  },
  settingsContainer: {
    gap: 16,
  },
  settingsGroupWrap: {
    gap: 16,
  },
  settingsGroup: {
    gap: 0,
  },
  settingItem: {
    minHeight: 48,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  settingIconBox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  settingIcon: {
    color: colors.neutral900,
    fontSize: 18,
    fontWeight: "600",
  },
  settingText: {
    flex: 1,
    color: colors.neutral900,
    lineHeight: 22,
    ...textPresets.fs14_400,
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.border10,
  },
}));
