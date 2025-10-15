import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  Activity,
  Building2,
  DollarSign,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminApi } from '@/lib/api'
import { useAuth } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated/admin/reports')({
  component: AdminReportsPage,
})

function AdminReportsPage() {
  const { t } = useTranslation()
  const { isAdmin } = useAuth()

  // Fetch analytics data
  const { data: overview } = useQuery({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: () => adminApi.getAnalyticsOverview(),
    enabled: isAdmin,
  })

  const { data: usersGrowth, isLoading: usersGrowthLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'users-growth'],
    queryFn: () => adminApi.getUsersGrowth(30),
    enabled: isAdmin,
  })

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'revenue'],
    queryFn: () => adminApi.getRevenueChart(30),
    enabled: isAdmin,
  })

  if (!isAdmin) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>

        <Main>
          <div className='flex h-full items-center justify-center'>
            <div className='text-center'>
              <Shield className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
              <h1 className='font-bold text-2xl'>
                {t('admin.accessDeniedTitle', 'Access Denied')}
              </h1>
              <p className='mt-2 text-muted-foreground'>
                {t(
                  'admin.accessDeniedDescription',
                  "You don't have permission to access this page."
                )}
              </p>
            </div>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='space-y-6'>
          {/* Header */}
          <div>
            <h1 className='flex items-center gap-2 font-bold text-3xl'>
              <TrendingUp className='h-8 w-8' />
              {t('admin.reports.title', 'Reports & Analytics')}
            </h1>
            <p className='mt-2 text-muted-foreground'>
              {t(
                'admin.reports.subtitle',
                'Platform insights and performance metrics'
              )}
            </p>
          </div>

          {/* Overview Cards */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='font-medium text-sm'>
                  {t('admin.reports.totalUsers', 'Total Users')}
                </CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                {overview ? (
                  <>
                    <div className='font-bold text-2xl'>
                      {overview.users.total}
                    </div>
                    <p className='text-muted-foreground text-xs'>
                      +{overview.users.new_last_7_days}{' '}
                      {t('admin.reports.thisWeek', 'this week')}
                    </p>
                  </>
                ) : (
                  <>
                    <Skeleton className='mb-2 h-8 w-20' />
                    <Skeleton className='h-3 w-24' />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='font-medium text-sm'>
                  {t('admin.reports.organizations', 'Organizations')}
                </CardTitle>
                <Building2 className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                {overview ? (
                  <>
                    <div className='font-bold text-2xl'>
                      {overview.organizations.total}
                    </div>
                    <p className='text-muted-foreground text-xs'>
                      {t(
                        'admin.reports.totalOrganizations',
                        'Total organizations'
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <Skeleton className='mb-2 h-8 w-20' />
                    <Skeleton className='h-3 w-32' />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='font-medium text-sm'>
                  {t(
                    'admin.reports.activeSubscriptions',
                    'Active Subscriptions'
                  )}
                </CardTitle>
                <Activity className='h-4 w-4 text-green-600' />
              </CardHeader>
              <CardContent>
                {overview ? (
                  <>
                    <div className='font-bold text-2xl'>
                      {overview.subscriptions.active}
                    </div>
                    <p className='text-muted-foreground text-xs'>
                      {t('admin.reports.payingCustomers', 'Paying customers')}
                    </p>
                  </>
                ) : (
                  <>
                    <Skeleton className='mb-2 h-8 w-20' />
                    <Skeleton className='h-3 w-28' />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='font-medium text-sm'>
                  {t('admin.reports.totalRevenue', 'Total Revenue')}
                </CardTitle>
                <DollarSign className='h-4 w-4 text-green-600' />
              </CardHeader>
              <CardContent>
                {overview ? (
                  <>
                    <div className='font-bold text-2xl'>
                      ${(overview.revenue.total / 100).toFixed(2)}
                    </div>
                    <p className='text-muted-foreground text-xs'>
                      ${(overview.revenue.last_30_days / 100).toFixed(2)}{' '}
                      {t('admin.reports.last30Days', 'last 30 days')}
                    </p>
                  </>
                ) : (
                  <>
                    <Skeleton className='mb-2 h-8 w-24' />
                    <Skeleton className='h-3 w-32' />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <Tabs defaultValue='users' className='space-y-4'>
            <TabsList>
              <TabsTrigger value='users'>
                {t('admin.reports.userGrowth', 'User Growth')}
              </TabsTrigger>
              <TabsTrigger value='revenue'>
                {t('admin.reports.revenue', 'Revenue')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value='users' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t(
                      'admin.reports.userGrowthLast30',
                      'User Growth (Last 30 Days)'
                    )}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'admin.reports.newUserRegistrations',
                      'New user registrations over time'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {usersGrowthLoading ? (
                    <div className='space-y-2'>
                      <Skeleton className='h-4 w-32' />
                      <div className='flex h-[300px] items-end gap-2'>
                        {Array.from({ length: 30 }).map((_, idx) => (
                          <Skeleton key={idx} className='h-full flex-1' />
                        ))}
                      </div>
                      <Skeleton className='mx-auto h-3 w-48' />
                    </div>
                  ) : usersGrowth && usersGrowth.data.length > 0 ? (
                    <div className='space-y-2'>
                      <p className='text-muted-foreground text-sm'>
                        {t('admin.reports.totalNewUsers', 'Total new users:')}{' '}
                        {usersGrowth.data.reduce(
                          (acc, d) => acc + (d.count || 0),
                          0
                        )}
                      </p>
                      <div className='flex h-[300px] items-end gap-2'>
                        {usersGrowth.data.map((point, idx) => (
                          <div
                            key={idx}
                            className='flex-1 rounded-t bg-primary transition-all hover:opacity-80'
                            style={{
                              height: `${(point.count || 0) * 20 + 20}px`,
                              minHeight: '20px',
                            }}
                            title={`${point.date}: ${point.count} users`}
                          />
                        ))}
                      </div>
                      <div className='text-center text-muted-foreground text-xs'>
                        {usersGrowth.data[0]?.date} -{' '}
                        {usersGrowth.data[usersGrowth.data.length - 1]?.date}
                      </div>
                    </div>
                  ) : (
                    <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
                      {t(
                        'admin.reports.noUserGrowthData',
                        'No user growth data available yet'
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='revenue' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('admin.reports.revenueLast30', 'Revenue (Last 30 Days)')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'admin.reports.paymentRevenueOverTime',
                      'Payment revenue over time'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueLoading ? (
                    <div className='space-y-2'>
                      <Skeleton className='h-4 w-32' />
                      <div className='flex h-[300px] items-end gap-2'>
                        {Array.from({ length: 30 }).map((_, idx) => (
                          <Skeleton key={idx} className='h-full flex-1' />
                        ))}
                      </div>
                      <Skeleton className='mx-auto h-3 w-48' />
                    </div>
                  ) : revenueData && revenueData.data.length > 0 ? (
                    <div className='space-y-2'>
                      <p className='text-muted-foreground text-sm'>
                        {t('admin.reports.total', 'Total:')} $
                        {revenueData.data.reduce(
                          (acc, d) => acc + (d.revenue || 0),
                          0
                        ) / 100}
                      </p>
                      <div className='flex h-[300px] items-end gap-2'>
                        {revenueData.data.map((point, idx) => (
                          <div
                            key={idx}
                            className='flex-1 rounded-t bg-green-600 transition-all hover:opacity-80'
                            style={{
                              height: `${(point.revenue || 0) / 1000 + 20}px`,
                              minHeight: '20px',
                            }}
                            title={`${point.date}: $${(point.revenue || 0) / 100}`}
                          />
                        ))}
                      </div>
                      <div className='text-center text-muted-foreground text-xs'>
                        {revenueData.data[0]?.date} -{' '}
                        {revenueData.data[revenueData.data.length - 1]?.date}
                      </div>
                    </div>
                  ) : (
                    <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
                      {t(
                        'admin.reports.noRevenueData',
                        'No revenue data available yet'
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('admin.reports.dataSources', 'Data Sources')}
              </CardTitle>
              <CardDescription>
                {t(
                  'admin.reports.dataSourcesDescription',
                  'Information about the data displayed in these reports'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-start gap-2'>
                <Users className='mt-0.5 h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='font-medium text-sm'>
                    {t('admin.reports.userData', 'User Data')}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {t(
                      'admin.reports.userDataDescription',
                      'User registrations, verifications, and activity from the users table'
                    )}
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-2'>
                <DollarSign className='mt-0.5 h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='font-medium text-sm'>
                    {t('admin.reports.revenueData', 'Revenue Data')}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {t(
                      'admin.reports.revenueDataDescription',
                      'Payment data from billing_history table (Stripe invoices are tracked in DB)'
                    )}
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-2'>
                <Activity className='mt-0.5 h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='font-medium text-sm'>
                    {t('admin.reports.activityLogs', 'Activity Logs')}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {t(
                      'admin.reports.activityLogsDescription',
                      'System events and user actions are available in the dedicated Activity Logs page'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
