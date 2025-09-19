import { create } from 'zustand'
import { 
  authClient, 
  signIn, 
  signUp, 
  signOut, 
  type User, 
  type Session,
  type Organization
} from '@/lib/api/auth'

interface AuthState {
  user: User | null
  session: Session | null
  organizations: Organization[]
  activeOrganization: Organization | null
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setOrganizations: (organizations: Organization[]) => void
  setActiveOrganization: (organization: Organization | null) => void
  addOrganization: (organization: Organization) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  reset: () => void
  
  // Helper methods
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  organizations: [],
  activeOrganization: null,
  isLoading: false,
  isInitialized: false,
  
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, user: session?.user || null }),
  setOrganizations: (organizations) => set({ organizations }),
  setActiveOrganization: (activeOrganization) => set({ activeOrganization }),
  addOrganization: (organization) => 
    set((state) => ({ 
      organizations: [...state.organizations, organization] 
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  
  // Normalize various backend error shapes into a friendly message
  _resolveErrorMessage: ((raw: unknown): string => {
    try {
      // Unwrap AxiosError-like shapes or nested { error: {...} }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unwrap = (input: any) => {
        // AxiosError with response.data
        if (input && input.isAxiosError && input.response) {
          return input.response.data?.error || input.response.data || input
        }
        // Fetch-like error with json payload
        if (input && input.error) return input.error
        return input
      }

      const err = unwrap(raw) as { status?: number; code?: string; message?: string; detail?: unknown }
      const baseCode = (err?.code || '').toLowerCase()
      const baseMsg = err?.message?.trim()
      type DetailShape = { error?: string; message?: string } | string | undefined
      let detail: DetailShape = err?.detail as DetailShape
      
      // If detail is a string that looks like an object but uses single quotes, normalize and parse
      if (typeof detail === 'string') {
        const trimmed = detail.trim()
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
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

      if (code.includes('invalid_credentials') || /invalid email or password/i.test(msg || '')) {
        return 'Invalid email or password.'
      }
      if (code.includes('user_not_found')) {
        return 'Account not found. Please check your email or sign up.'
      }
      if (code.includes('email_not_verified')) {
        return 'Please verify your email to continue.'
      }
      if (code.includes('rate_limit') || (err.status === 429)) {
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
        const friendly = (get() as unknown as { _resolveErrorMessage: (e: unknown) => string })._resolveErrorMessage(result.error)
        throw new Error(friendly)
      } else if (result.data) {
        // If backend returns user, set it immediately to avoid relying on getSession
        const data = result.data as unknown
        if (typeof data === 'object' && data !== null && 'user' in (data as Record<string, unknown>)) {
          const user = (data as { user: User }).user
          set({ user, session: null, isInitialized: true })
        } else {
          // Data without a user is considered an error for sign-in
          const friendly = (get() as unknown as { _resolveErrorMessage: (e: unknown) => string })._resolveErrorMessage(data)
          throw new Error(friendly)
        }
      }
    } catch (e: unknown) {
      const friendly = (get() as unknown as { _resolveErrorMessage: (e: unknown) => string })._resolveErrorMessage(e)
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
        const friendly = (get() as unknown as { _resolveErrorMessage: (e: unknown) => string })._resolveErrorMessage(result.error)
        throw new Error(friendly)
      } else if (result.data) {
        const data = result.data as unknown
        if (typeof data === 'object' && data !== null && 'user' in (data as Record<string, unknown>)) {
          const user = (data as { user: User }).user
          set({ user, session: null, isInitialized: true })
        } else {
          // Data without a user is considered an error for sign-up
          const friendly = (get() as unknown as { _resolveErrorMessage: (e: unknown) => string })._resolveErrorMessage(data)
          throw new Error(friendly)
        }
      }
    } catch (e: unknown) {
      const friendly = (get() as unknown as { _resolveErrorMessage: (e: unknown) => string })._resolveErrorMessage(e)
      throw new Error(friendly)
    } finally {
      set({ isLoading: false })
    }
  },
  
  logout: async () => {
    try {
      set({ isLoading: true })
      await signOut()
      set({ 
        user: null, 
        session: null, 
        organizations: [], 
        activeOrganization: null 
      })
    } catch (_error) {
      // Even if logout fails on server, clear local state
      set({ 
        user: null, 
        session: null, 
        organizations: [], 
        activeOrganization: null 
      })
    } finally {
      set({ isLoading: false })
    }
  },
  
  checkSession: async () => {
    try {
      set({ isLoading: true })
      
      const session = await authClient.getSession()
      
      if (session.data) {
        set({ 
          session: session.data, 
          user: session.data.user 
        })
      } else {
        set({ session: null, user: null })
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
      organizations: [],
      activeOrganization: null,
      isLoading: false,
      isInitialized: false 
    })
  },
  
  isAuthenticated: () => {
    const state = get()
    return !!state.user
  },
}))

// Legacy compatibility exports
export const useAuth = () => {
  const store = useAuthStore()
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated(),
    organizations: store.organizations,
    activeOrganization: store.activeOrganization,
    setActiveOrganization: store.setActiveOrganization,
    isLoading: store.isLoading,
    reset: store.reset,
  }
}
