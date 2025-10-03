import { useState } from 'react'
import {
  MoreHorizontal,
  Plus,
  Building2,
  Settings,
  Trash2,
  Edit,
  ArrowRightLeft,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/stores/auth-store'
import { useOrganizations } from '@/hooks/use-organizations'
import { type Organization } from '@/lib/api'
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
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateOrganizationDialog } from './create-organization-dialog'
import { EditOrganizationDialog } from './edit-organization-dialog'

export function OrganizationsList() {
  const { t } = useTranslation()
  const { isAdmin } = useAuth()
  const {
    organizations,
    isLoading,
    isDeleting,
    setActiveOrganization,
    deleteOrganization,
  } = useOrganizations()
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null)

  const handleEdit = (organization: Organization) => {
    setSelectedOrganization(organization)
    setEditDialogOpen(true)
  }

  const handleDelete = (organization: Organization) => {
    setSelectedOrganization(organization)
    setDeleteDialogOpen(true)
  }

  const handleSwitch = (organization: Organization) => {
    // Use the centralized React Query hook method
    setActiveOrganization(organization.id)
  }

  const confirmDelete = () => {
    if (selectedOrganization) {
      deleteOrganization(selectedOrganization.id)
      setDeleteDialogOpen(false)
      setSelectedOrganization(null)
    }
  }

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>{t('organizations.title')}</h1>
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={`skeleton-${i + 1}`} className='animate-pulse'>
              <CardHeader>
                <div className='bg-muted h-4 w-3/4 rounded'></div>
                <div className='bg-muted h-3 w-1/2 rounded'></div>
              </CardHeader>
              <CardContent>
                <div className='bg-muted h-16 rounded'></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Organizations</h1>
          <p className='text-muted-foreground'>
            Manage your organizations and switch between them
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Organization
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {organizations.map((organization) => (
          <Card
            key={organization.id}
            className='transition-shadow hover:shadow-md'
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div className='flex items-center space-x-2'>
                <Building2 className='text-muted-foreground h-5 w-5' />
                <CardTitle className='text-sm font-medium'>
                  {organization.name}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm'>
                    <MoreHorizontal className='h-4 w-4' />
                    <span className='sr-only'>Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => handleSwitch(organization)}>
                    <ArrowRightLeft className='mr-2 h-4 w-4' />
                    Switch
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEdit(organization)}>
                        <Edit className='mr-2 h-4 w-4' />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className='mr-2 h-4 w-4' />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(organization)}
                        className='text-destructive'
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {organization.slug && (
                  <span className='bg-muted rounded px-2 py-1 font-mono text-xs'>
                    {organization.slug}
                  </span>
                )}
                {organization.plan && (
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground text-xs'>Plan:</span>
                    <span className='bg-primary/10 text-primary rounded px-2 py-0.5 text-xs font-medium'>
                      {organization.plan}
                    </span>
                  </div>
                )}
              </div>
              {organization.createdAt && (
                <p className='text-muted-foreground mt-2 text-xs'>
                  Created{' '}
                  {new Date(organization.createdAt).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {organizations.length === 0 && (
          <Card className='col-span-full'>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <Building2 className='text-muted-foreground mb-4 h-12 w-12' />
              <h3 className='mb-2 text-lg font-medium'>No organizations yet</h3>
              <p className='text-muted-foreground mb-4 text-center'>
                Create your first organization to get started
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className='mr-2 h-4 w-4' />
                Create Organization
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateOrganizationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedOrganization && (
        <EditOrganizationDialog
          organization={selectedOrganization}
          open={editDialogOpen}
          onOpenChange={(open: boolean) => {
            setEditDialogOpen(open)
            if (!open) setSelectedOrganization(null)
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedOrganization?.name}"?
              This action cannot be undone. All data associated with this
              organization will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
