import { images } from "@assets/images";
import { Button } from "@components/button";
import { Header } from "@components/header";
import { LinearGradient } from "@components/linear-gradient";
import { useEditProfile } from "@features/settings/hooks/use-edit-profile";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Image, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function EditProfileScreen() {
  const { bottom } = useSafeAreaInsets();
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

      <Header title="Cài đặt chung" transparent />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Thông tin */}
        <View style={[styles.section, shadows.sd2]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.neutral900 },
              textPresets.fs16_500,
            ]}
          >
            Thông tin
          </Text>

          <View style={styles.fieldGroup}>
            <View style={styles.field}>
              <Text
                style={[
                  styles.label,
                  { color: colors.neutral400 },
                  textPresets.fs14_400,
                ]}
              >
                Tên cửa hàng
              </Text>
              <View style={[styles.inputBox, { borderColor: colors.border10 }]}>
                <TextInput
                  style={[
                    styles.inputText,
                    { color: colors.neutral900 },
                    textPresets.fs14_400,
                  ]}
                  value={shopName}
                  onChangeText={setShopName}
                  placeholder="Nhập tên cửa hàng"
                  placeholderTextColor={colors.neutral400}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text
                style={[
                  styles.label,
                  { color: colors.neutral400 },
                  textPresets.fs14_400,
                ]}
              >
                Họ và tên
              </Text>
              <View style={[styles.inputBox, { borderColor: colors.border10 }]}>
                <TextInput
                  style={[
                    styles.inputText,
                    { color: colors.neutral900 },
                    textPresets.fs14_400,
                  ]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={colors.neutral400}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text
                style={[
                  styles.label,
                  { color: colors.neutral400 },
                  textPresets.fs14_400,
                ]}
              >
                Điện thoại
              </Text>
              <View style={[styles.inputBox, { borderColor: colors.border10 }]}>
                <TextInput
                  style={[
                    styles.inputText,
                    { color: colors.neutral900 },
                    textPresets.fs14_400,
                  ]}
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
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.neutral900 },
              textPresets.fs16_500,
            ]}
          >
            Mạng xã hội
          </Text>

          <View style={styles.fieldGroup}>
            <View style={styles.field}>
              <Text
                style={[
                  styles.label,
                  { color: colors.neutral400 },
                  textPresets.fs14_400,
                ]}
              >
                Facebook
              </Text>
              <View style={[styles.inputBox, { borderColor: colors.border10 }]}>
                <TextInput
                  style={[
                    styles.inputText,
                    { color: colors.neutral900 },
                    textPresets.fs14_400,
                  ]}
                  value={facebookUrl}
                  onChangeText={setFacebookUrl}
                  placeholder="facebook.com/yourprofile"
                  placeholderTextColor={colors.neutral400}
                  autoCapitalize="none"
                  keyboardType="url"
                  returnKeyType="next"
                />
                <Image
                  source={images.logo_facebook}
                  style={styles.socialBrandIcon}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text
                style={[
                  styles.label,
                  { color: colors.neutral400 },
                  textPresets.fs14_400,
                ]}
              >
                Tiktok
              </Text>
              <View style={[styles.inputBox, { borderColor: colors.border10 }]}>
                <TextInput
                  style={[
                    styles.inputText,
                    { color: colors.neutral900 },
                    textPresets.fs14_400,
                  ]}
                  value={tiktokUrl}
                  onChangeText={setTiktokUrl}
                  placeholder="tiktok.com/@yourprofile"
                  placeholderTextColor={colors.neutral400}
                  autoCapitalize="none"
                  keyboardType="url"
                  returnKeyType="next"
                />
                <Image
                  source={images.logo_tiktok}
                  style={styles.socialBrandIcon}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text
                style={[
                  styles.label,
                  { color: colors.neutral400 },
                  textPresets.fs14_400,
                ]}
              >
                Youtube
              </Text>
              <View style={[styles.inputBox, { borderColor: colors.border10 }]}>
                <TextInput
                  style={[
                    styles.inputText,
                    { color: colors.neutral900 },
                    textPresets.fs14_400,
                  ]}
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
          {
            backgroundColor: colors.neutral100,
            borderTopColor: colors.border10,
            paddingBottom: Math.max(bottom, 16),
          },
        ]}
      >
        <Button
          type="gradient"
          title="Lưu"
          loading={isSubmitting}
          disabled={!isDirty}
          onPress={() => {
            void save();
          }}
        />
      </View>
    </View>
  );
}

const styles = createStyles(({ colors }) => ({
  root: { flex: 1 },
  bg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
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
