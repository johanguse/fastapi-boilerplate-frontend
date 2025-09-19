import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, UserPlus } from 'lucide-react'
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

export function SignUpForm({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLFormElement>>) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { register, isLoading } = useAuthStore()

  const formSchema = z
    .object({
      name: z.string().min(1, t('auth.signUpNameRequired')),
      email: z.email({
        error: (iss) => (iss.input === '' ? t('auth.signUpEmailRequired') : t('auth.emailInvalid')),
      }),
      password: z
        .string()
        .min(1, t('auth.signUpPasswordRequired'))
        .min(7, t('auth.signUpPasswordTooShort7')),
      confirmPassword: z.string().min(1, t('auth.signUpConfirmPasswordRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.signUpPasswordsDontMatch'),
      path: ['confirmPassword'],
    })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      // Clear any previous root errors when submitting
      if (form.formState.errors.root) {
        form.clearErrors('root')
      }
      
      await register(data.email, data.password, data.name)
      
      toast.success(t('auth.signUpWelcome', { name: data.name }))
      navigate({ to: '/sign-in' })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('auth.signUpRegistrationFailed')
      
      // Set inline error on form root
      form.setError('root', {
        type: 'manual',
        message: errorMessage,
      })
      
      // Also show toast for better UX
      toast.error(errorMessage)
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
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.signUpFullName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('auth.signUpFullNamePlaceholder')} {...field} />
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
              <FormLabel>{t('auth.email')}</FormLabel>
              <FormControl>
                <Input placeholder={t('auth.signUpEmailPlaceholder')} {...field} />
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
              <FormLabel>{t('auth.password')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder={t('auth.signUpPasswordPlaceholder')} {...field} />
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
              <FormLabel>{t('auth.confirmPassword')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder={t('auth.signUpConfirmPasswordPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <UserPlus />}
          {t('auth.signUpCreateAccount')}
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              {t('auth.orContinueWithSignUp')}
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button
            variant='outline'
            className='w-full'
            type='button'
            disabled={isLoading}
          >
            <IconGithub className='h-4 w-4' /> GitHub
          </Button>
          <Button
            variant='outline'
            className='w-full'
            type='button'
            disabled={isLoading}
          >
            <IconFacebook className='h-4 w-4' /> Facebook
          </Button>
        </div>
      </form>
    </Form>
  )
}
