import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  History, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Copy, 
  Download, 
  Trash2,
  Calendar,
  Clock,
  Database,
  Loader2,
  BarChart3,
  PieChart,
  LineChart,
  Table as TableIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
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

interface AnalyticsHistoryProps {}

export function AnalyticsHistory({}: AnalyticsHistoryProps) {
  const { t } = useTranslation()
  const [queries, setQueries] = useState<AnalyticsQuery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedQuery, setSelectedQuery] = useState<AnalyticsQuery | null>(null)

  useEffect(() => {
    fetchQueries()
  }, [])

  const fetchQueries = async () => {
    try {
      setLoading(true)
      const response = await api.get('/ai-analytics/queries')
      setQueries(response.data.items || [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch query history')
    } finally {
      setLoading(false)
    }
  }

  const deleteQuery = async (queryId: string) => {
    try {
      await api.delete(`/ai-analytics/queries/${queryId}`)
      setQueries(prev => prev.filter(query => query.id !== queryId))
      if (selectedQuery?.id === queryId) {
        setSelectedQuery(null)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete query')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy text: ', err)
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
      minute: '2-digit'
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
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const getChartIcon = (chartType: string) => {
    const icons = {
      'bar': BarChart3,
      'line': LineChart,
      'pie': PieChart,
      'table': TableIcon,
    }
    return icons[chartType as keyof typeof icons] || Database
  }

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.query.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || query.status === filterStatus
    const matchesType = filterType === 'all' || query.chart_type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const chartTypes = Array.from(new Set(queries.map(q => q.chart_type)))

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
            <p className="text-muted-foreground">
              {t('aiAnalytics.loadingHistory', 'Loading query history...')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {t('aiAnalytics.queryHistory', 'Query History')}
          </h2>
          <p className="text-muted-foreground">
            {t('aiAnalytics.historyDescription', 'View and manage your analytics query history')}
          </p>
        </div>
        <Button onClick={fetchQueries} variant="outline">
          <History className="h-4 w-4 mr-2" />
          {t('aiAnalytics.refresh', 'Refresh')}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('aiAnalytics.searchHistory', 'Search query history...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                {t('aiAnalytics.allStatus', 'All Status')}
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('completed')}
              >
                {t('aiAnalytics.completed', 'Completed')}
              </Button>
              <Button
                variant={filterStatus === 'failed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('failed')}
              >
                {t('aiAnalytics.failed', 'Failed')}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
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
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
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
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queries List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('aiAnalytics.queries', 'Queries')} ({filteredQueries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredQueries.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('aiAnalytics.noQueries', 'No queries found')}
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery 
                      ? t('aiAnalytics.noQueriesMatch', 'No queries match your search')
                      : t('aiAnalytics.runFirstQuery', 'Run your first query to see it here')
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('aiAnalytics.query', 'Query')}</TableHead>
                      <TableHead>{t('aiAnalytics.type', 'Type')}</TableHead>
                      <TableHead>{t('aiAnalytics.status', 'Status')}</TableHead>
                      <TableHead>{t('aiAnalytics.created', 'Created')}</TableHead>
                      <TableHead className="w-12"></TableHead>
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
                            <div className="flex items-center gap-3">
                              <Icon className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">{formatQueryPreview(query.query)}</div>
                                <div className="text-sm text-gray-500">
                                  {query.data_count} {t('aiAnalytics.rows', 'rows')} • {query.execution_time}ms
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{query.chart_type}</Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(query.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatDate(query.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedQuery(query)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  {t('aiAnalytics.view', 'View')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copyToClipboard(query.query)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  {t('aiAnalytics.copy', 'Copy')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => downloadQuery(query)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  {t('aiAnalytics.download', 'Download')}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => deleteQuery(query.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
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
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {t('aiAnalytics.queryDetails', 'Query Details')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedQuery ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('aiAnalytics.query', 'Query')}</span>
                      <Badge variant="outline">{selectedQuery.chart_type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{selectedQuery.query}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('aiAnalytics.status', 'Status')}</span>
                      {getStatusBadge(selectedQuery.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('aiAnalytics.rows', 'Rows')}</span>
                      <span className="text-sm">{selectedQuery.data_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('aiAnalytics.executionTime', 'Execution Time')}</span>
                      <span className="text-sm">{selectedQuery.execution_time}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('aiAnalytics.tokens', 'Tokens')}</span>
                      <span className="text-sm">{selectedQuery.tokens_used}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('aiAnalytics.cost', 'Cost')}</span>
                      <span className="text-sm">${selectedQuery.cost.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('aiAnalytics.created', 'Created')}</span>
                      <span className="text-sm">{formatDate(selectedQuery.created_at)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">{t('aiAnalytics.generatedSQL', 'Generated SQL')}</h4>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                      <pre>{selectedQuery.sql_query}</pre>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedQuery.query)}
                      className="flex-1 gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      {t('aiAnalytics.copy', 'Copy')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadQuery(selectedQuery)}
                      className="flex-1 gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {t('aiAnalytics.download', 'Download')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {t('aiAnalytics.selectQuery', 'Select a query to view details')}
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
