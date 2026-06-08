import { HairlineWidth } from "@themes";
import { createStyles } from "@utils/createStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRegister } from "@modules/auth/hooks/use-register";
import { RegisterForm, RegisterSchema } from "@app-types/auth";
import Animated from "react-native-reanimated";
import { AnimatedStyleHandle } from "react-native-reanimated/lib/typescript/hook/commonTypes";
import { useThemes } from "@hooks/use-theme";
import { LinearGradient } from "@components/linear-gradient";

type Props = {
  onRegisterSuccess: () => void;
  animatedStyle: AnimatedStyleHandle<{
    opacity: number;
  }>;
};

export const Register = ({ onRegisterSuccess, animatedStyle }: Props) => {
  const { colors } = useThemes();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const formMethod = useForm<RegisterForm>({
    mode: "all",
    defaultValues: {
      password: "",
      phone: "",
      fullName: "",
      tiktokId: "",
      agreePolicy: false,
    },
    resolver: zodResolver(RegisterSchema),
  });

  const { handleRegister, isLoading } = useRegister(onRegisterSuccess);

  const submit = useCallback(() => {
    formMethod.handleSubmit(handleRegister)();
  }, [formMethod, handleRegister]);

  return (
    <FormProvider {...formMethod}>
      <Animated.View
        style={[StyleSheet.absoluteFill, animatedStyle, { rowGap: 20 }]}
      >
        <View style={{ rowGap: 8 }}>
          <Text style={styles.label}>Họ và tên</Text>
          <View style={styles.inputWrap}>
            <Controller
              control={formMethod.control}
              name="fullName"
              render={({ field: { onChange, value } }) => {
                return (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    placeholder="Nhập tên của bạn"
                    placeholderTextColor={colors.neutral300}
                    style={styles.input}
                  />
                );
              }}
            />
            <Text style={styles.check}>✓</Text>
          </View>
        </View>
        <View style={{ rowGap: 8 }}>
          <Text style={styles.label}>Số điện thoại</Text>
          <View style={styles.inputWrap}>
            <Controller
              control={formMethod.control}
              name="phone"
              render={({ field: { onChange, value } }) => {
                return (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    placeholder="Nhập số điện thoại"
                    placeholderTextColor={colors.neutral300}
                    style={styles.input}
                  />
                );
              }}
            />
            <Text style={styles.check}>✓</Text>
          </View>
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
          <View style={styles.inputWrap}>
            <Controller
              control={formMethod.control}
              name="tiktokId"
              render={({ field: { onChange, value } }) => {
                return (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    placeholder="@username"
                    placeholderTextColor={colors.neutral300}
                    style={styles.input}
                  />
                );
              }}
            />
            <Text style={styles.check}>✓</Text>
          </View>
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
              <Text style={styles.rememberText}>
                Bấm nút đăng kí bạn đồng ý với{" "}
                <Text style={styles.highLightText}>điều kiện</Text> và{" "}
                <Text style={styles.highLightText}>điều khoản</Text> của chúng
                tôi.
              </Text>
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
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
  },
  input: { flex: 1, color: colors.neutral900, ...textPresets.fs14_400 },
  check: { color: colors.greenSuccess, ...textPresets.fs18_900 },
  eye: { color: colors.primaryDark, ...textPresets.fs14_400 },
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
