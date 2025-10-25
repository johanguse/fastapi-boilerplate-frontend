import { createFileRoute } from '@tanstack/react-router'
import AIAnalyticsPage from '@/features/ai-analytics'

export const Route = createFileRoute('/_authenticated/ai-analytics')({
  component: AIAnalyticsPage,
})
