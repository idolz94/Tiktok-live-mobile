import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "@components/linear-gradient";
import { AnimatedErrorText } from "@components/animated-error-text";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@components/toast";
import { useThemes } from "@hooks/use-theme";
import { useAuth } from "@features/auth/hooks/use-auth";
import { HairlineWidth } from "@themes";
import { createStyles } from "@utils/createStyles";
import { useCallback, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { RegisterForm, RegisterSchema } from "@features/auth/schemas";

export const Register = () => {
  const { colors, textPresets } = useThemes();
  const { register } = useAuth();
  const toast = useToast();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const formMethod = useForm<RegisterForm>({
    mode: "onChange",
    defaultValues: {
      password: "",
      username: "",
      fullName: "",
      tiktokId: "",
      agreePolicy: false,
    },
    resolver: zodResolver(RegisterSchema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const submit = useCallback(() => {
    formMethod.handleSubmit(async ({ username: phone, password, fullName, tiktokId }) => {
      setIsLoading(true);
      try {
        await register({
          username: phone.trim(),
          password,
          fullName: fullName.trim(),
          tiktokId: tiktokId.trim().replace(/^@/, ""),
        });
      } catch (error) {
        toast.error({
          title: "Đăng ký thất bại",
          description: error instanceof Error ? error.message : "Đã có lỗi xảy ra",
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [formMethod, register, toast]);

  return (
    <FormProvider {...formMethod}>
      <View style={{ rowGap: 20 }}>
        <View style={{ rowGap: 8 }}>
          <Text style={styles.label}>Họ và tên</Text>
          <View style={{ rowGap: 6 }}>
            <Controller
              control={formMethod.control}
              name="fullName"
              render={({
                field: { onChange, value, onBlur },
                fieldState: { invalid, isDirty, error },
              }) => {
                return (
                  <>
                    <View style={styles.inputWrap}>
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="none"
                        placeholder="Nhập tên của bạn"
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
                  </>
                );
              }}
            />
          </View>
        </View>
        <View style={{ rowGap: 8 }}>
          <Text style={styles.label}>Tên đăng nhập</Text>
          <View style={{ rowGap: 6 }}>
            <Controller
              control={formMethod.control}
              name="username"
              render={({
                field: { onChange, value, onBlur },
                fieldState: { invalid, isDirty, error },
              }) => {
                return (
                  <>
                    <View style={styles.inputWrap}>
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="default"
                        autoCapitalize="none"
                        placeholder="Nhập tên đăng nhập"
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
                  </>
                );
              }}
            />
          </View>
        </View>
        <View style={{ rowGap: 8 }}>
          <Text style={styles.label}>Mật khẩu</Text>
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
                    <Pressable onPress={() => setIsPasswordVisible((v) => !v)} hitSlop={8}>
                      <Ionicons
                        name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={colors.neutral400}
                      />
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
            <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400]}>
              Tối thiểu 6 ký tự, chỉ gồm chữ cái và chữ số.
            </Text>
          </View>
        </View>
        <View style={{ rowGap: 8 }}>
          <Text style={styles.label}>Tiktok ID</Text>
          <View style={{ rowGap: 6 }}>
            <Controller
              control={formMethod.control}
              name="tiktokId"
              render={({
                field: { onChange, value, onBlur },
                fieldState: { isDirty, error },
              }) => {
                return (
                  <>
                    <View style={styles.inputWrap}>
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="default"
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="@username"
                        placeholderTextColor={colors.neutral300}
                        style={styles.input}
                      />
                      {value.length > 0 && !error && (
                        <Text style={styles.check}>✓</Text>
                      )}
                    </View>
                    <AnimatedErrorText
                      message={isDirty && error ? error.message : undefined}
                    />
                  </>
                );
              }}
            />
          </View>
        </View>

        <Controller
          control={formMethod.control}
          name="agreePolicy"
          render={({ field: { onChange, value }, fieldState: { isDirty, error } }) => (
            <View style={{ rowGap: 6 }}>
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
              <AnimatedErrorText
                message={isDirty && !value && error ? error.message : undefined}
              />
            </View>
          )}
        />

        <Pressable
          style={[
            styles.submitButton,
            (!formMethod.formState.isValid || isLoading) && { opacity: 0.5 },
          ]}
          onPress={submit}
          disabled={!formMethod.formState.isValid || isLoading}
        >
          <LinearGradient type="gra_primary" style={StyleSheet.absoluteFill} />
          <Text style={styles.submitText}>
            {isLoading ? "Đang xử lý..." : "Đăng ký"}
          </Text>
        </Pressable>
      </View>
    </FormProvider>
  );
};

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
  submitButton: {
    paddingVertical: 16,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  submitText: { color: colors.neutral100, ...textPresets.fs16_500 },
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
