import { createFileRoute } from '@tanstack/react-router'

// The `/dashboard` layout route (route.tsx) supplies the sidebar shell and the
// requireAuth guard; this is just the index page content.
export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndex,
})

function DashboardIndex() {
  return (
    <div className='flex flex-col gap-1'>
      <h2 className='text-2xl font-semibold tracking-tight'>Overview</h2>
      <p className='text-sm text-muted-foreground'>Welcome back.</p>
    </div>
  )
}
