import { useToast } from "@components/toast";
import { changePasswordApi } from "@features/auth/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
    newPassword: z
      .string()
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự.")
      .regex(/^[a-zA-Z0-9]+$/, "Mật khẩu chỉ được chứa chữ cái và chữ số."),
    confirmNewPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới."),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordForm = z.infer<typeof schema>;

export function useChangePassword() {
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<ChangePasswordForm>({
    mode: "onChange",
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
    resolver: zodResolver(schema),
  });

  const submit = useCallback(() => {
    handleSubmit(async ({ currentPassword, newPassword }) => {
      try {
        await changePasswordApi({ currentPassword, newPassword });
        toast.success("Đổi mật khẩu thành công.");
        router.back();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Đã có lỗi xảy ra.";
        toast.error({ title: "Không thể đổi mật khẩu", description: message });
      }
    })();
  }, [handleSubmit, toast]);

  return { control, isDirty, isSubmitting, submit };
}
