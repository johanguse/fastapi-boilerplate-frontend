import { useAuth } from '@/stores/auth-store'

/**
 * Hook to check if a feature is available based on email verification status
 *
 * @param requireVerifiedEmail - Whether the feature requires email verification
 * @returns Object with isAvailable flag and reason if not available
 *
 * @example
 * ```tsx
 * const { isAvailable, reason } = useFeatureGate(true)
 *
 * <Button disabled={!isAvailable}>
 *   {reason || 'Create Project'}
 * </Button>
 * ```
 */
export function useFeatureGate(requireVerifiedEmail = false) {
  const { user } = useAuth()

  if (!user) {
    return {
      isAvailable: false,
      reason: 'Please sign in to access this feature',
    }
  }

  if (requireVerifiedEmail && !user.is_verified) {
    return {
      isAvailable: false,
      reason: 'Please verify your email to unlock this feature',
    }
  }

  return {
    isAvailable: true,
    reason: null,
  }
}
