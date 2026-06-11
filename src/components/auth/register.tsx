import { useAuth as useClerkAuth, useSignUp } from "@clerk/clerk-expo";
import { LinearGradient } from "@components/linear-gradient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useThemes } from "@hooks/use-theme";
import { createTikTokChannelApi } from "@modules/auth/services/api";
import { HairlineWidth } from "@themes";
import { createStyles } from "@utils/createStyles";
import { useCallback, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { AnimatedStyleHandle } from "react-native-reanimated/lib/typescript/hook/commonTypes";
import { RegisterForm, RegisterSchema } from "src/schemas/auth";

type Props = {
  animatedStyle: AnimatedStyleHandle<{
    opacity: number;
  }>;
};

export const Register = ({ animatedStyle }: Props) => {
  const { colors } = useThemes();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const formMethod = useForm<RegisterForm>({
    mode: "all",
    defaultValues: {
      password: "",
      username: "",
      fullName: "",
      tiktokId: "",
      agreePolicy: false,
    },
    resolver: zodResolver(RegisterSchema),
  });

  const {
    signUp,
    setActive: signUpActive,
    isLoaded: isSignUpLoaded,
  } = useSignUp();
  const { signOut } = useClerkAuth();
  const [isLoading, setIsLoading] = useState(false);

  const submit = useCallback(() => {
    formMethod.handleSubmit(
      async ({ username: phone, password, fullName, tiktokId }) => {
        if (!isSignUpLoaded || !signUp) return;

        setIsLoading(true);
        try {
          const result = await signUp.create({
            username: phone.trim(),
            password,
            firstName: fullName.trim(),
            unsafeMetadata: {
              tiktokId: tiktokId.trim(),
            },
          });

          if (result.status === "complete") {
            await signUpActive({ session: result.createdSessionId });

            try {
              await createTikTokChannelApi({
                tiktokUsername: tiktokId.trim(),
                isDefault: true,
              });
            } catch (error) {
              console.warn(
                "[Register] Lỗi tạo TikTok channel ở backend:",
                error,
              );
              //@ts-ignore
              Alert.alert("Lỗi rồi!!", error?.message || "Có lỗi xảy ra");
            }
          } else {
            Alert.alert(
              "Yêu cầu xác minh",
              "Vui lòng hoàn tất xác minh tài khoản.",
            );
          }
        } catch (error: any) {
          const clerkErrors = error?.errors;
          if (clerkErrors?.length) {
            const firstErr = clerkErrors[0];
            let errMsg =
              firstErr.longMessage || firstErr.message || "Đăng ký thất bại";
            if (firstErr.code === "form_identifier_exists") {
              errMsg = "Tên đăng nhập này đã được sử dụng.";
            } else if (firstErr.code === "form_password_pwned") {
              errMsg = "Mật khẩu này đã bị lộ. Vui lòng sử dụng mật khẩu khác.";
            }
            Alert.alert("Đăng ký thất bại", errMsg);
          } else {
            Alert.alert(
              "Đăng ký thất bại",
              error instanceof Error ? error.message : "Đã có lỗi xảy ra",
            );
          }
        } finally {
          setIsLoading(false);
        }
      },
    )();
  }, [formMethod, signUp, signUpActive, signOut, isSignUpLoaded]);

  return (
    <FormProvider {...formMethod}>
      <Animated.View
        style={[StyleSheet.absoluteFill, animatedStyle, { rowGap: 20 }]}
      >
        <View style={{ rowGap: 8 }}>
          <Text style={styles.label}>Họ và tên</Text>
          <Controller
            control={formMethod.control}
            name="fullName"
            render={({
              field: { onChange, value },
              fieldState: { invalid },
            }) => {
              return (
                <View style={styles.inputWrap}>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    placeholder="Nhập tên của bạn"
                    placeholderTextColor={colors.neutral300}
                    style={styles.input}
                  />
                  {!invalid && value.length > 0 && (
                    <Text style={styles.check}>✓</Text>
                  )}
                </View>
              );
            }}
          />
        </View>
        <View style={{ rowGap: 8 }}>
          <Text style={styles.label}>Tên đăng nhập</Text>
          <Controller
            control={formMethod.control}
            name="username"
            render={({
              field: { onChange, value },
              fieldState: { invalid },
            }) => {
              return (
                <View style={styles.inputWrap}>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    placeholder="Nhập tên đăng nhập"
                    placeholderTextColor={colors.neutral300}
                    style={styles.input}
                  />
                  {!invalid && value.length > 0 && (
                    <Text style={styles.check}>✓</Text>
                  )}
                </View>
              );
            }}
          />
        </View>
        <View style={{ rowGap: 8 }}>
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.inputWrap}>
            <Controller
              control={formMethod.control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!isPasswordVisible}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={colors.neutral300}
                  style={styles.input}
                />
              )}
            />
            <Pressable onPress={() => setIsPasswordVisible((value) => !value)}>
              <Text style={styles.eye}>
                {isPasswordVisible ? "Ẩn" : "Hiện"}
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={{ rowGap: 8 }}>
          <Text style={styles.label}>Tiktok ID (tùy chọn)</Text>
          <Controller
            control={formMethod.control}
            name="tiktokId"
            render={({
              field: { onChange, value },
              fieldState: { invalid },
            }) => {
              return (
                <View style={styles.inputWrap}>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    placeholder="@username"
                    placeholderTextColor={colors.neutral300}
                    style={styles.input}
                  />
                  {!invalid && value.length > 0 && (
                    <Text style={styles.check}>✓</Text>
                  )}
                </View>
              );
            }}
          />
        </View>

        <Controller
          control={formMethod.control}
          name="agreePolicy"
          render={({ field: { onChange, value } }) => (
            <Pressable
              style={styles.rememberRow}
              onPress={() => onChange(!value)}
            >
              <View style={[styles.checkbox, value && styles.checkboxActive]}>
                {value ? <Text style={styles.checkboxText}>✓</Text> : null}
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.rememberText}>
                  Bấm nút đăng kí bạn đồng ý với{" "}
                  <Text style={styles.highLightText}>điều kiện</Text> và{" "}
                  <Text style={styles.highLightText}>điều khoản</Text> của chúng
                  tôi.
                </Text>
              </View>
            </Pressable>
          )}
        />

        <Pressable
          style={[
            styles.submitButton,
            !formMethod.formState.isValid && { opacity: 0.5 },
          ]}
          onPress={submit}
          disabled={isLoading}
        >
          <LinearGradient type="gra_primary" style={StyleSheet.absoluteFill} />
          <Text style={styles.submitText}>
            {isLoading ? "Đang xử lý..." : "Đăng ký"}
          </Text>
        </Pressable>
      </Animated.View>
    </FormProvider>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  flex: { flex: 1 },
  label: {
    color: colors.neutral900,
    ...textPresets.fs14_400,
  },
  inputWrap: {
    padding: 12,
    borderRadius: 8,
    borderWidth: HairlineWidth * 3,
    borderColor: colors.border10,
    backgroundColor: colors.neutral100,
    flexDirection: "row",
    alignItems: "center",
  },
  input: { flex: 1, color: colors.neutral900, ...textPresets.fs14_400 },
  check: { color: colors.success, ...textPresets.fs14_500 },
  eye: { color: colors.neutral900, ...textPresets.fs14_400 },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  submitText: { color: colors.neutral900, ...textPresets.fs16_500 },
  rememberRow: { flexDirection: "row", alignItems: "center", columnGap: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: { fontWeight: "900", color: colors.neutral100 },
  rememberText: { color: colors.neutral900, ...textPresets.fs14_400 },
  highLightText: {
    color: colors.primary,
    ...textPresets.fs14_500,
  },
}));
