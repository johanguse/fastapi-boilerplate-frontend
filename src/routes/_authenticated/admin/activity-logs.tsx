import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  Activity,
  Shield,
  Filter,
  User,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
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
import { Main } from '@/components/layout/main'

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
  const { isAdmin } = useAuth()
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [actionType, setActionType] = useState<string>('')
  const [searchUserId, setSearchUserId] = useState<string>('')

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['admin', 'activity-logs', page, pageSize, actionType, searchUserId],
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

  const totalPages = Math.ceil((logsData?.total || 0) / pageSize)

  return (
    <Main>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Activity Logs
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor all system activities and user actions
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Filter activity logs by type or user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select value={actionType || undefined} onValueChange={setActionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Action Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter by User ID..."
                    value={searchUserId}
                    onChange={(e) => setSearchUserId(e.target.value)}
                    className="pl-9"
                    type="number"
                  />
                </div>
              </div>
              {(actionType || searchUserId) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setActionType('')
                    setSearchUserId('')
                    setPage(1)
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
            <CardDescription>
              {logsData?.total
                ? `Showing ${logsData.items.length} of ${logsData.total} activities`
                : 'Loading activities...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !logsData?.items?.length ? (
              <div className="text-muted-foreground py-12 text-center">
                <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No activity logs found</p>
                <p className="text-sm mt-1">
                  {actionType || searchUserId
                    ? 'Try adjusting your filters'
                    : 'Activities will appear here as users interact with the system'}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>IP Address</TableHead>
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
                          <TableCell className="font-medium">
                            {log.action}
                          </TableCell>
                          <TableCell>
                            {log.user_name ? (
                              <div>
                                <div className="font-medium">{log.user_name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {log.user_email}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                System
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate">{log.description}</div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDistanceToNow(new Date(log.created_at), {
                              addSuffix: true,
                            })}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm font-mono">
                            {log.ip_address || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ({logsData.total} total
                    activities)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Main>
  )
}
