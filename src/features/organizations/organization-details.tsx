import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Users, Settings, UserPlus } from 'lucide-react'
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
  const { organizationId } = useParams({ from: '/_authenticated/organizations/$organizationId/' })
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
    return <div className="p-8">{t('common.loading')}</div>
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{organization.name}</h1>
          {organization.description && (
            <p className="mt-2 text-muted-foreground">
              {organization.description}
            </p>
          )}
        </div>
        <InviteMemberDialog
          organizationId={Number(organizationId)}
          organizationName={organization.name}
          trigger={
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              {t('invitations.inviteMember')}
            </Button>
          }
        />
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            {t('organizations.members')}
          </TabsTrigger>
          <TabsTrigger value="invitations">
            <UserPlus className="mr-2 h-4 w-4" />
            {t('invitations.noPendingInvitations').replace('No ', '')}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            {t('organizations.settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('organizations.members')}</CardTitle>
              <CardDescription>
                Manage your organization members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No members yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {members.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">{member.user.name || member.user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.user.email}
                          </p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium">
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                View and manage pending team invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingInvitations organizationId={Number(organizationId)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('organizations.settings')}</CardTitle>
              <CardDescription>
                Manage organization settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Organization settings coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
