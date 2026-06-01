import { z } from "zod";

export type Mode = "login" | "register";

export const LoginSchema = z.object({
  phone: z.string().min(3),
  password: z.string().min(5),
  remember: z.boolean(),
});

export type LoginForm = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(3),
  password: z.string().min(5),
  tiktokId: z.string().min(3),
});

export type RegisterForm = z.infer<typeof RegisterSchema>;
