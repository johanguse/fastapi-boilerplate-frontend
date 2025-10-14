import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/(auth)/verify-email')({
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { token } = useSearch({ from: '/(auth)/verify-email' }) as {
    token?: string
  }
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError(t('emailVerification.noToken'))
      return
    }

    const verifyEmail = async () => {
      try {
        await api.post(`/api/v1/invitations/verify-email/${token}`)
        setStatus('success')
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate({ to: '/' })
        }, 3000)
      } catch (err) {
        setStatus('error')
        // If using axios, err is likely AxiosError; otherwise, check for response property
        const errorDetail = (
          err as { response?: { data?: { detail?: string } } }
        ).response?.data?.detail
        setError(errorDetail || t('emailVerification.verificationFailed'))
      }
    }

    verifyEmail()
  }, [token, navigate, t])

  return (
    <div className='bg-muted/40 flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
            {status === 'loading' && (
              <div className='bg-primary/10'>
                <Loader2 className='text-primary h-6 w-6 animate-spin' />
              </div>
            )}
            {status === 'success' && (
              <div className='rounded-full bg-green-100 p-3'>
                <CheckCircle2 className='h-6 w-6 text-green-600' />
              </div>
            )}
            {status === 'error' && (
              <div className='bg-destructive/10 rounded-full p-3'>
                <XCircle className='text-destructive h-6 w-6' />
              </div>
            )}
          </div>

          <CardTitle className='text-center'>
            {status === 'loading' && t('emailVerification.verifying')}
            {status === 'success' && t('emailVerification.verified')}
            {status === 'error' && t('emailVerification.verificationFailed')}
          </CardTitle>

          <CardDescription className='text-center'>
            {status === 'loading' && t('emailVerification.pleaseWait')}
            {status === 'success' && t('emailVerification.successDescription')}
            {status === 'error' && error}
          </CardDescription>
        </CardHeader>

        {status === 'success' && (
          <CardContent>
            <div className='bg-muted/50 flex items-start gap-3 rounded-lg border p-4'>
              <Mail className='text-muted-foreground mt-0.5 h-5 w-5' />
              <div className='flex-1'>
                <p className='text-sm font-medium'>
                  {t('emailVerification.allSet')}
                </p>
                <p className='text-muted-foreground mt-1 text-sm'>
                  {t('emailVerification.redirectingToDashboard')}
                </p>
              </div>
            </div>
          </CardContent>
        )}

        {status === 'success' && (
          <CardFooter className='justify-center'>
            <Button onClick={() => navigate({ to: '/' })}>
              {t('emailVerification.goToDashboard')}
            </Button>
          </CardFooter>
        )}

        {status === 'error' && (
          <CardFooter className='flex flex-col gap-2'>
            <Button className='w-full' onClick={() => navigate({ to: '/' })}>
              {t('navigation.dashboard')}
            </Button>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => window.location.reload()}
            >
              {t('common.tryAgain')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
