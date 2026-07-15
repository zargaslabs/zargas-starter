import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(1, "Şifre zorunludur."),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta adresi girin."),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "Şifre en az 8 karakter olmalı."),
    confirmPassword: z.string().min(8, "Şifrenizi tekrar girin."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  });
