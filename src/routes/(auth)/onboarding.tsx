import { createFileRoute, redirect } from '@tanstack/react-router'
import { Onboarding } from '@/features/onboarding'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/(auth)/onboarding')({
  component: Onboarding,
  beforeLoad: async () => {
    // Get the current auth state directly from the store
    const { user } = useAuthStore.getState()

    // Check if user is authenticated
    if (!user) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: '/onboarding',
        },
      })
    }

    // Check if onboarding is already completed
    if (user.onboarding_completed) {
      throw redirect({
        to: '/',
      })
    }
  },
})
