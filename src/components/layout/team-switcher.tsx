
import { ChevronsUpDown, Plus, Building2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { organization } from '@/lib/api/auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const queryClient = useQueryClient()
  const { organizations, activeOrganization, setActiveOrganization, isAuthenticated } = useAuth()

  // Organizations are fetched via the useAuth hook, so we can use the loading state from there
  const isLoading = !isAuthenticated

  // Create organization mutation
  const createOrganizationMutation = useMutation({
    mutationFn: async (name: string) => {
      const result = await organization.create({ name })
      if (result.error) {
        throw new Error('Failed to create organization')
      }
      return result.data
    },
    onSuccess: (newOrg) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      if (newOrg) {
        setActiveOrganization(newOrg)
        toast.success(`${(newOrg as { name: string }).name} has been created successfully.`)
      }
    },
    onError: () => {
      toast.error('Failed to create organization. Please try again.')
    },
  })

  // Set active organization mutation
  const setActiveMutation = useMutation({
    mutationFn: async (organizationId: string) => {
      const result = await organization.setActive({ organizationId })
      if (result.error) {
        throw new Error('Failed to set active organization')
      }
      return result.data
    },
    onSuccess: (_, organizationId) => {
      const selectedOrg = organizations.find(org => org.id === organizationId)
      if (selectedOrg) {
        setActiveOrganization(selectedOrg)
        toast.success(`Switched to ${selectedOrg.name}`)
      }
    },
    onError: () => {
      toast.error('Failed to switch organization. Please try again.')
    },
  })

  const handleCreateOrganization = () => {
    const name = prompt('Enter organization name:')
    if (name?.trim()) {
      createOrganizationMutation.mutate(name.trim())
    }
  }

  const handleSwitchOrganization = (organizationId: string) => {
    setActiveMutation.mutate(organizationId)
  }

  const currentOrg = activeOrganization || {
    id: 'default',
    name: isLoading ? 'Loading...' : 'No Organization',
    slug: 'default',
  }

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              <Building2 className='size-4' />
            </div>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-semibold'>Loading...</span>
              <span className='truncate text-xs'>Organizations</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                <Building2 className='size-4' />
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {currentOrg.name}
                </span>
                <span className='truncate text-xs'>Organization</span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              Organizations
            </DropdownMenuLabel>
            {organizations.map((org, index) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSwitchOrganization(org.id)}
                className='gap-2 p-2'
                disabled={setActiveMutation.isPending}
              >
                <div className='flex size-6 items-center justify-center rounded-sm border'>
                  <Building2 className='size-4 shrink-0' />
                </div>
                {org.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className='gap-2 p-2' 
              onClick={handleCreateOrganization}
              disabled={createOrganizationMutation.isPending}
            >
              <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
                <Plus className='size-4' />
              </div>
              <div className='text-muted-foreground font-medium'>
                {createOrganizationMutation.isPending ? 'Creating...' : 'Add organization'}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
