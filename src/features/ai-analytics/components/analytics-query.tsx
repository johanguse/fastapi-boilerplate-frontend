import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Database, 
  Send, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Lightbulb,
  Copy,
  Download,
  RefreshCw
} from 'lucide-react'
import { api } from '@/lib/api'

interface AnalyticsResult {
  id: string
  query: string
  sql_query: string
  data: any[]
  chart_type: string
  insights: string[]
  created_at: string
  tokens_used: number
  cost: number
  execution_time: number
}

interface AnalyticsQueryProps {}

export function AnalyticsQuery({}: AnalyticsQueryProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [chartType, setChartType] = useState('auto')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyticsResult | null>(null)
  const [copiedResultId, setCopiedResultId] = useState<string | null>(null)

  const chartTypes = [
    { value: 'auto', label: 'Auto-detect', icon: Lightbulb },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'table', label: 'Table', icon: Table },
  ]

  const exampleQueries = [
    "Show me the total sales by month for the last year",
    "What are the top 10 products by revenue?",
    "How many users registered each day this month?",
    "What is the average order value by customer segment?",
    "Show me the conversion rate by traffic source",
    "Which categories have the highest profit margins?",
  ]

  const handleSubmit = async () => {
    if (!query.trim() || isGenerating) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await api.post('/ai-analytics/query', {
        query: query.trim(),
        chart_type: chartType,
      })

      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to execute query')
    } finally {
      setIsGenerating(false)
    }
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
    } catch (err) {
      console.error('Failed to copy text: ', err)
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

  const convertToCSV = (data: any[]) => {
    if (!data.length) return ''
    
    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ]
    return csvRows.join('\n')
  }

  const renderChart = () => {
    if (!result || !result.data) return null

    // This is a simplified chart rendering
    // In a real app, you'd use a proper charting library like Chart.js or D3
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-center text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-2" />
          <p>Chart visualization would be rendered here</p>
          <p className="text-sm">Chart Type: {result.chart_type}</p>
        </div>
      </div>
    )
  }

  const renderDataTable = () => {
    if (!result || !result.data) return null

    const headers = Object.keys(result.data[0] || {})
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {result.data.slice(0, 10).map((row, index) => (
              <tr key={index}>
                {headers.map((header) => (
                  <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {result.data.length > 10 && (
          <div className="px-6 py-3 text-sm text-gray-500">
            Showing 10 of {result.data.length} rows
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t('aiAnalytics.naturalLanguageQuery', 'Natural Language Query')}
          </CardTitle>
          <CardDescription>
            {t('aiAnalytics.queryDescription', 'Ask questions about your data in plain English')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">
              {t('aiAnalytics.yourQuestion', 'Your Question')}
            </Label>
            <Textarea
              id="query"
              placeholder={t('aiAnalytics.queryPlaceholder', 'e.g., "Show me the total sales by month for the last year"')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {t('aiAnalytics.queryHint', 'Press Ctrl+Enter to execute the query')}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="chart-type">
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
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSubmit} 
                disabled={!query.trim() || isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isGenerating 
                  ? t('aiAnalytics.executing', 'Executing...') 
                  : t('aiAnalytics.execute', 'Execute Query')
                }
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {t('aiAnalytics.exampleQueries', 'Example Queries')}
          </CardTitle>
          <CardDescription>
            {t('aiAnalytics.exampleDescription', 'Try these example queries to get started')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleQueries.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start text-left h-auto p-3"
                onClick={() => setQuery(example)}
              >
                <span className="text-sm">{example}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Query Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {t('aiAnalytics.queryResults', 'Query Results')}
              </CardTitle>
              <CardDescription>
                {t('aiAnalytics.resultsDescription', 'Results for your natural language query')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {result.data?.length || 0}
                    </div>
                    <div className="text-sm text-blue-600">
                      {t('aiAnalytics.rowsReturned', 'Rows Returned')}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {result.execution_time}ms
                    </div>
                    <div className="text-sm text-green-600">
                      {t('aiAnalytics.executionTime', 'Execution Time')}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {result.tokens_used}
                    </div>
                    <div className="text-sm text-purple-600">
                      {t('aiAnalytics.tokensUsed', 'Tokens Used')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {t('aiAnalytics.cost', 'Cost')}: ${result.cost.toFixed(4)}
                  </span>
                  <span>
                    {t('aiAnalytics.generatedAt', 'Generated')}: {new Date(result.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SQL Query */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {t('aiAnalytics.generatedSQL', 'Generated SQL')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{result.sql_query}</pre>
              </div>
              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(result.sql_query, result.id)}
                  className="gap-2"
                >
                  {copiedResultId === result.id ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
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
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('aiAnalytics.chartVisualization', 'Chart Visualization')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart()}
              </CardContent>
            </Card>
          )}

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                {t('aiAnalytics.dataTable', 'Data Table')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderDataTable()}
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadData}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('aiAnalytics.downloadCSV', 'Download CSV')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          {result.insights && result.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  {t('aiAnalytics.aiInsights', 'AI Insights')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800">{insight}</p>
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
