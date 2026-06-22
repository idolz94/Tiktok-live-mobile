import { LinearGradient } from "@components/linear-gradient";
import { icons } from "@assets/icons";
import { images } from "@assets/images";
import { useAuth } from "@features/auth/hooks/use-auth";
import { createStyles } from "@utils/createStyles";
import { router } from "expo-router";
import { Image, ImageSourcePropType, ScrollView, Text, TouchableOpacity, View } from "react-native";

const AVATAR_URL = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&q=80";

const settingGroups: { icon: ImageSourcePropType; label: string; onPress?: () => void }[][] = [
  [
    { icon: images.logo_tiktok, label: "Quản lý kênh Tiktok", onPress: () => router.push("/(sheets)/tiktok-channels") },
    { icon: images.logo_facebook, label: "Quản lý kênh Facebook" },
  ],
  [
    { icon: icons.settings, label: "Cài đặt chung" },
    {
      icon: icons.clipboard_check,
      label: "Cài đặt thông tin SP trước Live",
      onPress: () => router.push("/product-info-setup"),
    },
    { icon: icons.print, label: "Cài đặt máy in", onPress: () => router.push("/printer-settings") },
    { icon: icons.truck, label: "Cấu hình vận chuyển", onPress: () => router.push("/shipping-settings") },
  ],
  [
    { icon: icons.group_user, label: "Ngôn ngữ" },
    { icon: icons.plus_circle, label: "Hỗ trợ" },
  ],
];

export default function SettingsTab() {
  const { user, logout } = useAuth();

  const username = user?.fullName || user?.username || "User";
  const accountName = user?.username || user?.phone || "Lumi Live";

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
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

          <View style={styles.settingsContainer}>
            {settingGroups.map((group, groupIndex) => (
              <View key={groupIndex} style={styles.settingsGroupWrap}>
                <View style={styles.settingsGroup}>
                  {group.map((item) => (
                    <SettingItem key={item.label} icon={item.icon} label={item.label} onPress={item.onPress} />
                  ))}
                </View>
                <View style={styles.divider} />
              </View>
            ))}
            <TouchableOpacity activeOpacity={0.7} style={styles.settingItem} onPress={logout}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconBox}>
                  <Image source={icons.disconnect} style={styles.settingIcon} resizeMode="contain" />
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

function SettingItem({
  icon,
  label,
  onPress,
}: {
  icon: ImageSourcePropType;
  label: string;
  onPress?: () => void;
}) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper activeOpacity={0.7 as never} style={styles.settingItem} onPress={onPress as never}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconBox}>
          <Image source={icon} style={styles.settingIcon} resizeMode="contain" />
        </View>
        <Text style={styles.settingText}>{label}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Wrapper>
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
    color: colors.neutral400,
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
  upgradeButton: {
    minWidth: 120,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeText: {
    color: colors.neutral100,
    ...textPresets.fs14_500,
  },
  tiktokCard: {
    backgroundColor: colors.neutral50,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: colors.border10,
  },
  tiktokHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  manageText: {
    color: colors.primary,
    fontWeight: "600",
  },
  manageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.neutral100,
    borderWidth: 0.5,
    borderColor: colors.border10,
    ...shadows.sd1,
  },
  manageTitle: {
    color: colors.neutral900,
    marginTop: 2,
    ...textPresets.fs14_500,
  },
  manageSubtitle: {
    color: colors.neutral400,
    marginTop: 2,
    ...textPresets.fs12_400,
  },
  cardLabel: {
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
  connectionText: {
    marginTop: 2,
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
  input: {
    borderWidth: 0.5,
    borderColor: colors.border10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.neutral900,
    backgroundColor: colors.neutral100,
    ...textPresets.fs14_400,
  },
  changeButton: {
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  changeButtonText: {
    color: colors.neutral100,
    ...textPresets.fs14_500,
  },
  serverText: {
    color: colors.neutral400,
    ...textPresets.fs11_400,
  },
  settingsContainer: {
    marginTop: 16,
    gap: 12,
  },
  settingsGroupWrap: {
    gap: 12,
  },
  settingsGroup: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.neutral100,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border10,
  },
  settingItem: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral100,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral50,
  },
  settingIcon: {
    width: 18,
    height: 18,
  },
  settingText: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  chevron: {
    color: colors.neutral400,
    ...textPresets.fs18_500,
  },
}));
