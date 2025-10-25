import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  FileText,
  MessageSquare,
  BarChart3
} from 'lucide-react'
import { api } from '@/lib/api'

interface DocumentSettings {
  chunk_size: number
  chunk_overlap: number
  max_tokens_per_chunk: number
  enable_summarization: boolean
  enable_key_points: boolean
  enable_chat: boolean
  auto_process: boolean
}

interface UsageStats {
  total_documents: number
  total_chunks: number
  total_chats: number
  total_tokens: number
  total_cost: number
}

export function DocumentSettings() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<DocumentSettings>({
    chunk_size: 1000,
    chunk_overlap: 200,
    max_tokens_per_chunk: 500,
    enable_summarization: true,
    enable_key_points: true,
    enable_chat: true,
    auto_process: true,
  })
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchUsageStats()
  }, [])

  const fetchSettings = async () => {
    try {
      // In a real app, you'd fetch settings from the API
      // For now, we'll use default values
      setSettings({
        chunk_size: 1000,
        chunk_overlap: 200,
        max_tokens_per_chunk: 500,
        enable_summarization: true,
        enable_key_points: true,
        enable_chat: true,
        auto_process: true,
      })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch settings')
    }
  }

  const fetchUsageStats = async () => {
    try {
      const response = await api.get('/ai-usage/dashboard')
      const data = response.data.usage_summary
      
      setUsageStats({
        total_documents: data.features?.documents?.count || 0,
        total_chunks: 0, // This would come from a specific endpoint
        total_chats: data.features?.documents?.tokens || 0, // Approximate
        total_tokens: data.credits_used * 1000, // Convert credits to tokens
        total_cost: data.total_cost || 0,
      })
    } catch (err: any) {
      console.error('Failed to fetch usage stats:', err)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      
      // In a real app, you'd save settings to the API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSettingChange = (key: keyof DocumentSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {t('aiDocuments.settings', 'Document Settings')}
          </h2>
          <p className="text-muted-foreground">
            {t('aiDocuments.settingsDescription', 'Configure how documents are processed and analyzed')}
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="gap-2">
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {t('aiDocuments.saveSettings', 'Save Settings')}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {t('aiDocuments.settingsSaved', 'Settings saved successfully')}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Processing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('aiDocuments.processingSettings', 'Processing Settings')}
            </CardTitle>
            <CardDescription>
              {t('aiDocuments.processingDescription', 'Configure how documents are chunked and processed')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chunk-size">
                {t('aiDocuments.chunkSize', 'Chunk Size')}
              </Label>
              <Input
                id="chunk-size"
                type="number"
                value={settings.chunk_size}
                onChange={(e) => handleSettingChange('chunk_size', parseInt(e.target.value))}
                min="100"
                max="2000"
              />
              <p className="text-xs text-muted-foreground">
                {t('aiDocuments.chunkSizeDescription', 'Number of characters per chunk (100-2000)')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chunk-overlap">
                {t('aiDocuments.chunkOverlap', 'Chunk Overlap')}
              </Label>
              <Input
                id="chunk-overlap"
                type="number"
                value={settings.chunk_overlap}
                onChange={(e) => handleSettingChange('chunk_overlap', parseInt(e.target.value))}
                min="0"
                max="500"
              />
              <p className="text-xs text-muted-foreground">
                {t('aiDocuments.chunkOverlapDescription', 'Overlap between chunks for better context')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-tokens">
                {t('aiDocuments.maxTokensPerChunk', 'Max Tokens per Chunk')}
              </Label>
              <Input
                id="max-tokens"
                type="number"
                value={settings.max_tokens_per_chunk}
                onChange={(e) => handleSettingChange('max_tokens_per_chunk', parseInt(e.target.value))}
                min="100"
                max="1000"
              />
              <p className="text-xs text-muted-foreground">
                {t('aiDocuments.maxTokensDescription', 'Maximum tokens for AI processing per chunk')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('aiDocuments.featureSettings', 'Feature Settings')}
            </CardTitle>
            <CardDescription>
              {t('aiDocuments.featureDescription', 'Enable or disable AI features for documents')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="summarization">
                  {t('aiDocuments.enableSummarization', 'Enable Summarization')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('aiDocuments.summarizationDescription', 'Automatically generate document summaries')}
                </p>
              </div>
              <Switch
                id="summarization"
                checked={settings.enable_summarization}
                onCheckedChange={(checked) => handleSettingChange('enable_summarization', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="key-points">
                  {t('aiDocuments.enableKeyPoints', 'Enable Key Points')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('aiDocuments.keyPointsDescription', 'Extract key points and insights')}
                </p>
              </div>
              <Switch
                id="key-points"
                checked={settings.enable_key_points}
                onCheckedChange={(checked) => handleSettingChange('enable_key_points', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="chat">
                  {t('aiDocuments.enableChat', 'Enable Chat')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('aiDocuments.chatDescription', 'Allow chatting with documents')}
                </p>
              </div>
              <Switch
                id="chat"
                checked={settings.enable_chat}
                onCheckedChange={(checked) => handleSettingChange('enable_chat', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-process">
                  {t('aiDocuments.autoProcess', 'Auto Process')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('aiDocuments.autoProcessDescription', 'Automatically process documents on upload')}
                </p>
              </div>
              <Switch
                id="auto-process"
                checked={settings.auto_process}
                onCheckedChange={(checked) => handleSettingChange('auto_process', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('aiDocuments.usageStatistics', 'Usage Statistics')}
            </CardTitle>
            <CardDescription>
              {t('aiDocuments.usageDescription', 'Current usage and limits for document features')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {usageStats ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {usageStats.total_documents}
                    </div>
                    <div className="text-xs text-blue-600">
                      {t('aiDocuments.documents', 'Documents')}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {usageStats.total_chats}
                    </div>
                    <div className="text-xs text-green-600">
                      {t('aiDocuments.chats', 'Chats')}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('aiDocuments.totalTokens', 'Total Tokens')}</span>
                    <span className="font-medium">{usageStats.total_tokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t('aiDocuments.totalCost', 'Total Cost')}</span>
                    <span className="font-medium">${usageStats.total_cost.toFixed(4)}</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchUsageStats}
                  className="w-full gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('aiDocuments.refresh', 'Refresh')}
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  {t('aiDocuments.loadingStats', 'Loading statistics...')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
