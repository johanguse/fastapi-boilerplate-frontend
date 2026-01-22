import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BarChart3,
  Calendar,
  Copy,
  Edit,
  FileText,
  Lightbulb,
  Loader2,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Play,
  Search,
  Target,
  Trash2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'

interface ContentTemplate {
  id: string
  name: string
  description: string
  category: string
  prompt_template: string
  variables: string[]
  usage_count: number
  created_at: string
  updated_at: string
}

export function ContentTemplates() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const {
    data: templates = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ai-content', 'templates'],
    queryFn: async () => {
      const response = await api.get('/ai-content/templates')
      return (response.data.items || []) as ContentTemplate[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      await api.delete(`/ai-content/templates/${templateId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-content', 'templates'] })
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: async (template: ContentTemplate) => {
      const response = await api.post('/ai-content/templates', {
        name: `${template.name} (Copy)`,
        description: template.description,
        category: template.category,
        prompt_template: template.prompt_template,
        variables: template.variables,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-content', 'templates'] })
    },
  })

  const deleteTemplate = async (templateId: string) => {
    await deleteMutation.mutateAsync(templateId)
  }

  const duplicateTemplate = async (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return
    await duplicateMutation.mutateAsync(template)
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      Writing: FileText,
      Social: MessageSquare,
      Communication: Mail,
      Marketing: Target,
      PR: Calendar,
      Creative: Lightbulb,
    }
    return icons[category as keyof typeof icons] || FileText
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Writing: 'bg-blue-100 text-blue-800',
      Social: 'bg-green-100 text-green-800',
      Communication: 'bg-purple-100 text-purple-800',
      Marketing: 'bg-orange-100 text-orange-800',
      PR: 'bg-pink-100 text-pink-800',
      Creative: 'bg-yellow-100 text-yellow-800',
    }
    return (
      colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      filterCategory === 'all' || template.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(templates.map((t) => t.category)))

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Failed to fetch templates'

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex h-64 items-center justify-center'>
          <div className='space-y-2 text-center'>
            <Loader2 className='mx-auto h-8 w-8 animate-spin text-gray-400' />
            <p className='text-muted-foreground'>
              {t('aiContent.loadingTemplates', 'Loading templates...')}
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
            {t('aiContent.contentTemplates', 'Content Templates')}
          </h2>
          <p className='text-muted-foreground'>
            {t(
              'aiContent.templatesDescription',
              'Manage and use AI content templates'
            )}
          </p>
        </div>
        <Button onClick={() => refetch()} variant='outline'>
          <FileText className='mr-2 h-4 w-4' />
          {t('aiContent.refresh', 'Refresh')}
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
                    'aiContent.searchTemplates',
                    'Search templates...'
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <Button
                variant={filterCategory === 'all' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilterCategory('all')}
              >
                {t('aiContent.all', 'All')}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={filterCategory === category ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setFilterCategory(category)}
                >
                  {category}
                </Button>
              ))}
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

      {/* Templates Grid */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {filteredTemplates.length === 0 ? (
          <div className='col-span-full py-12 text-center'>
            <FileText className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <h3 className='mb-2 font-medium text-gray-900 text-lg'>
              {t('aiContent.noTemplates', 'No templates found')}
            </h3>
            <p className='text-gray-500'>
              {searchQuery
                ? t(
                    'aiContent.noTemplatesMatch',
                    'No templates match your search'
                  )
                : t(
                    'aiContent.createFirstTemplate',
                    'Create your first template to get started'
                  )}
            </p>
          </div>
        ) : (
          filteredTemplates.map((template) => {
            const Icon = getCategoryIcon(template.category)
            return (
              <Card
                key={template.id}
                className='transition-shadow hover:shadow-md'
              >
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-3'>
                      <Icon className='mt-1 h-5 w-5 text-blue-600' />
                      <div className='flex-1'>
                        <CardTitle className='text-lg'>
                          {template.name}
                        </CardTitle>
                        <CardDescription className='mt-1'>
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem>
                          <Play className='mr-2 h-4 w-4' />
                          {t('aiContent.use', 'Use')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className='mr-2 h-4 w-4' />
                          {t('aiContent.edit', 'Edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => duplicateTemplate(template.id)}
                        >
                          <Copy className='mr-2 h-4 w-4' />
                          {t('aiContent.duplicate', 'Duplicate')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteTemplate(template.id)}
                          className='text-red-600'
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          {t('aiContent.delete', 'Delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                      <span className='text-muted-foreground text-sm'>
                        {template.usage_count} {t('aiContent.uses', 'uses')}
                      </span>
                    </div>

                    {template.variables.length > 0 && (
                      <div>
                        <p className='mb-1 font-medium text-muted-foreground text-sm'>
                          {t('aiContent.variables', 'Variables')}:
                        </p>
                        <div className='flex flex-wrap gap-1'>
                          {template.variables.map((variable) => (
                            <Badge
                              key={variable}
                              variant='outline'
                              className='text-xs'
                            >
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className='text-muted-foreground text-xs'>
                      {t('aiContent.created', 'Created')}:{' '}
                      {formatDate(template.created_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Usage Statistics */}
      {templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              {t('aiContent.templateStats', 'Template Statistics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
              <div className='rounded-lg bg-blue-50 p-4 text-center'>
                <div className='font-bold text-2xl text-blue-600'>
                  {templates.length}
                </div>
                <div className='text-blue-600 text-sm'>
                  {t('aiContent.totalTemplates', 'Total Templates')}
                </div>
              </div>
              <div className='rounded-lg bg-green-50 p-4 text-center'>
                <div className='font-bold text-2xl text-green-600'>
                  {templates.reduce((sum, t) => sum + t.usage_count, 0)}
                </div>
                <div className='text-green-600 text-sm'>
                  {t('aiContent.totalUses', 'Total Uses')}
                </div>
              </div>
              <div className='rounded-lg bg-purple-50 p-4 text-center'>
                <div className='font-bold text-2xl text-purple-600'>
                  {categories.length}
                </div>
                <div className='text-purple-600 text-sm'>
                  {t('aiContent.categories', 'Categories')}
                </div>
              </div>
              <div className='rounded-lg bg-orange-50 p-4 text-center'>
                <div className='font-bold text-2xl text-orange-600'>
                  {Math.round(
                    templates.reduce((sum, t) => sum + t.usage_count, 0) /
                      templates.length
                  )}
                </div>
                <div className='text-orange-600 text-sm'>
                  {t('aiContent.avgUses', 'Avg Uses')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
