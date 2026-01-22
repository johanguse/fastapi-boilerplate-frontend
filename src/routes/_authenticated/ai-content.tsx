import { createFileRoute } from '@tanstack/react-router'
import AIContentPage from '@/features/ai-content'

export const Route = createFileRoute('/_authenticated/ai-content')({
  component: AIContentPage,
})
