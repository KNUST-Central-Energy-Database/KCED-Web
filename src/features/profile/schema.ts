import { z } from "zod";

/** Ghanaian local number: starts with 0, exactly 10 digits (mobile parity). */
const phoneRegex = /^0[0-9]{9}$/;

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s\-()]/g, ""))
    .refine((v) => phoneRegex.test(v), {
      message: "Enter a valid Ghanaian phone number (e.g. 0241234567).",
    }),
});

export type ProfileValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
