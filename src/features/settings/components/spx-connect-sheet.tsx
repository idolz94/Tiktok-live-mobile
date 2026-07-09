import { zodResolver } from "@hookform/resolvers/zod";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { createStyles } from "@utils/createStyles";

const schema = z.object({
  phone: z.string().min(9, "Số điện thoại không hợp lệ").max(15),
  email: z.union([z.email("Email không hợp lệ"), z.literal("")]).optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  submitting: boolean;
  onSubmit: (data: { phone: string; email?: string }) => Promise<void>;
  onClose: () => void;
};

export function SpxConnectSheet({ submitting, onSubmit, onClose }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "", email: "" },
  });

  const submit = handleSubmit(async (data) => {
    await onSubmit({ phone: data.phone, email: data.email || undefined });
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kết nối tài khoản SPX</Text>
      <Text style={styles.subtitle}>
        Nhập thông tin để đăng ký tài khoản SPX Express cho shop của bạn.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Số điện thoại *</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, !!errors.phone && styles.inputError]}
              value={value}
              onChangeText={onChange}
              placeholder="0912345678"
              keyboardType="phone-pad"
              editable={!submitting}
            />
          )}
        />
        {errors.phone ? (
          <Text style={styles.errorText}>{errors.phone.message}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email (tuỳ chọn)</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, !!errors.email && styles.inputError]}
              value={value ?? ""}
              onChangeText={onChange}
              placeholder="shop@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!submitting}
            />
          )}
        />
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
          <Text style={styles.cancelText}>Huỷ</Text>
        </Pressable>
        <Pressable
          style={[styles.submitBtn, (!isDirty || submitting) && styles.submitBtnDisabled]}
          onPress={() => { void submit(); }}
          disabled={!isDirty || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitText}>Kết nối</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  container: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 16 },
  title: { color: colors.neutral900, ...textPresets.fs16_600 },
  subtitle: { color: colors.neutral400, ...textPresets.fs12_400 },
  field: { gap: 6 },
  label: { color: colors.neutral500, ...textPresets.fs14_500 },
  input: {
    borderWidth: 1,
    borderColor: colors.border10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.neutral900,
    ...textPresets.fs14_400,
  },
  inputError: { borderColor: "#ef4444" },
  errorText: { color: "#ef4444", ...textPresets.fs12_400 },
  actions: { flexDirection: "row", gap: 12, paddingTop: 4 },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral100 ?? "#f3f4f6",
  },
  cancelText: { color: colors.neutral500, ...textPresets.fs14_500 },
  submitBtn: {
    flex: 2,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff3911",
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { color: "#fff", ...textPresets.fs14_500 },
}));
