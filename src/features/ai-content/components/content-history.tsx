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
  History, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Copy, 
  Download, 
  Trash2,
  Calendar,
  Clock,
  FileText,
  Loader2,
  Filter,
  ChevronDown
} from 'lucide-react'
import { api } from '@/lib/api'

interface ContentGeneration {
  id: string
  template_name: string
  content: string
  metadata: any
  created_at: string
  tokens_used: number
  cost: number
  status: 'completed' | 'failed' | 'processing'
}

interface ContentHistoryProps {}

export function ContentHistory({}: ContentHistoryProps) {
  const { t } = useTranslation()
  const [generations, setGenerations] = useState<ContentGeneration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTemplate, setFilterTemplate] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedGeneration, setSelectedGeneration] = useState<ContentGeneration | null>(null)

  useEffect(() => {
    fetchGenerations()
  }, [])

  const fetchGenerations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/ai-content/generations')
      setGenerations(response.data.items || [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch content history')
    } finally {
      setLoading(false)
    }
  }

  const deleteGeneration = async (generationId: string) => {
    try {
      await api.delete(`/ai-content/generations/${generationId}`)
      setGenerations(prev => prev.filter(gen => gen.id !== generationId))
      if (selectedGeneration?.id === generationId) {
        setSelectedGeneration(null)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete generation')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const downloadContent = (generation: ContentGeneration) => {
    const blob = new Blob([generation.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generation.template_name}-${generation.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatContentPreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content
  }

  const getStatusBadge = (status: ContentGeneration['status']) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: FileText },
      failed: { color: 'bg-red-100 text-red-800', icon: FileText },
      processing: { color: 'bg-yellow-100 text-yellow-800', icon: Loader2 },
    }
    
    const config = statusConfig[status]
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const filteredGenerations = generations.filter(generation => {
    const matchesSearch = generation.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         generation.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTemplate = filterTemplate === 'all' || generation.template_name === filterTemplate
    const matchesStatus = filterStatus === 'all' || generation.status === filterStatus
    return matchesSearch && matchesTemplate && matchesStatus
  })

  const templates = Array.from(new Set(generations.map(g => g.template_name)))

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
            <p className="text-muted-foreground">
              {t('aiContent.loadingHistory', 'Loading content history...')}
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
            {t('aiContent.contentHistory', 'Content History')}
          </h2>
          <p className="text-muted-foreground">
            {t('aiContent.historyDescription', 'View and manage your generated content')}
          </p>
        </div>
        <Button onClick={fetchGenerations} variant="outline">
          <History className="h-4 w-4 mr-2" />
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
                  placeholder={t('aiContent.searchHistory', 'Search content history...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterTemplate === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTemplate('all')}
              >
                {t('aiContent.allTemplates', 'All Templates')}
              </Button>
              {templates.map((template) => (
                <Button
                  key={template}
                  variant={filterTemplate === template ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterTemplate(template)}
                >
                  {template}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                {t('aiContent.allStatus', 'All Status')}
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('completed')}
              >
                {t('aiContent.completed', 'Completed')}
              </Button>
              <Button
                variant={filterStatus === 'failed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('failed')}
              >
                {t('aiContent.failed', 'Failed')}
              </Button>
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
        {/* Generations List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('aiContent.generations', 'Generations')} ({filteredGenerations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredGenerations.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('aiContent.noGenerations', 'No content generated yet')}
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery 
                      ? t('aiContent.noGenerationsMatch', 'No generations match your search')
                      : t('aiContent.generateFirstContent', 'Generate your first content to see it here')
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('aiContent.template', 'Template')}</TableHead>
                      <TableHead>{t('aiContent.preview', 'Preview')}</TableHead>
                      <TableHead>{t('aiContent.status', 'Status')}</TableHead>
                      <TableHead>{t('aiContent.created', 'Created')}</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGenerations.map((generation) => (
                      <TableRow 
                        key={generation.id}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          selectedGeneration?.id === generation.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedGeneration(generation)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{generation.template_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-600 truncate">
                              {formatContentPreview(generation.content)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(generation.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(generation.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedGeneration(generation)}>
                                <Eye className="h-4 w-4 mr-2" />
                                {t('aiContent.view', 'View')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyToClipboard(generation.content)}>
                                <Copy className="h-4 w-4 mr-2" />
                                {t('aiContent.copy', 'Copy')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadContent(generation)}>
                                <Download className="h-4 w-4 mr-2" />
                                {t('aiContent.download', 'Download')}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteGeneration(generation.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('aiContent.delete', 'Delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {t('aiContent.contentPreview', 'Content Preview')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedGeneration ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('aiContent.template', 'Template')}</span>
                      <Badge variant="outline">{selectedGeneration.template_name}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('aiContent.status', 'Status')}</span>
                      {getStatusBadge(selectedGeneration.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('aiContent.tokens', 'Tokens')}</span>
                      <span className="text-sm">{selectedGeneration.tokens_used}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('aiContent.cost', 'Cost')}</span>
                      <span className="text-sm">${selectedGeneration.cost.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('aiContent.created', 'Created')}</span>
                      <span className="text-sm">{formatDate(selectedGeneration.created_at)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">{t('aiContent.content', 'Content')}</h4>
                    <div className="bg-gray-50 p-3 rounded-lg max-h-64 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed">
                        {selectedGeneration.content}
                      </pre>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedGeneration.content)}
                      className="flex-1 gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      {t('aiContent.copy', 'Copy')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadContent(selectedGeneration)}
                      className="flex-1 gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {t('aiContent.download', 'Download')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {t('aiContent.selectGeneration', 'Select a generation to preview')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
