import { HairlineWidth } from "@themes";
import { createStyles } from "@utils/createStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRegister } from "@modules/auth/hooks/use-register";
import { RegisterForm, RegisterSchema } from "@app-types/auth";

export const Register = ({
  onRegisterSuccess,
}: {
  onRegisterSuccess: () => void;
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const formMethod = useForm<RegisterForm>({
    mode: "all",
    defaultValues: {
      password: "",
      phone: "",
      fullName: "",
      tiktokId: "",
    },
    resolver: zodResolver(RegisterSchema),
  });

  const { handleRegister, isLoading } = useRegister(onRegisterSuccess);

  const submit = useCallback(() => {
    formMethod.handleSubmit(handleRegister)();
  }, [formMethod, handleRegister]);

  return (
    <FormProvider {...formMethod}>
      <View style={{ rowGap: 8 }}>
        <Text style={styles.label}>Tên của bạn</Text>
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
      <View style={{ rowGap: 8 }}>
        <Text style={styles.label}>Tiktok ID</Text>
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
                  placeholder="Nhập tiktok id"
                  style={styles.input}
                />
              );
            }}
          />
          <Text style={styles.check}>✓</Text>
        </View>
      </View>

      <Pressable
        style={[
          styles.submitButton,
          !formMethod.formState.isValid && { opacity: 0.5 },
        ]}
        onPress={submit}
        disabled={isLoading}
      >
        {
          <Text style={styles.submitText}>
            {isLoading ? "ĐANG XỬ LÝ..." : "TẠO TÀI KHOẢN"}
          </Text>
        }
      </Pressable>
    </FormProvider>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  flex: { flex: 1 },
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
  submitButton: {
    paddingVertical: 14,
    borderRadius: 13,
    backgroundColor: colors.warningAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: colors.text, ...textPresets.fs17_800 },
}));
