import { LinearGradient } from "@components/linear-gradient";
import { icons } from "@assets/icons";
import { images } from "@assets/images";
import { useAuth } from "@features/auth/hooks/use-auth";
import { createStyles } from "@utils/createStyles";
import { router } from "expo-router";
import { useRef } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabScrollToTop } from "@hooks/use-tab-scroll-to-top";
import { useToast } from "@components/toast";

const AVATAR_URL =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&q=80";

const settingGroups: {
  icon: ImageSourcePropType;
  label: string;
  onPress?: () => void;
}[][] = [
  [
    {
      icon: images.logo_tiktok,
      label: "Quản lý kênh Tiktok",
      onPress: () => router.push("/manage-tiktok-channel"),
    },
    { icon: images.logo_facebook, label: "Quản lý kênh Facebook" },
  ],
  [
    {
      icon: icons.settings,
      label: "Cài đặt chung",
      onPress: () => router.push("/edit-profile"),
    },
    {
      icon: icons.clipboard_check,
      label: "Cài đặt thông tin SP trước Live",
      onPress: () => router.push("/product-info-setup"),
    },
    {
      icon: icons.print,
      label: "Cài đặt máy in",
      onPress: () => router.push("/printer-settings"),
    },
    {
      icon: icons.truck,
      label: "Cấu hình vận chuyển",
      onPress: () => router.push("/shipping-settings"),
    },
    {
      icon: icons.settings,
      label: "Thay đổi mật khẩu",
      onPress: () => router.push("/change-password"),
    },
  ],
];

const socialLogins = [
  {
    type: "facebook",
    icon: images.logo_facebook,
  },
  {
    type: "tiktok",
    icon: images.logo_tiktok,
  },
  {
    type: "zalo",
    icon: images.logo_zalo,
  },
] as const;

export default function SettingsTab() {
  const { user, logout } = useAuth();
  const { top } = useSafeAreaInsets();

  const scrollRef = useRef<ScrollView>(null);

  useTabScrollToTop("settings", scrollRef);

  const username = user?.fullName || user?.username || "User";

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <Text style={styles.headerTitle}>Cài Đặt Chung</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
          </View>
          <Text style={styles.name}>{username}</Text>

          <View style={styles.socialLoginContainer}>
            {socialLogins.map((item) => (
              <Pressable
                key={item.type}
                style={styles.socialItemContainer}
                onPress={() => {}}
              >
                <Image source={item.icon} style={styles.socialImg} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.subscriptionCard}>
            <Pressable style={styles.subscriptionInfoRow} onPress={() => router.push("/license-plans")}>
              <LinearGradient type="gra_primary" style={styles.appIcon}>
                <Text style={styles.appIconText}>▣</Text>
              </LinearGradient>
              <View style={styles.subscriptionTextWrap}>
                <Text style={styles.subscriptionTitle}>Gói Lumi Live Mini</Text>
                <Text style={styles.subscriptionSubtitle}>1172-2700 đơn</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/license-plans")}>
              <LinearGradient type="gra_primary" style={styles.upgradeButton}>
                <Text style={styles.upgradeText}>Xem các gói</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.settingsContainer}>
            {settingGroups.map((group, groupIndex) => (
              <View key={groupIndex}>
                {groupIndex > 0 && <View style={styles.itemDivider} />}
                <View style={styles.settingsGroup}>
                  {group.map((item) => (
                    <View key={item.label}>
                      <SettingItem
                        icon={item.icon}
                        label={item.label}
                        onPress={item.onPress}
                      />
                    </View>
                  ))}
                </View>
              </View>
            ))}
            <View style={styles.itemDivider} />
            <View style={styles.settingsGroup}>
              <Pressable style={styles.settingItem} onPress={() => { void logout(); }}>
                <View style={styles.settingLeft}>
                  <Image
                    source={icons.disconnect}
                    style={styles.settingIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.settingText}>Đăng xuất</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
  const toast = useToast();

  const _onPress = () => {
    if (typeof onPress === "function") {
      onPress();
    } else {
      toast.info("Tính năng đang được phát triển!");
    }
  };

  const inner = (
    <View style={styles.settingLeft}>
      <Image source={icon} style={styles.settingIcon} resizeMode="contain" />
      <Text style={styles.settingText}>{label}</Text>
    </View>
  );
  if (!_onPress) {
    return (
      <View style={styles.settingItem}>
        {inner}
        <Text style={styles.chevron}>›</Text>
      </View>
    );
  }
  return (
    <Pressable style={styles.settingItem} onPress={_onPress}>
      {inner}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  root: { flex: 1 },
  bg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  header: {
    minHeight: 119,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 28,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 16,
  },
  profileCard: {
    alignItems: "center",
    padding: 16,
    gap: 16,
    borderRadius: 16,
    backgroundColor: colors.neutral100,
    ...shadows.sd2,
  },
  avatarWrap: {
    width: 98,
    height: 98,
    borderRadius: 49,
    overflow: "hidden",
    backgroundColor: colors.neutral50,
  },
  avatar: {
    width: 98,
    height: 98,
    borderRadius: 49,
  },
  name: {
    color: colors.neutral900,
    textAlign: "center",
    lineHeight: 24,
    ...textPresets.fs18_500,
  },
  content: {
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
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeText: {
    color: colors.neutral900,
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
    gap: 12,
  },
  settingsGroup: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.neutral100,
  },
  itemDivider: {
    height: 0.5,
    backgroundColor: colors.border10,
    marginLeft: 16 + 24 + 16,
  },
  settingItem: {
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
    gap: 16,
  },
  settingIcon: {
    width: 24,
    height: 24,
  },
  settingText: {
    color: colors.neutral900,
    ...textPresets.fs14_400,
  },
  chevron: {
    color: colors.neutral400,
    ...textPresets.fs18_500,
  },
  socialLoginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
    columnGap: 16,
  },
  socialItemContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border10,
    backgroundColor: colors.white,
  },
  socialImg: {
    width: 24,
    height: 24,
  },
}));
