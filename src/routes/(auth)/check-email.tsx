import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { formatTime, useTimer } from '@/hooks/use-timer'

export const Route = createFileRoute('/(auth)/check-email')({
  component: CheckEmailPage,
})

function CheckEmailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { email, type } = useSearch({ from: '/(auth)/check-email' }) as {
    email?: string
    type?: string
  }

  const isPasswordReset = type === 'password-reset'
  const [isResending, setIsResending] = useState(false)
  const [canResend, setCanResend] = useState(true)

  // Rate limiting timer (1 minute = 60 seconds)
  const timer = useTimer(60, {
    onComplete: () => {
      setCanResend(true)
    },
  })

  // Start timer when component mounts
  useEffect(() => {
    timer.start()
  }, [timer])

  const handleResendEmail = async () => {
    if (!email) return

    if (!canResend) {
      toast.error(
        t(
          isPasswordReset
            ? 'auth.forgotPasswordRateLimited'
            : 'auth.emailVerification.rateLimited',
          isPasswordReset
            ? 'Please wait {{time}} before requesting another password reset'
            : 'Please wait {{time}} before requesting another verification email',
          { time: formatTime(timer.timeLeft) }
        )
      )
      return
    }

    setIsResending(true)
    try {
      const endpoint = isPasswordReset
        ? '/api/v1/auth/forgot-password'
        : '/api/v1/auth/resend-verification'

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email }),
        }
      )

      if (response.ok) {
        toast.success(
          t(
            isPasswordReset
              ? 'auth.forgotPasswordEmailSent'
              : 'auth.emailVerification.resent',
            isPasswordReset
              ? 'Password reset link sent! Please check your inbox.'
              : 'Verification email sent! Please check your inbox.'
          )
        )
        setCanResend(false)
        timer.reset()
        timer.start()
      } else {
        const error = await response.json()
        toast.error(
          error.message ||
            t(
              isPasswordReset
                ? 'auth.forgotPasswordError'
                : 'auth.emailVerification.resendFailed',
              isPasswordReset
                ? 'Failed to resend password reset email'
                : 'Failed to resend verification email'
            )
        )
      }
    } catch (_error) {
      toast.error(
        t(
          isPasswordReset
            ? 'auth.forgotPasswordError'
            : 'auth.emailVerification.resendFailed',
          isPasswordReset
            ? 'Failed to resend password reset email'
            : 'Failed to resend verification email'
        )
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/40 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
            <Mail className='h-8 w-8 text-primary' />
          </div>

          <CardTitle className='text-center'>
            {isPasswordReset
              ? t('auth.checkEmail.passwordResetTitle', 'Check your email')
              : t('auth.checkEmail.title', 'Check your email')}
          </CardTitle>

          <CardDescription className='text-center'>
            {email ? (
              <>
                {isPasswordReset
                  ? t(
                      'auth.checkEmail.passwordResetDescriptionWithEmail',
                      'We sent a password reset link to'
                    )
                  : t(
                      'auth.checkEmail.descriptionWithEmail',
                      'We sent a verification link to'
                    )}{' '}
                <strong className='font-medium text-foreground'>{email}</strong>
              </>
            ) : isPasswordReset ? (
              t(
                'auth.checkEmail.passwordResetDescription',
                'We sent you a password reset link. Please check your email.'
              )
            ) : (
              t(
                'auth.checkEmail.description',
                'We sent you a verification link. Please check your email.'
              )
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className='space-y-4'>
            <div className='rounded-lg border bg-muted/50 p-4'>
              <h4 className='font-medium text-sm'>
                {t('auth.checkEmail.nextSteps', 'Next steps:')}
              </h4>
              <ol className='mt-2 space-y-2 text-muted-foreground text-sm'>
                <li className='flex items-start gap-2'>
                  <span className='mt-0.5'>1.</span>
                  <span>
                    {t(
                      'auth.checkEmail.step1',
                      'Check your email inbox (and spam folder)'
                    )}
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='mt-0.5'>2.</span>
                  <span>
                    {isPasswordReset
                      ? t(
                          'auth.checkEmail.passwordResetStep2',
                          'Click the password reset link in the email'
                        )
                      : t(
                          'auth.checkEmail.step2',
                          'Click the verification link in the email'
                        )}
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='mt-0.5'>3.</span>
                  <span>
                    {isPasswordReset
                      ? t(
                          'auth.checkEmail.passwordResetStep3',
                          'Enter your new password and sign in'
                        )
                      : t(
                          'auth.checkEmail.step3',
                          "Your email will be verified and you'll have full access"
                        )}
                  </span>
                </li>
              </ol>
            </div>

            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950'>
              <p className='text-blue-900 text-sm dark:text-blue-100'>
                <strong>{t('auth.checkEmail.note', 'Note:')}</strong>{' '}
                {t(
                  'auth.checkEmail.noteDescription',
                  'You can continue using the app, but some features require email verification.'
                )}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className='flex flex-col gap-2'>
          {!canResend && (
            <div className='mb-2 w-full text-center text-muted-foreground text-sm'>
              <p>
                {t(
                  'auth.emailVerification.nextRequest',
                  'Next request available in'
                )}
                :{' '}
                <span className='font-mono font-semibold text-primary'>
                  {formatTime(timer.timeLeft)}
                </span>
              </p>
            </div>
          )}

          <Button
            className='w-full'
            onClick={handleResendEmail}
            disabled={isResending || !canResend}
          >
            {isResending ? (
              <>
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                {t(
                  isPasswordReset
                    ? 'auth.resendingPasswordReset'
                    : 'auth.checkEmail.resending',
                  isPasswordReset ? 'Resending...' : 'Resending...'
                )}
              </>
            ) : (
              <>
                <RefreshCw className='mr-2 h-4 w-4' />
                {t(
                  isPasswordReset
                    ? 'auth.resendPasswordReset'
                    : 'auth.checkEmail.resendEmail',
                  isPasswordReset ? 'Resend Reset Link' : 'Resend Email'
                )}
              </>
            )}
          </Button>

          <Button
            variant='outline'
            className='w-full'
            onClick={() => navigate({ to: '/' })}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            {t('auth.checkEmail.continueToDashboard', 'Continue to Dashboard')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
