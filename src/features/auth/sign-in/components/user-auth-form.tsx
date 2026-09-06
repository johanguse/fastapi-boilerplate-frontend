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
import { TurnstileWidget } from '@/components/turnstile-widget'
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
import { useTurnstile } from '@/hooks/use-turnstile'
import { getLoginSchema, type LoginFormData } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { useAuth } from '@/stores/auth-store'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  readonly redirectTo?: string
}

// otp field is optional so form.handleSubmit works across both steps;
// the button's disabled state guards against premature submission
const createOtpFormSchema = (
  t: (key: string, defaultValue: string) => string
) =>
  z.object({
    email: z
      .string()
      .email(t('auth.emailInvalid', 'Please enter a valid email address')),
    otp: z
      .string()
      .length(
        6,
        t('auth.otp.validation.required', 'Please enter the 6-digit code')
      ),
  })

// ---------------------------------------------------------------------------
// OTP login sub-form
// ---------------------------------------------------------------------------

interface OtpLoginFormProps extends React.HTMLAttributes<HTMLFormElement> {
  readonly redirectTo?: string
  onSwitchToPassword: (email: string) => void
  initialEmail?: string
}

function OtpLoginForm({
  className,
  redirectTo,
  onSwitchToPassword,
  initialEmail = '',
  ...props
}: Readonly<OtpLoginFormProps>) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { checkSession } = useAuth()
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email')
  const turnstile = useTurnstile()

  const otpFormSchema = createOtpFormSchema(t)
  const otpForm = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { email: initialEmail, otp: '' },
  })

  const otpEmail = otpForm.watch('email')
  const otpCode = otpForm.watch('otp')

  const sendOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/otp/send`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      turnstile.reset()
      toast.success(t('auth.otp.sent', 'Verification code sent to your email'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/otp/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      turnstile.reset()
      if (data.user) {
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
      otpForm.setError('otp', { type: 'manual', message: error.message })
    },
  })

  return (
    <Form {...otpForm}>
      <form
        onSubmit={otpForm.handleSubmit((data) => {
          if (otpStep === 'email') {
            if (data.email) sendOtpMutation.mutate(data.email)
          } else if (data.otp?.length === 6) {
            verifyOtpMutation.mutate({ email: data.email, code: data.otp })
          }
        })}
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
            <TurnstileWidget
              ref={turnstile.ref}
              onSuccess={turnstile.onSuccess}
              onExpire={turnstile.onExpire}
              onError={turnstile.onError}
              className='mt-2'
            />
            <Button
              className='mt-2'
              disabled={
                sendOtpMutation.isPending || !otpEmail || !turnstile.isVerified
              }
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
            <TurnstileWidget
              ref={turnstile.ref}
              onSuccess={turnstile.onSuccess}
              onExpire={turnstile.onExpire}
              onError={turnstile.onError}
              className='mt-2'
            />
            <Button
              className='mt-2'
              disabled={
                verifyOtpMutation.isPending ||
                otpCode?.length !== 6 ||
                !turnstile.isVerified
              }
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
            onSwitchToPassword(otpForm.getValues('email'))
            otpForm.reset()
          }}
          className='text-muted-foreground'
        >
          <span className='underline'>
            {t('auth.usePassword', 'Use password instead')}
          </span>
        </Button>

        <SocialLogin className='mt-2' redirectTo={redirectTo || '/dashboard'} />
      </form>
    </Form>
  )
}

// ---------------------------------------------------------------------------
// Password login sub-form
// ---------------------------------------------------------------------------

interface PasswordLoginFormProps extends React.HTMLAttributes<HTMLFormElement> {
  readonly redirectTo?: string
  onSwitchToOtp: (email: string) => void
  initialEmail?: string
}

function PasswordLoginForm({
  className,
  redirectTo,
  onSwitchToOtp,
  initialEmail = '',
  ...props
}: Readonly<PasswordLoginFormProps>) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { login } = useAuth()
  const turnstile = useTurnstile()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(getLoginSchema()),
    defaultValues: { email: initialEmail, password: '' },
  })

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginFormData) => login(email, password),
    onSuccess: async (user) => {
      turnstile.reset()
      form.clearErrors()
      // biome-ignore lint/suspicious/noConsole: Debug login flow
      console.log('Login onSuccess - user data:', user)
      toast.success(t('auth.welcome', 'Welcome!'))
      await new Promise((resolve) => setTimeout(resolve, 500))
      if (user && !user.onboarding_completed) {
        // biome-ignore lint/suspicious/noConsole: Debug navigation
        console.log('Navigating to /onboarding')
        navigate({ to: '/onboarding', replace: true })
      } else {
        const targetPath =
          redirectTo && redirectTo !== '/onboarding' ? redirectTo : '/'
        // biome-ignore lint/suspicious/noConsole: Debug navigation
        console.log('Navigating to:', targetPath)
        navigate({ to: targetPath, replace: true })
      }
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: {
          data?: { detail?: { error?: string; message?: string } }
        }
      }
      const errorType = axiosError.response?.data?.detail?.error
      const backendMessage = axiosError.response?.data?.detail?.message
      let errorMessage: string
      if (errorType === 'EMAIL_NOT_VERIFIED') {
        errorMessage =
          backendMessage ||
          t(
            'auth.emailNotVerified',
            'Please verify your email address before logging in. Check your inbox for the verification link.'
          )
      } else {
        errorMessage = t(
          'auth.invalidCredentials',
          'Invalid email or password.'
        )
      }
      form.setError('root', { type: 'manual', message: errorMessage })
      toast.error(errorMessage)
      if (error instanceof Error) {
        // biome-ignore lint/suspicious/noConsole: Intentional error logging
        console.error('Login error:', error.message)
      }
    },
  })

  function onSubmit(data: LoginFormData) {
    if (form.formState.errors.root) form.clearErrors('root')
    loginMutation.mutate(data)
    turnstile.reset()
  }

  const clearRootError = () => {
    if (form.formState.errors.root) form.clearErrors('root')
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
                className='absolute end-0 -top-0.5 font-medium text-muted-foreground text-sm hover:opacity-75'
              >
                {t('auth.forgotPassword', 'Forgot password?')}
              </Link>
            </FormItem>
          )}
        />
        <TurnstileWidget
          ref={turnstile.ref}
          onSuccess={turnstile.onSuccess}
          onExpire={turnstile.onExpire}
          onError={turnstile.onError}
          className='mt-2'
        />
        <Button
          className='mt-2'
          disabled={loginMutation.isPending || !turnstile.isVerified}
        >
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
          onClick={() => onSwitchToOtp(form.getValues('email'))}
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

// ---------------------------------------------------------------------------
// Main export — toggles between OTP and password forms
// ---------------------------------------------------------------------------

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: Readonly<UserAuthFormProps>) {
  const [useOtp, setUseOtp] = useState(false)
  const [switchEmail, setSwitchEmail] = useState('')

  if (useOtp) {
    return (
      <OtpLoginForm
        onSwitchToPassword={(email) => {
          setUseOtp(false)
          setSwitchEmail(email)
        }}
        initialEmail={switchEmail}
        redirectTo={redirectTo}
        className={className}
        {...props}
      />
    )
  }

  return (
    <PasswordLoginForm
      onSwitchToOtp={(email) => {
        setUseOtp(true)
        setSwitchEmail(email)
      }}
      initialEmail={switchEmail}
      redirectTo={redirectTo}
      className={className}
      {...props}
    />
  )
}
