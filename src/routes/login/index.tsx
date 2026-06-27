import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/login/')({
  component: LoginPage,
})

const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    await new Promise(r => setTimeout(r, 2000))
    console.log(data)
  }

  return (
    <main className='w-full min-h-screen grid grid-cols-7'>

      {/* Left — hero image, 4 cols */}
      <div className='col-span-4 hidden md:flex items-center justify-center'>
        <img
          src="/assets/images/login/gradii.png"
          alt="Hero"
          className='w-full h-full max-h-screen object-cover'
        />
      </div>

      {/* Right — form, 3 cols */}
      <div className='col-span-7 md:col-span-3 flex flex-col items-center justify-center px-6 py-12'>
        <div className='w-full max-w-sm flex flex-col gap-10'>
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/assets/images/knust-logo.png"
              alt="KNUST Crest"
              className="h-14 w-auto"
            />
            <div className="pt-4 flex flex-col">
              <h1 className="font-garamond font-semibold text-xl tracking-tight m-0 leading-tight">
                KNUST
              </h1>
              <p className="text-[0.7rem] font-medium m-0 -mt-0.5 leading-normal">
                Central Energy Database
              </p>
            </div>
          </Link>

          <div className='w-full flex flex-col gap-6 '>
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
                  <Link to="/login" className='text-xs text-muted-foreground hover:text-primary'>
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id='password'
                  type='password'
                  placeholder='••••••••'
                  {...register('password')}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className='text-xs text-destructive'>{errors.password.message}</p>
                )}
              </div>

              <Button type='submit' size='lg' className='w-full mt-2' disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className='animate-spin' /> : 'Sign in'}
              </Button>
            </form>
          </div>
        </div>
      </div>

    </main>
  )
}