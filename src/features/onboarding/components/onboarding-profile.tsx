import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, User } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { User as UserType } from '@/lib/auth'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().optional(),
  job_title: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface OnboardingProfileProps {
  onComplete: () => void
  user: UserType | null
}

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Australia',
  'Japan',
  'South Korea',
  'Singapore',
  'India',
  'Brazil',
  'Mexico',
  'Argentina',
  'Other',
]

export function OnboardingProfile({
  onComplete,
  user,
}: OnboardingProfileProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      company: '',
      job_title: '',
      country: '',
      phone: '',
      bio: '',
      website: '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/onboarding/profile`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      )

      if (response.ok) {
        toast.success(
          t('onboarding.profile.success', 'Profile updated successfully!')
        )
        onComplete()
      } else {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to update profile')
      }
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Error logging for debugging
      console.error('Profile update error:', error)
      toast.error(
        t(
          'onboarding.profile.error',
          'Failed to update profile. Please try again.'
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
          <User className='h-8 w-8 text-primary' />
        </div>
        <h3 className='mb-2 font-semibold text-xl'>
          {t('onboarding.profile.title', 'Complete Your Profile')}
        </h3>
        <p className='text-muted-foreground'>
          {t(
            'onboarding.profile.description',
            'Tell us a bit about yourself to personalize your experience'
          )}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('onboarding.profile.name', 'Full Name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'onboarding.profile.namePlaceholder',
                        'Enter your full name'
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
              name='company'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('onboarding.profile.company', 'Company')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'onboarding.profile.companyPlaceholder',
                        'Enter your company name'
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
              name='job_title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('onboarding.profile.jobTitle', 'Job Title')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'onboarding.profile.jobTitlePlaceholder',
                        'e.g., Software Engineer'
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
              name='country'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('onboarding.profile.country', 'Country')}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            'onboarding.profile.countryPlaceholder',
                            'Select your country'
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('onboarding.profile.phone', 'Phone Number')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'onboarding.profile.phonePlaceholder',
                        '+1 (555) 123-4567'
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
              name='website'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('onboarding.profile.website', 'Website')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'onboarding.profile.websitePlaceholder',
                        'https://yourwebsite.com'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='bio'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('onboarding.profile.bio', 'Bio')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t(
                      'onboarding.profile.bioPlaceholder',
                      'Tell us a bit about yourself...'
                    )}
                    className='min-h-[100px]'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex justify-end pt-4'>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {t('onboarding.profile.saving', 'Saving...')}
                </>
              ) : (
                <>
                  <User className='mr-2 h-4 w-4' />
                  {t('onboarding.profile.continue', 'Continue')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
