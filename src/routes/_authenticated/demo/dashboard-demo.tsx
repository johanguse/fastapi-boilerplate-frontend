import { createFileRoute } from '@tanstack/react-router'
import { DashboardDemo } from '@/features/dashboard-demo'

export const Route = createFileRoute('/_authenticated/demo/dashboard-demo')({
  component: DashboardDemo,
})
