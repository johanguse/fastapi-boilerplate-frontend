import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react'
import { useState } from 'react'
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

export const Route = createFileRoute('/(auth)/check-email')({
  component: CheckEmailPage,
})

function CheckEmailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { email } = useSearch({ from: '/(auth)/check-email' }) as {
    email?: string
  }
  const [isResending, setIsResending] = useState(false)

  const handleResendEmail = async () => {
    if (!email) return

    setIsResending(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/invitations/verify-email/resend`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      )

      if (response.ok) {
        toast.success(
          t(
            'auth.emailVerification.resent',
            'Verification email sent! Please check your inbox.'
          )
        )
      } else {
        const error = await response.json()
        toast.error(
          error.message ||
            t(
              'auth.emailVerification.resendFailed',
              'Failed to resend verification email'
            )
        )
      }
    } catch (_error) {
      toast.error(
        t(
          'auth.emailVerification.resendFailed',
          'Failed to resend verification email'
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
            {t('auth.checkEmail.title', 'Check your email')}
          </CardTitle>

          <CardDescription className='text-center'>
            {email ? (
              <>
                {t(
                  'auth.checkEmail.descriptionWithEmail',
                  'We sent a verification link to'
                )}{' '}
                <strong className='font-medium text-foreground'>{email}</strong>
              </>
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
                    {t(
                      'auth.checkEmail.step2',
                      'Click the verification link in the email'
                    )}
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='mt-0.5'>3.</span>
                  <span>
                    {t(
                      'auth.checkEmail.step3',
                      "You'll be redirected to complete your profile"
                    )}
                  </span>
                </li>
              </ol>
            </div>

            <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950'>
              <p className='text-muted-foreground text-sm'>
                {t(
                  'auth.checkEmail.cantFindEmail',
                  "Can't find the email? Check your spam folder or request a new one."
                )}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className='flex flex-col gap-2'>
          <Button
            className='w-full'
            onClick={handleResendEmail}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                {t('auth.checkEmail.resending', 'Resending...')}
              </>
            ) : (
              <>
                <RefreshCw className='mr-2 h-4 w-4' />
                {t('auth.checkEmail.resendEmail', 'Resend Email')}
              </>
            )}
          </Button>

          <Button
            variant='outline'
            className='w-full'
            onClick={() => navigate({ to: '/sign-in' })}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            {t('auth.checkEmail.backToSignIn', 'Back to Sign In')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
