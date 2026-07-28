import { Ionicons } from "@expo/vector-icons";
import { AnimatedErrorText } from "@components/animated-error-text";
import { Header } from "@components/header";
import { LinearGradient } from "@components/linear-gradient";
import { useChangePassword } from "@features/settings/hooks/use-change-password";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { useState } from "react";
import { Controller } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ChangePasswordScreen() {
  const { colors, textPresets } = useThemes();
  const { control, isDirty, isSubmitting, submit } = useChangePassword();
  const { bottom } = useSafeAreaInsets();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Header title="Thay đổi mật khẩu" transparent />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={[{ color: colors.neutral400 }, textPresets.fs14_400]}>
              Mật khẩu hiện tại
            </Text>
            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { onChange, value, onBlur }, fieldState: { isDirty: fd, error } }) => (
                <>
                  <View style={[styles.inputBox, { borderColor: colors.border10 }]}>
                    <TextInput
                      style={[styles.inputText, { color: colors.neutral900 }, textPresets.fs14_400]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showCurrent}
                      placeholder="Nhập mật khẩu hiện tại"
                      placeholderTextColor={colors.neutral400}
                      autoCapitalize="none"
                    />
                    <Pressable onPress={() => setShowCurrent((v) => !v)} hitSlop={8}>
                      <Ionicons
                        name={showCurrent ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={colors.neutral400}
                      />
                    </Pressable>
                  </View>
                  <AnimatedErrorText message={fd && error ? error.message : undefined} />
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={[{ color: colors.neutral400 }, textPresets.fs14_400]}>
              Mật khẩu mới
            </Text>
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, value, onBlur }, fieldState: { isDirty: fd, error } }) => (
                <>
                  <View style={[styles.inputBox, { borderColor: colors.border10 }]}>
                    <TextInput
                      style={[styles.inputText, { color: colors.neutral900 }, textPresets.fs14_400]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showNew}
                      placeholder="Nhập mật khẩu mới"
                      placeholderTextColor={colors.neutral400}
                      autoCapitalize="none"
                    />
                    <Pressable onPress={() => setShowNew((v) => !v)} hitSlop={8}>
                      <Ionicons
                        name={showNew ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={colors.neutral400}
                      />
                    </Pressable>
                  </View>
                  <AnimatedErrorText message={fd && error ? error.message : undefined} />
                </>
              )}
            />
            <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400]}>
              Tối thiểu 6 ký tự, chỉ gồm chữ cái và chữ số.
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={[{ color: colors.neutral400 }, textPresets.fs14_400]}>
              Xác nhận mật khẩu mới
            </Text>
            <Controller
              control={control}
              name="confirmNewPassword"
              render={({ field: { onChange, value, onBlur }, fieldState: { isDirty: fd, error } }) => (
                <>
                  <View style={[styles.inputBox, { borderColor: colors.border10 }]}>
                    <TextInput
                      style={[styles.inputText, { color: colors.neutral900 }, textPresets.fs14_400]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirm}
                      placeholder="Nhập lại mật khẩu mới"
                      placeholderTextColor={colors.neutral400}
                      autoCapitalize="none"
                    />
                    <Pressable onPress={() => setShowConfirm((v) => !v)} hitSlop={8}>
                      <Ionicons
                        name={showConfirm ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={colors.neutral400}
                      />
                    </Pressable>
                  </View>
                  <AnimatedErrorText message={fd && error ? error.message : undefined} />
                </>
              )}
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottom + 8, borderTopColor: colors.border10 }]}>
        <TouchableOpacity
          onPress={submit}
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
              <Text style={[{ color: colors.neutral900 }, textPresets.fs16_500]}>Xác nhận</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = createStyles(({ colors, shadows }) => ({
  root: { flex: 1 },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 20,
    backgroundColor: colors.white,
    ...shadows.sd2,
  },
  field: { gap: 8 },
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
}));
