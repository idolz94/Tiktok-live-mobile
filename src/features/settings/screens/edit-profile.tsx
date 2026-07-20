import { LinearGradient } from "@components/linear-gradient";
import { useEditProfile } from "@features/settings/hooks/use-edit-profile";
import { createStyles } from "@utils/createStyles";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemes } from "@hooks/use-theme";
import { images } from "@assets/images";

export function EditProfileScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { colors, textPresets, shadows } = useThemes();
  const {
    fullName,
    phone,
    shopName,
    facebookUrl,
    tiktokUrl,
    youtubeUrl,
    setFullName,
    setPhone,
    setShopName,
    setFacebookUrl,
    setTiktokUrl,
    setYoutubeUrl,
    isDirty,
    isSubmitting,
    save,
  } = useEditProfile();

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Cài Đặt Chung</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Thông tin */}
        <View style={[styles.section, shadows.sd2]}>
          <Text style={[styles.sectionTitle, { color: colors.neutral900 }, textPresets.fs16_500]}>
            Thông tin
          </Text>

          <View style={styles.fieldGroup}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.neutral400 }, textPresets.fs14_400]}>
                Tên cửa hàng
              </Text>
              <View style={[styles.inputBox, { borderColor: colors.border10 }]}>
                <TextInput
                  style={[styles.inputText, { color: colors.neutral900 }, textPresets.fs14_400]}
                  value={shopName}
                  onChangeText={setShopName}
                  placeholder="Nhập tên cửa hàng"
                  placeholderTextColor={colors.neutral400}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.neutral400 }, textPresets.fs14_400]}>
                Họ và tên
              </Text>
              <View style={[styles.inputBox, { borderColor: colors.border10 }]}>
                <TextInput
                  style={[styles.inputText, { color: colors.neutral900 }, textPresets.fs14_400]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={colors.neutral400}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.neutral400 }, textPresets.fs14_400]}>
                Điện thoại
              </Text>
              <View style={[styles.inputBox, { borderColor: colors.border10 }]}>
                <TextInput
                  style={[styles.inputText, { color: colors.neutral900 }, textPresets.fs14_400]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor={colors.neutral400}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Mạng xã hội */}
        <View style={[styles.section, shadows.sd2]}>
          <Text style={[styles.sectionTitle, { color: colors.neutral900 }, textPresets.fs16_500]}>
            Mạng xã hội
          </Text>

          <View style={styles.fieldGroup}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.neutral400 }, textPresets.fs14_400]}>
                Facebook
              </Text>
              <View style={[styles.inputBox, { borderColor: colors.border10 }]}>
                <TextInput
                  style={[styles.inputText, { color: colors.neutral900 }, textPresets.fs14_400]}
                  value={facebookUrl}
                  onChangeText={setFacebookUrl}
                  placeholder="facebook.com/yourprofile"
                  placeholderTextColor={colors.neutral400}
                  autoCapitalize="none"
                  keyboardType="url"
                  returnKeyType="next"
                />
                <Image source={images.logo_facebook} style={styles.socialBrandIcon} />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.neutral400 }, textPresets.fs14_400]}>
                Tiktok
              </Text>
              <View style={[styles.inputBox, { borderColor: colors.border10 }]}>
                <TextInput
                  style={[styles.inputText, { color: colors.neutral900 }, textPresets.fs14_400]}
                  value={tiktokUrl}
                  onChangeText={setTiktokUrl}
                  placeholder="tiktok.com/@yourprofile"
                  placeholderTextColor={colors.neutral400}
                  autoCapitalize="none"
                  keyboardType="url"
                  returnKeyType="next"
                />
                <Image source={images.logo_tiktok} style={styles.socialBrandIcon} />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.neutral400 }, textPresets.fs14_400]}>
                Youtube
              </Text>
              <View style={[styles.inputBox, { borderColor: colors.border10 }]}>
                <TextInput
                  style={[styles.inputText, { color: colors.neutral900 }, textPresets.fs14_400]}
                  value={youtubeUrl}
                  onChangeText={setYoutubeUrl}
                  placeholder="youtube.com/@yourchannel"
                  placeholderTextColor={colors.neutral400}
                  autoCapitalize="none"
                  keyboardType="url"
                  returnKeyType="done"
                />
                <View style={styles.youtubeBadge}>
                  <Text style={styles.youtubeBadgeText}>▶</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.neutral100, borderTopColor: colors.border10, paddingBottom: Math.max(bottom, 16) },
        ]}
      >
        <TouchableOpacity
          onPress={() => { void save(); }}
          disabled={!isDirty || isSubmitting}
          activeOpacity={0.8}
        >
          <LinearGradient
            type="gra_primary"
            style={[styles.saveButton, (!isDirty || isSubmitting) && { opacity: 0.5 }]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[{ color: colors.neutral900 }, textPresets.fs16_500]}>Lưu</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = createStyles(({ colors }) => ({
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "300",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: colors.text,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 28,
  },
  headerRight: { width: 44, height: 44 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    gap: 12,
  },
  section: {
    borderRadius: 16,
    backgroundColor: colors.neutral100,
    overflow: "hidden",
    padding: 16,
  },
  sectionTitle: { marginBottom: 16 },
  fieldGroup: { gap: 20 },
  field: { gap: 8 },
  label: {},
  inputBox: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  inputText: { flex: 1 },
  footer: {
    borderTopWidth: 0.5,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  saveButton: {
    height: 56,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  socialBrandIcon: { width: 22, height: 22 },
  youtubeBadge: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: "#FF0000",
    alignItems: "center",
    justifyContent: "center",
  },
  youtubeBadgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
}));
