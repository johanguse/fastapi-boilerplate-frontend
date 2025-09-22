import type { ReactNode } from 'react'
import { useAuthInit } from '@/hooks/use-auth-init'

interface AuthProviderProps {
  readonly children: ReactNode
}

/**
 * AuthProvider component that handles authentication initialization
 * Shows a loading state while checking for existing sessions
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { isInitialized } = useAuthInit()

  // Show loading state while checking session
  if (!isInitialized) {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-b-2'></div>
      </div>
    )
  }

  return <>{children}</>
}
