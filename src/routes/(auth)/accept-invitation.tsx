import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle2, Loader2, Mail, Users, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { api } from '@/lib/api'

export const Route = createFileRoute('/(auth)/accept-invitation')({
  component: AcceptInvitationPage,
})

function AcceptInvitationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { token } = useSearch({ from: '/(auth)/accept-invitation' }) as {
    token?: string
  }
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(
        `/api/v1/invitations/invitations/${token}/accept`
      )
      return response.data
    },
    onSuccess: (data) => {
      setStatus('success')
      toast.success(t('invitations.invitationAccepted', 'Invitation accepted'), {
        description: t('invitations.redirecting', 'Redirecting...'),
      })
      // Redirect to organization after 2 seconds
      setTimeout(() => {
        navigate({
          to: '/organizations/$organizationId',
          params: { organizationId: String(data.organization_id) },
        })
      }, 2000)
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } }
      setStatus('error')
      toast.error(t('common.error'), {
        description:
          err.response?.data?.detail || t('invitations.acceptFailed', 'Failed to accept invitation'),
      })
    },
  })

  const declineMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/v1/invitations/invitations/${token}/decline`)
    },
    onSuccess: () => {
      toast.success(t('invitations.invitationDeclined', 'Invitation declined'), {
        description: t('invitations.declinedDescription', 'You have declined the invitation'),
      })
      setTimeout(() => {
        navigate({ to: '/' })
      }, 1500)
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } }
      toast.error(t('common.error'), {
        description:
          err.response?.data?.detail || t('invitations.declineFailed', 'Failed to decline invitation'),
      })
    },
  })

  if (!token) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-muted/40 p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10'>
              <XCircle className='h-6 w-6 text-destructive' />
            </div>
            <CardTitle className='text-center'>
              {t('invitations.invalidToken', 'Invalid Token')}
            </CardTitle>
            <CardDescription className='text-center'>
              {t('invitations.invalidTokenDescription', 'The invitation token is invalid or has expired')}
            </CardDescription>
          </CardHeader>
          <CardFooter className='justify-center'>
            <Button onClick={() => navigate({ to: '/' })}>
              {t('navigation.dashboard', 'Dashboard')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/40 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
            {status === 'success' ? (
              <CheckCircle2 className='h-6 w-6 text-green-600' />
            ) : status === 'error' ? (
              <XCircle className='h-6 w-6 text-destructive' />
            ) : (
              <Users className='h-6 w-6 text-primary' />
            )}
          </div>
          <CardTitle className='text-center'>
            {status === 'success'
              ? t('invitations.acceptSuccessTitle', 'Invitation Accepted')
              : status === 'error'
                ? t('invitations.acceptErrorTitle', 'Acceptance Failed')
                : t('invitations.teamInvitation', 'Team Invitation')}
          </CardTitle>
          <CardDescription className='text-center'>
            {status === 'success'
              ? t('invitations.acceptSuccessDescription', 'You have successfully joined the team')
              : status === 'error'
                ? t('invitations.acceptErrorDescription', 'There was an error accepting the invitation')
                : t('invitations.acceptInvitationDescription', 'You have been invited to join a team')}
          </CardDescription>
        </CardHeader>

        {status === 'idle' && (
          <>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-start gap-3 rounded-lg border p-4'>
                  <Mail className='mt-0.5 h-5 w-5 text-muted-foreground' />
                  <div className='flex-1'>
                    <p className='font-medium text-sm'>
                      {t('invitations.invitationDetails', 'Invitation Details')}
                    </p>
                    <p className='mt-1 text-muted-foreground text-sm'>
                      {t('invitations.youHaveBeenInvited', 'You have been invited to join this team')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className='flex flex-col gap-2'>
              <Button
                className='w-full'
                onClick={() => acceptMutation.mutate()}
                disabled={acceptMutation.isPending || declineMutation.isPending}
              >
                {acceptMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {t('common.loading', 'Loading')}
                  </>
                ) : (
                  t('invitations.acceptInvitation', 'Accept Invitation')
                )}
              </Button>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => declineMutation.mutate()}
                disabled={acceptMutation.isPending || declineMutation.isPending}
              >
                {declineMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {t('common.loading', 'Loading')}
                  </>
                ) : (
                  t('invitations.declineInvitation', 'Decline Invitation')
                )}
              </Button>
            </CardFooter>
          </>
        )}

        {status === 'success' && (
          <CardFooter className='justify-center'>
            <div className='flex items-center gap-2 text-muted-foreground text-sm'>
              <Loader2 className='h-4 w-4 animate-spin' />
              {t('invitations.redirecting', 'Redirecting...')}
            </div>
          </CardFooter>
        )}

        {status === 'error' && (
          <CardFooter className='justify-center'>
            <Button onClick={() => navigate({ to: '/' })}>
              {t('navigation.dashboard', 'Dashboard')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
