import { useEffect } from 'react'
import { useAuth } from '@/stores/auth-store'

/**
 * Hook to initialize authentication state on app startup
 * This ensures that sessions are restored from cookies after page reload
 */
export function useAuthInit() {
  const { checkSession, isInitialized, isAuthenticated } = useAuth()

  useEffect(() => {
    // Check for existing session on app startup
    checkSession()
  }, [checkSession])

  return {
    isInitialized,
    isAuthenticated,
  }
}
