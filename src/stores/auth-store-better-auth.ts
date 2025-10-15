import { create } from 'zustand'
import {
  getSession,
  type Session,
  signIn,
  signOut,
  signUp,
  type User,
} from '@/lib/auth'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean

  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void

  // Auth methods
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  reset: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, user: session?.user || null }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),

  // Normalize various backend error shapes into a friendly message
  // Accepts objects like { status, code, message, detail }
  // detail may be a JSON-like string with single quotes; we'll parse leniently
  _resolveErrorMessage: ((raw: unknown): string => {
    // Internal helper, not exported on the store type
    try {
      // Unwrap AxiosError-like shapes or nested { error: {...} }
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic error unwrapping requires any
      const unwrap = (input: any) => {
        // AxiosError with response.data
        if (input && input.isAxiosError && input.response) {
          return input.response.data?.error || input.response.data || input
        }
        // Fetch-like error with json payload
        if (input && input.error) return input.error
        return input
      }

      const err = unwrap(raw) as {
        status?: number
        code?: string
        message?: string
        detail?: unknown
      }
      const baseCode = (err?.code || '').toLowerCase()
      const baseMsg = err?.message?.trim()
      type DetailShape =
        | { error?: string; message?: string }
        | string
        | undefined
      let detail: DetailShape = err?.detail as DetailShape

      // If detail is a string that looks like an object but uses single quotes, normalize and parse
      if (typeof detail === 'string') {
        const trimmed = detail.trim()
        if (
          (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
          (trimmed.startsWith('[') && trimmed.endsWith(']'))
        ) {
          try {
            const jsonish = trimmed.replace(/'([^']*)'/g, '"$1"')
            detail = JSON.parse(jsonish)
          } catch {
            // keep original string
          }
        }
      }

      // Extract potential fields from detail
      const detailMsg = typeof detail === 'string' ? detail : detail?.message
      const detailCode = typeof detail === 'string' ? undefined : detail?.error

      // Common mappings
      const code = (detailCode || baseCode).toLowerCase()
      const msg = detailMsg || baseMsg

      if (
        code.includes('invalid_credentials') ||
        /invalid email or password/i.test(msg || '')
      ) {
        return 'Invalid email or password.'
      }
      if (code.includes('user_not_found')) {
        return 'Account not found. Please check your email or sign up.'
      }
      if (code.includes('email_not_verified')) {
        return 'Please verify your email to continue.'
      }
      if (code.includes('rate_limit') || err.status === 429) {
        return 'Too many attempts. Please wait a moment and try again.'
      }
      if (code.includes('conflict') || err.status === 409) {
        return 'Email already registered. Try signing in instead.'
      }
      if (err.status === 401) {
        return 'Unauthorized. Please sign in again.'
      }
      if (err.status === 500) {
        return 'Server error. Please try again shortly.'
      }
      // Fallback to any message we have, or a generic copy
      return msg || 'Something went wrong. Please try again.'
    } catch {
      return 'Something went wrong. Please try again.'
    }
  }) as unknown as never,

  login: async (email: string, password: string) => {
    set({ isLoading: true })

    try {
      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        const friendly = (
          get() as unknown as { _resolveErrorMessage: (e: unknown) => string }
        )._resolveErrorMessage(result.error)
        throw new Error(friendly)
      } else if (result.data) {
        // If backend returns user, set it immediately to avoid relying on getSession
        const data = result.data as unknown
        if (
          typeof data === 'object' &&
          data !== null &&
          'user' in (data as Record<string, unknown>)
        ) {
          const user = (data as { user: User }).user
          set({ user, session: null, isInitialized: true })
        } else {
          // Data without a user is considered an error for sign-in
          const friendly = (
            get() as unknown as { _resolveErrorMessage: (e: unknown) => string }
          )._resolveErrorMessage(data)
          throw new Error(friendly)
        }
      }
    } catch (e: unknown) {
      const friendly = (
        get() as unknown as { _resolveErrorMessage: (e: unknown) => string }
      )._resolveErrorMessage(e)
      throw new Error(friendly)
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true })

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      })

      if (result.error) {
        const friendly = (
          get() as unknown as { _resolveErrorMessage: (e: unknown) => string }
        )._resolveErrorMessage(result.error)
        throw new Error(friendly)
      } else if (result.data) {
        const data = result.data as unknown
        if (
          typeof data === 'object' &&
          data !== null &&
          'user' in (data as Record<string, unknown>)
        ) {
          const user = (data as { user: User }).user
          set({ user, session: null, isInitialized: true })
        } else {
          const friendly = (
            get() as unknown as { _resolveErrorMessage: (e: unknown) => string }
          )._resolveErrorMessage(data)
          throw new Error(friendly)
        }
      }
    } catch (e: unknown) {
      const friendly = (
        get() as unknown as { _resolveErrorMessage: (e: unknown) => string }
      )._resolveErrorMessage(e)
      throw new Error(friendly)
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    set({ isLoading: true })

    try {
      await signOut()
      set({ user: null, session: null, isInitialized: true })
    } catch (e: unknown) {
      // Even if logout fails on server, clear local state
      set({ user: null, session: null, isInitialized: true })
      // biome-ignore lint/suspicious/noConsole: Intentional warning for logout failures
      console.warn('Logout warning (cleared local state anyway):', e)
    } finally {
      set({ isLoading: false })
    }
  },

  checkSession: async () => {
    set({ isLoading: true })

    try {
      const session = await getSession()
      if (session?.data) {
        const sessionData = session.data as Session
        set({
          user: sessionData.user,
          session: sessionData,
          isInitialized: true,
        })
      } else {
        set({ user: null, session: null, isInitialized: true })
      }
    } catch (error: unknown) {
      // Gracefully handle 404 from backend that may not implement get-session
      type BetterAuthError = { error?: { status?: number } }
      const status = (error as BetterAuthError)?.error?.status
      if (status === 404) {
        set({ session: null, user: null })
      } else {
        set({ session: null, user: null })
      }
    } finally {
      set({ isLoading: false, isInitialized: true })
    }
  },

  reset: () => {
    set({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,
    })
  },
}))

// Helper hook for getting auth state
export const useAuth = () => {
  const store = useAuthStore()
  return {
    user: store.user,
    session: store.session,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    isAuthenticated: !!store.user,
    login: store.login,
    register: store.register,
    logout: store.logout,
    checkSession: store.checkSession,
    reset: store.reset,
  }
}
