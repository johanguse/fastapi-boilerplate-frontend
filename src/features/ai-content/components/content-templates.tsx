import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  FileText, 
  Search, 
  MoreHorizontal, 
  Play, 
  Edit, 
  Trash2, 
  Copy,
  Calendar,
  Users,
  Target,
  Lightbulb,
  Mail,
  MessageSquare,
  BarChart3,
  Loader2
} from 'lucide-react'
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

interface ContentTemplatesProps {}

export function ContentTemplates({}: ContentTemplatesProps) {
  const { t } = useTranslation()
  const [templates, setTemplates] = useState<ContentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await api.get('/ai-content/templates')
      setTemplates(response.data.items || [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }

  const deleteTemplate = async (templateId: string) => {
    try {
      await api.delete(`/ai-content/templates/${templateId}`)
      setTemplates(prev => prev.filter(template => template.id !== templateId))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete template')
    }
  }

  const duplicateTemplate = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId)
      if (!template) return

      const response = await api.post('/ai-content/templates', {
        name: `${template.name} (Copy)`,
        description: template.description,
        category: template.category,
        prompt_template: template.prompt_template,
        variables: template.variables,
      })

      setTemplates(prev => [...prev, response.data])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to duplicate template')
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Writing': FileText,
      'Social': MessageSquare,
      'Communication': Mail,
      'Marketing': Target,
      'PR': Calendar,
      'Creative': Lightbulb,
    }
    return icons[category as keyof typeof icons] || FileText
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Writing': 'bg-blue-100 text-blue-800',
      'Social': 'bg-green-100 text-green-800',
      'Communication': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-orange-100 text-orange-800',
      'PR': 'bg-pink-100 text-pink-800',
      'Creative': 'bg-yellow-100 text-yellow-800',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(templates.map(t => t.category)))

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
            <p className="text-muted-foreground">
              {t('aiContent.loadingTemplates', 'Loading templates...')}
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
            {t('aiContent.contentTemplates', 'Content Templates')}
          </h2>
          <p className="text-muted-foreground">
            {t('aiContent.templatesDescription', 'Manage and use AI content templates')}
          </p>
        </div>
        <Button onClick={fetchTemplates} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          {t('aiContent.refresh', 'Refresh')}
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
                  placeholder={t('aiContent.searchTemplates', 'Search templates...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('all')}
              >
                {t('aiContent.all', 'All')}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={filterCategory === category ? 'default' : 'outline'}
                  size="sm"
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
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('aiContent.noTemplates', 'No templates found')}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? t('aiContent.noTemplatesMatch', 'No templates match your search')
                : t('aiContent.createFirstTemplate', 'Create your first template to get started')
              }
            </p>
          </div>
        ) : (
          filteredTemplates.map((template) => {
            const Icon = getCategoryIcon(template.category)
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          {t('aiContent.use', 'Use')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          {t('aiContent.edit', 'Edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateTemplate(template.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          {t('aiContent.duplicate', 'Duplicate')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteTemplate(template.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('aiContent.delete', 'Delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {template.usage_count} {t('aiContent.uses', 'uses')}
                      </span>
                    </div>

                    {template.variables.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {t('aiContent.variables', 'Variables')}:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      {t('aiContent.created', 'Created')}: {formatDate(template.created_at)}
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
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('aiContent.templateStats', 'Template Statistics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {templates.length}
                </div>
                <div className="text-sm text-blue-600">
                  {t('aiContent.totalTemplates', 'Total Templates')}
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {templates.reduce((sum, t) => sum + t.usage_count, 0)}
                </div>
                <div className="text-sm text-green-600">
                  {t('aiContent.totalUses', 'Total Uses')}
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {categories.length}
                </div>
                <div className="text-sm text-purple-600">
                  {t('aiContent.categories', 'Categories')}
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(templates.reduce((sum, t) => sum + t.usage_count, 0) / templates.length)}
                </div>
                <div className="text-sm text-orange-600">
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
