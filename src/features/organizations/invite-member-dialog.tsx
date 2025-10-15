import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { api } from '@/lib/api'

const invitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['owner', 'admin', 'member', 'viewer']),
  message: z.string().max(500).optional(),
})

type InvitationFormData = z.infer<typeof invitationSchema>

interface InviteMemberDialogProps {
  organizationId: number
  organizationName: string
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function InviteMemberDialog({
  organizationId,
  organizationName,
  onSuccess,
  trigger,
}: InviteMemberDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      role: 'member',
      message: '',
    },
  })

  const onSubmit = async (data: InvitationFormData) => {
    try {
      await api.post(
        `/api/v1/invitations/organizations/${organizationId}/invitations`,
        data
      )

      toast.success(t('invitations.inviteSent', 'Invitation sent'), {
        description:
          t('invitations.inviteSentDescription', { email: data.email }) ||
          `Invitation sent to ${data.email}`,
      })

      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      toast.error(t('common.error', 'An error occurred'), {
        description:
          err.response?.data?.detail ||
          t('invitations.inviteFailedGeneric', 'Failed to send invitation'),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className='mr-2 h-4 w-4' />
            {t('invitations.inviteMember', 'Invite Member')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[525px]'>
        <DialogHeader>
          <DialogTitle>
            {t('invitations.inviteMemberTo', { name: organizationName }) ||
              `Invite member to ${organizationName}`}
          </DialogTitle>
          <DialogDescription>
            {t(
              'invitations.inviteDescription',
              'Invite a new member to your organization.'
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('invitations.emailAddress', 'Email Address')}
                  </FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Mail className='absolute top-3 left-3 h-4 w-4 text-muted-foreground' />
                      <Input
                        placeholder='colleague@example.com'
                        className='pl-9'
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('invitations.role')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            'invitations.selectRole',
                            'Select a role'
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='viewer'>
                        <div className='flex flex-col'>
                          <span className='font-medium'>
                            {t('roles.viewer', 'Viewer')}
                          </span>
                          <span className='text-muted-foreground text-xs'>
                            {t(
                              'roles.viewerDescription',
                              'Can view organization data'
                            )}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value='member'>
                        <div className='flex flex-col'>
                          <span className='font-medium'>
                            {t('roles.member', 'Member')}
                          </span>
                          <span className='text-muted-foreground text-xs'>
                            {t(
                              'roles.memberDescription',
                              'Can view and edit organization data'
                            )}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value='admin'>
                        <div className='flex flex-col'>
                          <span className='font-medium'>
                            {t('roles.admin', 'Admin')}
                          </span>
                          <span className='text-muted-foreground text-xs'>
                            {t(
                              'roles.adminDescription',
                              'Can manage organization settings and members'
                            )}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value='owner'>
                        <div className='flex flex-col'>
                          <span className='font-medium'>
                            {t('roles.owner', 'Owner')}
                          </span>
                          <span className='text-muted-foreground text-xs'>
                            {t(
                              'roles.ownerDescription',
                              'Full access to organization'
                            )}
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t(
                      'invitations.roleDescription',
                      'Select the role for the new member.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='message'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('invitations.personalMessage', 'Personal Message')}{' '}
                    <span className='text-muted-foreground'>
                      ({t('common.optional', 'optional')})
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'invitations.messagePlaceholder',
                        'Add a message (optional)'
                      )}
                      className='resize-none'
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'invitations.messageDescription',
                      'This message will be included in the invitation email.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type='submit' disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? t('common.loading', 'Loading...')
                  : t('invitations.sendInvite', 'Send Invite')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
