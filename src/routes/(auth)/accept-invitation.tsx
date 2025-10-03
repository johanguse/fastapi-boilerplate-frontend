import { useState } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, XCircle, Loader2, Mail, Users } from 'lucide-react'
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
import { toast } from 'sonner'

export const Route = createFileRoute('/(auth)/accept-invitation')({
  component: AcceptInvitationPage,
})

function AcceptInvitationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { token } = useSearch({ from: '/(auth)/accept-invitation' }) as { token?: string }
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
      toast.success(t('invitations.invitationAccepted'), {
        description: t('invitations.redirecting'),
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
          err.response?.data?.detail ||
          t('invitations.acceptFailed'),
      })
    },
  })

  const declineMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/v1/invitations/invitations/${token}/decline`)
    },
    onSuccess: () => {
      toast.success(t('invitations.invitationDeclined'), {
        description: t('invitations.declinedDescription'),
      })
      setTimeout(() => {
        navigate({ to: '/' })
      }, 1500)
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } }
      toast.error(t('common.error'), {
        description:
          err.response?.data?.detail || t('invitations.declineFailed'),
      })
    },
  })

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-center">
              {t('invitations.invalidToken')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('invitations.invalidTokenDescription')}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => navigate({ to: '/' })}>
              {t('navigation.dashboard')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {status === 'success' ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : status === 'error' ? (
              <XCircle className="h-6 w-6 text-destructive" />
            ) : (
              <Users className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle className="text-center">
            {status === 'success'
              ? t('invitations.acceptSuccessTitle')
              : status === 'error'
                ? t('invitations.acceptErrorTitle')
                : t('invitations.teamInvitation')}
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'success'
              ? t('invitations.acceptSuccessDescription')
              : status === 'error'
                ? t('invitations.acceptErrorDescription')
                : t('invitations.acceptInvitationDescription')}
          </CardDescription>
        </CardHeader>

        {status === 'idle' && (
          <>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {t('invitations.invitationDetails')}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('invitations.youHaveBeenInvited')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={() => acceptMutation.mutate()}
                disabled={acceptMutation.isPending || declineMutation.isPending}
              >
                {acceptMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('invitations.acceptInvitation')
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => declineMutation.mutate()}
                disabled={acceptMutation.isPending || declineMutation.isPending}
              >
                {declineMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('invitations.declineInvitation')
                )}
              </Button>
            </CardFooter>
          </>
        )}

        {status === 'success' && (
          <CardFooter className="justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('invitations.redirecting')}
            </div>
          </CardFooter>
        )}

        {status === 'error' && (
          <CardFooter className="justify-center">
            <Button onClick={() => navigate({ to: '/' })}>
              {t('navigation.dashboard')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

