import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

interface OAuthCallbackProps {
  provider: string
}

export function OAuthCallback({ provider }: OAuthCallbackProps) {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const error = urlParams.get('error')

        if (error) {
          throw new Error(`OAuth error: ${error}`)
        }

        if (!code) {
          throw new Error('No authorization code received')
        }

        // Exchange code for tokens via backend callback endpoint
        let callbackUrl = `/auth/oauth/${provider}/callback?code=${code}`
        if (state) {
          callbackUrl += `&state=${state}`
        }

        const response = await fetch(callbackUrl, {
          method: 'GET',
          credentials: 'include', // Include cookies for session handling
        })

        if (response.ok) {
          // Backend should handle token exchange and user creation/login
          // and redirect us or set cookies appropriately
          
          // Check if we were redirected (indicating success)
          if (response.redirected) {
            window.location.href = response.url
            return
          }

          // OAuth success - redirect to dashboard
          router.navigate({ to: '/' })
          return
        }

        throw new Error('OAuth callback failed')
        
      } catch (_error) {
        // Redirect to login with error
        router.navigate({ to: '/sign-in' })
      }
    }

    handleCallback()
  }, [provider, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <h2 className="mt-4 text-lg font-semibold">Completing sign in...</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we complete your {provider} authentication
        </p>
      </div>
    </div>
  )
}
