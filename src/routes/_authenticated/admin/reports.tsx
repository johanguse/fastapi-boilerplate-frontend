import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/stores/auth-store'
import { adminApi } from '@/lib/api'
import { Main } from '@/components/layout/main'
import {
  Shield,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Activity,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_authenticated/admin/reports')({
  component: AdminReportsPage,
})

function AdminReportsPage() {
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
      <Main>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground mt-2">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Platform insights and performance metrics
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overview ? (
                <>
                  <div className="text-2xl font-bold">{overview.users.total}</div>
                  <p className="text-xs text-muted-foreground">
                    +{overview.users.new_last_7_days} this week
                  </p>
                </>
              ) : (
                <>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overview ? (
                <>
                  <div className="text-2xl font-bold">{overview.organizations.total}</div>
                  <p className="text-xs text-muted-foreground">
                    Total organizations
                  </p>
                </>
              ) : (
                <>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {overview ? (
                <>
                  <div className="text-2xl font-bold">{overview.subscriptions.active}</div>
                  <p className="text-xs text-muted-foreground">
                    Paying customers
                  </p>
                </>
              ) : (
                <>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-28" />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {overview ? (
                <>
                  <div className="text-2xl font-bold">
                    ${(overview.revenue.total / 100).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${(overview.revenue.last_30_days / 100).toFixed(2)} last 30 days
                  </p>
                </>
              ) : (
                <>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Growth</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Growth (Last 30 Days)</CardTitle>
                <CardDescription>
                  New user registrations over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersGrowthLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <div className="h-[300px] flex items-end gap-2">
                      {Array.from({ length: 30 }).map((_, idx) => (
                        <Skeleton key={idx} className="flex-1 h-full" />
                      ))}
                    </div>
                    <Skeleton className="h-3 w-48 mx-auto" />
                  </div>
                ) : usersGrowth && usersGrowth.data.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Total new users: {usersGrowth.data.reduce((acc, d) => acc + (d.count || 0), 0)}
                    </p>
                    <div className="h-[300px] flex items-end gap-2">
                      {usersGrowth.data.map((point, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-primary rounded-t transition-all hover:opacity-80"
                          style={{
                            height: `${(point.count || 0) * 20 + 20}px`,
                            minHeight: '20px',
                          }}
                          title={`${point.date}: ${point.count} users`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      {usersGrowth.data[0]?.date} - {usersGrowth.data[usersGrowth.data.length - 1]?.date}
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No user growth data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue (Last 30 Days)</CardTitle>
                <CardDescription>
                  Payment revenue over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <div className="h-[300px] flex items-end gap-2">
                      {Array.from({ length: 30 }).map((_, idx) => (
                        <Skeleton key={idx} className="flex-1 h-full" />
                      ))}
                    </div>
                    <Skeleton className="h-3 w-48 mx-auto" />
                  </div>
                ) : revenueData && revenueData.data.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Total: ${revenueData.data.reduce((acc, d) => acc + (d.revenue || 0), 0) / 100}
                    </p>
                    <div className="h-[300px] flex items-end gap-2">
                      {revenueData.data.map((point, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-green-600 rounded-t transition-all hover:opacity-80"
                          style={{
                            height: `${((point.revenue || 0) / 1000) + 20}px`,
                            minHeight: '20px',
                          }}
                          title={`${point.date}: $${(point.revenue || 0) / 100}`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      {revenueData.data[0]?.date} - {revenueData.data[revenueData.data.length - 1]?.date}
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No revenue data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>
              Information about the data displayed in these reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">User Data</p>
                <p className="text-xs text-muted-foreground">
                  User registrations, verifications, and activity from the users table
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Revenue Data</p>
                <p className="text-xs text-muted-foreground">
                  Payment data from billing_history table (Stripe invoices are tracked in DB)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Activity Logs</p>
                <p className="text-xs text-muted-foreground">
                  System events and user actions are available in the dedicated Activity Logs page
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Main>
  )
}
