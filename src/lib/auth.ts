import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"
import { z } from "zod"

// Better Auth client configuration with organization plugin
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000", // Your FastAPI backend
  basePath: "/auth", // Match the FastAPI backend auth routes
  fetchOptions: {
    // Send cookies for session persistence across refreshes
    credentials: 'include',
    onError(e) {
      if (e.error.status === 401) {
        window.location.href = '/auth/sign-in'
      }
    },
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
  metadata?: Record<string, unknown> | null
  createdAt: Date
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

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
