import { LoginForm, LoginSchema } from "@app-types/auth";
import { images } from "@assets/images";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { Image } from "@components/image";
import { LinearGradient } from "@components/linear-gradient";
import { Separator } from "@components/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useThemes } from "@hooks/use-theme";
import { useAuthStore } from "@stores/auth";
import { HairlineWidth } from "@themes";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useState } from "react";
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
  const { login } = useAuthStore();
  const { colors } = useThemes();
  const { show, hide } = useBottomSheet();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const formMethod = useForm<LoginForm>({
    mode: "all",
    defaultValues: {
      phone: "",
      password: "",
      remember: false,
    },
    resolver: zodResolver(LoginSchema),
  });

  const handleSocialLogin = (
    type: "phone" | "facebook" | "tiktok" | "zalo",
  ) => {};

  const forgotPass = () =>
    show({
      content: <ForgotPass onClose={hide} />,
      showDragIndicator: false,
    });

  const submit = useCallback(() => {
    formMethod.handleSubmit(async ({ phone, password, remember }) => {
      setLoading(true);
      const result = await login({ phone, password, remember });
      setLoading(false);
      if (!result.ok) {
        Alert.alert("Đăng nhập thất bại", result.message || "Đã có lỗi xảy ra");
      }
    })();
  }, [formMethod, login]);

  return (
    <FormProvider {...formMethod}>
      <Animated.View style={[{ rowGap: 20 }, animatedStyle]}>
        <View style={{ rowGap: 8 }}>
          <Text style={styles.label}>Số điện thoại</Text>
          <Controller
            control={formMethod.control}
            name="phone"
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
                    placeholder="Nhập số điện thoại"
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
          disabled={loading}
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
