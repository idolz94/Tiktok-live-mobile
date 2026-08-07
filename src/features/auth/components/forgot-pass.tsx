import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatedErrorText } from "@components/animated-error-text";
import { Button } from "@components/button";
import { useToast } from "@components/toast";
import { useThemes } from "@hooks/use-theme";
import { HairlineWidth } from "@themes";
import { createStyles } from "@utils/createStyles";
import { useState } from "react";
import { Control, Controller, FormProvider, useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
import { ForgotPasswordForm, ForgotPasswordSchema } from "../schemas";
import { resetPasswordApi } from "../services/api";

const defaultValues: ForgotPasswordForm = {
  username: "",
  tiktokId: "",
  newPassword: "",
  confirmPassword: "",
};

type Props = {
  onClose: () => void;
};

export const ForgotPass = ({ onClose }: Props) => {
  const { colors } = useThemes();
  const toast = useToast();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const formMethod = useForm<ForgotPasswordForm>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: "onChange",
    defaultValues,
  });

  const submit = formMethod.handleSubmit(async (values) => {
    try {
      await resetPasswordApi({
        username: values.username.trim(),
        tiktokId: values.tiktokId.trim(),
        newPassword: values.newPassword,
      });
      toast.success({
        title: "Đổi mật khẩu thành công",
        description: "Vui lòng đăng nhập lại bằng mật khẩu mới.",
      });
      onClose();
    } catch (error) {
      toast.error({
        title: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    }
  });

  return (
    <FormProvider {...formMethod}>
      <View style={{ rowGap: 20 }}>
        <TextField
          control={formMethod.control}
          name="username"
          label="Tên đăng nhập"
          placeholder="Nhập tên đăng nhập"
        />

        <TextField
          control={formMethod.control}
          name="tiktokId"
          label="Tiktok ID"
          placeholder="@username"
          note="ID Tiktok chỉ có thể chứa chữ không dấu, số, dấu gạch dưới và dấu chấm."
        />

        <PasswordField
          control={formMethod.control}
          name="newPassword"
          label="Mật khẩu mới"
          placeholder="Nhập mật khẩu mới"
          isVisible={isPasswordVisible}
          onToggleVisible={() => setIsPasswordVisible((value) => !value)}
        />

        <PasswordField
          control={formMethod.control}
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu mới"
          isVisible={isConfirmPasswordVisible}
          onToggleVisible={() => setIsConfirmPasswordVisible((value) => !value)}
        />

        <Button
          title="Đổi mật khẩu"
          type="gradient"
          onPress={submit}
          disabled={
            !formMethod.formState.isDirty ||
            !formMethod.formState.isValid ||
            formMethod.formState.isSubmitting
          }
          loading={formMethod.formState.isSubmitting}
          loadingType="center"
          containerStyle={styles.submitButton}
          txtBtnStyle={styles.submitText}
        />
      </View>
    </FormProvider>
  );
};

type FieldProps = {
  control: Control<ForgotPasswordForm>;
  name: keyof ForgotPasswordForm;
  label: string;
  placeholder: string;
  note?: string;
};

function TextField({ control, name, label, placeholder, note }: FieldProps) {
  const { colors } = useThemes();

  return (
    <View style={{ rowGap: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={{ rowGap: 6 }}>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value, onBlur }, fieldState: { invalid, isDirty, error } }) => (
            <>
              <View style={styles.inputWrap}>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={placeholder}
                  placeholderTextColor={colors.neutral300}
                  style={styles.input}
                />
                {!invalid && value.length > 0 && <Text style={styles.check}>✓</Text>}
              </View>
              {note ? (
                <Text style={[styles.inputNote, isDirty && error ? styles.inputNoteError : null]}>
                  {note}
                </Text>
              ) : (
                <AnimatedErrorText message={isDirty && error ? error.message : undefined} />
              )}
            </>
          )}
        />
      </View>
    </View>
  );
}

type PasswordFieldProps = FieldProps & {
  isVisible: boolean;
  onToggleVisible: () => void;
};

function PasswordField({
  control,
  name,
  label,
  placeholder,
  isVisible,
  onToggleVisible,
}: PasswordFieldProps) {
  const { colors } = useThemes();

  return (
    <View style={{ rowGap: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value, onBlur }, fieldState: { isDirty, error } }) => (
          <View style={{ rowGap: 6 }}>
            <View style={styles.inputWrap}>
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!isVisible}
                placeholder={placeholder}
                placeholderTextColor={colors.neutral300}
                style={styles.input}
              />
              <Pressable onPress={onToggleVisible} hitSlop={8}>
                <Ionicons
                  name={isVisible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.neutral400}
                />
              </Pressable>
            </View>
            <AnimatedErrorText message={isDirty && error ? error.message : undefined} />
          </View>
        )}
      />
    </View>
  );
}

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
  inputNote: { color: colors.neutral400, ...textPresets.fs12_400 },
  inputNoteError: { color: colors.error },
}));
