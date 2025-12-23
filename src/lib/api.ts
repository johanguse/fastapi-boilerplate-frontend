import axios, { type AxiosResponse } from 'axios'
import { deleteCookie as deleteCookieUtil } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

const API_BASE_URL = 'http://localhost:8000/api/v1'

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests for authentication
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Try to get token from auth store and add to Authorization header
    const session = useAuthStore.getState().session
    if (session?.session?.token) {
      config.headers.Authorization = `Bearer ${session.session.token}`
    }
    // Also rely on HTTP-only cookies as fallback
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for handling auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth tokens
      deleteCookieUtil('ba_session')
      deleteCookieUtil('ba_active_org')
      useAuthStore.getState().reset()
      // Emit logout event for Better Auth compatibility
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
    return Promise.reject(new Error(error.message || 'Request failed'))
  }
)

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

// Better Auth compatible interfaces
export interface BetterAuthUser {
  id: string
  email: string
  name: string
  emailVerified: boolean
  createdAt?: string
  updatedAt?: string
}

export interface BetterAuthSession {
  token: string
  expiresAt: string
  activeOrganizationId?: string
}

export interface BetterAuthResponse {
  user: BetterAuthUser
  session: BetterAuthSession
}

export interface BetterAuthSignInRequest {
  email: string
  password: string
  callbackURL?: string
}

export interface BetterAuthSignUpRequest {
  email: string
  password: string
  name?: string
  callbackURL?: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string | null
  description?: string | null
  plan?: string // Organization plan (Free, Starter, Pro, etc.)
  metadata?: Record<string, unknown>
  createdAt?: string
  maxProjects?: number
  activeProjects?: number
}

export interface User {
  id: number
  email: string
  name: string
  role: string
  status: string // 'active', 'invited', 'suspended'
  is_active: boolean
  is_verified: boolean
  is_superuser?: boolean
  created_at: string
  updated_at?: string
  image?: string | null // Profile image URL
  avatar_url?: string // Alias for image (deprecated, use image)
  // Profile fields
  company?: string
  job_title?: string
  country?: string
  phone?: string
  bio?: string
  website?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}

export interface AdminStats {
  total_users: number
  verified_users: number
  active_users: number
  admin_users: number
  member_users: number
}

export interface AnalyticsOverview {
  users: {
    total: number
    new_last_30_days: number
    new_last_7_days: number
  }
  organizations: {
    total: number
  }
  subscriptions: {
    active: number
  }
  revenue: {
    total: number
    last_30_days: number
    currency: string
  }
  activity: {
    total_events: number
  }
}

export interface ChartDataPoint {
  date: string
  count?: number
  revenue?: number
}

export interface ActivityLog {
  id: number
  action: string
  action_type: string
  description: string
  action_metadata?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
  user_id?: number
  organization_id?: number
  project_id?: number
  user_name?: string
  user_email?: string
}

export interface UserUpdateAdmin {
  name?: string
  role?: string
  status?: string // 'active', 'invited', 'suspended'
  is_active?: boolean
  is_verified?: boolean
}

export interface UserInvite {
  email: string
  name: string
  role?: string
}

export interface Team {
  id: number
  name: string
  created_at: string
  updated_at: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  plan_name?: string
  subscription_status?: string
}

export interface Project {
  id: number
  name: string
  description?: string
  team_id: number
  created_at: string
  updated_at: string
}

export const authApi = {
  // Legacy FastAPI Users login
  async login(data: LoginRequest): Promise<AuthResponse> {
    // FastAPI Users expects form data for login
    const formData = new URLSearchParams()
    formData.append('username', data.email) // FastAPI Users uses 'username' field
    formData.append('password', data.password)

    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      '/auth/jwt/login',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    return response.data
  },

  // Better Auth compatible sign in
  async signIn(data: BetterAuthSignInRequest): Promise<BetterAuthResponse> {
    const response: AxiosResponse<BetterAuthResponse> = await apiClient.post(
      '/auth/sign-in/email',
      data
    )
    // Token is automatically set via HTTP-only cookie by the backend
    return response.data
  },

  // Better Auth compatible sign up
  async signUp(data: BetterAuthSignUpRequest): Promise<BetterAuthResponse> {
    const response: AxiosResponse<BetterAuthResponse> = await apiClient.post(
      '/auth/sign-up/email',
      data
    )
    // Token is automatically set via HTTP-only cookie by the backend
    return response.data
  },

  // Better Auth compatible sign out
  async signOut(): Promise<{ success: boolean }> {
    const response: AxiosResponse<{ success: boolean }> =
      await apiClient.post('/auth/sign-out')
    // Cookies are cleared by the backend
    return response.data
  },

  // Get current session (Better Auth style)
  async getSession(): Promise<{
    user: BetterAuthUser
    session: BetterAuthSession
  }> {
    const response: AxiosResponse<{
      user: BetterAuthUser
      session: BetterAuthSession
    }> = await apiClient.get('/auth/session')
    return response.data
  },

  // Legacy registration
  async register(data: RegisterRequest): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.post(
      '/auth/register',
      {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role || 'member',
        is_active: true,
        is_verified: false,
      }
    )

    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.get('/me')
    return response.data
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email })
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, password })
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.patch('/me', data)
    return response.data
  },
}

// Better Auth organization API
export const organizationApi = {
  async list(): Promise<Organization[]> {
    const response: AxiosResponse<Organization[]> =
      await apiClient.get('/auth/organization')
    return response.data
  },

  async get(id: string): Promise<Organization> {
    const response: AxiosResponse<Organization> = await apiClient.get(
      `/auth/organization/${id}`
    )
    return response.data
  },

  async create(data: {
    name: string
    slug?: string
    logo?: string
  }): Promise<Organization> {
    const response: AxiosResponse<Organization> = await apiClient.post(
      '/auth/organization',
      data
    )
    return response.data
  },

  async update(
    id: string,
    data: { name?: string; slug?: string; logo?: string }
  ): Promise<Organization> {
    const response: AxiosResponse<Organization> = await apiClient.put(
      `/auth/organization/${id}`,
      data
    )
    return response.data
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> =
      await apiClient.delete(`/auth/organization/${id}`)
    return response.data
  },

  async setActive(
    organizationId: string
  ): Promise<{ success: boolean; activeOrganizationId: string }> {
    const response: AxiosResponse<{
      success: boolean
      activeOrganizationId: string
    }> = await apiClient.post('/auth/organization/set-active', {
      organizationId,
    })
    return response.data
  },
}

export const teamsApi = {
  async getTeams(): Promise<Team[]> {
    const response: AxiosResponse<{ items: Team[] }> =
      await apiClient.get('/teams')
    return response.data.items
  },

  async createTeam(name: string): Promise<Team> {
    const response: AxiosResponse<Team> = await apiClient.post('/teams', {
      name,
    })
    return response.data
  },

  async getTeam(id: number): Promise<Team> {
    const response: AxiosResponse<Team> = await apiClient.get(`/teams/${id}`)
    return response.data
  },

  async updateTeam(id: number, data: Partial<Team>): Promise<Team> {
    const response: AxiosResponse<Team> = await apiClient.put(
      `/teams/${id}`,
      data
    )
    return response.data
  },

  async deleteTeam(id: number): Promise<void> {
    await apiClient.delete(`/teams/${id}`)
  },
}

export const projectsApi = {
  async getProjects(): Promise<Project[]> {
    const response: AxiosResponse<{ items: Project[] }> =
      await apiClient.get('/projects')
    return response.data.items
  },

  async createProject(data: {
    name: string
    description?: string
    team_id: number
  }): Promise<Project> {
    const response: AxiosResponse<Project> = await apiClient.post(
      '/projects',
      data
    )
    return response.data
  },

  async getProject(id: number): Promise<Project> {
    const response: AxiosResponse<Project> = await apiClient.get(
      `/projects/${id}`
    )
    return response.data
  },

  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    const response: AxiosResponse<Project> = await apiClient.put(
      `/projects/${id}`,
      data
    )
    return response.data
  },

  async deleteProject(id: number): Promise<void> {
    await apiClient.delete(`/projects/${id}`)
  },
}

// Admin API (requires admin role)
export const adminApi = {
  async getAllUsers(params?: {
    page?: number
    size?: number
    search?: string
    role?: string
  }): Promise<PaginatedResponse<User>> {
    const response: AxiosResponse<PaginatedResponse<User>> =
      await apiClient.get('/admin/users', { params })
    return response.data
  },

  async getUserById(userId: number): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.get(
      `/admin/users/${userId}`
    )
    return response.data
  },

  async updateUser(userId: number, data: UserUpdateAdmin): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.patch(
      `/admin/users/${userId}`,
      data
    )
    return response.data
  },

  async deleteUser(
    userId: number
  ): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> =
      await apiClient.delete(`/admin/users/${userId}`)
    return response.data
  },

  async inviteUser(data: UserInvite): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.post(
      '/admin/users/invite',
      data
    )
    return response.data
  },

  async getStats(): Promise<AdminStats> {
    const response: AxiosResponse<AdminStats> =
      await apiClient.get('/admin/stats')
    return response.data
  },

  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const response: AxiosResponse<AnalyticsOverview> = await apiClient.get(
      '/admin/analytics/overview'
    )
    return response.data
  },

  async getUsersGrowth(days: number = 30): Promise<{ data: ChartDataPoint[] }> {
    const response: AxiosResponse<{ data: ChartDataPoint[] }> =
      await apiClient.get('/admin/analytics/users-growth', {
        params: { days },
      })
    return response.data
  },

  async getRevenueChart(
    days: number = 30
  ): Promise<{ data: ChartDataPoint[]; currency: string }> {
    const response: AxiosResponse<{
      data: ChartDataPoint[]
      currency: string
    }> = await apiClient.get('/admin/analytics/revenue-chart', {
      params: { days },
    })
    return response.data
  },

  async getActivityLogs(params?: {
    page?: number
    size?: number
    action_type?: string
    user_id?: number
    organization_id?: number
  }): Promise<PaginatedResponse<ActivityLog>> {
    const response: AxiosResponse<PaginatedResponse<ActivityLog>> =
      await apiClient.get('/admin/activity-logs', { params })
    return response.data
  },
}

// Export apiClient as 'api' for convenience
export const api = apiClient

export default apiClient
