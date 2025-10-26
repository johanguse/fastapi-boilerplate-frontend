import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const authStore = useAuthStore.getState()
    const { isInitialized, checkSession } = authStore

    if (!isInitialized) {
      await checkSession()
    }

    const { user } = useAuthStore.getState()

    if (!user) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: window.location.pathname,
        },
      })
    }

    if (!user.onboarding_completed) {
      throw redirect({
        to: '/onboarding',
      })
    }
  },
  component: AuthenticatedLayout,
})
