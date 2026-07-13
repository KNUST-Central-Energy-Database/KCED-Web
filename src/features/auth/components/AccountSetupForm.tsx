import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { accountSetupSchema, type AccountSetupForm as AccountSetupFormValues } from '@/features/auth/schema'
import { completeAccountSetup, getProfile } from '@/features/auth/services/auth.service'

export function AccountSetupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountSetupFormValues>({
    resolver: zodResolver(accountSetupSchema),
  })

  // Supabase puts the token in the URL hash on invite links; the session lands
  // via the INITIAL_SESSION event.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (!session) {
          toast.error('Invite link is invalid or has expired.', { duration: 8000 })
          navigate({ to: '/login' })
          return
        }

        // Skip setup if the profile is already complete.
        const profile = await getProfile(session.user.id)
        if (profile?.phone) {
          navigate({ to: '/dashboard' })
          return
        }

        setChecking(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const onSubmit = async (data: AccountSetupFormValues) => {
    try {
      await completeAccountSetup({
        fullName: data.full_name,
        phone: data.phone,
        password: data.password,
      })
      navigate({ to: '/dashboard' })
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <div className='w-full flex flex-col gap-6'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-semibold tracking-tight'>Set up your account</h2>
        <p className='text-sm text-muted-foreground'>Complete your profile to get started</p>
      </div>

      {checking ? (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='w-6 h-6 animate-spin' />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='full_name'>Full Name</Label>
            <Input
              id='full_name'
              placeholder='John Doe'
              {...register('full_name')}
              aria-invalid={!!errors.full_name}
            />
            {errors.full_name && (
              <p className='text-xs text-destructive'>{errors.full_name.message}</p>
            )}
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='phone'>Phone Number</Label>
            <Input
              id='phone'
              type='tel'
              placeholder='0548666090'
              {...register('phone')}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className='text-xs text-destructive'>{errors.phone.message}</p>
            )}
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='password'>Password</Label>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                {...register('password')}
                aria-invalid={!!errors.password}
                className='pr-10'
              />
              <button
                type='button'
                onClick={() => setShowPassword(p => !p)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>
            {errors.password && (
              <p className='text-xs text-destructive'>{errors.password.message}</p>
            )}
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='confirm_password'>Confirm Password</Label>
            <div className='relative'>
              <Input
                id='confirm_password'
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                {...register('confirm_password')}
                aria-invalid={!!errors.confirm_password}
                className='pr-10'
              />
              <button
                type='button'
                onClick={() => setShowPassword(p => !p)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className='text-xs text-destructive'>{errors.confirm_password.message}</p>
            )}
          </div>

          <Button type='submit' size='lg' className='w-full mt-2' disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className='animate-spin' /> : 'Complete Setup'}
          </Button>
        </form>
      )}
    </div>
  )
}
