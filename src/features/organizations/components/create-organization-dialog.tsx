import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod/v4'
import { TurnstileWidget } from '@/components/turnstile-widget'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useOrganizations } from '@/hooks/use-organizations'
import { useTurnstile } from '@/hooks/use-turnstile'
import { api } from '@/lib/api'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  slug: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface CreateOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
}: Readonly<CreateOrganizationDialogProps>) {
  const [error, setError] = useState<string | null>(null)
  const [logo, setLogo] = useState<File | null>(null)
  const { t } = useTranslation()
  const { createOrganizationAsync, isCreating } = useOrganizations()
  const turnstile = useTurnstile()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      setError(null)

      // Generate slug from name if not provided
      const slug =
        data.slug ||
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')

      // Create organization first
      const newOrg = await createOrganizationAsync({
        name: data.name,
        slug,
      })

      // Upload logo if provided
      if (logo && newOrg?.id) {
        const formData = new FormData()
        formData.append('file', logo)
        await api.post(`/organizations/${newOrg.id}/logo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }

      form.reset()
      setLogo(null)
      onOpenChange(false)
      toast.success(
        t('organizations.createSuccess', 'Organization created successfully!')
      )
      turnstile.reset()
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { detail?: { message?: string } } }
      }
      const errorMessage =
        axiosError.response?.data?.detail?.message || t('common.error', 'Error')
      setError(errorMessage)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isCreating) {
      form.reset()
      setError(null)
      setLogo(null)
      turnstile.reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {t('organizations.createOrganization', 'Create Organization')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'organizations.createNewDescription',
              'Create a new organization to collaborate with your team.'
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {error && (
              <div className='rounded-md border border-destructive/20 bg-destructive/10 p-3'>
                <p className='text-destructive text-sm'>{error}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('organizations.name', 'Organization Name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'organizations.namePlaceholder',
                        'My Organization'
                      )}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        // Auto-generate slug as user types (unless manually edited)
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

            <FormItem>
              <FormLabel>
                {t('organizations.logo', 'Organization Logo')}{' '}
                {t('common.optional', '(Optional)')}
              </FormLabel>
              <FormControl>
                <ImageUpload value={null} onChange={setLogo} type='logo' />
              </FormControl>
              <p className='text-muted-foreground text-xs'>
                {t(
                  'organizations.logoDescription',
                  'Upload a logo for your organization (max 5MB)'
                )}
              </p>
            </FormItem>

            <FormField
              control={form.control}
              name='slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('organizations.slug', 'Slug (URL identifier)')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'organizations.slugPlaceholder',
                        'my-organization'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className='text-muted-foreground text-xs'>
                    {t(
                      'organizations.slugDescription',
                      'Used in URLs. Only lowercase letters, numbers, and hyphens allowed.'
                    )}
                  </p>
                </FormItem>
              )}
            />

            <TurnstileWidget
              ref={turnstile.ref}
              onSuccess={turnstile.onSuccess}
              onExpire={turnstile.onExpire}
              onError={turnstile.onError}
              className='mt-2'
            />

            <DialogFooter className='gap-y-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={isCreating}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type='submit'
                disabled={isCreating || !turnstile.isVerified}
              >
                {isCreating ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {t('organizations.creating', 'Creating...')}
                  </>
                ) : (
                  t('organizations.createOrganization', 'Create Organization')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
