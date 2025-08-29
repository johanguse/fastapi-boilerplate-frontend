import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'access_token'

// Legacy FastAPI Users interface
interface AuthUser {
  id: number
  email: string
  name: string
  role: string
  is_active: boolean
  is_verified: boolean
  is_superuser: boolean
  created_at: string
  updated_at: string
}

// Better Auth compatible interface
interface BetterAuthUser {
  id: string
  email: string
  name: string
  emailVerified: boolean
  createdAt?: string
  updatedAt?: string
}

interface BetterAuthSession {
  token: string
  expiresAt: string
  activeOrganizationId?: string
}

// Organization interface
interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  metadata?: Record<string, unknown>
  createdAt?: string
}

interface AuthState {
  auth: {
    // Legacy FastAPI Users state
    user: AuthUser | null
    accessToken: string
    
    // Better Auth state
    betterAuthUser: BetterAuthUser | null
    betterAuthSession: BetterAuthSession | null
    
    // Organizations state
    organizations: Organization[]
    activeOrganization: Organization | null
    
    // Actions
    setUser: (user: AuthUser | null) => void
    setAccessToken: (accessToken: string) => void
    setBetterAuth: (user: BetterAuthUser, session: BetterAuthSession) => void
    setBetterAuthUser: (user: BetterAuthUser | null) => void
    setBetterAuthSession: (session: BetterAuthSession | null) => void
    setOrganizations: (organizations: Organization[]) => void
    addOrganization: (organization: Organization) => void
    setActiveOrganization: (organization: Organization | null) => void
    resetAccessToken: () => void
    reset: () => void
    isAuthenticated: () => boolean
  }
}

// Helper function to get token from cookies (Better Auth style)
function getBetterAuthToken(): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ba_session=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  
  return {
    auth: {
      // Legacy state
      user: null,
      accessToken: initToken,
      
      // Better Auth state
      betterAuthUser: null,
      betterAuthSession: null,
      
      // Organizations state
      organizations: [],
      activeOrganization: null,
      
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
        
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
        
      setBetterAuth: (user: BetterAuthUser, session: BetterAuthSession) =>
        set((state) => ({
          ...state,
          auth: {
            ...state.auth,
            betterAuthUser: user,
            betterAuthSession: session,
          }
        })),
        
      setBetterAuthUser: (user: BetterAuthUser | null) =>
        set((state) => ({ ...state, auth: { ...state.auth, betterAuthUser: user } })),
        
      setBetterAuthSession: (session: BetterAuthSession | null) =>
        set((state) => ({ ...state, auth: { ...state.auth, betterAuthSession: session } })),
        
      setOrganizations: (organizations: Organization[]) =>
        set((state) => ({ ...state, auth: { ...state.auth, organizations } })),
        
      addOrganization: (organization: Organization) =>
        set((state) => ({ 
          ...state, 
          auth: { 
            ...state.auth, 
            organizations: [...state.auth.organizations, organization] 
          } 
        })),
        
      setActiveOrganization: (activeOrganization: Organization | null) =>
        set((state) => ({ ...state, auth: { ...state.auth, activeOrganization } })),
        
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
        
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return {
            ...state,
            auth: { 
              ...state.auth, 
              user: null, 
              accessToken: '',
              betterAuthUser: null,
              betterAuthSession: null,
              organizations: [],
              activeOrganization: null,
            },
          }
        }),
        
      isAuthenticated: () => {
        const state = get()
        
        // Check Better Auth authentication first
        if (state.auth.betterAuthUser && state.auth.betterAuthSession?.token) {
          return true
        }
        
        // Check for Better Auth session cookie
        const betterAuthToken = getBetterAuthToken()
        if (betterAuthToken && state.auth.betterAuthUser) {
          return true
        }
        
        // Fallback to legacy authentication
        return !!(state.auth.accessToken && state.auth.user)
      },
    },
  }
})

// Helper hooks for Better Auth compatibility
export const useBetterAuth = () => {
  const store = useAuthStore()
  return {
    user: store.auth.betterAuthUser,
    session: store.auth.betterAuthSession,
    isAuthenticated: store.auth.isAuthenticated(),
    setBetterAuth: store.auth.setBetterAuth,
    setUser: store.auth.setBetterAuthUser,
    setSession: store.auth.setBetterAuthSession,
    reset: store.auth.reset,
  }
}

// Legacy hook for backward compatibility
export const useAuth = () => {
  const store = useAuthStore()
  return {
    user: store.auth.user,
    accessToken: store.auth.accessToken,
    isAuthenticated: store.auth.isAuthenticated(),
    setUser: store.auth.setUser,
    setAccessToken: store.auth.setAccessToken,
    reset: store.auth.reset,
  }
}
