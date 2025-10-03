import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@/stores/auth-store'
import { getLoginSchema, type LoginFormData } from '@/lib/auth'
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
import { Input } from '@/components/ui/input'
import { SocialLogin } from '@/components/auth/social-login'
import { PasswordInput } from '@/components/password-input'

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
    onSuccess: () => {
      // Clear any form errors on success
      form.clearErrors()

      // Redirect to the stored location or default to dashboard
      const targetPath = redirectTo || '/dashboard'
      navigate({ to: targetPath, replace: true })

      toast.success(t('auth.welcome'))
    },
    onError: (error: unknown) => {
      // Handle error from Better Auth login
      // Always use translated message instead of backend English message
      const errorMessage = t('auth.invalidCredentials')

      // Set inline error on form root
      form.setError('root', {
        type: 'manual',
        message: errorMessage,
      })

      // Also show toast for better UX
      toast.error(errorMessage)

      // Log the actual error for debugging
      if (error instanceof Error) {
        // eslint-disable-next-line no-console
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
          <div className='border-destructive bg-destructive/10 mb-4 rounded-md border p-3'>
            <p className='text-destructive text-sm font-medium'>
              {form.formState.errors.root.message}
            </p>
          </div>
        )}
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.email')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('auth.emailPlaceholder')}
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
              <FormLabel>{t('auth.password')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('auth.passwordPlaceholder')}
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
                className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'
              >
                {t('auth.forgotPassword')}
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
          {t('auth.signIn')}
        </Button>

        <SocialLogin className='mt-2' redirectTo={redirectTo || '/dashboard'} />
      </form>
    </Form>
  )
}
