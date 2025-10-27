import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle2, Loader2, Mail, XCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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

export const Route = createFileRoute('/(auth)/verify-email')({
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { token } = useSearch({ from: '/(auth)/verify-email' }) as {
    token?: string
  }

  const verifyMutation = useMutation({
    mutationFn: async (verificationToken: string) => {
      const response = await api.post(
        `/invitations/verify-email/${verificationToken}`
      )
      return response.data
    },
  })

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token)
    }
    // verifyMutation.mutate is stable from useMutation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, verifyMutation.mutate])

  useEffect(() => {
    if (verifyMutation.isSuccess) {
      // Redirect to dashboard after 3 seconds
      const timer = setTimeout(() => {
        navigate({ to: '/' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [verifyMutation.isSuccess, navigate])

  const getErrorMessage = (): string => {
    if (!token) {
      return t('emailVerification.noToken', 'No token provided')
    }
    if (verifyMutation.error) {
      const error = verifyMutation.error
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'detail' in error.response.data &&
        typeof error.response.data.detail === 'string'
      ) {
        return error.response.data.detail
      }
    }
    return t(
      'emailVerification.verificationFailed',
      'Email verification failed'
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
              <div className='bg-primary/10'>
                <Loader2 className='h-6 w-6 animate-spin text-primary' />
              </div>
            )}
            {status === 'success' && (
              <div className='rounded-full bg-green-100 p-3'>
                <CheckCircle2 className='h-6 w-6 text-green-600' />
              </div>
            )}
            {status === 'error' && (
              <div className='rounded-full bg-destructive/10 p-3'>
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
              t(
                'emailVerification.successDescription',
                'Your email has been verified successfully'
              )}
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
                  {t(
                    'emailVerification.redirectingToDashboard',
                    'Redirecting to dashboard'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        )}

        {status === 'success' && (
          <CardFooter className='justify-center'>
            <Button onClick={() => navigate({ to: '/' })}>
              {t('emailVerification.goToDashboard', 'Go to Dashboard')}
            </Button>
          </CardFooter>
        )}

        {status === 'error' && (
          <CardFooter className='flex flex-col gap-2'>
            <Button className='w-full' onClick={() => navigate({ to: '/' })}>
              {t('navigation.dashboard', 'Dashboard')}
            </Button>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => window.location.reload()}
            >
              {t('common.tryAgain', 'Try Again')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
