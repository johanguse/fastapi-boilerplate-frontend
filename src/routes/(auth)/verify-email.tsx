import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle2, Loader2, Mail, XCircle } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/(auth)/verify-email')({
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const checkSession = useAuthStore((state) => state.checkSession)
  const user = useAuthStore((state) => state.user)
  const { token } = useSearch({ from: '/(auth)/verify-email' }) as {
    token?: string
  }
  const hasVerified = useRef(false)

  const verifyMutation = useMutation({
    mutationFn: async (verificationToken: string) => {
      if (!verificationToken) {
        throw new Error('Verification token is missing')
      }

      const response = await api.post('/auth/verify-email', {
        token: verificationToken,
      })
      return response.data
    },
    onSuccess: async () => {
      // Refresh session to update user verification status
      await checkSession()

      // Show success message
      toast.success(
        t('emailVerification.success', 'Email verified successfully!')
      )

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate({ to: '/', replace: true })
      }, 2000)
    },
    onError: (error: unknown) => {
      // Log error for debugging
      const err = error as {
        response?: {
          data?: {
            detail?: string | { error?: string; message?: string }
          }
        }
        message?: string
      }

      // biome-ignore lint/suspicious/noConsole: Error logging for debugging
      console.error('Email verification error:', {
        message: err.message,
        detail: err.response?.data?.detail,
      })
    },
  })

  useEffect(() => {
    if (token && !hasVerified.current) {
      hasVerified.current = true
      verifyMutation.mutate(token)
    }
    // Only run once when token is available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const getErrorMessage = (): string => {
    if (!token) {
      return t('emailVerification.noToken', 'No token provided')
    }
    if (verifyMutation.error) {
      const error = verifyMutation.error as {
        response?: {
          data?: {
            detail?: string | { error?: string; message?: string }
          }
        }
        message?: string
      }

      // Try to extract error message from response
      if (error?.response?.data?.detail) {
        const detail = error.response.data.detail
        if (typeof detail === 'string') {
          return detail
        }
        if (typeof detail === 'object' && detail.message) {
          return detail.message
        }
      }

      // Fallback to error message
      if (error?.message) {
        return error.message
      }
    }
    return t(
      'emailVerification.verificationFailed',
      'Email verification failed. The link may have expired or already been used.'
    )
  }

  const status = !token
    ? 'error'
    : verifyMutation.isPending
      ? 'loading'
      : verifyMutation.isSuccess
        ? 'success'
        : verifyMutation.isError
          ? 'error'
          : 'loading'

  const errorMessage = status === 'error' ? getErrorMessage() : ''

  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/40 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
            {status === 'loading' && (
              <div className='bg-transparent'>
                <Loader2 className='h-6 w-6 animate-spin text-primary' />
              </div>
            )}
            {status === 'success' && (
              <div className='rounded-full p-3'>
                <CheckCircle2 className='h-6 w-6 text-green-600' />
              </div>
            )}
            {status === 'error' && (
              <div className='rounded-full p-3'>
                <XCircle className='h-6 w-6 text-destructive' />
              </div>
            )}
          </div>

          <CardTitle className='text-center'>
            {status === 'loading' &&
              t('emailVerification.verifying', 'Verifying')}
            {status === 'success' &&
              t('emailVerification.verified', 'Verified')}
            {status === 'error' &&
              t('emailVerification.verificationFailed', 'Verification Failed')}
          </CardTitle>

          <CardDescription className='text-center'>
            {status === 'loading' &&
              t('emailVerification.pleaseWait', 'Please wait')}
            {status === 'success' &&
              (user
                ? t(
                    'emailVerification.successDescriptionLoggedIn',
                    'Your email has been verified successfully! Redirecting...'
                  )
                : t(
                    'emailVerification.successDescription',
                    'Your email has been verified successfully. Please sign in to continue.'
                  ))}
            {status === 'error' && errorMessage}
          </CardDescription>
        </CardHeader>

        {status === 'success' && (
          <CardContent>
            <div className='flex items-start gap-3 rounded-lg border bg-muted/50 p-4'>
              <Mail className='mt-0.5 h-5 w-5 text-muted-foreground' />
              <div className='flex-1'>
                <p className='font-medium text-sm'>
                  {t('emailVerification.allSet', 'All set!')}
                </p>
                <p className='mt-1 text-muted-foreground text-sm'>
                  {user
                    ? t(
                        'emailVerification.redirectingToDashboard',
                        'Redirecting...'
                      )
                    : t(
                        'emailVerification.redirectingToLogin',
                        'Redirecting to sign in page...'
                      )}
                </p>
              </div>
            </div>
          </CardContent>
        )}

        {status === 'success' && (
          <CardFooter className='justify-center'>
            <Button
              onClick={() => {
                if (user) {
                  if (!user.onboarding_completed) {
                    navigate({ to: '/onboarding' })
                  } else {
                    navigate({ to: '/' })
                  }
                } else {
                  navigate({ to: '/sign-in' })
                }
              }}
            >
              {user
                ? t('emailVerification.goToDashboard', 'Go to Dashboard')
                : t('emailVerification.goToSignIn', 'Go to Sign In')}
            </Button>
          </CardFooter>
        )}

        {status === 'error' && (
          <CardFooter className='flex flex-col gap-2'>
            <Button
              className='w-full'
              onClick={() => navigate({ to: '/sign-in' })}
            >
              {t('emailVerification.goToSignIn', 'Go to Sign In')}
            </Button>
            {errorMessage.includes('already verified') ||
            errorMessage.includes('expired') ? (
              <Button
                variant='outline'
                className='w-full'
                onClick={async () => {
                  // Try resending verification email if user is logged in
                  const { user } = useAuthStore.getState()
                  if (user && !user.emailVerified) {
                    try {
                      await api.post('/auth/resend-verification', {
                        email: user.email,
                      })
                      toast.success(
                        t(
                          'emailVerification.resendSuccess',
                          'Verification email sent! Please check your inbox.'
                        )
                      )
                    } catch {
                      // Ignore errors
                    }
                  }
                }}
              >
                {t(
                  'emailVerification.resendEmail',
                  'Resend Verification Email'
                )}
              </Button>
            ) : (
              <Button
                variant='outline'
                className='w-full'
                onClick={() => window.location.reload()}
              >
                {t('common.tryAgain', 'Try Again')}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
