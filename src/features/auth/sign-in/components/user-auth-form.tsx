import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { SocialLogin } from '@/components/auth/social-login'
import { PasswordInput } from '@/components/password-input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { getLoginSchema, type LoginFormData } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { useAuth } from '@/stores/auth-store'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  readonly redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: Readonly<UserAuthFormProps>) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { login } = useAuth()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(getLoginSchema()),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginFormData) => login(email, password),
    onSuccess: async (user) => {
      // Clear any form errors on success
      form.clearErrors()

      // biome-ignore lint/suspicious/noConsole: Debug login flow
      console.log('Login onSuccess - user data:', user)

      // Show success toast immediately
      toast.success(t('auth.welcome', 'Welcome!'))

      // Longer delay to ensure cookies are fully set and Zustand state is updated
      // This is critical for the onboarding page to have access to auth state
      setTimeout(() => {
        // Priority 1: Check onboarding status first
        if (user && !user.onboarding_completed) {
          // User hasn't completed onboarding - always go to onboarding
          // biome-ignore lint/suspicious/noConsole: Debug navigation
          console.log('Navigating to /onboarding')
          navigate({ to: '/onboarding', replace: true })
        } else {
          // User has completed onboarding or doesn't have onboarding
          // Priority 2: Use redirectTo if it's NOT the onboarding page
          // Priority 3: Default to root page
          const targetPath =
            redirectTo && redirectTo !== '/onboarding' ? redirectTo : '/'
          // biome-ignore lint/suspicious/noConsole: Debug navigation
          console.log('Navigating to:', targetPath)
          navigate({ to: targetPath, replace: true })
        }
      }, 300) // Increased to 300ms to ensure cookies are set
    },
    onError: (error: unknown) => {
      // Handle error from Better Auth login
      const axiosError = error as {
        response?: {
          data?: {
            detail?: {
              error?: string
              message?: string
            }
          }
        }
      }

      // Check for specific error types
      const errorType = axiosError.response?.data?.detail?.error
      const backendMessage = axiosError.response?.data?.detail?.message

      let errorMessage: string

      if (errorType === 'EMAIL_NOT_VERIFIED') {
        // Email not verified error
        errorMessage =
          backendMessage ||
          t(
            'auth.emailNotVerified',
            'Please verify your email address before logging in. Check your inbox for the verification link.'
          )
      } else {
        // Default invalid credentials message
        errorMessage = t(
          'auth.invalidCredentials',
          'Invalid email or password.'
        )
      }

      // Set inline error on form root
      form.setError('root', {
        type: 'manual',
        message: errorMessage,
      })

      // Also show toast for better UX
      toast.error(errorMessage)

      // Log the actual error for debugging
      if (error instanceof Error) {
        // biome-ignore lint/suspicious/noConsole: Intentional error logging
        console.error('Login error:', error.message)
      }
    },
  })

  function onSubmit(data: LoginFormData) {
    // Clear any previous root errors when submitting
    if (form.formState.errors.root) {
      form.clearErrors('root')
    }
    loginMutation.mutate(data)
  }

  // Clear root errors when user types
  const clearRootError = () => {
    if (form.formState.errors.root) {
      form.clearErrors('root')
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        {form.formState.errors.root && (
          <div className='mb-4 rounded-md border border-destructive bg-destructive/10 p-3'>
            <p className='font-medium text-destructive text-sm'>
              {form.formState.errors.root.message}
            </p>
          </div>
        )}
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.email', 'Email')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t(
                    'auth.emailPlaceholder',
                    'Enter your email address'
                  )}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    clearRootError()
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>{t('auth.password', 'Password')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t(
                    'auth.passwordPlaceholder',
                    'Enter your password'
                  )}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    clearRootError()
                  }}
                />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='-top-0.5 absolute end-0 font-medium text-muted-foreground text-sm hover:opacity-75'
              >
                {t('auth.forgotPassword', 'Forgot password?')}
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={loginMutation.isPending}>
          {loginMutation.isPending ? (
            <Loader2 className='animate-spin' />
          ) : (
            <LogIn />
          )}
          {t('auth.signIn', 'Sign In')}
        </Button>

        <SocialLogin className='mt-2' redirectTo={redirectTo || '/dashboard'} />
      </form>
    </Form>
  )
}
