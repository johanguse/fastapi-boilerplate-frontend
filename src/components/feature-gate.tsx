import type { ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useFeatureGate } from '@/hooks/use-feature-gate'

interface FeatureGateProps {
  /**
   * Whether this feature requires email verification
   */
  requireVerifiedEmail?: boolean

  /**
   * The component to render (will be disabled if feature is not available)
   */
  children: ReactNode

  /**
   * Custom message to show when feature is locked
   */
  lockedMessage?: string

  /**
   * Whether to show a tooltip when feature is locked
   */
  showTooltip?: boolean
}

/**
 * Component that gates features based on user verification status
 *
 * @example
 * ```tsx
 * <FeatureGate requireVerifiedEmail>
 *   <Button>Create Project</Button>
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  requireVerifiedEmail = false,
  children,
  lockedMessage,
  showTooltip = true,
}: FeatureGateProps) {
  const { isAvailable, reason } = useFeatureGate(requireVerifiedEmail)

  // If feature is available, render children as-is
  if (isAvailable) {
    return <>{children}</>
  }

  // If no tooltip needed, just render disabled children
  if (!showTooltip) {
    return <div className='cursor-not-allowed opacity-50'>{children}</div>
  }

  // Render with tooltip
  const message = lockedMessage || reason || 'This feature is currently locked'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='inline-block cursor-not-allowed'>
            <div className='pointer-events-none opacity-50'>{children}</div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
