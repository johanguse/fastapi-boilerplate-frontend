import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { useCallback, useRef, useState } from 'react'

/**
 * Custom hook for Cloudflare Turnstile CAPTCHA integration.
 *
 * Provides token management, verification status, and widget control.
 * The token is automatically cleared on reset and can be consumed by
 * form submission handlers.
 *
 * @example
 * ```tsx
 * const turnstile = useTurnstile()
 *
 * // In JSX:
 * <TurnstileWidget ref={turnstile.ref} onSuccess={turnstile.onSuccess} />
 * <Button disabled={!turnstile.isVerified}>Submit</Button>
 *
 * // After submission:
 * turnstile.reset()
 * ```
 */
export function useTurnstile() {
  const [token, setToken] = useState<string | null>(null)
  const ref = useRef<TurnstileInstance>(null)

  const reset = useCallback(() => {
    setToken(null)
    ref.current?.reset()
  }, [])

  const onSuccess = useCallback((newToken: string) => {
    setToken(newToken)
  }, [])

  const onExpire = useCallback(() => {
    setToken(null)
  }, [])

  const onError = useCallback(() => {
    setToken(null)
  }, [])

  return {
    /** The current Turnstile verification token (null if not verified) */
    token,
    /** Whether the Turnstile challenge has been completed */
    isVerified: !!token,
    /** Ref to attach to the TurnstileWidget for programmatic control */
    ref,
    /** Reset the Turnstile widget (call after form submission) */
    reset,
    /** Callback to pass to TurnstileWidget's onSuccess prop */
    onSuccess,
    /** Callback to pass to TurnstileWidget's onExpire prop */
    onExpire,
    /** Callback to pass to TurnstileWidget's onError prop */
    onError,
  }
}
