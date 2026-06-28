import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/_auth/forgot-password')({
  component: ForgotPasswordPage,
})

const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email'),
})

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

function RequestResetForm() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/forgot-password`,
    })

    if (error) {
      toast.error(error.message)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className='w-full flex flex-col gap-4'>
        <h2 className='text-2xl font-semibold tracking-tight'>Check your email</h2>
        <p className='text-sm text-muted-foreground'>
          We sent a reset link to <span className='font-medium text-ink'>{getValues('email')}</span>. Check your inbox and follow the link to reset your password.
        </p>
        <Link to="/login" className='flex gap-2 items-center justify-center text-xs text-muted-foreground hover:text-primary'>
          <ArrowLeft size={12} strokeWidth={1.8} /> Back to Login
        </Link>
      </div>
    )
  }

  return (
    <div className='w-full flex flex-col gap-6'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-semibold tracking-tight'>Forgot Password</h2>
        <p className='text-sm text-muted-foreground'>Enter your email to reset your password</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            placeholder='you@knust.edu.gh'
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className='text-xs text-destructive'>{errors.email.message}</p>
          )}
        </div>

        <Button type='submit' size='lg' className='w-full mt-2' disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className='animate-spin' /> : 'Reset password'}
        </Button>

        <Link to="/login" className='flex gap-2 items-center justify-center text-xs text-muted-foreground hover:text-primary'>
          <ArrowLeft size={12} strokeWidth={1.8} />Back to Login
        </Link>
      </form>
    </div>
  )
}

function NewPasswordForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const onSubmit = async (data: ResetPasswordForm) => {
    const { error } = await supabase.auth.updateUser({ password: data.password })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Password updated successfully.')
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-semibold tracking-tight'>New Password</h2>
        <p className='text-sm text-muted-foreground'>Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='password'>New Password</Label>
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              {...register('password')}
              aria-invalid={!!errors.password}
              className='pr-10'
            />
            <button type='button' onClick={() => setShowPassword(p => !p)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'>
              {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>
          {errors.password && <p className='text-xs text-destructive'>{errors.password.message}</p>}
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='confirmPassword'>Confirm Password</Label>
          <div className='relative'>
            <Input
              id='confirmPassword'
              type={showConfirm ? 'text' : 'password'}
              placeholder='••••••••'
              {...register('confirmPassword')}
              aria-invalid={!!errors.confirmPassword}
              className='pr-10'
            />
            <button type='button' onClick={() => setShowConfirm(p => !p)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'>
              {showConfirm ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>
          {errors.confirmPassword && <p className='text-xs text-destructive'>{errors.confirmPassword.message}</p>}
        </div>

        <Button type='submit' size='lg' className='w-full mt-2' disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className='animate-spin' /> : 'Update password'}
        </Button>
      </form>
    </>
  )
}

function ForgotPasswordPage() {
  const [hasToken, setHasToken] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasToken(true)
      }
      setChecking(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (checking) return null

  return (
    <div className='w-full flex flex-col gap-6'>
      {hasToken ? <NewPasswordForm /> : <RequestResetForm />}
    </div>
  )
}