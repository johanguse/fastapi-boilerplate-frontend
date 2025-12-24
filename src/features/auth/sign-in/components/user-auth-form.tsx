import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod/v4'
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { getLoginSchema, type LoginFormData } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { useAuth } from '@/stores/auth-store'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  readonly redirectTo?: string
}

const createOtpFormSchema = (
  t: (key: string, defaultValue: string) => string
) =>
  z.object({
    email: z
      .string()
      .email(t('auth.email.invalid', 'Please enter a valid email address')),
    otp: z
      .string()
      .length(
        6,
        t('auth.otp.validation.required', 'Please enter the 6-digit code')
      ),
  })

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: Readonly<UserAuthFormProps>) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { login, checkSession } = useAuth()
  const [useOtp, setUseOtp] = useState(false)
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email')

  const form = useForm<LoginFormData>({
    resolver: zodResolver(getLoginSchema()),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const otpFormSchema = createOtpFormSchema(t)
  const otpForm = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      email: '',
      otp: '',
    },
  })

  const otpEmail = otpForm.watch('email')
  const otpCode = otpForm.watch('otp')

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/otp/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.detail?.message || 'Failed to send verification code'
        )
      }

      return response.json()
    },
    onSuccess: () => {
      setOtpStep('code')
      toast.success(t('auth.otp.sent', 'Verification code sent to your email'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/otp/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, code }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail?.message || 'Invalid or expired code')
      }

      return response.json()
    },
    onSuccess: async (data) => {
      if (data.user) {
        // Refresh session to update auth state
        await checkSession()

        toast.success(t('auth.welcome', 'Welcome!'))

        await new Promise((resolve) => setTimeout(resolve, 500))

        if (data.user && !data.user.onboarding_completed) {
          navigate({ to: '/onboarding', replace: true })
        } else {
          const targetPath =
            redirectTo && redirectTo !== '/onboarding' ? redirectTo : '/'
          navigate({ to: targetPath, replace: true })
        }
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
      otpForm.setError('otp', {
        type: 'manual',
        message: error.message,
      })
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

      // Important: Verify session is established before navigating
      // This ensures cookies are set and state is synchronized
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Navigate based on onboarding status
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

  function onSendOtp() {
    const email = otpForm.getValues('email')
    if (email) {
      sendOtpMutation.mutate(email)
    }
  }

  function onVerifyOtp() {
    const { email, otp: code } = otpForm.getValues()
    if (email && code) {
      verifyOtpMutation.mutate({ email, code })
    }
  }

  // Clear root errors when user types
  const clearRootError = () => {
    if (form.formState.errors.root) {
      form.clearErrors('root')
    }
  }

  // Render OTP login form
  if (useOtp) {
    return (
      <Form {...otpForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (otpStep === 'email') {
              onSendOtp()
            } else {
              onVerifyOtp()
            }
          }}
          className={cn('grid gap-3', className)}
          {...props}
        >
          {otpStep === 'email' ? (
            <>
              <FormField
                control={otpForm.control}
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className='mt-2'
                disabled={sendOtpMutation.isPending || !otpEmail}
              >
                {sendOtpMutation.isPending ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  <Mail />
                )}
                {t('auth.sendCode', 'Send Code')}
              </Button>
            </>
          ) : (
            <>
              <div className='mb-2 text-center text-muted-foreground text-sm'>
                {t(
                  'auth.otp.enterCode',
                  'Enter the 6-digit code sent to {{email}}',
                  { email: otpEmail }
                )}
              </div>
              <FormField
                control={otpForm.control}
                name='otp'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='sr-only'>
                      {t('auth.otp.code', 'Verification Code')}
                    </FormLabel>
                    <FormControl>
                      <div className='flex justify-center'>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className='mt-2'
                disabled={verifyOtpMutation.isPending || otpCode?.length !== 6}
              >
                {verifyOtpMutation.isPending ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  <LogIn />
                )}
                {t('auth.verifyAndSignIn', 'Verify & Sign In')}
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setOtpStep('email')}
                disabled={sendOtpMutation.isPending}
              >
                {t('auth.otp.changeEmail', 'Change email')}
              </Button>
            </>
          )}

          <Button
            type='button'
            variant='link'
            size='sm'
            onClick={() => {
              setUseOtp(false)
              setOtpStep('email')
              otpForm.reset()
            }}
            className='text-muted-foreground'
          >
            <span className='underline'>
              {t('auth.usePassword', 'Use password instead')}
            </span>
          </Button>

          <SocialLogin
            className='mt-2'
            redirectTo={redirectTo || '/dashboard'}
          />
        </form>
      </Form>
    )
  }

  // Render password login form (default)
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
                className='absolute end-0 -top-0.5 font-medium text-muted-foreground text-sm hover:opacity-75'
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

        <Button
          type='button'
          variant='link'
          size='sm'
          onClick={() => {
            setUseOtp(true)
            otpForm.setValue('email', form.getValues('email'))
          }}
          className='text-muted-foreground'
        >
          <span className='underline'>
            {t('auth.getCode', 'Get a code instead')}
          </span>
        </Button>

        <SocialLogin className='mt-2' redirectTo={redirectTo || '/dashboard'} />
      </form>
    </Form>
  )
}
