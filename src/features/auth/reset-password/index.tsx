import { useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { ResetPasswordForm } from './components/reset-password-form'

export function ResetPassword() {
  const { t } = useTranslation()
  const { token } = useSearch({ from: '/(auth)/reset-password' }) as {
    token?: string
  }

  if (!token) {
    return (
      <AuthLayout>
        <Card className='gap-4'>
          <CardHeader>
            <CardTitle className='text-lg tracking-tight'>
              {t('auth.resetPasswordTitle', 'Reset Password')}
            </CardTitle>
            <CardDescription>
              {t(
                'auth.resetPasswordNoToken',
                'Invalid or missing reset token. Please request a new password reset link.'
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            {t('auth.resetPasswordTitle', 'Reset Password')}
          </CardTitle>
          <CardDescription>
            {t(
              'auth.resetPasswordDescription',
              'Enter your new password below.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm token={token} />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
