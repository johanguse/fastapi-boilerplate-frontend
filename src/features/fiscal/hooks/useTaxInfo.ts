/**
 * Hook to check if user has tax information on file
 *
 * Use this before initiating purchases to ensure tax compliance
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { UserTaxInfo } from '@/shared/entities/fiscal'

export function useTaxInfo() {
  const query = useQuery<UserTaxInfo | null>({
    queryKey: ['tax-info'],
    queryFn: async () => {
      try {
        const res = await api.get<UserTaxInfo>('/api/v1/fiscal/tax-info')
        return res.data
      } catch (error: unknown) {
        // 404 means no tax info yet
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status === 404) {
          return null
        }
        throw new Error('Failed to load tax information')
      }
    },
    retry: false, // Don't retry 404s
  })

  return {
    taxInfo: query.data,
    hasTaxInfo: query.data !== null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
