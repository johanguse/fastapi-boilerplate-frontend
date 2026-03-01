import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import type { RefObject } from 'react'
import { cn } from '@/lib/utils'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''

interface TurnstileWidgetProps {
  /** Callback fired when the challenge is completed successfully */
  onSuccess: (token: string) => void
  /** Callback fired when the token expires */
  onExpire?: () => void
  /** Callback fired when an error occurs */
  onError?: () => void
  /** Widget size: 'normal' (300x65), 'compact' (150x140), or 'flexible' */
  size?: 'normal' | 'compact' | 'flexible'
  /** Additional CSS classes for the container */
  className?: string
  /** Ref for programmatic control (reset, etc.) */
  ref?: RefObject<TurnstileInstance | null>
}

/**
 * Cloudflare Turnstile CAPTCHA widget.
 *
 * Renders the Turnstile challenge with consistent defaults.
 * If `VITE_TURNSTILE_SITE_KEY` is not set, renders nothing —
 * this allows the app to work in development without Turnstile credentials.
 *
 * @example
 * ```tsx
 * const turnstile = useTurnstile()
 *
 * <TurnstileWidget
 *   ref={turnstile.ref}
 *   onSuccess={turnstile.onSuccess}
 *   onExpire={turnstile.onExpire}
 *   onError={turnstile.onError}
 * />
 * ```
 */
export function TurnstileWidget({
  onSuccess,
  onExpire,
  onError,
  size = 'flexible',
  className,
  ref,
}: TurnstileWidgetProps) {
  // Gracefully skip when no site key is configured (development)
  if (!TURNSTILE_SITE_KEY) {
    return null
  }

  return (
    <div className={cn('flex justify-center', className)}>
      <Turnstile
        ref={ref}
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={onSuccess}
        onExpire={onExpire}
        onError={onError}
        options={{
          size,
          theme: 'auto',
        }}
      />
    </div>
  )
}
