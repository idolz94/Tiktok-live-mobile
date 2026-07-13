import { LinearGradient } from "@components/linear-gradient";
import { useEditProfile } from "@features/settings/hooks/use-edit-profile";
import { createStyles } from "@utils/createStyles";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemes } from "@hooks/use-theme";
import { images } from "@assets/images";

export function EditProfileScreen() {
  const { colors, textPresets } = useThemes();
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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.neutral50 }]}
      edges={["top", "left", "right", "bottom"]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.neutral100 }]}>
        <TouchableOpacity
          onPress={() => router.canGoBack() && router.back()}
          style={[styles.headerBtn, { backgroundColor: colors.neutral50 }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.backIcon, { color: colors.neutral900 }, textPresets.fs20_600]}>
            ‹
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.neutral900 }, textPresets.fs18_500]}>
          Chỉnh sửa hồ sơ
        </Text>
        {/* invisible spacer to balance title */}
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Thông tin */}
        <View style={[styles.section, { backgroundColor: colors.neutral100 }]}>
          <Text style={[styles.sectionTitle, { color: colors.neutral900 }, textPresets.fs16_500]}>
            Thông tin
          </Text>

          <View style={styles.fieldGroup}>
            {/* Shop name */}
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

            {/* Full name */}
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

            {/* Phone */}
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

        {/* Section break */}
        <View style={[styles.sectionBreak, { backgroundColor: colors.neutral50 }]} />

        {/* Mạng xã hội */}
        <View style={[styles.section, { backgroundColor: colors.neutral100 }]}>
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

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky footer */}
      <View
        style={[styles.footer, { backgroundColor: colors.neutral100, borderTopColor: colors.border10 }]}
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
    </SafeAreaView>
  );
}

const styles = createStyles(() => ({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    marginTop: -2,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 16,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  fieldGroup: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {},
  inputBox: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  inputText: {
    flex: 1,
  },
  sectionBreak: {
    height: 8,
  },
  footer: {
    borderTopWidth: 0.5,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  saveButton: {
    height: 56,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  socialBrandIcon: {
    width: 22,
    height: 22,
  },
  youtubeBadge: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: "#FF0000",
    alignItems: "center",
    justifyContent: "center",
  },
  youtubeBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
}));
