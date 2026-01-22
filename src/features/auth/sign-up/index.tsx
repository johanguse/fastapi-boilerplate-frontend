import { Link, useSearch } from '@tanstack/react-router'
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
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  const { t } = useTranslation()
  const { email } = useSearch({ from: '/(auth)/sign-up' })

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            {t('auth.signUpTitle', 'Sign Up')}
          </CardTitle>
          <CardDescription>
            {t('auth.signUpDescription', 'Create your account below.')} <br />
            {t('auth.signUpAlreadyHaveAccount', 'Already have an account?')}{' '}
            <Link
              to='/sign-in'
              className='underline underline-offset-4 hover:text-primary'
            >
              {t('auth.signIn', 'Sign In')}
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm defaultEmail={email} />
        </CardContent>
        <CardFooter>
          <p className='px-8 text-center text-muted-foreground text-sm'>
            {t(
              'auth.signUpByCreating',
              'By creating an account, you agree to our'
            )}{' '}
            <a
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              {t('auth.terms', 'Terms of Service')}
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              {t('auth.privacy', 'Privacy Policy')}
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
