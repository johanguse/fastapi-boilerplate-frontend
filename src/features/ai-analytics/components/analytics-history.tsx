import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Copy,
  Database,
  Download,
  Eye,
  History,
  LineChart,
  Loader2,
  MoreHorizontal,
  PieChart,
  Search,
  Table as TableIcon,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { api } from '@/lib/api'

interface AnalyticsQuery {
  id: string
  query: string
  sql_query: string
  chart_type: string
  status: 'completed' | 'failed' | 'processing'
  created_at: string
  tokens_used: number
  cost: number
  execution_time: number
  data_count: number
}

export function AnalyticsHistory() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedQuery, setSelectedQuery] = useState<AnalyticsQuery | null>(
    null
  )

  const {
    data: queries = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ai-analytics', 'queries'],
    queryFn: async () => {
      const response = await api.get('/ai-analytics/queries')
      return (response.data.items || []) as AnalyticsQuery[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (queryId: string) => {
      await api.delete(`/ai-analytics/queries/${queryId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-analytics', 'queries'] })
      if (selectedQuery) {
        setSelectedQuery(null)
      }
    },
  })

  const deleteQuery = async (queryId: string) => {
    await deleteMutation.mutateAsync(queryId)
    if (selectedQuery?.id === queryId) {
      setSelectedQuery(null)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (_err) {
      // Silently handle clipboard errors (e.g., insufficient permissions)
    }
  }

  const downloadQuery = (query: AnalyticsQuery) => {
    const content = `Query: ${query.query}\n\nSQL: ${query.sql_query}\n\nStatus: ${query.status}\nCreated: ${query.created_at}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-query-${query.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatQueryPreview = (query: string) => {
    return query.length > 100 ? query.substring(0, 100) + '...' : query
  }

  const getStatusBadge = (status: AnalyticsQuery['status']) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      processing: { color: 'bg-yellow-100 text-yellow-800', icon: Loader2 },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className='mr-1 h-3 w-3' />
        {status}
      </Badge>
    )
  }

  const getChartIcon = (chartType: string) => {
    const icons = {
      bar: BarChart3,
      line: LineChart,
      pie: PieChart,
      table: TableIcon,
    }
    return icons[chartType as keyof typeof icons] || Database
  }

  const filteredQueries = queries.filter((query) => {
    const matchesSearch = query.query
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStatus =
      filterStatus === 'all' || query.status === filterStatus
    const matchesType = filterType === 'all' || query.chart_type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const chartTypes = Array.from(new Set(queries.map((q) => q.chart_type)))

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Failed to fetch query history'

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex h-64 items-center justify-center'>
          <div className='space-y-2 text-center'>
            <Loader2 className='mx-auto h-8 w-8 animate-spin text-gray-400' />
            <p className='text-muted-foreground'>
              {t('aiAnalytics.loadingHistory', 'Loading query history...')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='font-bold text-2xl'>
            {t('aiAnalytics.queryHistory', 'Query History')}
          </h2>
          <p className='text-muted-foreground'>
            {t(
              'aiAnalytics.historyDescription',
              'View and manage your analytics query history'
            )}
          </p>
        </div>
        <Button onClick={() => refetch()} variant='outline'>
          <History className='mr-2 h-4 w-4' />
          {t('aiAnalytics.refresh', 'Refresh')}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  placeholder={t(
                    'aiAnalytics.searchHistory',
                    'Search query history...'
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilterStatus('all')}
              >
                {t('aiAnalytics.allStatus', 'All Status')}
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilterStatus('completed')}
              >
                {t('aiAnalytics.completed', 'Completed')}
              </Button>
              <Button
                variant={filterStatus === 'failed' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilterStatus('failed')}
              >
                {t('aiAnalytics.failed', 'Failed')}
              </Button>
            </div>
            <div className='flex gap-2'>
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilterType('all')}
              >
                {t('aiAnalytics.allTypes', 'All Types')}
              </Button>
              {chartTypes.map((type) => {
                const Icon = getChartIcon(type)
                return (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setFilterType(type)}
                    className='gap-2'
                  >
                    <Icon className='h-4 w-4' />
                    {type}
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Queries List */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>
                {t('aiAnalytics.queries', 'Queries')} ({filteredQueries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredQueries.length === 0 ? (
                <div className='py-12 text-center'>
                  <History className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                  <h3 className='mb-2 font-medium text-gray-900 text-lg'>
                    {t('aiAnalytics.noQueries', 'No queries found')}
                  </h3>
                  <p className='text-gray-500'>
                    {searchQuery
                      ? t(
                          'aiAnalytics.noQueriesMatch',
                          'No queries match your search'
                        )
                      : t(
                          'aiAnalytics.runFirstQuery',
                          'Run your first query to see it here'
                        )}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('aiAnalytics.query', 'Query')}</TableHead>
                      <TableHead>{t('aiAnalytics.type', 'Type')}</TableHead>
                      <TableHead>{t('aiAnalytics.status', 'Status')}</TableHead>
                      <TableHead>
                        {t('aiAnalytics.created', 'Created')}
                      </TableHead>
                      <TableHead className='w-12'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQueries.map((query) => {
                      const Icon = getChartIcon(query.chart_type)
                      return (
                        <TableRow
                          key={query.id}
                          className={`cursor-pointer hover:bg-gray-50 ${
                            selectedQuery?.id === query.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedQuery(query)}
                        >
                          <TableCell>
                            <div className='flex items-center gap-3'>
                              <Icon className='h-4 w-4 text-gray-400' />
                              <div>
                                <div className='font-medium'>
                                  {formatQueryPreview(query.query)}
                                </div>
                                <div className='text-gray-500 text-sm'>
                                  {query.data_count}{' '}
                                  {t('aiAnalytics.rows', 'rows')} •{' '}
                                  {query.execution_time}ms
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline'>{query.chart_type}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(query.status)}</TableCell>
                          <TableCell>
                            <div className='flex items-center gap-1 text-gray-500 text-sm'>
                              <Calendar className='h-3 w-3' />
                              {formatDate(query.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='sm'>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                  onClick={() => setSelectedQuery(query)}
                                >
                                  <Eye className='mr-2 h-4 w-4' />
                                  {t('aiAnalytics.view', 'View')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => copyToClipboard(query.query)}
                                >
                                  <Copy className='mr-2 h-4 w-4' />
                                  {t('aiAnalytics.copy', 'Copy')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => downloadQuery(query)}
                                >
                                  <Download className='mr-2 h-4 w-4' />
                                  {t('aiAnalytics.download', 'Download')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteQuery(query.id)}
                                  className='text-red-600'
                                >
                                  <Trash2 className='mr-2 h-4 w-4' />
                                  {t('aiAnalytics.delete', 'Delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Query Details */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Eye className='h-5 w-5' />
                {t('aiAnalytics.queryDetails', 'Query Details')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedQuery ? (
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>
                        {t('aiAnalytics.query', 'Query')}
                      </span>
                      <Badge variant='outline'>
                        {selectedQuery.chart_type}
                      </Badge>
                    </div>
                    <p className='text-gray-600 text-sm'>
                      {selectedQuery.query}
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>
                        {t('aiAnalytics.status', 'Status')}
                      </span>
                      {getStatusBadge(selectedQuery.status)}
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>
                        {t('aiAnalytics.rows', 'Rows')}
                      </span>
                      <span className='text-sm'>
                        {selectedQuery.data_count}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>
                        {t('aiAnalytics.executionTime', 'Execution Time')}
                      </span>
                      <span className='text-sm'>
                        {selectedQuery.execution_time}ms
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>
                        {t('aiAnalytics.tokens', 'Tokens')}
                      </span>
                      <span className='text-sm'>
                        {selectedQuery.tokens_used}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>
                        {t('aiAnalytics.cost', 'Cost')}
                      </span>
                      <span className='text-sm'>
                        ${selectedQuery.cost.toFixed(4)}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>
                        {t('aiAnalytics.created', 'Created')}
                      </span>
                      <span className='text-sm'>
                        {formatDate(selectedQuery.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className='border-t pt-4'>
                    <h4 className='mb-2 font-medium text-sm'>
                      {t('aiAnalytics.generatedSQL', 'Generated SQL')}
                    </h4>
                    <div className='overflow-x-auto rounded-lg bg-gray-900 p-3 font-mono text-gray-100 text-xs'>
                      <pre>{selectedQuery.sql_query}</pre>
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => copyToClipboard(selectedQuery.query)}
                      className='flex-1 gap-2'
                    >
                      <Copy className='h-4 w-4' />
                      {t('aiAnalytics.copy', 'Copy')}
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => downloadQuery(selectedQuery)}
                      className='flex-1 gap-2'
                    >
                      <Download className='h-4 w-4' />
                      {t('aiAnalytics.download', 'Download')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='py-8 text-center'>
                  <Eye className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                  <p className='text-gray-500 text-sm'>
                    {t(
                      'aiAnalytics.selectQuery',
                      'Select a query to view details'
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
