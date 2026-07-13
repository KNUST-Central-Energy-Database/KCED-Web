import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { redirectIfAuthenticated } from '@/features/auth/guards'

export const Route = createFileRoute('/_auth/login')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: redirectIfAuthenticated,
  component: LoginForm,
})
