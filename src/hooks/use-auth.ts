import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { organization } from '@/lib/api/auth'

export function useAuth() {
  const {
    user,
    organizations,
    activeOrganization,
    isAuthenticated,
    setOrganizations,
    setActiveOrganization,
  } = useAuthStore()

  // Check if user is authenticated
  const authenticated = isAuthenticated()

  // Fetch organizations when authenticated using Better Auth client
  const { data: organizationsData, isLoading: organizationsLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const result = await organization.list()
      if (result.error) {
        throw new Error('Failed to fetch organizations')
      }
      return result.data || []
    },
    enabled: authenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors to avoid logout loops
      const axiosError = error as { response?: { status?: number } }
      if (axiosError?.response?.status === 401) {
        return false
      }
      return failureCount < 3
    },
  })

  // Update organizations in store
  useEffect(() => {
    if (organizationsData) {
      setOrganizations(organizationsData)
      // Set active organization if none selected
      if (!activeOrganization && organizationsData.length > 0) {
        setActiveOrganization(organizationsData[0])
      }
    }
  }, [organizationsData, setOrganizations, activeOrganization, setActiveOrganization])

  return {
    // Auth state
    user,
    isAuthenticated: authenticated,
    
    // Organizations
    organizations,
    activeOrganization,
    
    // Loading states
    isLoading: organizationsLoading,
    organizationsLoading,
    
    // Actions
    setActiveOrganization,
  }
}