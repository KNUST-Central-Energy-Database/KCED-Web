import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/guards'
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: requireAuth,
  component: DashboardRoute,
})

function DashboardRoute() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
