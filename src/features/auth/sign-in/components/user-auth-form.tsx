import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { useAuthStore } from '@/stores/auth-store'
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
  const { login, isLoading } = useAuthStore()

  const formSchema = z.object({
    email: z.string().email(t('auth.emailInvalid')).min(1, t('auth.emailRequired')),
    password: z.string().min(1, t('auth.passwordRequired')),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      // Clear any previous root errors when submitting
      if (form.formState.errors.root) {
        form.clearErrors('root')
      }
      
      await login(data.email, data.password)
      
      // Success - redirect to the stored location or default to dashboard
      const targetPath = redirectTo || '/'
      
      // Use window.location for more reliable navigation after auth
      if (redirectTo && redirectTo !== '/') {
        window.location.href = redirectTo
      } else {
        navigate({ to: targetPath, replace: true })
      }
      
      toast.success(t('auth.loginSuccess') || 'Welcome back!')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.'
      
      // Set inline error on form root
      form.setError('root', {
        type: 'manual',
        message: errorMessage,
      })
      
      // Also show toast for better UX
      toast.error(errorMessage)
    }
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
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
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
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconGithub className='h-4 w-4' /> {t('auth.signInWithGitHub')}
          </Button>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconFacebook className='h-4 w-4' /> {t('auth.signInWithFacebook')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
