import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const { isAuthenticated } = useAuthStore.getState().auth
    
    // If not authenticated, redirect to sign-in
    if (!isAuthenticated()) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: window.location.pathname,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})
