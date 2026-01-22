import { useMutation } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  Copy,
  Download,
  Edit,
  FileText,
  Lightbulb,
  Loader2,
  Mail,
  MessageSquare,
  Target,
  Wand2,
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
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'

interface ContentGeneration {
  id: string
  template_name: string
  content: string
  metadata: Record<string, unknown>
  created_at: string
  tokens_used: number
  cost: number
}

export function ContentWizard() {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const [generatedContent, setGeneratedContent] =
    useState<ContentGeneration | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    template: '',
    topic: '',
    audience: '',
    tone: '',
    length: '',
    keywords: '',
    additionalContext: '',
    language: 'en',
  })

  const generateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/ai-content/generate', {
        template_name: data.template,
        topic: data.topic,
        audience: data.audience,
        tone: data.tone,
        length: data.length,
        keywords: data.keywords,
        additional_context: data.additionalContext,
        language: data.language,
      })
      return response.data as ContentGeneration
    },
    onSuccess: (data) => {
      setGeneratedContent(data)
      setCurrentStep(4) // Move to results step
    },
  })

  const templates = [
    {
      id: 'blog-post',
      name: 'Blog Post',
      description: 'Create engaging blog posts',
      icon: FileText,
      category: 'Writing',
    },
    {
      id: 'social-media',
      name: 'Social Media',
      description: 'Generate social media content',
      icon: MessageSquare,
      category: 'Social',
    },
    {
      id: 'email',
      name: 'Email',
      description: 'Write professional emails',
      icon: Mail,
      category: 'Communication',
    },
    {
      id: 'product-description',
      name: 'Product Description',
      description: 'Create product descriptions',
      icon: Target,
      category: 'Marketing',
    },
    {
      id: 'ad-copy',
      name: 'Ad Copy',
      description: 'Generate advertising copy',
      icon: Lightbulb,
      category: 'Marketing',
    },
    {
      id: 'press-release',
      name: 'Press Release',
      description: 'Write press releases',
      icon: Calendar,
      category: 'PR',
    },
  ]

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

  const audiences = [
    { value: 'general', label: 'General Audience' },
    { value: 'business', label: 'Business Professionals' },
    { value: 'technical', label: 'Technical Audience' },
    { value: 'students', label: 'Students' },
    { value: 'consumers', label: 'Consumers' },
    { value: 'investors', label: 'Investors' },
  ]

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = () => {
    generateMutation.mutate(formData)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (_err) {
      // Silently handle clipboard errors (e.g., insufficient permissions)
    }
  }

  const downloadContent = () => {
    if (!generatedContent) return

    const blob = new Blob([generatedContent.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${formData.topic}-content.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-6'>
            <div>
              <h3 className='mb-4 font-semibold text-lg'>
                {t('aiContent.selectTemplate', 'Select a Template')}
              </h3>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {templates.map((template) => {
                  const Icon = template.icon
                  return (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.template === template.id
                          ? 'ring-2 ring-blue-500'
                          : ''
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          template: template.id,
                        }))
                      }
                    >
                      <CardContent className='p-4'>
                        <div className='flex items-start gap-3'>
                          <Icon className='mt-1 h-6 w-6 text-blue-600' />
                          <div className='flex-1'>
                            <h4 className='font-medium'>{template.name}</h4>
                            <p className='text-muted-foreground text-sm'>
                              {template.description}
                            </p>
                            <Badge variant='secondary' className='mt-2'>
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className='space-y-6'>
            <div>
              <h3 className='mb-4 font-semibold text-lg'>
                {t('aiContent.contentDetails', 'Content Details')}
              </h3>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='topic'>
                      {t('aiContent.topic', 'Topic')} *
                    </Label>
                    <Input
                      id='topic'
                      placeholder={t(
                        'aiContent.topicPlaceholder',
                        'What should the content be about?'
                      )}
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          topic: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor='audience'>
                      {t('aiContent.audience', 'Target Audience')}
                    </Label>
                    <Select
                      value={formData.audience}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, audience: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            'aiContent.selectAudience',
                            'Select audience'
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {audiences.map((audience) => (
                          <SelectItem
                            key={audience.value}
                            value={audience.value}
                          >
                            {audience.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='tone'>{t('aiContent.tone', 'Tone')}</Label>
                    <Select
                      value={formData.tone}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, tone: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('aiContent.selectTone', 'Select tone')}
                        />
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
                </div>

                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='length'>
                      {t('aiContent.length', 'Length')}
                    </Label>
                    <Select
                      value={formData.length}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, length: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            'aiContent.selectLength',
                            'Select length'
                          )}
                        />
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

                  <div>
                    <Label htmlFor='keywords'>
                      {t('aiContent.keywords', 'Keywords')}
                    </Label>
                    <Input
                      id='keywords'
                      placeholder={t(
                        'aiContent.keywordsPlaceholder',
                        'Enter keywords separated by commas'
                      )}
                      value={formData.keywords}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          keywords: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor='language'>
                      {t('aiContent.language', 'Language')}
                    </Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='en'>English</SelectItem>
                        <SelectItem value='es'>Spanish</SelectItem>
                        <SelectItem value='fr'>French</SelectItem>
                        <SelectItem value='de'>German</SelectItem>
                        <SelectItem value='pt'>Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className='space-y-6'>
            <div>
              <h3 className='mb-4 font-semibold text-lg'>
                {t('aiContent.additionalContext', 'Additional Context')}
              </h3>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='additionalContext'>
                    {t(
                      'aiContent.contextLabel',
                      'Additional Context (Optional)'
                    )}
                  </Label>
                  <Textarea
                    id='additionalContext'
                    placeholder={t(
                      'aiContent.contextPlaceholder',
                      'Add any additional context, requirements, or specific instructions...'
                    )}
                    value={formData.additionalContext}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        additionalContext: e.target.value,
                      }))
                    }
                    rows={6}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className='space-y-6'>
            <div>
              <h3 className='mb-4 font-semibold text-lg'>
                {t('aiContent.generatedContent', 'Generated Content')}
              </h3>

              {generatedContent ? (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <CheckCircle className='h-5 w-5 text-green-600' />
                      <span className='text-muted-foreground text-sm'>
                        {t(
                          'aiContent.generationComplete',
                          'Content generated successfully'
                        )}
                      </span>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          copyToClipboard(generatedContent.content)
                        }
                        className='gap-2'
                      >
                        <Copy className='h-4 w-4' />
                        {t('aiContent.copy', 'Copy')}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={downloadContent}
                        className='gap-2'
                      >
                        <Download className='h-4 w-4' />
                        {t('aiContent.download', 'Download')}
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardContent className='p-6'>
                      <div className='prose max-w-none'>
                        <pre className='whitespace-pre-wrap font-sans text-sm leading-relaxed'>
                          {generatedContent.content}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>

                  <div className='flex items-center gap-4 text-muted-foreground text-sm'>
                    <span>
                      {t('aiContent.tokensUsed', 'Tokens Used')}:{' '}
                      {generatedContent.tokens_used}
                    </span>
                    <span>
                      {t('aiContent.cost', 'Cost')}: $
                      {generatedContent.cost.toFixed(4)}
                    </span>
                    <span>
                      {t('aiContent.generatedAt', 'Generated')}:{' '}
                      {new Date(generatedContent.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className='py-12 text-center'>
                  <Wand2 className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                  <p className='text-muted-foreground'>
                    {t(
                      'aiContent.noContentGenerated',
                      'No content generated yet'
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className='space-y-6'>
      {/* Progress */}
      <Card>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='font-medium text-sm'>
                {t('aiContent.step', 'Step')} {currentStep}{' '}
                {t('aiContent.of', 'of')} 4
              </span>
              <span className='text-muted-foreground text-sm'>
                {Math.round((currentStep / 4) * 100)}%
              </span>
            </div>
            <Progress value={(currentStep / 4) * 100} className='h-2' />
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {generateMutation.isError && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {t('aiContent.generationError', 'Failed to generate content')}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Wand2 className='h-5 w-5' />
            {t('aiContent.contentWizard', 'Content Wizard')}
          </CardTitle>
          <CardDescription>
            {t(
              'aiContent.wizardDescription',
              'Follow the steps to generate high-quality content with AI'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className='flex items-center justify-between'>
        <Button
          variant='outline'
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className='gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          {t('aiContent.previous', 'Previous')}
        </Button>

        <div className='flex gap-2'>
          {currentStep < 3 ? (
            <Button onClick={handleNext} className='gap-2'>
              {t('aiContent.next', 'Next')}
              <ArrowRight className='h-4 w-4' />
            </Button>
          ) : currentStep === 3 ? (
            <Button
              onClick={handleGenerate}
              disabled={
                generateMutation.isPending ||
                !formData.template ||
                !formData.topic
              }
              className='gap-2'
            >
              {generateMutation.isPending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Wand2 className='h-4 w-4' />
              )}
              {generateMutation.isPending
                ? t('aiContent.generating', 'Generating...')
                : t('aiContent.generate', 'Generate Content')}
            </Button>
          ) : (
            <Button onClick={() => setCurrentStep(1)} className='gap-2'>
              <Edit className='h-4 w-4' />
              {t('aiContent.createNew', 'Create New')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
