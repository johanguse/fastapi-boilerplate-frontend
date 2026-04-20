import { z } from 'zod/v4'

/**
 * User Entity
 * Schema and types for user management
 */

// ============================================================================
// Schemas (Runtime Validation)
// ============================================================================

export const UserStatusSchema = z.enum([
  'active',
  'inactive',
  'invited',
  'suspended',
])

export const UserRoleSchema = z.enum([
  'superadmin',
  'admin',
  'cashier',
  'manager',
])

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  status: UserStatusSchema,
  role: UserRoleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const UserListSchema = z.array(UserSchema)

// ============================================================================
// Inferred Types
// ============================================================================

export type UserStatus = z.infer<typeof UserStatusSchema>
export type UserRole = z.infer<typeof UserRoleSchema>
export type User = z.infer<typeof UserSchema>
export type UserList = z.infer<typeof UserListSchema>
