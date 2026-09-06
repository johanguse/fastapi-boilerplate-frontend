/**
 * Public, unauthenticated app configuration / feature flags.
 *
 * Backed by GET /api/v1/config, which reports which optional
 * integrations are enabled on this deployment (e.g. Fiscal Nacional
 * NFS-e, only enabled when the backend has the relevant env vars set).
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface PublicConfig {
  fiscal_enabled: boolean
}

export function usePublicConfig() {
  return useQuery<PublicConfig>({
    queryKey: ['public-config'],
    queryFn: async () => {
      const res = await api.get<PublicConfig>('/config')
      return res.data
    },
    staleTime: Infinity,
    retry: false,
  })
}
