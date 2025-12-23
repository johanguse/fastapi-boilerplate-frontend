import { organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { z } from 'zod/v4'
import i18n from '@/lib/i18n'

// Better Auth client configuration with organization plugin
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000', // Your FastAPI backend
  basePath: '/api/v1/auth', // Match the FastAPI backend auth routes with API prefix
  fetchOptions: {
    // Send cookies for session persistence across refreshes
    credentials: 'include',
    // Don't redirect on 401 - let the auth store handle it gracefully
    // A 401 on getSession is expected when not logged in
  },
  plugins: [
    organizationClient({
      // Enable teams within organizations
      teams: {
        enabled: true,
      },
    }),
  ],
})

// Export auth methods for easier use
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  resetPassword,
  forgetPassword,
  verifyEmail,
} = authClient

// Export organization methods directly from the client
export const organization = authClient.organization

// Types for our application (compatible with Better Auth)
export interface User {
  id: string
  email: string
  name: string
  emailVerified: boolean
  image?: string | null
  createdAt: Date
  updatedAt: Date
  role?: string // User role (admin, user, etc.)
  is_verified?: boolean // Backend uses snake_case
  is_superuser?: boolean // Backend admin flag
  onboarding_completed?: boolean // Onboarding completion status
  onboarding_step?: number // Current onboarding step
  // Profile fields
  company?: string
  job_title?: string
  country?: string
  phone?: string
  bio?: string
  website?: string
}

export interface Session {
  user: User
  session: {
    id: string
    userId: string
    expiresAt: Date
    token: string
    ipAddress?: string | null
    userAgent?: string | null
    activeOrganizationId?: string | null
    activeTeamId?: string | null
  }
}

// Organization/Team types (Better Auth organization plugin)
export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string | null
  description?: string | null
  plan?: string // Organization plan (Free, Starter, Pro, etc.)
  metadata?: Record<string, unknown> | null
  createdAt: Date
  maxProjects?: number
  activeProjects?: number
}

export interface Team {
  id: string
  name: string
  slug: string
  organizationId: string
  logo?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: Date
}

export interface Member {
  id: string
  organizationId: string
  userId: string
  role: string
  createdAt: Date
  user: User
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  role: string
  createdAt: Date
  user: User
}

export interface Invitation {
  id: string
  organizationId: string
  email: string
  role: string
  expiresAt: Date
  createdAt: Date
  organizationName?: string
  inviterName?: string
}

// Validation schemas with i18n support
export const getLoginSchema = () =>
  z.object({
    email: z
      .email(i18n.t('auth.emailInvalid', 'Invalid email address'))
      .min(1, i18n.t('auth.emailRequired', 'Email is required')),
    password: z
      .string()
      .min(
        6,
        i18n.t(
          'auth.passwordTooShort',
          'Password must be at least 6 characters',
          { count: 6 }
        )
      ),
  })

export const getRegisterSchema = () =>
  z
    .object({
      email: z
        .email(i18n.t('auth.emailInvalid', 'Invalid email address'))
        .min(1, i18n.t('auth.emailRequired', 'Email is required')),
      password: z
        .string()
        .min(
          6,
          i18n.t(
            'auth.passwordTooShort',
            'Password must be at least 6 characters',
            { count: 6 }
          )
        ),
      name: z.string().min(
        2,
        i18n.t('auth.nameTooShort', 'Name must be at least 2 characters', {
          count: 2,
        })
      ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: i18n.t('auth.passwordsDontMatch', "Passwords don't match"),
      path: ['confirmPassword'],
    })

// Types for forms based on dynamic schemas
export type LoginFormData = z.infer<ReturnType<typeof getLoginSchema>>
export type RegisterFormData = z.infer<ReturnType<typeof getRegisterSchema>>
