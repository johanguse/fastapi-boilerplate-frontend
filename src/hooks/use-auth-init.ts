import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { authApi } from '@/lib/api'

/**
 * Hook to initialize authentication state on app startup
 * This ensures that sessions are restored from cookies after page reload
 */
export function useAuthInit() {
  const [isInitialized, setIsInitialized] = useState(false)
  const authStore = useAuthStore((state) => state.auth)
  const { setBetterAuth, setBetterAuthUser, reset } = authStore

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's a Better Auth session cookie
        const hasSessionCookie = document.cookie.includes('ba_session=')
        
        if (hasSessionCookie) {
          // Try to get the current session from the backend
          const sessionData = await authApi.getSession()
          
          if (sessionData?.user && sessionData?.session) {
            // Restore session in store
            setBetterAuth(sessionData.user, sessionData.session)
          } else {
            // Invalid session, clear auth state
            reset()
          }
        } else {
          // No session cookie, ensure auth state is clean
          reset()
        }
      } catch (_error) {
        // Session check failed, clear auth state
        reset()
      } finally {
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [setBetterAuth, setBetterAuthUser, reset])

  return { 
    isInitialized,
    isAuthenticated: authStore.isAuthenticated() 
  }
}