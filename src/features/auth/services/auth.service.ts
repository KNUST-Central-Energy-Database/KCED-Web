import { supabase } from '@/lib/supabase'

/**
 * Auth operations, wrapping the Supabase client. Each throws `Error(message)`
 * on failure so callers can `try/catch → toast.error`. Mirrors the OTP flows in
 * the kced_mobile auth_controller.
 */

/** Sign in with email + password. */
export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
}

/** The current session (from local storage), or null if signed out. */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/** Sign out of the current session. */
export async function signOut() {
  await supabase.auth.signOut()
}

// ---- Forgot password (OTP flow) --------------------------------------------
//   1. sendPasswordResetOtp(email) → emails a 6-digit recovery code
//   2. verifyPasswordResetOtp()    → creates a recovery session
//   3. setNewPassword()            → sets the new password
//   4. endRecovery()               → sign out (on success or on back-out)

/** Step 1: email a 6-digit password-reset code. */
export async function sendPasswordResetOtp(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim())
  if (error) throw new Error(error.message)
}

/** Step 2: verify the reset code, creating a recovery session. */
export async function verifyPasswordResetOtp(email: string, token: string) {
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: 'recovery',
  })
  if (error) throw new Error(error.message || 'Invalid code. Please try again.')
}

/** Step 3: set the new password on the recovery session. */
export async function setNewPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)
}

/** Ends a recovery session by signing out — forces a fresh login afterwards. */
export async function endRecovery() {
  await supabase.auth.signOut()
}

// ---- Account setup ---------------------------------------------------------

/** Read a user's profile. Returns null if it can't be fetched. */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('full_name, phone')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

/**
 * Complete first-time account setup: set the password + name on the auth user,
 * then save the phone number to the profile row.
 */
export async function completeAccountSetup(params: {
  fullName: string
  phone: string
  password: string
}) {
  const { error: passwordError } = await supabase.auth.updateUser({
    password: params.password,
    data: { full_name: params.fullName },
  })
  if (passwordError) throw new Error(passwordError.message)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Session expired. Please use your invite link again.')

  // full_name lives in auth metadata (set above); only phone needs saving here.
  const { error: profileError } = await supabase
    .from('users')
    .update({ phone: params.phone })
    .eq('id', user.id)
  if (profileError) throw new Error(profileError.message)
}
