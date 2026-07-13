import { z } from 'zod'

/** Login: email + password. */
export const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
})
export type LoginForm = z.infer<typeof loginSchema>

/** Forgot password — step 1: the email to send a reset code to. */
export const emailSchema = z.object({
  email: z.email('Enter a valid email'),
})
export type EmailForm = z.infer<typeof emailSchema>

/** Forgot password — step 3: the new password + confirmation. */
export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

/** First-time account setup from an invite link. */
export const accountSetupSchema = z.object({
  full_name: z.string().min(1, 'Enter your full name'),
  phone: z.string().length(10, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Confirm your password'),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})
export type AccountSetupForm = z.infer<typeof accountSetupSchema>
