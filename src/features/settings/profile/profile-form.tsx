import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'

const createProfileFormSchema = (
  t: (key: string, defaultValue: string) => string
) =>
  z.object({
    username: z
      .string(
        t('profile.validation.usernameRequired', 'Please enter your username.')
      )
      .min(
        2,
        t(
          'profile.validation.usernameMinLength',
          'Username must be at least 2 characters.'
        )
      )
      .max(
        30,
        t(
          'profile.validation.usernameMaxLength',
          'Username must not be longer than 30 characters.'
        )
      ),
    email: z.email({
      error: (iss) =>
        iss.input === undefined
          ? t(
              'profile.validation.emailRequired',
              'Please select an email to display.'
            )
          : undefined,
    }),
    bio: z.string().max(160).min(4),
    urls: z
      .array(
        z.object({
          value: z.url(
            t('profile.validation.urlRequired', 'Please enter a valid URL.')
          ),
        })
      )
      .optional(),
  })

type ProfileFormValues = z.infer<ReturnType<typeof createProfileFormSchema>>

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  bio: 'I own a computer.',
  urls: [
    { value: 'https://shadcn.com' },
    { value: 'http://twitter.com/shadcn' },
  ],
}

export function ProfileForm() {
  const { t } = useTranslation()
  const profileFormSchema = createProfileFormSchema(t)
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  const { fields, append } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => showSubmittedData(data))}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.username', 'Username')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('profile.usernamePlaceholder', 'shadcn')}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t(
                  'profile.usernameDescription',
                  'This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days.'
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.email', 'Email')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'profile.emailPlaceholder',
                        'Select a verified email to display'
                      )}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='m@example.com'>m@example.com</SelectItem>
                  <SelectItem value='m@google.com'>m@google.com</SelectItem>
                  <SelectItem value='m@support.com'>m@support.com</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t(
                  'profile.emailDescription',
                  'You can manage verified email addresses in your'
                )}{' '}
                <Link to='/'>email settings</Link>.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.bio', 'Bio')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t(
                    'profile.bioPlaceholder',
                    'Tell us a little bit about yourself'
                  )}
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t(
                  'profile.bioDescription',
                  'You can @mention other users and organizations to link to them.'
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && 'sr-only')}>
                    {t('profile.urls', 'URLs')}
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && 'sr-only')}>
                    {t(
                      'profile.urlsDescription',
                      'Add links to your website, blog, or social media profiles.'
                    )}
                  </FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='mt-2'
            onClick={() => append({ value: '' })}
          >
            {t('profile.addUrl', 'Add URL')}
          </Button>
        </div>
        <Button type='submit'>
          {t('profile.updateProfile', 'Update profile')}
        </Button>
      </form>
    </Form>
  )
}
