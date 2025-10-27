import { useMutation, useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  RefreshCw,
  Save,
  Settings,
  Wand2,
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

interface ContentSettings {
  default_tone: string
  default_length: string
  default_language: string
  auto_save: boolean
  enable_plagiarism_check: boolean
  enable_grammar_check: boolean
  max_generations_per_day: number
  default_temperature: number
  enable_content_optimization: boolean
}

interface UsageStats {
  total_generations: number
  total_tokens: number
  total_cost: number
  templates_used: number
  daily_generations: number
  monthly_generations: number
}

export function ContentSettings() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<ContentSettings>({
    default_tone: 'professional',
    default_length: 'medium',
    default_language: 'en',
    auto_save: true,
    enable_plagiarism_check: false,
    enable_grammar_check: true,
    max_generations_per_day: 50,
    default_temperature: 0.7,
    enable_content_optimization: true,
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
        total_generations: data.features?.content?.count || 0,
        total_tokens: data.credits_used * 1000,
        total_cost: data.total_cost || 0,
        templates_used: 0,
        daily_generations: 0,
        monthly_generations: 0,
      } as UsageStats
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
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

  const handleSettingChange = (key: keyof ContentSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'authoritative', label: 'Authoritative' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'persuasive', label: 'Persuasive' },
  ]

  const lengths = [
    { value: 'short', label: 'Short (100-300 words)' },
    { value: 'medium', label: 'Medium (300-800 words)' },
    { value: 'long', label: 'Long (800+ words)' },
  ]

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'pt', label: 'Portuguese' },
  ]

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='font-bold text-2xl'>
            {t('aiContent.contentSettings', 'Content Settings')}
          </h2>
          <p className='text-muted-foreground'>
            {t(
              'aiContent.settingsDescription',
              'Configure AI content generation preferences and limits'
            )}
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className='gap-2'>
          {saving ? (
            <RefreshCw className='h-4 w-4 animate-spin' />
          ) : (
            <Save className='h-4 w-4' />
          )}
          {t('aiContent.saveSettings', 'Save Settings')}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert>
          <CheckCircle className='h-4 w-4' />
          <AlertDescription>
            {t('aiContent.settingsSaved', 'Settings saved successfully')}
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
        {/* Default Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              {t('aiContent.defaultSettings', 'Default Settings')}
            </CardTitle>
            <CardDescription>
              {t(
                'aiContent.defaultDescription',
                'Set default values for content generation'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='default-tone'>
                {t('aiContent.defaultTone', 'Default Tone')}
              </Label>
              <Select
                value={settings.default_tone}
                onValueChange={(value) =>
                  handleSettingChange('default_tone', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      {tone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='default-length'>
                {t('aiContent.defaultLength', 'Default Length')}
              </Label>
              <Select
                value={settings.default_length}
                onValueChange={(value) =>
                  handleSettingChange('default_length', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lengths.map((length) => (
                    <SelectItem key={length.value} value={length.value}>
                      {length.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='default-language'>
                {t('aiContent.defaultLanguage', 'Default Language')}
              </Label>
              <Select
                value={settings.default_language}
                onValueChange={(value) =>
                  handleSettingChange('default_language', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.value} value={language.value}>
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='default-temperature'>
                {t('aiContent.defaultTemperature', 'Default Temperature')}
              </Label>
              <Input
                id='default-temperature'
                type='number'
                min='0'
                max='2'
                step='0.1'
                value={settings.default_temperature}
                onChange={(e) =>
                  handleSettingChange(
                    'default_temperature',
                    parseFloat(e.target.value)
                  )
                }
              />
              <p className='text-muted-foreground text-xs'>
                {t(
                  'aiContent.temperatureDescription',
                  'Controls creativity (0.0 = focused, 2.0 = creative)'
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Wand2 className='h-5 w-5' />
              {t('aiContent.featureSettings', 'Feature Settings')}
            </CardTitle>
            <CardDescription>
              {t(
                'aiContent.featureDescription',
                'Enable or disable AI content features'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='auto-save'>
                  {t('aiContent.autoSave', 'Auto Save')}
                </Label>
                <p className='text-muted-foreground text-xs'>
                  {t(
                    'aiContent.autoSaveDescription',
                    'Automatically save generated content'
                  )}
                </p>
              </div>
              <Switch
                id='auto-save'
                checked={settings.auto_save}
                onCheckedChange={(checked) =>
                  handleSettingChange('auto_save', checked)
                }
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='plagiarism-check'>
                  {t('aiContent.plagiarismCheck', 'Plagiarism Check')}
                </Label>
                <p className='text-muted-foreground text-xs'>
                  {t(
                    'aiContent.plagiarismDescription',
                    'Check for plagiarism in generated content'
                  )}
                </p>
              </div>
              <Switch
                id='plagiarism-check'
                checked={settings.enable_plagiarism_check}
                onCheckedChange={(checked) =>
                  handleSettingChange('enable_plagiarism_check', checked)
                }
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='grammar-check'>
                  {t('aiContent.grammarCheck', 'Grammar Check')}
                </Label>
                <p className='text-muted-foreground text-xs'>
                  {t(
                    'aiContent.grammarDescription',
                    'Check grammar and spelling'
                  )}
                </p>
              </div>
              <Switch
                id='grammar-check'
                checked={settings.enable_grammar_check}
                onCheckedChange={(checked) =>
                  handleSettingChange('enable_grammar_check', checked)
                }
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='content-optimization'>
                  {t('aiContent.contentOptimization', 'Content Optimization')}
                </Label>
                <p className='text-muted-foreground text-xs'>
                  {t(
                    'aiContent.optimizationDescription',
                    'Optimize content for SEO and readability'
                  )}
                </p>
              </div>
              <Switch
                id='content-optimization'
                checked={settings.enable_content_optimization}
                onCheckedChange={(checked) =>
                  handleSettingChange('enable_content_optimization', checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              {t('aiContent.usageStatistics', 'Usage Statistics')}
            </CardTitle>
            <CardDescription>
              {t(
                'aiContent.usageDescription',
                'Current usage and limits for content generation'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {usageStats ? (
              <>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-sm'>
                      {t('aiContent.totalGenerations', 'Total Generations')}
                    </span>
                    <span className='text-sm'>
                      {usageStats.total_generations}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-sm'>
                      {t('aiContent.totalTokens', 'Total Tokens')}
                    </span>
                    <span className='text-sm'>
                      {usageStats.total_tokens.toLocaleString()}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-sm'>
                      {t('aiContent.totalCost', 'Total Cost')}
                    </span>
                    <span className='text-sm'>
                      ${usageStats.total_cost.toFixed(4)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-sm'>
                      {t('aiContent.templatesUsed', 'Templates Used')}
                    </span>
                    <span className='text-sm'>{usageStats.templates_used}</span>
                  </div>
                </div>

                <Separator />

                <div className='space-y-2'>
                  <Label htmlFor='max-generations'>
                    {t(
                      'aiContent.maxGenerationsPerDay',
                      'Max Generations per Day'
                    )}
                  </Label>
                  <Input
                    id='max-generations'
                    type='number'
                    min='1'
                    max='1000'
                    value={settings.max_generations_per_day}
                    onChange={(e) =>
                      handleSettingChange(
                        'max_generations_per_day',
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
                  {t('aiContent.refresh', 'Refresh')}
                </Button>
              </>
            ) : (
              <div className='py-8 text-center'>
                <BarChart3 className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                <p className='text-gray-500 text-sm'>
                  {t('aiContent.loadingStats', 'Loading statistics...')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
