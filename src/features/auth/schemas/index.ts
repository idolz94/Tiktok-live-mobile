import { z } from "zod";

const fullNamePattern = /^[\p{L}\s]+$/u;
const blockedTextSymbolsPattern = /[@$%^&<>]/;
const tiktokIdPattern = /^@?[A-Za-z0-9._]+$/;

export type Mode = "login" | "register";

export const LoginSchema = z.object({
  username: z.string().trim().min(3, "Tài khoản phải có ít nhất 3 ký tự"),
  password: z.string().min(5, "Mật khẩu phải có ít nhất 5 ký tự"),
  remember: z.boolean(),
});

export type LoginForm = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự")
    .regex(fullNamePattern, "Họ và tên chỉ được gồm chữ cái và khoảng trắng"),
  username: z
    .string()
    .trim()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .refine((value) => !blockedTextSymbolsPattern.test(value), {
      message: "Tên đăng nhập không được chứa ký tự đặc biệt @$%^&<>",
    }),
  password: z.string().min(5, "Mật khẩu phải có ít nhất 5 ký tự"),
  tiktokId: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || tiktokIdPattern.test(value), {
      message: "TikTok ID chỉ được gồm chữ cái, số, dấu gạch dưới và dấu chấm",
    }),
  agreePolicy: z.boolean().refine(v => v === true, { message: "Vui lòng đồng ý điều khoản" }),
});

export type RegisterForm = z.infer<typeof RegisterSchema>;
