import { useMutation } from '@tanstack/react-query'
import { AlertCircle, Mail, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { formatTime, useTimer } from '@/hooks/use-timer'
import { useAuth } from '@/stores/auth-store'

interface EmailVerificationBannerProps {
  className?: string
}

export function EmailVerificationBanner({
  className,
}: EmailVerificationBannerProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [canResend, setCanResend] = useState(true)

  // Rate limiting timer (60 seconds)
  const timer = useTimer(60, {
    onComplete: () => {
      setCanResend(true)
    },
  })

  const resendMutation = useMutation({
    mutationFn: async () => {
      if (!user?.email) {
        throw new Error('No email address found')
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/resend-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email: user.email }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to resend verification email')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success(
        t(
          'auth.emailVerification.resent',
          'Verification email sent! Please check your inbox.'
        )
      )
      setCanResend(false)
      timer.reset()
      timer.start()
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          t(
            'auth.emailVerification.resendFailed',
            'Failed to resend verification email'
          )
      )
    },
  })

  const handleResend = () => {
    if (!canResend) {
      toast.error(
        t(
          'auth.emailVerification.rateLimited',
          'Please wait {{time}} before requesting another verification email',
          { time: formatTime(timer.timeLeft) }
        )
      )
      return
    }

    resendMutation.mutate()
  }

  // Don't show if user is verified
  if (!user || user.is_verified) {
    return null
  }

  return (
    <Alert
      variant='default'
      className={`relative border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 ${className || ''}`}
    >
      <AlertCircle className='h-4 w-4 text-yellow-600 dark:text-yellow-500' />
      <AlertTitle className='text-yellow-900 dark:text-yellow-100'>
        {t('auth.emailVerification.bannerTitle', 'Email Verification Required')}
      </AlertTitle>
      <AlertDescription className='flex flex-col gap-3 text-yellow-800 dark:text-yellow-200'>
        <p>
          {t(
            'auth.emailVerification.bannerDescription',
            'Please verify your email address to unlock all features. Check your inbox for the verification link.'
          )}
        </p>
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={handleResend}
            disabled={resendMutation.isPending || !canResend}
            className='border-yellow-300 bg-yellow-100 hover:bg-yellow-200 dark:border-yellow-800 dark:bg-yellow-900 dark:hover:bg-yellow-800'
          >
            {resendMutation.isPending ? (
              <>
                <RefreshCw className='mr-2 h-3 w-3 animate-spin' />
                {t('auth.emailVerification.sending', 'Sending...')}
              </>
            ) : (
              <>
                <Mail className='mr-2 h-3 w-3' />
                {t('auth.emailVerification.resendButton', 'Resend Email')}
              </>
            )}
          </Button>
          {!canResend && (
            <span className='text-xs text-yellow-700 dark:text-yellow-300'>
              {t('auth.emailVerification.nextRequest', 'Next request in')}:{' '}
              <span className='font-mono font-semibold'>
                {formatTime(timer.timeLeft)}
              </span>
            </span>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
