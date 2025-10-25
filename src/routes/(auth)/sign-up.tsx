import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/v4'
import { SignUp } from '@/features/auth/sign-up'

const searchSchema = z.object({
  email: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-up')({
  component: SignUp,
  validateSearch: searchSchema,
})
