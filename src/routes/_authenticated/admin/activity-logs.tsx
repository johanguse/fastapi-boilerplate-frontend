import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Activity, Shield, Filter, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/stores/auth-store'
import { adminApi } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export const Route = createFileRoute('/_authenticated/admin/activity-logs')({
  component: ActivityLogsPage,
})

const ACTION_TYPE_COLORS: Record<string, string> = {
  auth: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  user: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  organization:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  project:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  payment:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  system: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  security: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

function ActivityLogsPage() {
  const { t } = useTranslation()
  const { isAdmin } = useAuth()
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [actionType, setActionType] = useState<string>('')
  const [searchUserId, setSearchUserId] = useState<string>('')

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: [
      'admin',
      'activity-logs',
      page,
      pageSize,
      actionType,
      searchUserId,
    ],
    queryFn: () =>
      adminApi.getActivityLogs({
        page,
        size: pageSize,
        action_type: actionType || undefined,
        user_id: searchUserId ? parseInt(searchUserId) : undefined,
      }),
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
              <Shield className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
              <h1 className='text-2xl font-bold'>
                {t('admin.accessDeniedTitle', 'Access Denied')}
              </h1>
              <p className='text-muted-foreground mt-2'>
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

  const totalPages = Math.ceil((logsData?.total || 0) / pageSize)

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
            <h1 className='flex items-center gap-2 text-3xl font-bold'>
              <Activity className='h-8 w-8' />
              {t('admin.activityLogs.title', 'Activity Logs')}
            </h1>
            <p className='text-muted-foreground mt-2'>
              {t(
                'admin.activityLogs.subtitle',
                'Monitor all system activities and user actions'
              )}
            </p>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Filter className='h-5 w-5' />
                {t('admin.activityLogs.filters', 'Filters')}
              </CardTitle>
              <CardDescription>
                {t(
                  'admin.activityLogs.filtersDescription',
                  'Filter activity logs by type or user'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col gap-4 sm:flex-row'>
                <div className='flex-1'>
                  <Select
                    value={actionType || undefined}
                    onValueChange={setActionType}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          'admin.activityLogs.allActionTypes',
                          'All Action Types'
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='auth'>
                        {t('admin.activityLogs.authentication', 'Authentication')}
                      </SelectItem>
                      <SelectItem value='user'>
                        {t('admin.activityLogs.user', 'User')}
                      </SelectItem>
                      <SelectItem value='organization'>
                        {t('admin.activityLogs.organization', 'Organization')}
                      </SelectItem>
                      <SelectItem value='project'>
                        {t('admin.activityLogs.project', 'Project')}
                      </SelectItem>
                      <SelectItem value='payment'>
                        {t('admin.activityLogs.payment', 'Payment')}
                      </SelectItem>
                      <SelectItem value='system'>
                        {t('admin.activityLogs.system', 'System')}
                      </SelectItem>
                      <SelectItem value='security'>
                        {t('admin.activityLogs.security', 'Security')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex-1'>
                  <div className='relative'>
                    <User className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
                    <Input
                      placeholder={t(
                        'admin.activityLogs.filterByUserId',
                        'Filter by User ID...'
                      )}
                      value={searchUserId}
                      onChange={(e) => setSearchUserId(e.target.value)}
                      className='pl-9'
                      type='number'
                    />
                  </div>
                </div>
                {(actionType || searchUserId) && (
                  <Button
                    variant='outline'
                    onClick={() => {
                      setActionType('')
                      setSearchUserId('')
                      setPage(1)
                    }}
                  >
                    {t('admin.activityLogs.clearFilters', 'Clear Filters')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('admin.activityLogs.activityHistory', 'Activity History')}
              </CardTitle>
              <CardDescription>
                {logsData?.total
                  ? t(
                      'admin.activityLogs.showingActivities',
                      'Showing {{count}} of {{total}} activities',
                      {
                        count: logsData.items.length,
                        total: logsData.total,
                      }
                    )
                  : t(
                      'admin.activityLogs.loadingActivities',
                      'Loading activities...'
                    )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className='space-y-4'>
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <div key={idx} className='flex items-start gap-4'>
                      <Skeleton className='h-12 w-12 rounded-full' />
                      <div className='flex-1 space-y-2'>
                        <Skeleton className='h-4 w-1/3' />
                        <Skeleton className='h-3 w-2/3' />
                        <Skeleton className='h-3 w-1/4' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !logsData?.items?.length ? (
                <div className='text-muted-foreground py-12 text-center'>
                  <Activity className='mx-auto mb-4 h-12 w-12 opacity-50' />
                  <p className='text-lg font-medium'>
                    {t('admin.activityLogs.noActivityLogs', 'No activity logs found')}
                  </p>
                  <p className='mt-1 text-sm'>
                    {actionType || searchUserId
                      ? t(
                          'admin.activityLogs.tryAdjustingFilters',
                          'Try adjusting your filters'
                        )
                      : t(
                          'admin.activityLogs.activitiesWillAppear',
                          'Activities will appear here as users interact with the system'
                        )}
                  </p>
                </div>
              ) : (
                <>
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {t('admin.activityLogs.type', 'Type')}
                          </TableHead>
                          <TableHead>
                            {t('admin.activityLogs.action', 'Action')}
                          </TableHead>
                          <TableHead>
                            {t('admin.activityLogs.user', 'User')}
                          </TableHead>
                          <TableHead>
                            {t('admin.activityLogs.description', 'Description')}
                          </TableHead>
                          <TableHead>
                            {t('admin.activityLogs.time', 'Time')}
                          </TableHead>
                          <TableHead>
                            {t('admin.activityLogs.ipAddress', 'IP Address')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logsData.items.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Badge
                                className={
                                  ACTION_TYPE_COLORS[log.action_type] ||
                                  ACTION_TYPE_COLORS.system
                                }
                              >
                                {log.action_type}
                              </Badge>
                            </TableCell>
                            <TableCell className='font-medium'>
                              {log.action}
                            </TableCell>
                            <TableCell>
                              {log.user_name ? (
                                <div>
                                  <div className='font-medium'>
                                    {log.user_name}
                                  </div>
                                  <div className='text-muted-foreground text-xs'>
                                    {log.user_email}
                                  </div>
                                </div>
                              ) : (
                                <span className='text-muted-foreground'>
                                  {t('admin.activityLogs.systemUser', 'System')}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className='max-w-md'>
                              <div className='truncate'>{log.description}</div>
                            </TableCell>
                            <TableCell className='text-muted-foreground text-sm'>
                              {formatDistanceToNow(new Date(log.created_at), {
                                addSuffix: true,
                              })}
                            </TableCell>
                            <TableCell className='text-muted-foreground font-mono text-sm'>
                              {log.ip_address ||
                                t('admin.activityLogs.notAvailable', 'N/A')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className='mt-4 flex items-center justify-between'>
                    <p className='text-muted-foreground text-sm'>
                      {t(
                        'admin.activityLogs.pageOf',
                        'Page {{page}} of {{total}} ({{count}} total activities)',
                        {
                          page,
                          total: totalPages,
                          count: logsData.total,
                        }
                      )}
                    </p>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        {t('admin.activityLogs.previous', 'Previous')}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                      >
                        {t('admin.activityLogs.next', 'Next')}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
