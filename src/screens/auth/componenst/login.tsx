import { useAuthStore } from "@/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { HairlineWidth } from "@themes";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { LoginForm, LoginSchema } from "../type";

export const Login = memo(() => {
  const { login } = useAuthStore();

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
                style={styles.input}
              />
            )}
          />
          <Pressable onPress={() => setIsPasswordVisible((value) => !value)}>
            <Text style={styles.eye}>{isPasswordVisible ? "Ẩn" : "Hiện"}</Text>
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
      <View style={{ rowGap: 8 }}>
        <Pressable
          style={[
            styles.submitButton,
            (!formMethod.formState.isValid || loading) && { opacity: 0.5 },
          ]}
          onPress={submit}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
          </Text>
        </Pressable>
        <Pressable onPress={() => {}}>
          <Text style={styles.forgotPass}>Quên mật khẩu?</Text>
        </Pressable>
      </View>
    </FormProvider>
  );
});

const styles = createStyles(({ colors, textPresets }) => ({
  label: {
    color: colors.text,
    ...textPresets.fs16_900,
  },
  inputWrap: {
    padding: 12,
    borderRadius: 13,
    borderWidth: HairlineWidth * 3,
    borderColor: colors.text,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
  },
  input: { flex: 1, color: colors.text, ...textPresets.fs18_700 },
  check: { color: colors.greenSuccess, ...textPresets.fs18_900 },
  eye: { color: colors.primaryDark, ...textPresets.fs18_900 },
  rememberRow: { flexDirection: "row", alignItems: "center", columnGap: 10 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.warningAlt,
    borderColor: colors.warningAlt,
  },
  checkboxText: { fontWeight: "900", color: colors.text },
  rememberText: { color: colors.text, ...textPresets.fs15_400 },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 13,
    backgroundColor: colors.warningAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: colors.text, ...textPresets.fs17_800 },
  forgotPass: {
    color: colors.primaryDark,
    ...textPresets.fs15_400,
  },
}));
