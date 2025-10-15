/**
 * Centralized React Query hook for organization management
 * This is the single source of truth for organizations data
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { organizationApi } from '@/lib/api'
import { getCookie, setCookie } from '@/lib/cookies'

const ACTIVE_ORG_COOKIE = 'ba_active_org'

/**
 * Get the active organization ID from cookie
 */
function getActiveOrganizationId(): string | null {
  return getCookie(ACTIVE_ORG_COOKIE) || null
}

/**
 * Set the active organization ID in cookie
 */
function setActiveOrganizationId(organizationId: string | null): void {
  if (organizationId) {
    setCookie(ACTIVE_ORG_COOKIE, organizationId, 30) // 30 days
  } else {
    // Remove cookie if null
    document.cookie = `${ACTIVE_ORG_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }
}

/**
 * Hook to manage organizations using React Query only
 * This replaces the previous Zustand store approach
 */
export function useOrganizations() {
  const queryClient = useQueryClient()

  // Fetch organizations list from API
  const {
    data: organizations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationApi.list,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })

  // Get active organization ID from cookie
  const activeOrganizationId = getActiveOrganizationId()

  // Find the active organization from the list
  const activeOrganization =
    organizations.find((org) => org.id === activeOrganizationId) ||
    organizations[0] ||
    null

  // Mutation to set active organization
  const setActiveMutation = useMutation({
    mutationFn: async (organizationId: string) => {
      // Just update the cookie - no API call needed
      setActiveOrganizationId(organizationId)
      return organizationId
    },
    onSuccess: (organizationId) => {
      // Find the organization name for the toast
      const org = organizations.find((o) => o.id === organizationId)
      if (org) {
        toast.success(`Switched to ${org.name}`)
      }
      // Invalidate queries that depend on active organization
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
    onError: () => {
      toast.error('Failed to switch organization')
    },
  })

  /**
   * Set the active organization
   */
  const setActiveOrganization = (organizationId: string) => {
    setActiveMutation.mutate(organizationId)
  }

  /**
   * Create a new organization
   */
  const createMutation = useMutation({
    mutationFn: organizationApi.create,
    onSuccess: (newOrg) => {
      // Invalidate and refetch organizations
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      // Automatically set as active
      setActiveOrganizationId(newOrg.id)
      toast.success('Organization created successfully')
    },
    onError: () => {
      toast.error('Failed to create organization')
    },
  })

  /**
   * Update an organization
   */
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { name?: string; slug?: string; logo?: string }
    }) => organizationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization updated successfully')
    },
    onError: () => {
      toast.error('Failed to update organization')
    },
  })

  /**
   * Delete an organization
   */
  const deleteMutation = useMutation({
    mutationFn: organizationApi.delete,
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })

      // If deleted org was active, clear active org
      if (activeOrganizationId === deletedId) {
        setActiveOrganizationId(null)
      }

      toast.success('Organization deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete organization')
    },
  })

  /**
   * Reset active organization (e.g., on logout)
   */
  const resetActive = () => {
    setActiveOrganizationId(null)
  }

  return {
    // Data
    organizations,
    activeOrganization,
    activeOrganizationId,
    isLoading,
    error,

    // Actions
    setActiveOrganization,
    createOrganization: createMutation.mutate,
    updateOrganization: updateMutation.mutate,
    deleteOrganization: deleteMutation.mutate,
    resetActive,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSwitching: setActiveMutation.isPending,
  }
}
