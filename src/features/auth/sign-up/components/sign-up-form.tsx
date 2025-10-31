import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, UserPlus } from 'lucide-react'
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
import { getRegisterSchema, type RegisterFormData } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { useAuth } from '@/stores/auth-store'

export function SignUpForm({
  className,
  defaultEmail,
  ...props
}: Readonly<
  React.HTMLAttributes<HTMLFormElement> & { defaultEmail?: string }
>) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { register } = useAuth()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(getRegisterSchema()),
    defaultValues: {
      name: '',
      email: defaultEmail || '',
      password: '',
      confirmPassword: '',
    },
  })

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password }: RegisterFormData) =>
      register(email, password, name),
    onSuccess: async () => {
      // Clear any form errors on success
      form.clearErrors()

      // Small delay to ensure Zustand state is fully updated
      await new Promise((resolve) => setTimeout(resolve, 0))

      // Show success message
      toast.success(
        t(
          'auth.signUpSuccess',
          'Account created successfully! A verification email has been sent.'
        )
      )

      // Redirect to onboarding - user is now logged in!
      navigate({
        to: '/onboarding',
        replace: true,
      })
    },
    onError: (error: unknown) => {
      // biome-ignore lint/suspicious/noConsole: Intentional error logging
      console.error('Registration error:', error)

      const axiosError = error as {
        response?: {
          status?: number
          data?: {
            detail?: string | { error?: string; message?: string }
            error?: string
            message?: string
          }
        }
        message?: string
      }

      // First, check if the error message itself contains "already exists"
      const errorMessage = axiosError.message || ''
      const isUserExistsInMessage =
        errorMessage.toLowerCase().includes('already exists') ||
        errorMessage.toLowerCase().includes('already registered')

      if (isUserExistsInMessage) {
        const message = t(
          'auth.signUpEmailExists',
          'This email is already registered. Please sign in instead or use a different email.'
        )
        form.setError('email', {
          type: 'manual',
          message: message,
        })
        toast.error(message)
        return
      }

      if (axiosError.response?.status === 400) {
        // Handle nested detail structure from backend
        const detail = axiosError.response.data?.detail
        const errorData =
          typeof detail === 'object' ? detail : axiosError.response.data

        // Check for "User with this email already exists" message
        const detailMessage = typeof detail === 'string' ? detail : ''
        const isUserExists =
          errorData?.error === 'USER_EXISTS' ||
          detailMessage.toLowerCase().includes('already exists') ||
          detailMessage.toLowerCase().includes('already registered')

        if (isUserExists) {
          const errorMessage = t(
            'auth.signUpEmailExists',
            'This email is already registered. Please sign in instead or use a different email.'
          )
          form.setError('email', {
            type: 'manual',
            message: errorMessage,
          })
          toast.error(errorMessage)
        } else {
          const errorMessage =
            errorData?.message ||
            detailMessage ||
            t(
              'auth.signUpRegistrationFailed',
              'Registration failed. Please try again.'
            )
          form.setError('root', {
            type: 'manual',
            message: errorMessage,
          })
          toast.error(errorMessage)
        }
      } else if (axiosError.response?.status === 422) {
        const errorMessage = t(
          'auth.signUpCheckInformation',
          'Please check your information and try again.'
        )
        form.setError('root', {
          type: 'manual',
          message: errorMessage,
        })
        toast.error(errorMessage)
      } else {
        // Handle network errors and other errors
        const isNetworkError =
          axiosError.message?.toLowerCase().includes('network error') ||
          axiosError.message?.toLowerCase().includes('failed to fetch') ||
          !axiosError.response

        const errorMessage = isNetworkError
          ? t(
              'auth.networkError',
              'Network error. Please check your connection and try again.'
            )
          : t(
              'auth.signUpRegistrationFailed',
              'Registration failed. Please try again.'
            )

        form.setError('root', {
          type: 'manual',
          message: errorMessage,
        })
        toast.error(errorMessage)
      }
    },
  })

  function onSubmit(data: RegisterFormData) {
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    })
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
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.signUpFullName', 'Full Name')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t(
                    'auth.signUpFullNamePlaceholder',
                    'Enter your full name'
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.email', 'Email')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t(
                    'auth.signUpEmailPlaceholder',
                    'Enter your email address'
                  )}
                  {...field}
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
            <FormItem>
              <FormLabel>{t('auth.password', 'Password')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t(
                    'auth.signUpPasswordPlaceholder',
                    'Create a password'
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('auth.confirmPassword', 'Confirm Password')}
              </FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t(
                    'auth.signUpConfirmPasswordPlaceholder',
                    'Re-enter your password'
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={registerMutation.isPending}>
          {registerMutation.isPending ? (
            <Loader2 className='animate-spin' />
          ) : (
            <UserPlus />
          )}
          {t('auth.signUpCreateAccount', 'Create Account')}
        </Button>

        <SocialLogin className='mt-2' redirectTo='/' />
      </form>
    </Form>
  )
}
