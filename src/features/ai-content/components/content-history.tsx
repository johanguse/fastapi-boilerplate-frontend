import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Copy,
  Download,
  Eye,
  FileText,
  History,
  Loader2,
  MoreHorizontal,
  Search,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { api } from '@/lib/api'

interface ContentGeneration {
  id: string
  template_name: string
  content: string
  metadata: Record<string, unknown>
  created_at: string
  tokens_used: number
  cost: number
  status: 'completed' | 'failed' | 'processing'
}

export function ContentHistory() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTemplate, setFilterTemplate] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedGeneration, setSelectedGeneration] =
    useState<ContentGeneration | null>(null)

  const {
    data: generations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ai-content', 'generations'],
    queryFn: async () => {
      const response = await api.get('/ai-content/generations')
      return (response.data.items || []) as ContentGeneration[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (generationId: string) => {
      await api.delete(`/ai-content/generations/${generationId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ai-content', 'generations'],
      })
    },
  })

  const deleteGeneration = async (generationId: string) => {
    await deleteMutation.mutateAsync(generationId)
    if (selectedGeneration?.id === generationId) {
      setSelectedGeneration(null)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (_err) {
      // Silently handle clipboard errors (e.g., insufficient permissions)
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
      minute: '2-digit',
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
        <Icon className='mr-1 h-3 w-3' />
        {status}
      </Badge>
    )
  }

  const filteredGenerations = generations.filter((generation) => {
    const matchesSearch =
      generation.template_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      generation.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTemplate =
      filterTemplate === 'all' || generation.template_name === filterTemplate
    const matchesStatus =
      filterStatus === 'all' || generation.status === filterStatus
    return matchesSearch && matchesTemplate && matchesStatus
  })

  const templates = Array.from(new Set(generations.map((g) => g.template_name)))

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Failed to fetch content history'

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex h-64 items-center justify-center'>
          <div className='space-y-2 text-center'>
            <Loader2 className='mx-auto h-8 w-8 animate-spin text-gray-400' />
            <p className='text-muted-foreground'>
              {t('aiContent.loadingHistory', 'Loading content history...')}
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
            {t('aiContent.contentHistory', 'Content History')}
          </h2>
          <p className='text-muted-foreground'>
            {t(
              'aiContent.historyDescription',
              'View and manage your generated content'
            )}
          </p>
        </div>
        <Button onClick={() => refetch()} variant='outline'>
          <History className='mr-2 h-4 w-4' />
          {t('aiContent.refresh', 'Refresh')}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400' />
                <Input
                  placeholder={t(
                    'aiContent.searchHistory',
                    'Search content history...'
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <Button
                variant={filterTemplate === 'all' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilterTemplate('all')}
              >
                {t('aiContent.allTemplates', 'All Templates')}
              </Button>
              {templates.map((template) => (
                <Button
                  key={template}
                  variant={filterTemplate === template ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setFilterTemplate(template)}
                >
                  {template}
                </Button>
              ))}
            </div>
            <div className='flex gap-2'>
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilterStatus('all')}
              >
                {t('aiContent.allStatus', 'All Status')}
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilterStatus('completed')}
              >
                {t('aiContent.completed', 'Completed')}
              </Button>
              <Button
                variant={filterStatus === 'failed' ? 'default' : 'outline'}
                size='sm'
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
        <Alert variant='destructive'>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Generations List */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>
                {t('aiContent.generations', 'Generations')} (
                {filteredGenerations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredGenerations.length === 0 ? (
                <div className='py-12 text-center'>
                  <History className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                  <h3 className='mb-2 font-medium text-gray-900 text-lg'>
                    {t('aiContent.noGenerations', 'No content generated yet')}
                  </h3>
                  <p className='text-gray-500'>
                    {searchQuery
                      ? t(
                          'aiContent.noGenerationsMatch',
                          'No generations match your search'
                        )
                      : t(
                          'aiContent.generateFirstContent',
                          'Generate your first content to see it here'
                        )}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t('aiContent.template', 'Template')}
                      </TableHead>
                      <TableHead>{t('aiContent.preview', 'Preview')}</TableHead>
                      <TableHead>{t('aiContent.status', 'Status')}</TableHead>
                      <TableHead>{t('aiContent.created', 'Created')}</TableHead>
                      <TableHead className='w-12'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGenerations.map((generation) => (
                      <TableRow
                        key={generation.id}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          selectedGeneration?.id === generation.id
                            ? 'bg-blue-50'
                            : ''
                        }`}
                        onClick={() => setSelectedGeneration(generation)}
                      >
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <FileText className='h-4 w-4 text-gray-400' />
                            <span className='font-medium'>
                              {generation.template_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='max-w-xs'>
                            <p className='truncate text-gray-600 text-sm'>
                              {formatContentPreview(generation.content)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(generation.status)}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1 text-gray-500 text-sm'>
                            <Calendar className='h-3 w-3' />
                            {formatDate(generation.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                onClick={() =>
                                  setSelectedGeneration(generation)
                                }
                              >
                                <Eye className='mr-2 h-4 w-4' />
                                {t('aiContent.view', 'View')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  copyToClipboard(generation.content)
                                }
                              >
                                <Copy className='mr-2 h-4 w-4' />
                                {t('aiContent.copy', 'Copy')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => downloadContent(generation)}
                              >
                                <Download className='mr-2 h-4 w-4' />
                                {t('aiContent.download', 'Download')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteGeneration(generation.id)}
                                className='text-red-600'
                              >
                                <Trash2 className='mr-2 h-4 w-4' />
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
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Eye className='h-5 w-5' />
                {t('aiContent.contentPreview', 'Content Preview')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedGeneration ? (
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>
                        {t('aiContent.template', 'Template')}
                      </span>
                      <Badge variant='outline'>
                        {selectedGeneration.template_name}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>
                        {t('aiContent.status', 'Status')}
                      </span>
                      {getStatusBadge(selectedGeneration.status)}
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>
                        {t('aiContent.tokens', 'Tokens')}
                      </span>
                      <span className='text-sm'>
                        {selectedGeneration.tokens_used}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>
                        {t('aiContent.cost', 'Cost')}
                      </span>
                      <span className='text-sm'>
                        ${selectedGeneration.cost.toFixed(4)}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>
                        {t('aiContent.created', 'Created')}
                      </span>
                      <span className='text-sm'>
                        {formatDate(selectedGeneration.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className='border-t pt-4'>
                    <h4 className='mb-2 font-medium text-sm'>
                      {t('aiContent.content', 'Content')}
                    </h4>
                    <div className='max-h-64 overflow-y-auto rounded-lg bg-gray-50 p-3'>
                      <pre className='whitespace-pre-wrap font-sans text-xs leading-relaxed'>
                        {selectedGeneration.content}
                      </pre>
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        copyToClipboard(selectedGeneration.content)
                      }
                      className='flex-1 gap-2'
                    >
                      <Copy className='h-4 w-4' />
                      {t('aiContent.copy', 'Copy')}
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => downloadContent(selectedGeneration)}
                      className='flex-1 gap-2'
                    >
                      <Download className='h-4 w-4' />
                      {t('aiContent.download', 'Download')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='py-8 text-center'>
                  <Eye className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                  <p className='text-gray-500 text-sm'>
                    {t(
                      'aiContent.selectGeneration',
                      'Select a generation to preview'
                    )}
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
