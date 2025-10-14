import { AlertCircle, Mail, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

interface EmailVerificationBannerProps {
  email: string
  onDismiss?: () => void
}

export function EmailVerificationBanner({
  email,
  onDismiss,
}: EmailVerificationBannerProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const handleResendEmail = async () => {
    setIsLoading(true)
    try {
      await api.post('/api/v1/invitations/verify-email/resend')
      toast.success(t('emailVerification.emailSent'), {
        description: t('emailVerification.checkInbox', { email }),
      })
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { detail?: string } } })?.response
              ?.data?.detail || t('emailVerification.resendFailed')

      toast.error(t('common.error'), {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed) return null

  return (
    <Alert className='relative border-yellow-500 bg-yellow-50 dark:bg-yellow-950'>
      <AlertCircle className='h-4 w-4 text-yellow-600 dark:text-yellow-500' />
      <AlertDescription className='ml-2 flex items-center justify-between gap-4'>
        <div className='flex items-center gap-2'>
          <Mail className='h-4 w-4' />
          <span className='text-sm'>
            {t('emailVerification.notVerified', { email })}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={handleResendEmail}
            disabled={isLoading}
            className='border-yellow-600 text-yellow-600 hover:bg-yellow-100 dark:border-yellow-500 dark:text-yellow-500'
          >
            {isLoading ? t('common.loading') : t('emailVerification.resend')}
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={handleDismiss}
            className='h-6 w-6 p-0'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
