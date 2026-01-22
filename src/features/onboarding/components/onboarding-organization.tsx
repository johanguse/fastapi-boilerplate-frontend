import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Loader2 } from 'lucide-react'
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
import { ImageUpload } from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import { useOnboarding } from '../context/onboarding-context'

const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  slug: z.string().optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

interface OnboardingOrganizationProps {
  onComplete: () => void
}

export function OnboardingOrganization({
  onComplete,
}: OnboardingOrganizationProps) {
  const { t } = useTranslation()
  const { profile, organization, updateOrganization } = useOnboarding()
  const [isLoading, setIsLoading] = useState(false)
  const [orgLogo, setOrgLogo] = useState<File | null>(null)

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization.name || '',
      slug: organization.slug || '',
      description: organization.description || '',
    },
  })

  const onSubmit = async (data: OrganizationFormData) => {
    setIsLoading(true)

    try {
      // Upload profile image first if provided
      if (profile?.image instanceof File) {
        const formData = new FormData()
        formData.append('file', profile.image)
        await api.post('/users/me/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }

      // Use save-all endpoint to save both profile and organization, and mark as complete
      const saveAllData = {
        profile: {
          name: profile?.name,
          company: profile?.company,
          job_title: profile?.job_title,
          country: profile?.country,
          phone: profile?.phone,
          bio: profile?.bio,
          website: profile?.website,
        },
        organization: {
          name: data.name,
          slug: data.slug,
          description: data.description,
        },
      }

      const response = await api.post('/auth/onboarding/save-all', saveAllData)
      const result = response.data

      // Upload organization logo if provided and organization was created
      if (orgLogo && result.organization?.id) {
        const formData = new FormData()
        formData.append('file', orgLogo)
        await api.post(
          `/organizations/${result.organization.id}/upload-logo`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
      }

      // Update context
      updateOrganization({
        ...data,
        logo: orgLogo,
      })

      toast.success(
        t(
          'onboarding.organization.success',
          'Onboarding completed successfully!'
        )
      )

      onComplete()
    } catch (error: unknown) {
      // biome-ignore lint/suspicious/noConsole: Error logging for debugging
      console.error('Organization creation error:', error)

      // Check for specific error types
      const axiosError = error as {
        response?: {
          status?: number
          data?: {
            detail?: string | { error?: string; message?: string }
          }
        }
        message?: string
        code?: string
      }

      // Handle network errors (CORS, connection issues)
      if (axiosError.code === 'ERR_NETWORK' || !axiosError.response) {
        toast.error(
          t(
            'onboarding.organization.networkError',
            'Network error. Please check your connection and try again.'
          )
        )
        return
      }

      // Handle 409 Conflict - Organization already exists
      if (axiosError.response?.status === 409) {
        const detail = axiosError.response.data?.detail
        const errorMessage =
          typeof detail === 'string'
            ? detail
            : typeof detail === 'object'
              ? detail.message || detail.error
              : null

        toast.error(
          errorMessage ||
            t(
              'onboarding.organization.alreadyExists',
              'An organization with this name already exists. Please choose a different name.'
            )
        )
        return
      }

      // Handle 400 Bad Request - Invalid data
      if (axiosError.response?.status === 400) {
        const detail = axiosError.response.data?.detail
        const errorMessage =
          typeof detail === 'string'
            ? detail
            : typeof detail === 'object'
              ? detail.message || detail.error
              : null

        toast.error(
          errorMessage ||
            t(
              'onboarding.saveAllError',
              'Failed to save onboarding data. Please check your input and try again.'
            )
        )
        return
      }

      // Handle other errors
      const detail = axiosError.response?.data?.detail
      const errorMessage =
        typeof detail === 'string'
          ? detail
          : typeof detail === 'object'
            ? detail.message || detail.error
            : null

      toast.error(
        errorMessage ||
          t(
            'onboarding.organization.error',
            'Failed to complete onboarding. Please try again.'
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
          <Building2 className='h-8 w-8 text-primary' />
        </div>
        <h3 className='mb-2 font-semibold text-xl'>
          {t('onboarding.organization.title', 'Create Your Organization')}
        </h3>
        <p className='text-muted-foreground'>
          {t(
            'onboarding.organization.description',
            'Set up your workspace to collaborate with your team'
          )}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* Organization Logo Upload */}
          <div className='flex justify-center'>
            <ImageUpload
              type='logo'
              value={null}
              onChange={setOrgLogo}
              size='xl'
              name={form.watch('name')}
              className='flex flex-col items-center justify-center'
            />
          </div>

          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('onboarding.organization.name', 'Organization Name')} *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      'onboarding.organization.namePlaceholder',
                      'Enter your organization name'
                    )}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      // Auto-generate slug as user types
                      const autoSlug = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')
                      form.setValue('slug', autoSlug, {
                        shouldValidate: true,
                      })
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='slug'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('onboarding.organization.slug', 'URL Slug')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      'onboarding.organization.slugPlaceholder',
                      'my-organization'
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className='text-muted-foreground text-sm'>
                  {t(
                    'onboarding.organization.slugHelp',
                    'Optional: A unique identifier for your organization URL'
                  )}
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('onboarding.organization.description', 'Description')}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t(
                      'onboarding.organization.descriptionPlaceholder',
                      'Tell us about your organization...'
                    )}
                    className='min-h-[100px]'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='rounded-lg bg-muted/50 p-4'>
            <h4 className='mb-2 font-medium'>
              {t('onboarding.organization.benefits.title', "What you'll get:")}
            </h4>
            <ul className='space-y-1 text-muted-foreground text-sm'>
              <li>
                •{' '}
                {t(
                  'onboarding.organization.benefits.team',
                  'Team collaboration tools'
                )}
              </li>
              <li>
                •{' '}
                {t(
                  'onboarding.organization.benefits.projects',
                  'Project management'
                )}
              </li>
              <li>
                •{' '}
                {t(
                  'onboarding.organization.benefits.analytics',
                  'Analytics and insights'
                )}
              </li>
              <li>
                •{' '}
                {t(
                  'onboarding.organization.benefits.support',
                  'Priority support'
                )}
              </li>
            </ul>
          </div>

          <div className='flex justify-end pt-4'>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {t('onboarding.organization.creating', 'Creating...')}
                </>
              ) : (
                <>
                  <Building2 className='mr-2 h-4 w-4' />
                  {t('onboarding.organization.continue', 'Create Organization')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
