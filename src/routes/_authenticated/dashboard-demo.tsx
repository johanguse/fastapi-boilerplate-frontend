import { DashboardDemo } from '@/features/dashboard-demo'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard-demo')({
  component: DashboardDemo,
})
