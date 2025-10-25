import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  Database, 
  History, 
  Settings, 
  Plus,
  TrendingUp,
  PieChart,
  LineChart,
  Table,
  Brain,
  Lightbulb,
  Target
} from 'lucide-react'
import { AnalyticsQuery } from './components/analytics-query'
import { AnalyticsCharts } from './components/analytics-charts'
import { AnalyticsHistory } from './components/analytics-history'
import { AnalyticsSettings } from './components/analytics-settings'

export default function AIAnalyticsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('query')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('aiAnalytics.title', 'AI Analytics')}
          </h1>
          <p className="text-muted-foreground">
            {t('aiAnalytics.description', 'Generate insights and visualizations from your data using natural language queries')}
          </p>
        </div>
        <Button size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          {t('aiAnalytics.newQuery', 'New Query')}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('aiAnalytics.totalQueries', 'Total Queries')}
                </p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('aiAnalytics.chartsGenerated', 'Charts Generated')}
                </p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('aiAnalytics.insightsGenerated', 'Insights Generated')}
                </p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('aiAnalytics.creditsUsed', 'Credits Used')}
                </p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="query" className="gap-2">
            <Database className="h-4 w-4" />
            {t('aiAnalytics.query', 'Query')}
          </TabsTrigger>
          <TabsTrigger value="charts" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('aiAnalytics.charts', 'Charts')}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            {t('aiAnalytics.history', 'History')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            {t('aiAnalytics.settings', 'Settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-6">
          <AnalyticsQuery />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <AnalyticsCharts />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <AnalyticsHistory />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AnalyticsSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
