import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { signIn } from '@/lib/auth'
import { cn } from '@/lib/utils'

interface SocialLoginProps {
  className?: string
  redirectTo?: string
}

// Simple icon components for social providers
const GoogleIcon = () => (
  <svg className='h-4 w-4' viewBox='0 0 24 24'>
    <path
      fill='currentColor'
      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
    />
    <path
      fill='currentColor'
      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
    />
    <path
      fill='currentColor'
      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
    />
    <path
      fill='currentColor'
      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
    />
  </svg>
)

const GitHubIcon = () => (
  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 24 24'>
    <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
  </svg>
)

const MicrosoftIcon = () => (
  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 24 24'>
    <path d='M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z' />
  </svg>
)

const AppleIcon = () => (
  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 24 24'>
    <path d='M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701' />
  </svg>
)

const SpinnerIcon = () => (
  <svg className='h-4 w-4 animate-spin' fill='none' viewBox='0 0 24 24'>
    <circle
      className='opacity-25'
      cx='12'
      cy='12'
      r='10'
      stroke='currentColor'
      strokeWidth='4'
    />
    <path
      className='opacity-75'
      fill='currentColor'
      d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
    />
  </svg>
)

const providerIcons = {
  google: GoogleIcon,
  github: GitHubIcon,
  microsoft: MicrosoftIcon,
  apple: AppleIcon,
} as const

const providerColors = {
  google: 'hover:bg-blue-50 border-blue-200 text-blue-700',
  github: 'hover:bg-gray-50 border-gray-200 text-gray-700',
  microsoft: 'hover:bg-blue-50 border-blue-200 text-blue-700',
  apple: 'hover:bg-gray-50 border-gray-900 text-gray-900',
} as const

const socialProviders = [
  { id: 'google', name: 'Google', enabled: true },
  { id: 'github', name: 'GitHub', enabled: true },
  { id: 'microsoft', name: 'Microsoft', enabled: true },
  { id: 'apple', name: 'Apple', enabled: true },
] as const

export function SocialLogin({ className, redirectTo }: SocialLoginProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const handleSocialLogin = async (providerId: string) => {
    setLoading((prev) => ({ ...prev, [providerId]: true }))

    try {
      // Use Better Auth social sign in
      const result = await signIn.social({
        provider: providerId as 'google' | 'github' | 'microsoft' | 'apple',
        callbackURL: redirectTo || window.location.origin + '/dashboard',
      })

      if (result.error) {
        // Handle error from Better Auth
        // biome-ignore lint/suspicious/noConsole: Intentional error logging
        console.error('Social login error:', result.error)
        toast.error(
          t('auth.socialLogin.error.description', { provider: providerId })
        )
      } else {
        // Better Auth handles the redirect automatically
        toast.success(t('auth.socialLogin.success', { provider: providerId }))
      }
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Intentional error logging
      console.error('Social login failed:', error)
      toast.error(
        t('auth.socialLogin.error.description', { provider: providerId })
      )
    } finally {
      setLoading((prev) => ({ ...prev, [providerId]: false }))
    }
  }

  const enabledProviders = socialProviders.filter(
    (provider) => provider.enabled
  )

  if (enabledProviders.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            {t('auth.socialLogin.divider')}
          </span>
        </div>
      </div>

      <div className='grid gap-2'>
        {enabledProviders.map((provider) => {
          const IconComponent =
            providerIcons[provider.id as keyof typeof providerIcons]
          const colorClass =
            providerColors[provider.id as keyof typeof providerColors]

          return (
            <Button
              key={provider.id}
              variant='outline'
              onClick={() => handleSocialLogin(provider.id)}
              disabled={loading[provider.id]}
              className={cn(
                'relative w-full transition-colors duration-200',
                colorClass
              )}
            >
              {loading[provider.id] ? <SpinnerIcon /> : <IconComponent />}
              <span className='ml-2'>
                {t('auth.socialLogin.continueWith', {
                  provider: provider.name,
                })}
              </span>
            </Button>
          )
        })}
      </div>

      <p className='text-center text-muted-foreground text-xs'>
        {t('auth.socialLogin.disclaimer')}
      </p>
    </div>
  )
}
