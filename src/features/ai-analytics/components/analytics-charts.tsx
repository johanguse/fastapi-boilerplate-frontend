import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  BarChart3, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Download, 
  Trash2,
  Calendar,
  Clock,
  Database,
  Loader2,
  Filter,
  RefreshCw,
  PieChart,
  LineChart,
  Table,
  TrendingUp
} from 'lucide-react'
import { api } from '@/lib/api'

interface AnalyticsChart {
  id: string
  query: string
  chart_type: string
  chart_config: any
  data: any[]
  created_at: string
  updated_at: string
  usage_count: number
}

interface AnalyticsChartsProps {}

export function AnalyticsCharts({}: AnalyticsChartsProps) {
  const { t } = useTranslation()
  const [charts, setCharts] = useState<AnalyticsChart[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedChart, setSelectedChart] = useState<AnalyticsChart | null>(null)

  useEffect(() => {
    fetchCharts()
  }, [])

  const fetchCharts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/ai-analytics/charts')
      setCharts(response.data.items || [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch charts')
    } finally {
      setLoading(false)
    }
  }

  const deleteChart = async (chartId: string) => {
    try {
      await api.delete(`/ai-analytics/charts/${chartId}`)
      setCharts(prev => prev.filter(chart => chart.id !== chartId))
      if (selectedChart?.id === chartId) {
        setSelectedChart(null)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete chart')
    }
  }

  const duplicateChart = async (chartId: string) => {
    try {
      const chart = charts.find(c => c.id === chartId)
      if (!chart) return

      const response = await api.post('/ai-analytics/charts', {
        query: chart.query,
        chart_type: chart.chart_type,
        chart_config: chart.chart_config,
      })

      setCharts(prev => [...prev, response.data])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to duplicate chart')
    }
  }

  const getChartIcon = (chartType: string) => {
    const icons = {
      'bar': BarChart3,
      'line': LineChart,
      'pie': PieChart,
      'table': Table,
    }
    return icons[chartType as keyof typeof icons] || BarChart3
  }

  const getChartColor = (chartType: string) => {
    const colors = {
      'bar': 'bg-blue-100 text-blue-800',
      'line': 'bg-green-100 text-green-800',
      'pie': 'bg-purple-100 text-purple-800',
      'table': 'bg-gray-100 text-gray-800',
    }
    return colors[chartType as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const renderChartPreview = (chart: AnalyticsChart) => {
    // This is a simplified chart preview
    // In a real app, you'd render an actual chart
    const Icon = getChartIcon(chart.chart_type)
    
    return (
      <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Icon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-xs text-gray-500">{chart.chart_type} Chart</p>
        </div>
      </div>
    )
  }

  const filteredCharts = charts.filter(chart => {
    const matchesSearch = chart.query.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || chart.chart_type === filterType
    return matchesSearch && matchesType
  })

  const chartTypes = Array.from(new Set(charts.map(c => c.chart_type)))

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
            <p className="text-muted-foreground">
              {t('aiAnalytics.loadingCharts', 'Loading charts...')}
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
            {t('aiAnalytics.savedCharts', 'Saved Charts')}
          </h2>
          <p className="text-muted-foreground">
            {t('aiAnalytics.chartsDescription', 'Manage and view your saved analytics charts')}
          </p>
        </div>
        <Button onClick={fetchCharts} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
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
                  placeholder={t('aiAnalytics.searchCharts', 'Search charts...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                {t('aiAnalytics.all', 'All')}
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
        {/* Charts Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCharts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('aiAnalytics.noCharts', 'No charts found')}
                </h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? t('aiAnalytics.noChartsMatch', 'No charts match your search')
                    : t('aiAnalytics.createFirstChart', 'Create your first chart to see it here')
                  }
                </p>
              </div>
            ) : (
              filteredCharts.map((chart) => {
                const Icon = getChartIcon(chart.chart_type)
                return (
                  <Card key={chart.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <CardTitle className="text-lg">{chart.query}</CardTitle>
                            <CardDescription className="mt-1">
                              {chart.chart_type} Chart
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {renderChartPreview(chart)}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getChartColor(chart.chart_type)}>
                              {chart.chart_type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {chart.usage_count} {t('aiAnalytics.uses', 'uses')}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(chart.created_at)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        {/* Chart Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {t('aiAnalytics.chartDetails', 'Chart Details')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedChart ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('aiAnalytics.query', 'Query')}</span>
                      <Badge variant="outline">{selectedChart.chart_type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{selectedChart.query}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('aiAnalytics.usage', 'Usage')}</span>
                      <span className="text-sm">{selectedChart.usage_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('aiAnalytics.created', 'Created')}</span>
                      <span className="text-sm">{formatDate(selectedChart.created_at)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">{t('aiAnalytics.chartPreview', 'Chart Preview')}</h4>
                    {renderChartPreview(selectedChart)}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateChart(selectedChart.id)}
                      className="flex-1 gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t('aiAnalytics.duplicate', 'Duplicate')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteChart(selectedChart.id)}
                      className="flex-1 gap-2 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('aiAnalytics.delete', 'Delete')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {t('aiAnalytics.selectChart', 'Select a chart to view details')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart Statistics */}
          {charts.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('aiAnalytics.chartStats', 'Chart Statistics')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {charts.length}
                    </div>
                    <div className="text-xs text-blue-600">
                      {t('aiAnalytics.totalCharts', 'Total Charts')}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {charts.reduce((sum, c) => sum + c.usage_count, 0)}
                    </div>
                    <div className="text-xs text-green-600">
                      {t('aiAnalytics.totalUses', 'Total Uses')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
