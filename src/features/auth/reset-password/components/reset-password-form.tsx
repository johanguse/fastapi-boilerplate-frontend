import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { KeyRound, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod/v4'
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
import { api } from '@/lib/api'

type ResetPasswordFormProps = {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const formSchema = z
    .object({
      password: z
        .string()
        .min(6, {
          message: t(
            'auth.passwordMinLength',
            'Password must be at least 6 characters'
          ),
        })
        .max(100, {
          message: t(
            'auth.passwordMaxLength',
            'Password must be less than 100 characters'
          ),
        }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.passwordsDoNotMatch', 'Passwords do not match'),
      path: ['confirmPassword'],
    })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      await api.resetPassword(token, data.password)

      toast.success(
        t(
          'auth.resetPasswordSuccess',
          'Password reset successfully! You can now sign in with your new password.'
        )
      )

      // Redirect to sign in after a short delay
      setTimeout(() => {
        navigate({ to: '/sign-in' })
      }, 1500)
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t(
              'auth.resetPasswordError',
              'Failed to reset password. The link may have expired. Please request a new one.'
            )

      toast.error(errorMessage)

      // If token is invalid/expired, suggest requesting new link
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof error.response === 'object' &&
        error.response !== null &&
        'status' in error.response &&
        error.response.status === 400
      ) {
        setTimeout(() => {
          navigate({ to: '/forgot-password' })
        }, 2000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.newPassword', 'New Password')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t(
                    'auth.newPasswordPlaceholder',
                    'Enter your new password'
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
                    'auth.confirmPasswordPlaceholder',
                    'Confirm your new password'
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='mt-2' disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              {t('auth.resettingPassword', 'Resetting...')}
            </>
          ) : (
            <>
              <KeyRound className='mr-2 h-4 w-4' />
              {t('auth.resetPasswordButton', 'Reset Password')}
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
