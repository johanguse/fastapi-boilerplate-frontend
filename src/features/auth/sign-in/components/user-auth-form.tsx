import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { useAuthStore } from '@/stores/auth-store'
import { authApi } from '@/lib/api'
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
  const { auth } = useAuthStore()

  const formSchema = z.object({
    email: z.email({
      error: (iss) => (iss.input === '' ? t('auth.emailRequired') : t('auth.emailInvalid')),
    }),
    password: z
      .string()
      .min(1, t('auth.passwordRequired'))
      .min(8, t('auth.passwordTooShort')),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: authApi.signIn,
    onSuccess: async (authResponse) => {
      // Clear any form errors on success
      form.clearErrors()
      
      // Set Better Auth state
      auth.setBetterAuth(authResponse.user, authResponse.session)
      
      // Redirect to the stored location or default to dashboard
      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })
      
      toast.success(`Welcome back, ${authResponse.user.name || authResponse.user.email}!`)
    },
    onError: (error: unknown) => {
      // eslint-disable-next-line no-console
      console.error('Login error:', error)
      
      const axiosError = error as { 
        response?: { 
          status?: number; 
          data?: { 
            detail?: { error?: string; message?: string }; 
            error?: string; 
            message?: string 
          } 
        } 
      }
      
      let errorMessage = 'Login failed. Please try again.'
      
      if (axiosError.response?.status === 400) {
        // Handle nested detail structure from backend
        const detail = axiosError.response.data?.detail
        errorMessage = detail?.message || axiosError.response.data?.message || t('auth.invalidCredentials')
      } else if (axiosError.response?.status === 422) {
        errorMessage = t('auth.emailInvalid')
      }
      
      // Set inline error on form root
      form.setError('root', {
        type: 'manual',
        message: errorMessage,
      })
      
      // Also show toast for better UX
      toast.error(errorMessage)
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
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
          <div className='rounded-md border border-destructive bg-destructive/10 p-3 mb-4'>
            <p className='text-sm font-medium text-destructive'>{form.formState.errors.root.message}</p>
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
          {loginMutation.isPending ? <Loader2 className='animate-spin' /> : <LogIn />}
          {t('auth.signIn')}
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              {t('auth.orContinueWith')}
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' type='button' disabled={loginMutation.isPending}>
            <IconGithub className='h-4 w-4' /> {t('auth.signInWithGitHub')}
          </Button>
          <Button variant='outline' type='button' disabled={loginMutation.isPending}>
            <IconFacebook className='h-4 w-4' /> {t('auth.signInWithFacebook')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
