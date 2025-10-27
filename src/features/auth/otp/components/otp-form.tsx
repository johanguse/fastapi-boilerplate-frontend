import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod/v4'
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
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

const createFormSchema = (t: (key: string, defaultValue: string) => string) =>
  z.object({
    email: z
      .string()
      .email(t('auth.email.invalid', 'Please enter a valid email address')),
    otp: z
      .string()
      .min(
        6,
        t('auth.otp.validation.required', 'Please enter the 6-digit code.')
      )
      .max(
        6,
        t('auth.otp.validation.required', 'Please enter the 6-digit code.')
      ),
    name: z.string().optional(),
  })

type OtpFormProps = React.HTMLAttributes<HTMLFormElement>

export function OtpForm({ className, ...props }: OtpFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [userExists, setUserExists] = useState<boolean | null>(null)

  const formSchema = createFormSchema(t)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      otp: '',
      name: '',
    },
  })

  const email = form.watch('email')
  const otp = form.watch('otp')

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
    onSuccess: (data) => {
      setUserExists(data.user_exists)
      setStep('otp')
      toast.success(t('auth.otp.sent', 'Verification code sent to your email'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: {
      email: string
      code: string
      name?: string
    }) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/otp/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail?.message || 'Invalid verification code')
      }

      return response.json()
    },
    onSuccess: async (data) => {
      // Set user in auth store
      const authState = useAuthStore.getState()
      authState.setUser(data.user)
      authState.setSession(data.session)
      authState.setInitialized(true)

      toast.success(t('auth.otp.success', 'Welcome! You are now logged in'))

      // Small delay to ensure Zustand state is fully updated
      await new Promise((resolve) => setTimeout(resolve, 0))

      // Redirect based on onboarding status
      if (data.user.onboarding_completed) {
        navigate({ to: '/', replace: true })
      } else {
        navigate({ to: '/onboarding', replace: true })
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (step === 'email') {
      sendOtpMutation.mutate(data.email)
    } else {
      verifyOtpMutation.mutate({
        email: data.email,
        code: data.otp,
        name: data.name || undefined,
      })
    }
  }

  function goBackToEmail() {
    setStep('email')
    form.setValue('otp', '')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4', className)}
        {...props}
      >
        {step === 'email' && (
          <>
            <div className='mb-4 text-center'>
              <h2 className='font-bold text-2xl'>
                {t('auth.otp.title', 'Sign in with email')}
              </h2>
              <p className='mt-2 text-muted-foreground'>
                {t(
                  'auth.otp.subtitle',
                  'Enter your email address to receive a verification code'
                )}
              </p>
            </div>

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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              disabled={!email || sendOtpMutation.isPending}
              className='w-full'
            >
              {sendOtpMutation.isPending
                ? t('auth.otp.sending', 'Sending...')
                : t('auth.otp.sendCode', 'Send verification code')}
            </Button>
          </>
        )}

        {step === 'otp' && (
          <>
            <div className='mb-4 text-center'>
              <h2 className='font-bold text-2xl'>
                {t('auth.otp.verifyTitle', 'Enter verification code')}
              </h2>
              <p className='mt-2 text-muted-foreground'>
                {t(
                  'auth.otp.verifySubtitle',
                  'We sent a 6-digit code to {email}',
                  { email }
                )}
              </p>
              <Button
                variant='link'
                onClick={goBackToEmail}
                className='h-auto p-0 text-sm'
              >
                {t('auth.otp.changeEmail', 'Change email address')}
              </Button>
            </div>

            <FormField
              control={form.control}
              name='otp'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='sr-only'>
                    {t('auth.otp.label', 'One-Time Password')}
                  </FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      {...field}
                      containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {userExists === false && (
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('auth.signUpFullName', 'Full Name')}
                    </FormLabel>
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
            )}

            <Button
              type='submit'
              disabled={otp.length < 6 || verifyOtpMutation.isPending}
              className='w-full'
            >
              {verifyOtpMutation.isPending
                ? t('auth.otp.verifying', 'Verifying...')
                : t('auth.otp.verifyButton', 'Verify')}
            </Button>
          </>
        )}
      </form>
    </Form>
  )
}
