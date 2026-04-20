import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Mail, Send } from 'lucide-react'
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
import { useTurnstile } from '@/hooks/use-turnstile'
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
  const turnstile = useTurnstile()

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      role: 'member',
      message: '',
    },
  })

  const inviteMutation = useMutation({
    mutationFn: async (data: InvitationFormData) => {
      const response = await api.post(
        `/api/v1/invitations/organizations/${organizationId}/invitations`,
        { ...data, turnstileToken: turnstile.token }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      toast.success(t('invitations.inviteSent', 'Invitation sent'), {
        description:
          t('invitations.inviteSentDescription', { email: variables.email }) ||
          `Invitation sent to ${variables.email}`,
      })

      turnstile.reset()
      form.reset()
      setOpen(false)
      onSuccess?.()
    },
    onError: (error: unknown) => {
      let errorMessage = t(
        'invitations.inviteFailedGeneric',
        'Failed to send invitation'
      )
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'detail' in error.response.data &&
        typeof error.response.data.detail === 'string'
      ) {
        errorMessage = error.response.data.detail
      }
      toast.error(t('common.error', 'An error occurred'), {
        description: errorMessage,
      })
      turnstile.reset()
    },
  })

  const onSubmit = (data: InvitationFormData) => {
    inviteMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Send className='mr-2 h-4 w-4' />
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
            id='invite-member-form'
          >
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
                onClick={() => setOpen(false)}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type='submit'
                form='invite-member-form'
                disabled={inviteMutation.isPending || !turnstile.isVerified}
              >
                {inviteMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {t('common.loading', 'Loading...')}
                  </>
                ) : (
                  <>
                    <Send className='mr-2 h-4 w-4' />
                    {t('invitations.sendInvite', 'Send Invite')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
