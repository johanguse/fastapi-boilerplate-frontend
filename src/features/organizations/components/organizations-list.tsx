import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Plus, Building2, Settings, Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { organizationApi, type Organization } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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
import { CreateOrganizationDialog } from './create-organization-dialog'
import { EditOrganizationDialog } from './edit-organization-dialog'

export function OrganizationsList() {
  const { t } = useTranslation()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)
  
  const queryClient = useQueryClient()

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationApi.list,
  })

  const deleteMutation = useMutation({
    mutationFn: organizationApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedOrganization(null)
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { detail?: { message?: string } } } }
      const errorMessage = axiosError.response?.data?.detail?.message || 'Failed to delete organization'
      toast.error(errorMessage)
    },
  })

  const handleEdit = (organization: Organization) => {
    setSelectedOrganization(organization)
    setEditDialogOpen(true)
  }

  const handleDelete = (organization: Organization) => {
    setSelectedOrganization(organization)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedOrganization) {
      deleteMutation.mutate(selectedOrganization.id)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('organizations.title')}</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={`skeleton-${i + 1}`} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">
            Manage your organizations and switch between them
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((organization) => (
          <Card key={organization.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  {organization.name}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(organization)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDelete(organization)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {organization.slug && (
                  <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                    {organization.slug}
                  </span>
                )}
              </CardDescription>
              {organization.createdAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Created {new Date(organization.createdAt).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {organizations.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No organizations yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first organization to get started
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
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
              Are you sure you want to delete "{selectedOrganization?.name}"? This action cannot be undone.
              All data associated with this organization will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}