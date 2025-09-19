import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"
import { z } from "zod"

// Better Auth client configuration with organization plugin
// `better-auth` is shimmed via `src/types/shims.d.ts` during local dev.
const _rawAuthClient = createAuthClient({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
	basePath: "/api/v1/auth",
	fetchOptions: {
		credentials: "include",
		onError(e: unknown) {
			const errObj = e as { error?: { status?: number } } | undefined
			if (errObj && errObj.error && errObj.error.status === 401) {
				window.location.href = "/sign-in"
			}
		},
	},
	plugins: [
		organizationClient({
			teams: { enabled: true },
		}),
	],
})

export const authClient = _rawAuthClient as unknown as AuthClientPublic

// Minimal, concrete types matching how the app calls the client
type SignEmailMethod = {
	email: (payload: Record<string, unknown>) => Promise<{ data?: { user?: User } | unknown; error?: unknown }>
}

type ApiError = { message?: string } | undefined

type ResultShape<T = unknown> = { data?: T; error?: ApiError }

type OrganizationApi = {
	create: <T = Organization>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
	setActive: <T = unknown>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
	list: <T = Organization[]>() => Promise<ResultShape<T>>
	update: <T = Organization>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
	delete: <T = unknown>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
	createTeam: <T = Team>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
	listTeams: <T = Team[]>(payload?: Record<string, unknown>) => Promise<ResultShape<T>>
	updateTeam: <T = Team>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
	removeTeam: <T = unknown>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
	setActiveTeam: <T = unknown>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
	inviteMember: <T = unknown>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
	acceptInvitation: <T = unknown>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
	rejectInvitation: <T = unknown>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
	listMembers: <T = { members: Member[] }>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
	removeMember: <T = unknown>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
	updateMemberRole: <T = unknown>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
	listInvitations: <T = Invitation[]>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
	listUserInvitations: <T = Invitation[]>() => Promise<ResultShape<T>>
	cancelInvitation: <T = unknown>(payload: Record<string, unknown>) => Promise<ResultShape<T>>
}

type AuthClientPublic = {
	signIn: SignEmailMethod
	signUp: SignEmailMethod
	signOut: () => Promise<unknown>
	useSession?: () => unknown
	getSession: () => Promise<{ data?: Session; error?: unknown }>
	resetPassword?: (...args: unknown[]) => Promise<unknown>
	forgetPassword?: (...args: unknown[]) => Promise<unknown>
	verifyEmail?: (...args: unknown[]) => Promise<unknown>
	organization: OrganizationApi
}

const _authClient = authClient as AuthClientPublic

export const {
	signIn,
	signUp,
	signOut,
	useSession,
	getSession,
	resetPassword,
	forgetPassword,
	verifyEmail,
} = _authClient

export const organization = _authClient.organization

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
	organizationId: string
	createdAt: Date
	updatedAt?: Date | null
}

export interface Member {
	id: string
	userId: string
	organizationId: string
	role: string | string[]
	createdAt: Date
	user?: {
		id: string
		name: string
		email: string
		image?: string | null
	}
}

export interface TeamMember {
	id: string
	teamId: string
	userId: string
	createdAt: Date
}

export interface Invitation {
	id: string
	email: string
	inviterId: string
	organizationId: string
	role: 'member' | 'admin' | 'owner' | ('member' | 'admin' | 'owner')[]
	status: 'pending' | 'accepted' | 'rejected' | 'canceled'
	expiresAt: Date
	teamId?: string | null
}

// Validation schemas
export const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z
	.object({
		email: z.string().email("Please enter a valid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		name: z.string().min(2, "Name must be at least 2 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	})

export const forgotPasswordSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
})

export const resetPasswordSchema = z
	.object({
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
		token: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>