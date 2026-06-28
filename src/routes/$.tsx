import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/$')({
  component: NotFoundPage,
})

function NotFoundPage() {
  return (
    <main className='w-full min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6'>
      <p className='text-8xl font-garamond font-semibold text-primary'>404</p>
      <h1 className='text-2xl font-semibold tracking-tight'>Page not found</h1>
      <p className='text-sm text-muted-foreground max-w-xs'>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className='flex gap-4 mt-2'>
        <Link
          to='/'
          className='text-sm font-medium text-primary underline underline-offset-4 hover:text-primary-hover'
        >
          Home
        </Link>
        <Link
          to='/dashboard'
          className='text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-primary'
        >
          Dashboard
        </Link>
      </div>
    </main>
  )
}