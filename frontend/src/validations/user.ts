import { z } from "zod";

export const roleValues = ["admin", "staff"] as const;

const baseUserSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Ad soyad en az 2 karakter olmalı.")
    .max(120, "Ad soyad en fazla 120 karakter olabilir."),
  role: z.enum(roleValues, { message: "Geçerli bir rol seçin." }),
  phone: z
    .string()
    .trim()
    .max(32, "Telefon en fazla 32 karakter olabilir.")
    .optional()
    .transform((value) => (value ? value : null)),
});

export const inviteUserSchema = baseUserSchema.extend({
  email: z.string().trim().email("Geçerli bir e-posta adresi girin."),
});

export const userProfileSchema = baseUserSchema;
