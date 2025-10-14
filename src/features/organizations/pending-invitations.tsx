import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Mail, MoreHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ROLES } from '@/config/roles'
import { api } from '@/lib/api'

interface Invitation {
  id: number
  email: string
  role: string
  status: string
  message?: string
  invited_by_name: string
  expires_at: string
  created_at: string
}

interface PendingInvitationsProps {
  organizationId: number
}

export function PendingInvitations({
  organizationId,
}: PendingInvitationsProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: invitations, isLoading } = useQuery<Invitation[]>({
    queryKey: ['invitations', organizationId],
    queryFn: async () => {
      const response = await api.get(
        `/api/v1/invitations/organizations/${organizationId}/invitations`
      )
      return response.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      await api.delete(
        `/api/v1/invitations/organizations/${organizationId}/invitations/${invitationId}`
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['invitations', organizationId],
      })
      toast.success(
        t('invitations.invitationCancelled', 'Invitation cancelled'),
        {
          description: t(
            'invitations.invitationCancelledDescription',
            'The invitation has been cancelled.'
          ),
        }
      )
      setDeleteId(null)
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } }
      toast.error(t('common.error', 'An error occurred'), {
        description:
          err.response?.data?.detail ||
          t('invitations.cancelFailed', 'Failed to cancel invitation'),
      })
    },
  })

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case ROLES.OWNER:
        return 'default'
      case ROLES.ADMIN:
        return 'secondary'
      case ROLES.MEMBER:
      case ROLES.VIEWER:
      default:
        return 'outline'
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <p className='text-muted-foreground'>
          {t('common.loading', 'Loading...')}
        </p>
      </div>
    )
  }

  if (!invitations || invitations.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-12'>
        <Mail className='mb-4 h-12 w-12 text-muted-foreground' />
        <h3 className='mb-2 font-semibold text-lg'>
          {t('invitations.noPendingInvitations', 'No pending invitations')}
        </h3>
        <p className='text-muted-foreground text-sm'>
          {t(
            'invitations.noPendingInvitationsDescription',
            'There are currently no pending invitations.'
          )}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('invitations.email', 'Email')}</TableHead>
              <TableHead>{t('invitations.role', 'Role')}</TableHead>
              <TableHead>{t('invitations.invitedBy', 'Invited By')}</TableHead>
              <TableHead>{t('invitations.sentDate', 'Sent Date')}</TableHead>
              <TableHead>{t('invitations.expiresAt', 'Expires At')}</TableHead>
              <TableHead className='w-[70px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className='font-medium'>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    {invitation.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(invitation.role)}>
                    {/* biome-ignore lint/suspicious/noExplicitAny: Dynamic translation key requires any */}
                    {t(`roles.${invitation.role}` as any)}
                  </Badge>
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {invitation.invited_by_name}
                </TableCell>
                <TableCell className='text-muted-foreground text-sm'>
                  {format(new Date(invitation.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className='text-muted-foreground text-sm'>
                  {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem
                        className='text-destructive focus:text-destructive'
                        onClick={() => setDeleteId(invitation.id)}
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        {t('invitations.cancelInvitation', 'Cancel Invitation')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('invitations.cancelInvitationTitle', 'Cancel Invitation?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'invitations.cancelInvitationDescription',
                'Are you sure you want to cancel this invitation?'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteMutation.isPending
                ? t('common.loading', 'Loading...')
                : t('invitations.cancelInvitation', 'Cancel Invitation')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
