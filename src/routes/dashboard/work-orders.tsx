import { createFileRoute } from '@tanstack/react-router'

// The `/dashboard` layout route (route.tsx) supplies the sidebar shell and the
// requireAuth guard; this is just the page content.
export const Route = createFileRoute('/dashboard/work-orders')({
  component: WorkOrders,
})

function WorkOrders() {
  return (
    <div className='flex flex-col gap-1'>
      <h2 className='text-2xl font-semibold tracking-tight'>Work Orders</h2>
      <p className='text-sm text-muted-foreground'>Work orders will appear here.</p>
    </div>
  )
}
