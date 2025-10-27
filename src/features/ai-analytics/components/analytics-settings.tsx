import { useMutation, useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Database,
  RefreshCw,
  Save,
  TrendingUp,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { api } from '@/lib/api'

interface AnalyticsSettings {
  default_chart_type: string
  auto_execute_queries: boolean
  enable_query_validation: boolean
  enable_sql_explanation: boolean
  max_query_complexity: number
  query_timeout: number
  enable_caching: boolean
  cache_duration: number
  enable_data_privacy: boolean
  max_rows_per_query: number
}

interface UsageStats {
  total_queries: number
  total_tokens: number
  total_cost: number
  charts_generated: number
  daily_queries: number
  monthly_queries: number
  avg_execution_time: number
}

export function AnalyticsSettings() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<AnalyticsSettings>({
    default_chart_type: 'auto',
    auto_execute_queries: false,
    enable_query_validation: true,
    enable_sql_explanation: true,
    max_query_complexity: 5,
    query_timeout: 30,
    enable_caching: true,
    cache_duration: 3600,
    enable_data_privacy: true,
    max_rows_per_query: 1000,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { data: usageStats, refetch: refetchUsageStats } = useQuery({
    queryKey: ['ai-usage', 'dashboard'],
    queryFn: async () => {
      const response = await api.get('/ai-usage/dashboard')
      const data = response.data.usage_summary

      return {
        total_queries: data.features?.analytics?.count || 0,
        total_tokens: data.credits_used * 1000, // Convert credits to tokens
        total_cost: data.total_cost || 0,
        charts_generated: 0, // This would come from a specific endpoint
        daily_queries: 0, // This would be calculated
        monthly_queries: 0, // This would be calculated
        avg_execution_time: 0, // This would be calculated
      } as UsageStats
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      // In a real app, you'd save settings to the API
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    },
    onSuccess: () => {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { detail?: string } } }
      setError(error.response?.data?.detail || 'Failed to save settings')
    },
  })

  const saveSettings = async () => {
    setSaving(true)
    setError(null)
    await saveMutation.mutateAsync()
    setSaving(false)
  }

  const handleSettingChange = (
    key: keyof AnalyticsSettings,
    value: unknown
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const chartTypes = [
    { value: 'auto', label: 'Auto-detect' },
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'table', label: 'Table' },
  ]

  const complexityLevels = [
    { value: 1, label: 'Simple (1)' },
    { value: 2, label: 'Basic (2)' },
    { value: 3, label: 'Intermediate (3)' },
    { value: 4, label: 'Advanced (4)' },
    { value: 5, label: 'Expert (5)' },
  ]

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='font-bold text-2xl'>
            {t('aiAnalytics.analyticsSettings', 'Analytics Settings')}
          </h2>
          <p className='text-muted-foreground'>
            {t(
              'aiAnalytics.settingsDescription',
              'Configure AI analytics preferences and limits'
            )}
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className='gap-2'>
          {saving ? (
            <RefreshCw className='h-4 w-4 animate-spin' />
          ) : (
            <Save className='h-4 w-4' />
          )}
          {t('aiAnalytics.saveSettings', 'Save Settings')}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert>
          <CheckCircle className='h-4 w-4' />
          <AlertDescription>
            {t('aiAnalytics.settingsSaved', 'Settings saved successfully')}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Query Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Database className='h-5 w-5' />
              {t('aiAnalytics.querySettings', 'Query Settings')}
            </CardTitle>
            <CardDescription>
              {t(
                'aiAnalytics.queryDescription',
                'Configure query execution and validation'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='default-chart-type'>
                {t('aiAnalytics.defaultChartType', 'Default Chart Type')}
              </Label>
              <Select
                value={settings.default_chart_type}
                onValueChange={(value) =>
                  handleSettingChange('default_chart_type', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chartTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='max-complexity'>
                {t('aiAnalytics.maxQueryComplexity', 'Max Query Complexity')}
              </Label>
              <Select
                value={settings.max_query_complexity.toString()}
                onValueChange={(value) =>
                  handleSettingChange('max_query_complexity', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {complexityLevels.map((level) => (
                    <SelectItem
                      key={level.value}
                      value={level.value.toString()}
                    >
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='query-timeout'>
                {t('aiAnalytics.queryTimeout', 'Query Timeout (seconds)')}
              </Label>
              <Input
                id='query-timeout'
                type='number'
                min='5'
                max='300'
                value={settings.query_timeout}
                onChange={(e) =>
                  handleSettingChange('query_timeout', parseInt(e.target.value))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='max-rows'>
                {t('aiAnalytics.maxRowsPerQuery', 'Max Rows per Query')}
              </Label>
              <Input
                id='max-rows'
                type='number'
                min='100'
                max='10000'
                value={settings.max_rows_per_query}
                onChange={(e) =>
                  handleSettingChange(
                    'max_rows_per_query',
                    parseInt(e.target.value)
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              {t('aiAnalytics.featureSettings', 'Feature Settings')}
            </CardTitle>
            <CardDescription>
              {t(
                'aiAnalytics.featureDescription',
                'Enable or disable analytics features'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='auto-execute'>
                  {t('aiAnalytics.autoExecuteQueries', 'Auto Execute Queries')}
                </Label>
                <p className='text-muted-foreground text-xs'>
                  {t(
                    'aiAnalytics.autoExecuteDescription',
                    'Automatically execute queries when typed'
                  )}
                </p>
              </div>
              <Switch
                id='auto-execute'
                checked={settings.auto_execute_queries}
                onCheckedChange={(checked) =>
                  handleSettingChange('auto_execute_queries', checked)
                }
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='query-validation'>
                  {t(
                    'aiAnalytics.enableQueryValidation',
                    'Enable Query Validation'
                  )}
                </Label>
                <p className='text-muted-foreground text-xs'>
                  {t(
                    'aiAnalytics.validationDescription',
                    'Validate queries before execution'
                  )}
                </p>
              </div>
              <Switch
                id='query-validation'
                checked={settings.enable_query_validation}
                onCheckedChange={(checked) =>
                  handleSettingChange('enable_query_validation', checked)
                }
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='sql-explanation'>
                  {t(
                    'aiAnalytics.enableSQLExplanation',
                    'Enable SQL Explanation'
                  )}
                </Label>
                <p className='text-muted-foreground text-xs'>
                  {t(
                    'aiAnalytics.explanationDescription',
                    'Show explanations for generated SQL'
                  )}
                </p>
              </div>
              <Switch
                id='sql-explanation'
                checked={settings.enable_sql_explanation}
                onCheckedChange={(checked) =>
                  handleSettingChange('enable_sql_explanation', checked)
                }
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='caching'>
                  {t('aiAnalytics.enableCaching', 'Enable Caching')}
                </Label>
                <p className='text-muted-foreground text-xs'>
                  {t(
                    'aiAnalytics.cachingDescription',
                    'Cache query results for faster access'
                  )}
                </p>
              </div>
              <Switch
                id='caching'
                checked={settings.enable_caching}
                onCheckedChange={(checked) =>
                  handleSettingChange('enable_caching', checked)
                }
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='data-privacy'>
                  {t('aiAnalytics.enableDataPrivacy', 'Enable Data Privacy')}
                </Label>
                <p className='text-muted-foreground text-xs'>
                  {t(
                    'aiAnalytics.privacyDescription',
                    'Protect sensitive data in queries'
                  )}
                </p>
              </div>
              <Switch
                id='data-privacy'
                checked={settings.enable_data_privacy}
                onCheckedChange={(checked) =>
                  handleSettingChange('enable_data_privacy', checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              {t('aiAnalytics.usageStatistics', 'Usage Statistics')}
            </CardTitle>
            <CardDescription>
              {t(
                'aiAnalytics.usageDescription',
                'Current usage and limits for analytics features'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {usageStats ? (
              <>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-sm'>
                      {t('aiAnalytics.totalQueries', 'Total Queries')}
                    </span>
                    <span className='text-sm'>{usageStats.total_queries}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-sm'>
                      {t('aiAnalytics.chartsGenerated', 'Charts Generated')}
                    </span>
                    <span className='text-sm'>
                      {usageStats.charts_generated}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-sm'>
                      {t('aiAnalytics.totalTokens', 'Total Tokens')}
                    </span>
                    <span className='text-sm'>
                      {usageStats.total_tokens.toLocaleString()}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-sm'>
                      {t('aiAnalytics.totalCost', 'Total Cost')}
                    </span>
                    <span className='text-sm'>
                      ${usageStats.total_cost.toFixed(4)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-sm'>
                      {t('aiAnalytics.avgExecutionTime', 'Avg Execution Time')}
                    </span>
                    <span className='text-sm'>
                      {usageStats.avg_execution_time}ms
                    </span>
                  </div>
                </div>

                <Separator />

                <div className='space-y-2'>
                  <Label htmlFor='cache-duration'>
                    {t('aiAnalytics.cacheDuration', 'Cache Duration (seconds)')}
                  </Label>
                  <Input
                    id='cache-duration'
                    type='number'
                    min='60'
                    max='86400'
                    value={settings.cache_duration}
                    onChange={(e) =>
                      handleSettingChange(
                        'cache_duration',
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => refetchUsageStats()}
                  className='w-full gap-2'
                >
                  <RefreshCw className='h-4 w-4' />
                  {t('aiAnalytics.refresh', 'Refresh')}
                </Button>
              </>
            ) : (
              <div className='py-8 text-center'>
                <TrendingUp className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                <p className='text-gray-500 text-sm'>
                  {t('aiAnalytics.loadingStats', 'Loading statistics...')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
