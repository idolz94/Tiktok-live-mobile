import { z } from "zod";

export type Mode = "login" | "register";

export const LoginSchema = z.object({
  username: z.string().trim().min(3, "Tài khoản phải có ít nhất 3 ký tự"),
  password: z.string().min(5, "Mật khẩu phải có ít nhất 5 ký tự"),
  remember: z.boolean(),
});

export type LoginForm = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  fullName: z.string().trim().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  username: z.string().trim().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(5, "Mật khẩu phải có ít nhất 5 ký tự"),
  tiktokId: z.string().trim(),
  agreePolicy: z.boolean().refine(v => v === true, { message: "Vui lòng đồng ý điều khoản" }),
});

export type RegisterForm = z.infer<typeof RegisterSchema>;
