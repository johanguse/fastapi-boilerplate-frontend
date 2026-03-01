import { z } from 'zod/v4'

/**
 * Task Entity
 * Schema and types for task management
 */

// ============================================================================
// Schemas (Runtime Validation)
// ============================================================================

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string(),
})

export const TaskListSchema = z.array(TaskSchema)

// ============================================================================
// Inferred Types
// ============================================================================

export type Task = z.infer<typeof TaskSchema>
export type TaskList = z.infer<typeof TaskListSchema>
