import { images } from "@assets/images";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { Image } from "@components/image";
import { LinearGradient } from "@components/linear-gradient";
import { Separator } from "@components/separator";
import { AnimatedErrorText } from "@components/animated-error-text";
import { useAuth } from "@features/auth/hooks/use-auth";
import { LoginForm, LoginSchema } from "@features/auth/schemas";
import { useAuthStore } from "@features/auth/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useThemes } from "@hooks/use-theme";
import { HairlineWidth } from "@themes";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useEffect, useState } from "react";
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
import { ForgotPass } from "./forgot-pass";

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
  {
    type: "phone",
    icon: images.logo_phone,
  },
] as const;

type Props = {
  switchToRegister: () => void;
  animatedStyle: AnimatedStyleHandle<{
    opacity: number;
  }>;
};

export const Login = memo(({ switchToRegister, animatedStyle }: Props) => {
  const { login } = useAuth();
  const { colors } = useThemes();
  const { show, hide } = useBottomSheet();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const { isRemembered, lastUsername } = useAuthStore();

  const formMethod = useForm<LoginForm>({
    mode: "onChange",
    defaultValues: {
      username: lastUsername || "",
      password: "",
      remember: isRemembered ?? false,
    },
    resolver: zodResolver(LoginSchema),
  });

  useEffect(() => {
    formMethod.reset({
      username: lastUsername || "",
      password: "",
      remember: isRemembered ?? false,
    });
  }, [lastUsername, isRemembered]);

  const handleSocialLogin = (
    _type: "phone" | "facebook" | "tiktok" | "zalo",
  ) => {};

  const forgotPass = () =>
    show({
      content: <ForgotPass onClose={hide} />,
      showDragIndicator: false,
    });

  const submit = useCallback(() => {
    formMethod.handleSubmit(async ({ username, password, remember }) => {
      setLoading(true);
      try {
        await login({
          username: username.trim(),
          password,
          remember,
        });
      } catch (error: any) {
        Alert.alert(
          "Đăng nhập thất bại",
          error?.response?.data?.message ||
            error?.message ||
            "Đã có lỗi xảy ra",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [formMethod, login]);

  return (
    <FormProvider {...formMethod}>
      <Animated.View style={[{ rowGap: 20 }, animatedStyle]}>
        <View style={{ rowGap: 8 }}>
          <Text style={styles.label}>Tài khoản</Text>
          <Controller
            control={formMethod.control}
            name="username"
            render={({
              field: { onChange, value, onBlur },
              fieldState: { invalid, isDirty, error },
            }) => {
              return (
                <View>
                  <View style={styles.inputWrap}>
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="default"
                      autoCapitalize="none"
                      placeholder="Nhập tài khoản"
                      placeholderTextColor={colors.neutral300}
                      style={styles.input}
                    />
                    {!invalid && value.length > 0 && (
                      <Text style={styles.check}>✓</Text>
                    )}
                  </View>
                  <AnimatedErrorText
                    message={isDirty && error ? error.message : undefined}
                  />
                </View>
              );
            }}
          />
        </View>

        <View style={{ rowGap: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.label}>Mật khẩu</Text>
            <Pressable onPress={forgotPass}>
              <Text style={styles.forgotPass}>Quên mật khẩu?</Text>
            </Pressable>
          </View>
          <View style={{ rowGap: 6 }}>
            <View style={styles.inputWrap}>
              <Controller
                control={formMethod.control}
                name="password"
                render={({ field: { onChange, value, onBlur } }) => (
                  <>
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!isPasswordVisible}
                      placeholder="Nhập mật khẩu"
                      placeholderTextColor={colors.neutral300}
                      style={styles.input}
                    />
                    <Pressable onPress={() => setIsPasswordVisible((v) => !v)}>
                      <Text style={styles.eye}>
                        {isPasswordVisible ? "Ẩn" : "Hiện"}
                      </Text>
                    </Pressable>
                  </>
                )}
              />
            </View>
            <AnimatedErrorText
              message={
                formMethod.formState.dirtyFields.password && formMethod.formState.errors.password
                  ? formMethod.formState.errors.password.message
                  : undefined
              }
            />
          </View>
        </View>

        <Controller
          control={formMethod.control}
          name="remember"
          render={({ field: { onChange, value } }) => (
            <Pressable
              style={styles.rememberRow}
              onPress={() => onChange(!value)}
            >
              <View style={[styles.checkbox, value && styles.checkboxActive]}>
                {value ? <Text style={styles.checkboxText}>✓</Text> : null}
              </View>
              <Text style={styles.rememberText}>Lưu đăng nhập</Text>
            </Pressable>
          )}
        />
        <Pressable
          style={[
            styles.submitButton,
            (!formMethod.formState.isValid || loading) && { opacity: 0.5 },
          ]}
          onPress={submit}
          disabled={!formMethod.formState.isValid || loading}
        >
          <LinearGradient type="gra_primary" style={StyleSheet.absoluteFill} />
          <Text style={styles.submitText}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Text>
        </Pressable>
        <View style={styles.dividerRow}>
          <Separator type="horizontal" size={1} containerStyle={styles.flex} />
          <Text style={styles.dividerText}>Tư vấn</Text>
          <Separator type="horizontal" size={1} containerStyle={styles.flex} />
        </View>
        <View style={styles.socialLoginContainer}>
          {socialLogins.map((item) => (
            <Pressable
              key={item.type}
              style={styles.socialItemContainer}
              onPress={() => handleSocialLogin(item.type)}
            >
              <Image source={item.icon} style={styles.socialImg} />
            </Pressable>
          ))}
        </View>
        <View
          style={{
            paddingTop: 21,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={styles.registerText}>Bạn chưa có tài khoản?</Text>
          <Pressable onPress={switchToRegister}>
            <Text style={styles.registerTextNav}>{` Đăng ký ngay!`}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </FormProvider>
  );
});

const styles = createStyles(({ colors, textPresets }) => ({
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
  eye: { color: colors.primary, ...textPresets.fs14_400 },
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
  submitButton: {
    paddingVertical: 16,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  submitText: { color: colors.neutral900, ...textPresets.fs16_500 },
  forgotPass: {
    color: colors.neutral900,
    ...textPresets.fs14_400,
  },
  flex: { flex: 1 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
    paddingTop: 4,
  },
  dividerText: {
    color: colors.neutral900,
    ...textPresets.fs12_500,
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
  },
  socialImg: {
    width: 24,
    height: 24,
  },
  registerText: {
    color: colors.neutral900,
    ...textPresets.fs14_400,
    textAlign: "center",
  },
  registerTextNav: {
    color: colors.primary,
  },
}));
