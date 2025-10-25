import { createFileRoute, redirect } from '@tanstack/react-router'
import { Onboarding } from '@/features/onboarding'

export const Route = createFileRoute('/(auth)/onboarding')({
  component: Onboarding,
  beforeLoad: async ({ context }) => {
    // Check if user is authenticated
    if (!context.auth?.user) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: '/onboarding',
        },
      })
    }
    
    // Check if onboarding is already completed
    if (context.auth.user.onboarding_completed) {
      throw redirect({
        to: '/',
      })
    }
  },
})