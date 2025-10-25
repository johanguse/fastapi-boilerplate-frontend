import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AuthLayout } from '../auth-layout'
import { OtpForm } from './components/otp-form'
import { useTimer, formatTime } from '@/hooks/use-timer'
import { toast } from 'sonner'

export function Otp() {
  const { t } = useTranslation()
  const [canResend, setCanResend] = useState(false)
  
  // Timer for resend cooldown (5 minutes = 300 seconds)
  const timer = useTimer(300, {
    onComplete: () => {
      setCanResend(true)
    }
  })

  const handleResend = async () => {
    if (canResend) {
      try {
        // TODO: Implement proper resend verification logic with Better Auth
        // For now, just show a success message
        toast.success(t('auth.otp.resendSuccess', 'Verification email sent successfully'))
        setCanResend(false)
        timer.reset()
        timer.start()
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Error logging for debugging
        console.error('Resend verification error:', error)
        toast.error(t('common.error', 'An error occurred'))
      }
    }
  }

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-base tracking-tight'>
            {t('auth.otp.title', 'Two-factor Authentication')}
          </CardTitle>
          <CardDescription>
            {t(
              'auth.otp.description',
              'Please enter the authentication code. We have sent the authentication code to your email.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OtpForm />
        </CardContent>
        <CardFooter>
          <div className='flex w-full flex-col items-center gap-2'>
            <p className='text-center text-muted-foreground text-sm'>
              {t('auth.otp.haventReceived', "Haven't received it?")}
            </p>
            {canResend ? (
              <Button
                variant='link'
                onClick={handleResend}
                className='underline underline-offset-4 hover:text-primary'
              >
                {t('auth.otp.resendCode', 'Resend a new code')}
              </Button>
            ) : (
              <div className='text-center text-muted-foreground text-sm'>
                <p>
                  {t('auth.otp.resendIn', 'Resend available in')}:{' '}
                  <span className='font-mono font-semibold text-primary'>
                    {formatTime(timer.timeLeft)}
                  </span>
                </p>
              </div>
            )}
            <Link
              to='/sign-in'
              className='text-center text-sm text-muted-foreground underline underline-offset-4 hover:text-primary'
            >
              {t('auth.otp.backToSignIn', 'Back to Sign In')}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
