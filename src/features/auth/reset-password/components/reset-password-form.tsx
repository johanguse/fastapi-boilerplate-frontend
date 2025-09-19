import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'

// Reset Password API function
const resetPassword = async (token: string, newPassword: string) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, new_password: newPassword }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to reset password')
  }

  return response.json()
}

export function ResetPasswordForm({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLFormElement>>) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  
  // Get token from URL search params
  const search = useSearch({ from: '/(auth)/reset-password' })
  const token = search?.token

  const formSchema = z.object({
    password: z
      .string()
      .min(1, t('auth.passwordRequired') || 'Password is required')
      .min(8, t('auth.passwordMinLength') || 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(1, t('auth.confirmPasswordRequired') || 'Please confirm your password'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.passwordMismatch') || "Passwords don't match",
    path: ['confirmPassword'],
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      password: '',
      confirmPassword: ''
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!token) {
      toast.error('Invalid reset link. Please request a new password reset.')
      return
    }

    setIsLoading(true)

    try {
      await resetPassword(token, data.password)
      
      toast.success(t('auth.passwordResetSuccess') || 'Password reset successfully!')
      form.reset()
      navigate({ to: '/sign-in' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('common.error')
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Show error if no token
  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="text-destructive">
          <p className="font-medium">Invalid Reset Link</p>
          <p className="text-sm text-muted-foreground mt-1">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>
        <Button 
          onClick={() => navigate({ to: '/forgot-password' })}
          variant="outline"
        >
          Request New Reset Link
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.newPassword') || 'New Password'}</FormLabel>
              <FormControl>
                <PasswordInput 
                  placeholder={t('auth.newPasswordPlaceholder') || 'Enter your new password'} 
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
              <FormLabel>{t('auth.confirmNewPassword') || 'Confirm New Password'}</FormLabel>
              <FormControl>
                <PasswordInput 
                  placeholder={t('auth.confirmNewPasswordPlaceholder') || 'Confirm your new password'} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <CheckCircle />}
          {t('auth.resetPassword') || 'Reset Password'}
        </Button>
      </form>
    </Form>
  )
}