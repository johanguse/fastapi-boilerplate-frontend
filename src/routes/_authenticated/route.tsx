import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const authState = useAuthStore.getState()

    // If not authenticated, redirect to sign-in
    if (!authState.user) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: window.location.pathname,
        },
      })
    }

    // If not completed onboarding, redirect to onboarding
    if (authState.user && !authState.user.onboarding_completed) {
      throw redirect({ to: '/onboarding' })
    }
  },
  component: AuthenticatedLayout,
})
