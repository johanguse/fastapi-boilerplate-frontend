import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BarChart3,
  Eye,
  LineChart,
  Loader2,
  MoreHorizontal,
  PieChart,
  RefreshCw,
  Search,
  Table,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'

interface AnalyticsChart {
  id: string
  query: string
  chart_type: string
  chart_config: Record<string, unknown>
  data: Record<string, unknown>[]
  created_at: string
  updated_at: string
  usage_count: number
}

export function AnalyticsCharts() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedChart, setSelectedChart] = useState<AnalyticsChart | null>(
    null
  )

  const {
    data: charts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ai-analytics', 'charts'],
    queryFn: async () => {
      const response = await api.get('/ai-analytics/charts')
      return (response.data.items || []) as AnalyticsChart[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (chartId: string) => {
      await api.delete(`/ai-analytics/charts/${chartId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-analytics', 'charts'] })
      if (selectedChart) {
        setSelectedChart(null)
      }
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: async (chart: AnalyticsChart) => {
      const response = await api.post('/ai-analytics/charts', {
        query: chart.query,
        chart_type: chart.chart_type,
        chart_config: chart.chart_config,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-analytics', 'charts'] })
    },
  })

  const deleteChart = async (chartId: string) => {
    await deleteMutation.mutateAsync(chartId)
    if (selectedChart?.id === chartId) {
      setSelectedChart(null)
    }
  }

  const duplicateChart = async (chartId: string) => {
    const chart = charts.find((c) => c.id === chartId)
    if (!chart) return
    await duplicateMutation.mutateAsync(chart)
  }

  const getChartIcon = (chartType: string) => {
    const icons = {
      bar: BarChart3,
      line: LineChart,
      pie: PieChart,
      table: Table,
    }
    return icons[chartType as keyof typeof icons] || BarChart3
  }

  const getChartColor = (chartType: string) => {
    const colors = {
      bar: 'bg-blue-100 text-blue-800',
      line: 'bg-green-100 text-green-800',
      pie: 'bg-purple-100 text-purple-800',
      table: 'bg-gray-100 text-gray-800',
    }
    return (
      colors[chartType as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    )
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
      <div className='flex h-32 items-center justify-center rounded-lg bg-gray-50'>
        <div className='text-center'>
          <Icon className='mx-auto mb-2 h-8 w-8 text-gray-400' />
          <p className='text-gray-500 text-xs'>{chart.chart_type} Chart</p>
        </div>
      </div>
    )
  }

  const filteredCharts = charts.filter((chart) => {
    const matchesSearch = chart.query
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || chart.chart_type === filterType
    return matchesSearch && matchesType
  })

  const chartTypes = Array.from(new Set(charts.map((c) => c.chart_type)))

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Failed to fetch charts'

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex h-64 items-center justify-center'>
          <div className='space-y-2 text-center'>
            <Loader2 className='mx-auto h-8 w-8 animate-spin text-gray-400' />
            <p className='text-muted-foreground'>
              {t('aiAnalytics.loadingCharts', 'Loading charts...')}
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
            {t('aiAnalytics.savedCharts', 'Saved Charts')}
          </h2>
          <p className='text-muted-foreground'>
            {t(
              'aiAnalytics.chartsDescription',
              'Manage and view your saved analytics charts'
            )}
          </p>
        </div>
        <Button onClick={() => refetch()} variant='outline'>
          <RefreshCw className='mr-2 h-4 w-4' />
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
                    'aiAnalytics.searchCharts',
                    'Search charts...'
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size='sm'
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
        {/* Charts Grid */}
        <div className='lg:col-span-2'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {filteredCharts.length === 0 ? (
              <div className='col-span-full py-12 text-center'>
                <BarChart3 className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                <h3 className='mb-2 font-medium text-gray-900 text-lg'>
                  {t('aiAnalytics.noCharts', 'No charts found')}
                </h3>
                <p className='text-gray-500'>
                  {searchQuery
                    ? t(
                        'aiAnalytics.noChartsMatch',
                        'No charts match your search'
                      )
                    : t(
                        'aiAnalytics.createFirstChart',
                        'Create your first chart to see it here'
                      )}
                </p>
              </div>
            ) : (
              filteredCharts.map((chart) => {
                const Icon = getChartIcon(chart.chart_type)
                return (
                  <Card
                    key={chart.id}
                    className='transition-shadow hover:shadow-md'
                  >
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-start gap-3'>
                          <Icon className='mt-1 h-5 w-5 text-blue-600' />
                          <div className='flex-1'>
                            <CardTitle className='text-lg'>
                              {chart.query}
                            </CardTitle>
                            <CardDescription className='mt-1'>
                              {chart.chart_type} Chart
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant='ghost' size='sm'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        {renderChartPreview(chart)}

                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <Badge className={getChartColor(chart.chart_type)}>
                              {chart.chart_type}
                            </Badge>
                            <span className='text-muted-foreground text-sm'>
                              {chart.usage_count}{' '}
                              {t('aiAnalytics.uses', 'uses')}
                            </span>
                          </div>
                          <div className='text-muted-foreground text-xs'>
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
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Eye className='h-5 w-5' />
                {t('aiAnalytics.chartDetails', 'Chart Details')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedChart ? (
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>
                        {t('aiAnalytics.query', 'Query')}
                      </span>
                      <Badge variant='outline'>
                        {selectedChart.chart_type}
                      </Badge>
                    </div>
                    <p className='text-gray-600 text-sm'>
                      {selectedChart.query}
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>
                        {t('aiAnalytics.usage', 'Usage')}
                      </span>
                      <span className='text-sm'>
                        {selectedChart.usage_count}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>
                        {t('aiAnalytics.created', 'Created')}
                      </span>
                      <span className='text-sm'>
                        {formatDate(selectedChart.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className='border-t pt-4'>
                    <h4 className='mb-2 font-medium text-sm'>
                      {t('aiAnalytics.chartPreview', 'Chart Preview')}
                    </h4>
                    {renderChartPreview(selectedChart)}
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => duplicateChart(selectedChart.id)}
                      className='flex-1 gap-2'
                    >
                      <RefreshCw className='h-4 w-4' />
                      {t('aiAnalytics.duplicate', 'Duplicate')}
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => deleteChart(selectedChart.id)}
                      className='flex-1 gap-2 text-red-600'
                    >
                      <Trash2 className='h-4 w-4' />
                      {t('aiAnalytics.delete', 'Delete')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='py-8 text-center'>
                  <Eye className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                  <p className='text-gray-500 text-sm'>
                    {t(
                      'aiAnalytics.selectChart',
                      'Select a chart to view details'
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart Statistics */}
          {charts.length > 0 && (
            <Card className='mt-6'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  {t('aiAnalytics.chartStats', 'Chart Statistics')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='rounded-lg bg-blue-50 p-3 text-center'>
                    <div className='font-bold text-2xl text-blue-600'>
                      {charts.length}
                    </div>
                    <div className='text-blue-600 text-xs'>
                      {t('aiAnalytics.totalCharts', 'Total Charts')}
                    </div>
                  </div>
                  <div className='rounded-lg bg-green-50 p-3 text-center'>
                    <div className='font-bold text-2xl text-green-600'>
                      {charts.reduce((sum, c) => sum + c.usage_count, 0)}
                    </div>
                    <div className='text-green-600 text-xs'>
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
