import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  AlertCircle,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  FolderKanban,
  HardDrive,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useOrganizations } from '@/hooks/use-organizations'
import { api } from '@/lib/api'

export const Route = createFileRoute('/_authenticated/settings/billing')({
  component: BillingPage,
})

interface Subscription {
  id: number
  organization_id: number
  plan_id: number
  stripe_customer_id: string
  stripe_subscription_id: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at: string | null
  trial_start: string | null
  trial_end: string | null
  current_users_count: number
  current_projects_count: number
  current_storage_gb: number
  plan: {
    id: number
    name: string
    display_name: string
    price_monthly_usd: number
    price_yearly_usd: number
    max_projects: number
    max_users: number
    max_storage_gb: number
  }
}

interface UsageMetrics {
  organization_id: number
  plan_name: string
  max_projects: number
  max_users: number
  max_storage_gb: number
  current_projects: number
  current_users: number
  current_storage_gb: number
  projects_usage_percent: number
  users_usage_percent: number
  storage_usage_percent: number
}

interface BillingHistoryItem {
  id: number
  stripe_invoice_id: string
  amount: number
  currency: string
  status: string
  invoice_date: string
  paid_at: string | null
  invoice_url: string | null
  invoice_pdf: string | null
  description: string | null
}

function BillingPage() {
  const { t, i18n } = useTranslation()
  const { activeOrganization } = useOrganizations()
  const queryClient = useQueryClient()

  const managePortalMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(
        `/api/v1/subscriptions/organizations/${activeOrganization!.id}/portal`,
        null,
        {
          params: {
            return_url: window.location.href,
          },
        }
      )
      return response.data
    },
    onSuccess: (data) => {
      window.location.href = data.portal_url
    },
    onError: (error: unknown) => {
      let errorMessage = t(
        'billing.errors.portalFailed',
        'Failed to open billing portal'
      )
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'detail' in error.response.data &&
        typeof error.response.data.detail === 'string'
      ) {
        errorMessage = error.response.data.detail
      }
      toast.error(errorMessage)
    },
  })

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      await api.post(
        `/api/v1/subscriptions/organizations/${activeOrganization!.id}/cancel`
      )
    },
    onSuccess: () => {
      // Invalidate subscription query to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['subscription', activeOrganization?.id],
      })
      toast.success(
        t(
          'billing.cancelSuccess',
          'Subscription canceled. It will remain active until the end of the billing period.'
        )
      )
    },
    onError: (error: unknown) => {
      let errorMessage = t(
        'billing.errors.cancelFailed',
        'Failed to cancel subscription'
      )
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'detail' in error.response.data &&
        typeof error.response.data.detail === 'string'
      ) {
        errorMessage = error.response.data.detail
      }
      toast.error(errorMessage)
    },
  })

  const { data: subscription, isLoading: loadingSubscription } =
    useQuery<Subscription>({
      queryKey: ['subscription', activeOrganization?.id],
      queryFn: async () => {
        const response = await api.get(
          `/api/v1/subscriptions/organizations/${activeOrganization?.id}/subscription`
        )
        return response.data
      },
      enabled: !!activeOrganization?.id,
    })

  const { data: usage } = useQuery<UsageMetrics>({
    queryKey: ['usage', activeOrganization?.id],
    queryFn: async () => {
      const response = await api.get(
        `/api/v1/subscriptions/organizations/${activeOrganization?.id}/usage`
      )
      return response.data
    },
    enabled: !!activeOrganization?.id,
  })

  const { data: billingHistory, isLoading: loadingHistory } = useQuery<{
    items: BillingHistoryItem[]
    total: number
  }>({
    queryKey: ['billing-history', activeOrganization?.id],
    queryFn: async () => {
      const response = await api.get(
        `/api/v1/subscriptions/organizations/${activeOrganization?.id}/billing-history`
      )
      return response.data
    },
    enabled: !!activeOrganization?.id,
  })

  const handleManageBilling = () => {
    managePortalMutation.mutate()
  }

  const handleCancelSubscription = () => {
    if (
      !confirm(
        t(
          'billing.confirmCancel',
          'Are you sure you want to cancel your subscription? It will remain active until the end of the billing period.'
        )
      )
    ) {
      return
    }
    cancelSubscriptionMutation.mutate()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      active: 'default',
      trialing: 'secondary',
      past_due: 'destructive',
      canceled: 'outline',
      incomplete: 'outline',
    }

    return (
      <Badge variant={variants[status] || 'outline'}>
        {t(`billing.status.${status}`, status)}
      </Badge>
    )
  }

  if (!activeOrganization) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {t('billing.noOrganization', 'Please select an organization first')}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loadingSubscription) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 w-48 rounded bg-muted' />
          <div className='h-64 rounded bg-muted' />
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Card>
          <CardHeader>
            <CardTitle>
              {t('billing.noSubscription.title', 'No Active Subscription')}
            </CardTitle>
            <CardDescription>
              {t(
                'billing.noSubscription.description',
                "You don't have an active subscription yet."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to='/pricing'>
              <Button>
                {t('billing.noSubscription.viewPlans', 'View Pricing Plans')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='container mx-auto space-y-8 px-4 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-bold text-3xl'>
            {t('billing.title', 'Billing & Subscription')}
          </h1>
          <p className='text-muted-foreground'>
            {t('billing.subtitle', 'Manage your subscription and billing')}
          </p>
        </div>
        <Button
          onClick={handleManageBilling}
          disabled={managePortalMutation.isPending}
        >
          <ExternalLink className='mr-2 h-4 w-4' />
          {managePortalMutation.isPending
            ? t('billing.loading', 'Loading...')
            : t('billing.managePortal', 'Manage Billing')}
        </Button>
      </div>

      {/* Current Plan */}
      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              {t('billing.currentPlan', 'Current Plan')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-bold text-2xl'>
                  {subscription.plan.display_name}
                </p>
                <p className='text-muted-foreground text-sm'>
                  {formatCurrency(subscription.plan.price_monthly_usd, 'USD')}/
                  {t('billing.month', 'month')}
                </p>
              </div>
              {getStatusBadge(subscription.status)}
            </div>

            <Separator />

            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  {t('billing.nextBilling', 'Next billing date')}
                </span>
                <span className='font-medium'>
                  {formatDate(subscription.current_period_end)}
                </span>
              </div>

              {subscription.cancel_at_period_end && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    {t(
                      'billing.cancelScheduled',
                      'Your subscription will be canceled at the end of the billing period.'
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {!subscription.cancel_at_period_end && (
              <div className='space-y-2'>
                <Link to='/pricing'>
                  <Button variant='outline' className='w-full'>
                    <TrendingUp className='mr-2 h-4 w-4' />
                    {t('billing.upgradePlan', 'Upgrade Plan')}
                  </Button>
                </Link>
                <Button
                  variant='outline'
                  className='w-full text-destructive'
                  onClick={handleCancelSubscription}
                  disabled={cancelSubscriptionMutation.isPending}
                >
                  {cancelSubscriptionMutation.isPending
                    ? t('billing.processing', 'Processing...')
                    : t('billing.cancelSubscription', 'Cancel Subscription')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='h-5 w-5' />
              {t('billing.usage', 'Usage')}
            </CardTitle>
            <CardDescription>
              {t(
                'billing.usageDescription',
                'Current usage of your plan resources'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Projects Usage */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='flex items-center gap-2'>
                  <FolderKanban className='h-4 w-4' />
                  {t('billing.projects', 'Projects')}
                </span>
                <span className='font-medium'>
                  {usage?.current_projects || 0} / {usage?.max_projects || 0}
                </span>
              </div>
              <Progress value={usage?.projects_usage_percent || 0} />
            </div>

            {/* Users Usage */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='flex items-center gap-2'>
                  <Users className='h-4 w-4' />
                  {t('billing.teamMembers', 'Team Members')}
                </span>
                <span className='font-medium'>
                  {usage?.current_users || 0} / {usage?.max_users || 0}
                </span>
              </div>
              <Progress value={usage?.users_usage_percent || 0} />
            </div>

            {/* Storage Usage */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='flex items-center gap-2'>
                  <HardDrive className='h-4 w-4' />
                  {t('billing.storage', 'Storage')}
                </span>
                <span className='font-medium'>
                  {usage?.current_storage_gb || 0} GB /{' '}
                  {usage?.max_storage_gb || 0} GB
                </span>
              </div>
              <Progress value={usage?.storage_usage_percent || 0} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>{t('billing.history', 'Billing History')}</CardTitle>
          <CardDescription>
            {t('billing.historyDescription', 'View and download past invoices')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className='animate-pulse space-y-2'>
              <div className='h-10 rounded bg-muted' />
              <div className='h-10 rounded bg-muted' />
            </div>
          ) : billingHistory?.items?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('billing.table.date', 'Date')}</TableHead>
                  <TableHead>
                    {t('billing.table.description', 'Description')}
                  </TableHead>
                  <TableHead>{t('billing.table.amount', 'Amount')}</TableHead>
                  <TableHead>{t('billing.table.status', 'Status')}</TableHead>
                  <TableHead className='text-right'>
                    {t('billing.table.invoice', 'Invoice')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.invoice_date)}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell>
                      {formatCurrency(item.amount, item.currency)}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className='text-right'>
                      {item.invoice_pdf && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            window.open(item.invoice_pdf!, '_blank')
                          }
                        >
                          <Download className='h-4 w-4' />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className='text-center text-muted-foreground'>
              {t('billing.noHistory', 'No billing history yet')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
