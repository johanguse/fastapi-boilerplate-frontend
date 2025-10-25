import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
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
import { cn } from '@/lib/utils'
import { useTimer, formatTime } from '@/hooks/use-timer'
import { forgetPassword } from '@/lib/auth'

export function ForgotPasswordForm({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLFormElement>>) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [canSubmit, setCanSubmit] = useState(true)
  
  // Rate limiting timer (5 minutes = 300 seconds)
  const timer = useTimer(300, {
    onComplete: () => {
      setCanSubmit(true)
    }
  })

  const formSchema = z.object({
    email: z.email({
      error: (iss) =>
        iss.input === ''
          ? t('auth.forgotPasswordEmailRequired', 'Email is required')
          : t('auth.emailInvalid', 'Invalid email address'),
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  // Start timer when component mounts (rate limiting)
  useEffect(() => {
    timer.start()
  }, [timer])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!canSubmit) {
      toast.error(
        t(
          'auth.forgotPasswordRateLimited',
          'Please wait {{time}} before requesting another password reset',
          { time: formatTime(timer.timeLeft) }
        )
      )
      return
    }

    setIsLoading(true)

    try {
      // Call the backend forgot password endpoint directly
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: data.email }),
      })

      const result = await response.json()

      if (response.ok) {
        // Success - email sent
        toast.success(result.message || t('auth.forgotPasswordEmailSent', 'Password reset link sent to your email address.'))
        setCanSubmit(false)
        timer.reset()
        timer.start()
        form.reset()
        
        // If user doesn't exist, show option to sign up
        if (result.user_exists === false) {
          setTimeout(() => {
            navigate({ 
              to: '/sign-up', 
              search: { email: data.email } 
            })
          }, 2000)
        } else {
          navigate({ to: '/sign-in' })
        }
      } else {
        // Handle error response
        toast.error(result.detail?.message || result.message || t('common.error', 'An error occurred'))
      }
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Error logging for debugging
      console.error('Forgot password error:', error)
      toast.error(t('common.error', 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-2', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.email', 'Email')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t(
                    'auth.forgotPasswordEmailPlaceholder',
                    'Enter your email address'
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {!canSubmit && (
          <div className='text-center text-muted-foreground text-sm'>
            <p>
              {t('auth.forgotPasswordNextRequest', 'Next request available in')}:{' '}
              <span className='font-mono font-semibold text-primary'>
                {formatTime(timer.timeLeft)}
              </span>
            </p>
          </div>
        )}
        
        <Button 
          className='mt-2' 
          disabled={isLoading || !canSubmit}
        >
          {t('auth.forgotPasswordContinue', 'Continue')}
          {isLoading ? <Loader2 className='animate-spin' /> : <ArrowRight />}
        </Button>
      </form>
    </Form>
  )
}
