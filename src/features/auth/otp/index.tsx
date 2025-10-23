import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { OtpForm } from './components/otp-form'

export function Otp() {
  const { t } = useTranslation()
  
  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-base tracking-tight'>
            {t('auth.otp.title', 'Two-factor Authentication')}
          </CardTitle>
          <CardDescription>
            {t('auth.otp.description', 'Please enter the authentication code. We have sent the authentication code to your email.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OtpForm />
        </CardContent>
        <CardFooter>
          <p className='px-8 text-center text-muted-foreground text-sm'>
            {t('auth.otp.haventReceived', "Haven't received it?")}{' '}
            <Link
              to='/sign-in'
              className='underline underline-offset-4 hover:text-primary'
            >
              {t('auth.otp.resendCode', 'Resend a new code.')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
