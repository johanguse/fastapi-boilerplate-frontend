import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { Users, Settings, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InviteMemberDialog } from './invite-member-dialog'
import { PendingInvitations } from './pending-invitations'

export function OrganizationDetails() {
  const { organizationId } = useParams({
    from: '/_authenticated/organizations/$organizationId/',
  })
  const { t } = useTranslation()

  const { data: organization, isLoading } = useQuery({
    queryKey: ['organization', organizationId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/organizations/${organizationId}`)
      return response.data
    },
  })

  const { data: members = [] } = useQuery({
    queryKey: ['organization-members', organizationId],
    queryFn: async () => {
      const response = await api.get(
        `/api/v1/organizations/${organizationId}/members`
      )
      return response.data
    },
  })

  if (isLoading || !organization) {
    return <div className='p-8'>{t('common.loading', 'Loading...')}</div>
  }

  return (
    <div className='container mx-auto space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>{organization.name}</h1>
          {organization.description && (
            <p className='text-muted-foreground mt-2'>
              {organization.description}
            </p>
          )}
        </div>
        <InviteMemberDialog
          organizationId={Number(organizationId)}
          organizationName={organization.name}
          trigger={
            <Button>
              <UserPlus className='mr-2 h-4 w-4' />
              {t('invitations.inviteMember', 'Invite Member')}
            </Button>
          }
        />
      </div>

      <Tabs defaultValue='members' className='w-full'>
        <TabsList>
          <TabsTrigger value='members'>
            <Users className='mr-2 h-4 w-4' />
            {t('organizations.members', 'Members')}
          </TabsTrigger>
          <TabsTrigger value='invitations'>
            <UserPlus className='mr-2 h-4 w-4' />
            {t(
              'invitations.noPendingInvitations',
              'No pending invitations'
            ).replace('No ', '')}
          </TabsTrigger>
          <TabsTrigger value='settings'>
            <Settings className='mr-2 h-4 w-4' />
            {t('organizations.settings', 'Settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='members' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>{t('organizations.members', 'Members')}</CardTitle>
              <CardDescription>
                {t(
                  'organizations.manageMembers',
                  'Manage your organization members and their roles'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {members.length === 0 ? (
                  <div className='text-muted-foreground py-8 text-center'>
                    {t('organizations.noMembers', 'No members yet')}
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {members.map(
                      (member: {
                        id: number
                        user: { name: string | null; email: string }
                        role: string
                      }) => (
                        <div
                          key={member.id}
                          className='flex items-center justify-between rounded-lg border p-4'
                        >
                          <div>
                            <p className='font-medium'>
                              {member.user.name || member.user.email}
                            </p>
                            <p className='text-muted-foreground text-sm'>
                              {member.user.email}
                            </p>
                          </div>
                          <span className='bg-primary/10 rounded-full px-3 py-1 text-sm font-medium'>
                            {member.role}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='invitations' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>
                {t('organizations.pendingInvitations', 'Pending Invitations')}
              </CardTitle>
              <CardDescription>
                {t(
                  'organizations.pendingInvitationsDesc',
                  'View and manage pending team invitations'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingInvitations organizationId={Number(organizationId)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>{t('organizations.settings', 'Settings')}</CardTitle>
              <CardDescription>
                {t(
                  'organizations.manageSettings',
                  'Manage organization settings'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>
                {t(
                  'organizations.settingsComingSoon',
                  'Organization settings coming soon...'
                )}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
