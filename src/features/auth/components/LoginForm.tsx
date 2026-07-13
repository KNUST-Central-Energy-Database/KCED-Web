import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { loginSchema, type LoginForm as LoginFormValues } from '@/features/auth/schema'
import { signIn } from '@/features/auth/services/auth.service'
import { safeRedirect } from '@/features/auth/guards'

export function LoginForm() {
  const navigate = useNavigate()
  const { redirect } = useSearch({ from: '/_auth/login' })
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await signIn(data.email, data.password)
      navigate({ to: safeRedirect(redirect) ?? '/dashboard' })
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <div className='w-full flex flex-col gap-6'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-semibold tracking-tight'>Sign in</h2>
        <p className='text-sm text-muted-foreground'>Enter your credentials to continue</p>
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

        <div className='flex flex-col gap-1.5'>
          <div className='flex justify-between'>
            <Label htmlFor='password'>Password</Label>
            <Link to="/forgot-password" className='text-xs text-muted-foreground hover:text-primary'>
              Forgot password?
            </Link>
          </div>
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute inset-y-0 right-0 flex items-center pr-3'
            >
              {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
            </button>
          </div>
          {errors.password && (
            <p className='text-xs text-destructive'>{errors.password.message}</p>
          )}
        </div>

        <Button type='submit' size='lg' className='w-full mt-2' disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className='animate-spin' /> : 'Sign in'}
        </Button>
      </form>
    </div>
  )
}
