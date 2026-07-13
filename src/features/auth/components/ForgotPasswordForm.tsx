import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Check, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import {
  emailSchema,
  resetPasswordSchema,
  type EmailForm,
  type ResetPasswordForm,
} from '@/features/auth/schema'
import {
  endRecovery,
  sendPasswordResetOtp,
  setNewPassword,
  verifyPasswordResetOtp,
} from '@/features/auth/services/auth.service'
import { OtpInput, OTP_LENGTH } from '@/features/auth/components/OtpInput'

/** Where the user is in the OTP password reset. */
type Step = 'email' | 'code' | 'password' | 'done'

/**
 * Resets a forgotten password via a one-time code, entirely in-page:
 * email → 6-digit code → new password → done. Verifying the code creates a
 * recovery session, so leaving the flow after that point signs it out first.
 * Mirrors the kced_mobile forgot-password screen.
 */
export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')

  return (
    <div className='w-full flex flex-col gap-6'>
      {step === 'email' && (
        <EmailStep
          onSent={(sentEmail) => {
            setEmail(sentEmail)
            setStep('code')
          }}
        />
      )}
      {step === 'code' && (
        <CodeStep email={email} onVerified={() => setStep('password')} />
      )}
      {step === 'password' && <PasswordStep onDone={() => setStep('done')} />}
      {step === 'done' && <DoneStep />}
    </div>
  )
}

// ---- Step 1: email ----------------------------------------------------------

function EmailStep({ onSent }: { onSent: (email: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailForm>({ resolver: zodResolver(emailSchema) })

  const onSubmit = async (data: EmailForm) => {
    const target = data.email.trim()
    try {
      await sendPasswordResetOtp(target)
      onSent(target)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <>
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-semibold tracking-tight'>Forgot Password</h2>
        <p className='text-sm text-muted-foreground'>
          Enter your email and we'll send you a reset code
        </p>
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
          {isSubmitting ? <Loader2 className='animate-spin' /> : 'Send code'}
        </Button>

        <BackToLogin />
      </form>
    </>
  )
}

// ---- Step 2: code -----------------------------------------------------------

function CodeStep({ email, onVerified }: { email: string; onVerified: () => void }) {
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)

  const verify = async (token: string) => {
    setVerifying(true)
    try {
      await verifyPasswordResetOtp(email, token)
      onVerified()
    } catch (err) {
      toast.error((err as Error).message)
      setCode('')
    } finally {
      setVerifying(false)
    }
  }

  const resend = async () => {
    setResending(true)
    try {
      await sendPasswordResetOtp(email)
      toast.success('A new code is on its way.')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setResending(false)
    }
  }

  return (
    <>
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-semibold tracking-tight'>Enter Code</h2>
        <p className='text-sm text-muted-foreground'>
          We sent a 6-digit code to <span className='font-medium text-foreground'>{email}</span>
        </p>
      </div>

      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-1.5'>
          <Label>Verification Code</Label>
          <OtpInput value={code} onChange={setCode} disabled={verifying} onComplete={verify} />
        </div>

        <button
          type='button'
          onClick={resend}
          disabled={resending || verifying}
          className='self-start text-xs text-muted-foreground hover:text-primary disabled:opacity-60'
        >
          {resending ? 'Sending…' : "Didn't get it? Resend code"}
        </button>

        <Button
          type='button'
          size='lg'
          className='w-full mt-2'
          disabled={verifying || code.length !== OTP_LENGTH}
          onClick={() => verify(code)}
        >
          {verifying ? <Loader2 className='animate-spin' /> : 'Verify'}
        </Button>

        <BackToLogin />
      </div>
    </>
  )
}

// ---- Step 3: new password ---------------------------------------------------

function PasswordStep({ onDone }: { onDone: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema) })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      await setNewPassword(data.password)
      onDone()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <>
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-semibold tracking-tight'>New Password</h2>
        <p className='text-sm text-muted-foreground'>Choose a new password for your account</p>
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
            <button type='button' onClick={() => setShowPassword((p) => !p)}
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
            <button type='button' onClick={() => setShowConfirm((p) => !p)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'>
              {showConfirm ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>
          {errors.confirmPassword && <p className='text-xs text-destructive'>{errors.confirmPassword.message}</p>}
        </div>

        <Button type='submit' size='lg' className='w-full mt-2' disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className='animate-spin' /> : 'Reset password'}
        </Button>
      </form>
    </>
  )
}

// ---- Step 4: done -----------------------------------------------------------

function DoneStep() {
  const goToLogin = async () => {
    // End the recovery session so the user logs in fresh with the new password.
    await endRecovery()
    window.location.href = '/login'
  }

  return (
    <div className='flex flex-col items-center gap-6 py-2'>
      <div className='flex items-center justify-center w-14 h-14 rounded-full bg-primary/10'>
        <Check className='w-7 h-7 text-primary' strokeWidth={2.5} />
      </div>
      <div className='flex flex-col items-center gap-1 text-center'>
        <h2 className='text-2xl font-semibold tracking-tight'>All set</h2>
        <p className='text-sm text-muted-foreground'>Your password has been updated</p>
      </div>
      <Button size='lg' className='w-full' onClick={goToLogin}>
        Back to Login
      </Button>
    </div>
  )
}

// ---- Shared bits ------------------------------------------------------------

function BackToLogin() {
  return (
    <Link to='/login' className='flex gap-2 items-center justify-center text-xs text-muted-foreground hover:text-primary'>
      <ArrowLeft size={12} strokeWidth={1.8} /> Back to Login
    </Link>
  )
}
