import { createFileRoute } from '@tanstack/react-router'
import { AccountSetupForm } from '@/features/auth/components/AccountSetupForm'

export const Route = createFileRoute('/_auth/account-setup')({
  component: AccountSetupForm,
})
