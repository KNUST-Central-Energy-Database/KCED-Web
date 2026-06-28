import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/account-setup')({
  component: CreateAccountPage,
})

const schema = z.object({
  full_name: z.string().min(1, 'Enter your full name'),
  phone: z.string().length(10, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Confirm your password'),
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type CreateAccountForm = z.infer<typeof schema>

function CreateAccountPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateAccountForm>({
    resolver: zodResolver(schema),
  })

  // Supabase puts the token in the URL hash on invite links
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (!session) {
          toast.error('Invite link is invalid or has expired.', { duration: 8000 })
          navigate({ to: '/login' })
          return
        }

        // check if profile is already complete
        const { data: user } = await supabase
          .from('users')
          .select('full_name, phone')
          .eq('id', session.user.id)
          .single()

        if (user?.phone) {
          navigate({ to: '/dashboard' })
          return
        }

        setChecking(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const onSubmit = async (data: CreateAccountForm) => {
    const { error: passwordError } = await supabase.auth.updateUser({
      password: data.password,
      data: { full_name: data.full_name },
    })
    if (passwordError) {
      toast.error(passwordError.message)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: profileError } = await supabase
      .from('users')
      .update({
        phone: data.phone,  // we updated 'full_name' in the auth metadata, so we only need to update 'phone' here 
      })
      .eq('id', user.id)

    if (profileError) {
      toast.error(profileError.message)
      return
    }

    navigate({ to: '/dashboard' })
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