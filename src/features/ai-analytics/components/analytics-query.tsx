import { useMutation } from '@tanstack/react-query'
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Copy,
  Database,
  Download,
  Lightbulb,
  LineChart,
  Loader2,
  PieChart,
  Send,
  Table,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'

interface AnalyticsResult {
  id: string
  query: string
  sql_query: string
  data: Record<string, unknown>[]
  chart_type: string
  insights: string[]
  created_at: string
  tokens_used: number
  cost: number
  execution_time: number
}

export function AnalyticsQuery() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [chartType, setChartType] = useState('auto')
  const [result, setResult] = useState<AnalyticsResult | null>(null)
  const [copiedResultId, setCopiedResultId] = useState<string | null>(null)

  const queryMutation = useMutation({
    mutationFn: async ({
      query: queryText,
      chart_type,
    }: {
      query: string
      chart_type: string
    }) => {
      const response = await api.post('/ai-analytics/query', {
        query: queryText,
        chart_type,
      })
      return response.data as AnalyticsResult
    },
    onSuccess: (data) => {
      setResult(data)
    },
  })

  const chartTypes = [
    { value: 'auto', label: 'Auto-detect', icon: Lightbulb },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'table', label: 'Table', icon: Table },
  ]

  const exampleQueries = [
    'Show me the total sales by month for the last year',
    'What are the top 10 products by revenue?',
    'How many users registered each day this month?',
    'What is the average order value by customer segment?',
    'Show me the conversion rate by traffic source',
    'Which categories have the highest profit margins?',
  ]

  const handleSubmit = () => {
    if (!query.trim() || queryMutation.isPending) return
    queryMutation.mutate({ query: query.trim(), chart_type: chartType })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const copyToClipboard = async (text: string, resultId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedResultId(resultId)
      setTimeout(() => setCopiedResultId(null), 2000)
    } catch {
      // Clipboard error - ignore silently
    }
  }

  const downloadData = () => {
    if (!result || !result.data) return

    const csvContent = convertToCSV(result.data)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${result.id}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const convertToCSV = (data: Record<string, unknown>[]) => {
    if (!data.length) return ''

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => JSON.stringify(row[header] ?? '')).join(',')
      ),
    ]
    return csvRows.join('\n')
  }

  const renderChart = () => {
    if (!result || !result.data) return null

    // This is a simplified chart rendering
    // In a real app, you'd use a proper charting library like Chart.js or D3
    return (
      <div className='rounded-lg bg-gray-50 p-4'>
        <div className='text-center text-gray-500'>
          <BarChart3 className='mx-auto mb-2 h-12 w-12' />
          <p>Chart visualization would be rendered here</p>
          <p className='text-sm'>Chart Type: {result.chart_type}</p>
        </div>
      </div>
    )
  }

  const renderDataTable = () => {
    if (!result || !result.data) return null

    const headers = Object.keys(result.data[0] || {})

    return (
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className='px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider'
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {result.data.slice(0, 10).map((row, index) => (
              <tr key={index}>
                {headers.map((header) => (
                  <td
                    key={header}
                    className='whitespace-nowrap px-6 py-4 text-gray-900 text-sm'
                  >
                    {String(row[header] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {result.data.length > 10 && (
          <div className='px-6 py-3 text-gray-500 text-sm'>
            Showing 10 of {result.data.length} rows
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Database className='h-5 w-5' />
            {t('aiAnalytics.naturalLanguageQuery', 'Natural Language Query')}
          </CardTitle>
          <CardDescription>
            {t(
              'aiAnalytics.queryDescription',
              'Ask questions about your data in plain English'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='query'>
              {t('aiAnalytics.yourQuestion', 'Your Question')}
            </Label>
            <Textarea
              id='query'
              placeholder={t(
                'aiAnalytics.queryPlaceholder',
                'e.g., "Show me the total sales by month for the last year"'
              )}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={3}
              className='resize-none'
            />
            <p className='text-muted-foreground text-xs'>
              {t(
                'aiAnalytics.queryHint',
                'Press Ctrl+Enter to execute the query'
              )}
            </p>
          </div>

          <div className='flex gap-4'>
            <div className='flex-1'>
              <Label htmlFor='chart-type'>
                {t('aiAnalytics.chartType', 'Chart Type')}
              </Label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chartTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className='flex items-center gap-2'>
                          <Icon className='h-4 w-4' />
                          {type.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-end'>
              <Button
                onClick={handleSubmit}
                disabled={!query.trim() || queryMutation.isPending}
                className='gap-2'
              >
                {queryMutation.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Send className='h-4 w-4' />
                )}
                {queryMutation.isPending
                  ? t('aiAnalytics.executing', 'Executing...')
                  : t('aiAnalytics.execute', 'Execute Query')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Queries */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Lightbulb className='h-5 w-5' />
            {t('aiAnalytics.exampleQueries', 'Example Queries')}
          </CardTitle>
          <CardDescription>
            {t(
              'aiAnalytics.exampleDescription',
              'Try these example queries to get started'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
            {exampleQueries.map((example, index) => (
              <Button
                key={index}
                variant='outline'
                size='sm'
                className='h-auto justify-start p-3 text-left'
                onClick={() => setQuery(example)}
              >
                <span className='text-sm'>{example}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {queryMutation.isError && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {t('aiAnalytics.queryError', 'Failed to execute query')}
          </AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {result && (
        <div className='space-y-6'>
          {/* Query Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CheckCircle className='h-5 w-5 text-green-600' />
                {t('aiAnalytics.queryResults', 'Query Results')}
              </CardTitle>
              <CardDescription>
                {t(
                  'aiAnalytics.resultsDescription',
                  'Results for your natural language query'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div className='rounded-lg bg-blue-50 p-3 text-center'>
                    <div className='font-bold text-blue-600 text-lg'>
                      {result.data?.length || 0}
                    </div>
                    <div className='text-blue-600 text-sm'>
                      {t('aiAnalytics.rowsReturned', 'Rows Returned')}
                    </div>
                  </div>
                  <div className='rounded-lg bg-green-50 p-3 text-center'>
                    <div className='font-bold text-green-600 text-lg'>
                      {result.execution_time}ms
                    </div>
                    <div className='text-green-600 text-sm'>
                      {t('aiAnalytics.executionTime', 'Execution Time')}
                    </div>
                  </div>
                  <div className='rounded-lg bg-purple-50 p-3 text-center'>
                    <div className='font-bold text-lg text-purple-600'>
                      {result.tokens_used}
                    </div>
                    <div className='text-purple-600 text-sm'>
                      {t('aiAnalytics.tokensUsed', 'Tokens Used')}
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-between text-muted-foreground text-sm'>
                  <span>
                    {t('aiAnalytics.cost', 'Cost')}: ${result.cost.toFixed(4)}
                  </span>
                  <span>
                    {t('aiAnalytics.generatedAt', 'Generated')}:{' '}
                    {new Date(result.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SQL Query */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Database className='h-5 w-5' />
                {t('aiAnalytics.generatedSQL', 'Generated SQL')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-gray-100 text-sm'>
                <pre>{result.sql_query}</pre>
              </div>
              <div className='mt-2 flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => copyToClipboard(result.sql_query, result.id)}
                  className='gap-2'
                >
                  {copiedResultId === result.id ? (
                    <CheckCircle className='h-4 w-4 text-green-600' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                  {t('aiAnalytics.copy', 'Copy')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chart Visualization */}
          {result.chart_type !== 'table' && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5' />
                  {t('aiAnalytics.chartVisualization', 'Chart Visualization')}
                </CardTitle>
              </CardHeader>
              <CardContent>{renderChart()}</CardContent>
            </Card>
          )}

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Table className='h-5 w-5' />
                {t('aiAnalytics.dataTable', 'Data Table')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderDataTable()}
              <div className='mt-4 flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={downloadData}
                  className='gap-2'
                >
                  <Download className='h-4 w-4' />
                  {t('aiAnalytics.downloadCSV', 'Download CSV')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          {result.insights && result.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Lightbulb className='h-5 w-5' />
                  {t('aiAnalytics.aiInsights', 'AI Insights')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {result.insights.map((insight, index) => (
                    <div
                      key={index}
                      className='flex items-start gap-3 rounded-lg bg-yellow-50 p-3'
                    >
                      <Lightbulb className='mt-0.5 h-5 w-5 text-yellow-600' />
                      <p className='text-sm text-yellow-800'>{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
