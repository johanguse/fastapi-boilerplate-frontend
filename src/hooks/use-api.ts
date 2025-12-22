/**
 * Hey API React Query Hooks
 *
 * Thin wrappers around the generated SDK functions for seamless React Query integration.
 * These hooks handle response unwrapping and provide consistent error handling.
 *
 * Usage:
 *   import { useAdminUsers, useOrganizations } from "@/hooks/use-api";
 *   const { data, isLoading } = useAdminUsers({ query: { page: 1 } });
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

/**
 * Generic wrapper for SDK functions to work with React Query.
 * Unwraps the Hey API response format { data, error } into a standard format.
 */
export async function unwrapResponse<T>(
  promise: Promise<{ data?: T; error?: unknown }>
): Promise<T> {
  const result = await promise
  if (result.error) {
    throw result.error
  }
  if (result.data === undefined) {
    throw new Error('No data returned from API')
  }
  return result.data
}

// ============================================================================
// Admin Hooks
// ============================================================================

import type {
  AdminActivitylogsListData,
  AdminAnalyticsRevenuechartListData,
  AdminAnalyticsUsersgrowthListData,
  AdminUsersDeleteByIdData,
  AdminUsersGetByIdData,
  AdminUsersInviteCreateData,
  AdminUsersListData,
  AdminUsersUpdateByIdData,
} from '@/client'
import {
  adminActivitylogsList,
  adminAnalyticsOverviewList,
  adminAnalyticsRevenuechartList,
  adminAnalyticsUsersgrowthList,
  adminStatsList,
  adminUsersDeleteById,
  adminUsersGetById,
  adminUsersInviteCreate,
  adminUsersList,
  adminUsersUpdateById,
} from '@/client'

export function useAdminUsers(options?: AdminUsersListData) {
  return useQuery({
    queryKey: ['admin', 'users', options],
    queryFn: () => unwrapResponse(adminUsersList(options)),
  })
}

export function useAdminUser(options: AdminUsersGetByIdData) {
  return useQuery({
    queryKey: ['admin', 'users', options.path.user_id],
    queryFn: () => unwrapResponse(adminUsersGetById(options)),
    enabled: !!options.path.user_id,
  })
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: AdminUsersUpdateByIdData) =>
      unwrapResponse(adminUsersUpdateById(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: AdminUsersDeleteByIdData) =>
      unwrapResponse(adminUsersDeleteById(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useAdminInviteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: AdminUsersInviteCreateData) =>
      unwrapResponse(adminUsersInviteCreate(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => unwrapResponse(adminStatsList()),
  })
}

export function useAdminAnalyticsOverview() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: () => unwrapResponse(adminAnalyticsOverviewList()),
  })
}

export function useAdminUsersGrowth(
  options?: AdminAnalyticsUsersgrowthListData
) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'users-growth', options],
    queryFn: () => unwrapResponse(adminAnalyticsUsersgrowthList(options)),
  })
}

export function useAdminRevenueChart(
  options?: AdminAnalyticsRevenuechartListData
) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'revenue-chart', options],
    queryFn: () => unwrapResponse(adminAnalyticsRevenuechartList(options)),
  })
}

export function useAdminActivityLogs(options?: AdminActivitylogsListData) {
  return useQuery({
    queryKey: ['admin', 'activity-logs', options],
    queryFn: () => unwrapResponse(adminActivitylogsList(options)),
  })
}

// ============================================================================
// Organization Hooks
// ============================================================================

import type {
  AuthOrganizationDeleteByIdData,
  AuthOrganizationGetByIdData,
  AuthOrganizationInvitememberCreateData,
  AuthOrganizationRemovememberCreateData,
  AuthOrganizationSetactiveCreateData,
  AuthOrganizationUpdateByIdData,
  OrganizationsCreateData,
  OrganizationsListData,
} from '@/client'
import {
  authOrganizationDeleteById,
  authOrganizationGetById,
  authOrganizationInvitememberCreate,
  authOrganizationListmembersList,
  authOrganizationRemovememberCreate,
  authOrganizationSetactiveCreate,
  authOrganizationUpdateById,
  organizationsCreate,
  organizationsList,
} from '@/client'

export function useOrganizations(options?: OrganizationsListData) {
  return useQuery({
    queryKey: ['organizations', options],
    queryFn: () => unwrapResponse(organizationsList(options)),
  })
}

export function useOrganization(options: AuthOrganizationGetByIdData) {
  return useQuery({
    queryKey: ['organizations', options.path.org_id],
    queryFn: () => unwrapResponse(authOrganizationGetById(options)),
    enabled: !!options.path.org_id,
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: OrganizationsCreateData) =>
      unwrapResponse(organizationsCreate(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: AuthOrganizationUpdateByIdData) =>
      unwrapResponse(authOrganizationUpdateById(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: AuthOrganizationDeleteByIdData) =>
      unwrapResponse(authOrganizationDeleteById(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}

export function useSetActiveOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: AuthOrganizationSetactiveCreateData) =>
      unwrapResponse(authOrganizationSetactiveCreate(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}

export function useOrganizationMembers() {
  return useQuery({
    queryKey: ['organizations', 'members'],
    queryFn: () => unwrapResponse(authOrganizationListmembersList()),
  })
}

export function useInviteOrganizationMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: AuthOrganizationInvitememberCreateData) =>
      unwrapResponse(authOrganizationInvitememberCreate(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}

export function useRemoveOrganizationMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: AuthOrganizationRemovememberCreateData) =>
      unwrapResponse(authOrganizationRemovememberCreate(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}

// ============================================================================
// Project Hooks
// ============================================================================

import type {
  ProjectsCreateData,
  ProjectsDeleteByIdData,
  ProjectsGetByIdData,
  ProjectsListData,
  ProjectsUpdateByIdData,
} from '@/client'
import {
  projectsCreate,
  projectsDeleteById,
  projectsGetById,
  projectsList,
  projectsUpdateById,
} from '@/client'

export function useProjects(options?: ProjectsListData) {
  return useQuery({
    queryKey: ['projects', options],
    queryFn: () => unwrapResponse(projectsList(options)),
  })
}

export function useProject(options: ProjectsGetByIdData) {
  return useQuery({
    queryKey: ['projects', options.path.project_id],
    queryFn: () => unwrapResponse(projectsGetById(options)),
    enabled: !!options.path.project_id,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: ProjectsCreateData) =>
      unwrapResponse(projectsCreate(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: ProjectsUpdateByIdData) =>
      unwrapResponse(projectsUpdateById(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: ProjectsDeleteByIdData) =>
      unwrapResponse(projectsDeleteById(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

// ============================================================================
// User Profile Hooks
// ============================================================================

import type { UsersMeUpdateData, UsersMeUploadimageCreateData } from '@/client'
import {
  usersMeImageDelete,
  usersMeList,
  usersMeUpdate,
  usersMeUploadimageCreate,
} from '@/client'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => unwrapResponse(usersMeList()),
  })
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: UsersMeUpdateData) =>
      unwrapResponse(usersMeUpdate(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
    },
  })
}

export function useUploadProfileImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: UsersMeUploadimageCreateData) =>
      unwrapResponse(usersMeUploadimageCreate(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
    },
  })
}

export function useDeleteProfileImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => unwrapResponse(usersMeImageDelete()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
    },
  })
}

// ============================================================================
// Subscription Hooks
// ============================================================================

import type {
  SubscriptionsOrganizationsBillinghistoryGetByIdData,
  SubscriptionsOrganizationsCancelCreateByIdData,
  SubscriptionsOrganizationsCheckoutCreateByIdData,
  SubscriptionsOrganizationsPortalCreateByIdData,
  SubscriptionsOrganizationsSubscriptionGetByIdData,
  SubscriptionsOrganizationsUsageGetByIdData,
} from '@/client'
import {
  subscriptionsOrganizationsBillinghistoryGetById,
  subscriptionsOrganizationsCancelCreateById,
  subscriptionsOrganizationsCheckoutCreateById,
  subscriptionsOrganizationsPortalCreateById,
  subscriptionsOrganizationsSubscriptionGetById,
  subscriptionsOrganizationsUsageGetById,
  subscriptionsPlansList,
} from '@/client'

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscriptions', 'plans'],
    queryFn: () => unwrapResponse(subscriptionsPlansList()),
  })
}

export function useOrganizationSubscription(
  options: SubscriptionsOrganizationsSubscriptionGetByIdData
) {
  return useQuery({
    queryKey: ['subscriptions', options.path.organization_id],
    queryFn: () =>
      unwrapResponse(subscriptionsOrganizationsSubscriptionGetById(options)),
    enabled: !!options.path.organization_id,
  })
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (options: SubscriptionsOrganizationsCheckoutCreateByIdData) =>
      unwrapResponse(subscriptionsOrganizationsCheckoutCreateById(options)),
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: SubscriptionsOrganizationsCancelCreateByIdData) =>
      unwrapResponse(subscriptionsOrganizationsCancelCreateById(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    },
  })
}

export function useCreateBillingPortal() {
  return useMutation({
    mutationFn: (options: SubscriptionsOrganizationsPortalCreateByIdData) =>
      unwrapResponse(subscriptionsOrganizationsPortalCreateById(options)),
  })
}

export function useBillingHistory(
  options: SubscriptionsOrganizationsBillinghistoryGetByIdData
) {
  return useQuery({
    queryKey: [
      'subscriptions',
      options.path.organization_id,
      'billing-history',
    ],
    queryFn: () =>
      unwrapResponse(subscriptionsOrganizationsBillinghistoryGetById(options)),
    enabled: !!options.path.organization_id,
  })
}

export function useSubscriptionUsage(
  options: SubscriptionsOrganizationsUsageGetByIdData
) {
  return useQuery({
    queryKey: ['subscriptions', options.path.organization_id, 'usage'],
    queryFn: () =>
      unwrapResponse(subscriptionsOrganizationsUsageGetById(options)),
    enabled: !!options.path.organization_id,
  })
}

// ============================================================================
// AI Features Hooks
// ============================================================================

import type {
  AiAnalyticsQueriesListData,
  AiAnalyticsQueryCreateData,
  AiContentGenerateCreateData,
  AiContentGenerationsListData,
  AiContentTemplatesListData,
  AiDocumentsChatCreateByIdData,
  AiDocumentsDeleteByIdData,
  AiDocumentsGetByIdData,
  AiDocumentsListData,
  AiDocumentsUploadCreateData,
} from '@/client'
import {
  aiAnalyticsQueriesList,
  aiAnalyticsQueryCreate,
  aiContentGenerateCreate,
  aiContentGenerationsList,
  aiContentTemplatesList,
  aiDocumentsChatCreateById,
  aiDocumentsDeleteById,
  aiDocumentsGetById,
  aiDocumentsList,
  aiDocumentsUploadCreate,
  aiUsageDashboardList,
  aiUsageLimitsList,
} from '@/client'

export function useAiDocuments(options?: AiDocumentsListData) {
  return useQuery({
    queryKey: ['ai', 'documents', options],
    queryFn: () => unwrapResponse(aiDocumentsList(options)),
  })
}

export function useAiDocument(options: AiDocumentsGetByIdData) {
  return useQuery({
    queryKey: ['ai', 'documents', options.path.document_id],
    queryFn: () => unwrapResponse(aiDocumentsGetById(options)),
    enabled: !!options.path.document_id,
  })
}

export function useUploadAiDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: AiDocumentsUploadCreateData) =>
      unwrapResponse(aiDocumentsUploadCreate(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'documents'] })
    },
  })
}

export function useDeleteAiDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: AiDocumentsDeleteByIdData) =>
      unwrapResponse(aiDocumentsDeleteById(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'documents'] })
    },
  })
}

export function useChatWithDocument() {
  return useMutation({
    mutationFn: (options: AiDocumentsChatCreateByIdData) =>
      unwrapResponse(aiDocumentsChatCreateById(options)),
  })
}

export function useGenerateAiContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: AiContentGenerateCreateData) =>
      unwrapResponse(aiContentGenerateCreate(options)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'content'] })
    },
  })
}

export function useAiContentGenerations(
  options?: AiContentGenerationsListData
) {
  return useQuery({
    queryKey: ['ai', 'content', 'generations', options],
    queryFn: () => unwrapResponse(aiContentGenerationsList(options)),
  })
}

export function useAiContentTemplates(options?: AiContentTemplatesListData) {
  return useQuery({
    queryKey: ['ai', 'content', 'templates', options],
    queryFn: () => unwrapResponse(aiContentTemplatesList(options)),
  })
}

export function useAiAnalyticsQuery() {
  return useMutation({
    mutationFn: (options: AiAnalyticsQueryCreateData) =>
      unwrapResponse(aiAnalyticsQueryCreate(options)),
  })
}

export function useAiAnalyticsQueries(options?: AiAnalyticsQueriesListData) {
  return useQuery({
    queryKey: ['ai', 'analytics', 'queries', options],
    queryFn: () => unwrapResponse(aiAnalyticsQueriesList(options)),
  })
}

export function useAiUsageDashboard() {
  return useQuery({
    queryKey: ['ai', 'usage', 'dashboard'],
    queryFn: () => unwrapResponse(aiUsageDashboardList()),
  })
}

export function useAiUsageLimits() {
  return useQuery({
    queryKey: ['ai', 'usage', 'limits'],
    queryFn: () => unwrapResponse(aiUsageLimitsList()),
  })
}
