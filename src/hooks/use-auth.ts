import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { organizationApi } from '@/lib/api'

export function useAuth() {
  const authStore = useAuthStore((state) => state.auth)
  const {
    betterAuthUser,
    betterAuthSession,
    user,
    accessToken,
    setOrganizations,
    setActiveOrganization,
    isAuthenticated,
  } = authStore

  // Check if user is authenticated
  const authenticated = isAuthenticated()

  // Fetch organizations when authenticated (but not session data since that's handled globally)
  const { data: organizations, isLoading: organizationsLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationApi.list,
    enabled: authenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Update organizations in store
  useEffect(() => {
    if (organizations) {
      setOrganizations(organizations)
      // Set active organization if none selected
      if (!authStore.activeOrganization && organizations.length > 0) {
        setActiveOrganization(organizations[0])
      }
    }
  }, [organizations, setOrganizations, authStore.activeOrganization, setActiveOrganization])

  return {
    // Auth state
    user: betterAuthUser || user,
    accessToken,
    betterAuthUser,
    betterAuthSession,
    isAuthenticated: authenticated,
    
    // Organizations
    organizations: authStore.organizations,
    activeOrganization: authStore.activeOrganization,
    
    // Loading states
    isLoading: organizationsLoading,
    organizationsLoading,
    
    // Actions
    setActiveOrganization,
  }
}