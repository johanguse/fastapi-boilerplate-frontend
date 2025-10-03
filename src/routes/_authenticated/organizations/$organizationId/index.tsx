import { createFileRoute } from '@tanstack/react-router'
import { OrganizationDetails } from '@/features/organizations/organization-details'

export const Route = createFileRoute(
  '/_authenticated/organizations/$organizationId/'
)({
  component: OrganizationDetails,
})
