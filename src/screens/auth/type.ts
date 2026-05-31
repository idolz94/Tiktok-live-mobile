import { z } from "zod";

export const LoginSchema = z.object({
  phone: z.string().min(3),
  password: z.string().min(5),
  remember: z.boolean(),
});

export type LoginForm = z.infer<typeof LoginSchema>;
