import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Hook to initialize authentication state on app startup
 * This ensures that sessions are restored from cookies after page reload
 */
export function useAuthInit() {
  const { 
    checkSession, 
    isInitialized, 
    isAuthenticated 
  } = useAuthStore()

  useEffect(() => {
    // Check session on app startup
    checkSession()
  }, [checkSession])

  return { 
    isInitialized,
    isAuthenticated: isAuthenticated() 
  }
}