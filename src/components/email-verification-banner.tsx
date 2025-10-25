import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AlertTriangle, Mail, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/stores/auth-store'

interface EmailVerificationBannerProps {
  className?: string
}

export function EmailVerificationBanner({ className }: EmailVerificationBannerProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // Don't show banner if user is verified or dismissed
  if (!user || user.is_verified || isDismissed) {
    return null
  }

  const handleResendVerification = async () => {
    if (!user?.email) return

    setIsResending(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: user.email }),
      })

      if (response.ok) {
        toast.success(t('auth.emailVerification.resent', 'Verification email sent! Please check your inbox.'))
      } else {
        const error = await response.json()
        toast.error(error.message || t('auth.emailVerification.resendFailed', 'Failed to resend verification email'))
      }
    } catch (error) {
      toast.error(t('auth.emailVerification.resendFailed', 'Failed to resend verification email'))
    } finally {
      setIsResending(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  return (
    <Alert className={`border-orange-200 bg-orange-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-orange-600" />
          <span className="text-orange-800">
            {t('auth.emailVerification.message', 'Please verify your email address to access all features.')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            {isResending 
              ? t('auth.emailVerification.sending', 'Sending...') 
              : t('auth.emailVerification.resend', 'Resend')
            }
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-orange-600 hover:bg-orange-100 p-1 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}