import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
})

const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error(error.message)
      return
    }

    navigate({ to: '/dashboard' })
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