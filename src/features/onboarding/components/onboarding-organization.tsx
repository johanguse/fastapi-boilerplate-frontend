import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Building2 } from 'lucide-react'
import type { User as UserType } from '@/lib/auth'

const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  slug: z.string().optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

interface OnboardingOrganizationProps {
  onComplete: () => void
  user: UserType | null
}

export function OnboardingOrganization({ onComplete, user }: OnboardingOrganizationProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: user?.company ? `${user.company} Organization` : '',
      slug: '',
      description: '',
    },
  })

  const onSubmit = async (data: OrganizationFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/onboarding/organization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(t('onboarding.organization.success', 'Organization created successfully!'))
        onComplete()
      } else {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create organization')
      }
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Error logging for debugging
      console.error('Organization creation error:', error)
      toast.error(t('onboarding.organization.error', 'Failed to create organization. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {t('onboarding.organization.title', 'Create Your Organization')}
        </h3>
        <p className="text-muted-foreground">
          {t('onboarding.organization.description', 'Set up your workspace to collaborate with your team')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('onboarding.organization.name', 'Organization Name')} *</FormLabel>
                <FormControl>
                  <Input placeholder={t('onboarding.organization.namePlaceholder', 'Enter your organization name')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('onboarding.organization.slug', 'URL Slug')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('onboarding.organization.slugPlaceholder', 'my-organization')} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">
                  {t('onboarding.organization.slugHelp', 'Optional: A unique identifier for your organization URL')}
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('onboarding.organization.description', 'Description')}</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={t('onboarding.organization.descriptionPlaceholder', 'Tell us about your organization...')}
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">
              {t('onboarding.organization.benefits.title', 'What you\'ll get:')}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {t('onboarding.organization.benefits.team', 'Team collaboration tools')}</li>
              <li>• {t('onboarding.organization.benefits.projects', 'Project management')}</li>
              <li>• {t('onboarding.organization.benefits.analytics', 'Analytics and insights')}</li>
              <li>• {t('onboarding.organization.benefits.support', 'Priority support')}</li>
            </ul>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('onboarding.organization.creating', 'Creating...')}
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
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
