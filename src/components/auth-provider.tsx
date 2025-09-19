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
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}