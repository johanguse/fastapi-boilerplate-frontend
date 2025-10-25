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
  MessageSquare, 
  Download, 
  Trash2, 
  Eye,
  Calendar,
  Clock
} from 'lucide-react'
import { api } from '@/lib/api'

interface Document {
  id: string
  name: string
  status: 'processing' | 'completed' | 'failed'
  summary?: string
  key_points?: string[]
  created_at: string
  file_size: number
  file_type: string
}

interface DocumentLibraryProps {
  onDocumentSelect: (documentId: string) => void
  selectedDocument: string | null
  onStartChat: () => void
}

export function DocumentLibrary({ onDocumentSelect, selectedDocument, onStartChat }: DocumentLibraryProps) {
  const { t } = useTranslation()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/ai-documents/')
      setDocuments(response.data.items || [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      await api.delete(`/ai-documents/${documentId}`)
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      if (selectedDocument === documentId) {
        onDocumentSelect('')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete document')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  const getStatusBadge = (status: Document['status']) => {
    const statusConfig = {
      processing: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', icon: FileText },
      failed: { color: 'bg-red-100 text-red-800', icon: FileText },
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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">
              {t('aiDocuments.loadingDocuments', 'Loading documents...')}
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
            {t('aiDocuments.documentLibrary', 'Document Library')}
          </h2>
          <p className="text-muted-foreground">
            {t('aiDocuments.libraryDescription', 'Manage and interact with your AI-processed documents')}
          </p>
        </div>
        <Button onClick={fetchDocuments} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          {t('aiDocuments.refresh', 'Refresh')}
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
                  placeholder={t('aiDocuments.searchDocuments', 'Search documents...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                {t('aiDocuments.all', 'All')}
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('completed')}
              >
                {t('aiDocuments.completed', 'Completed')}
              </Button>
              <Button
                variant={filterStatus === 'processing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('processing')}
              >
                {t('aiDocuments.processing', 'Processing')}
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

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('aiDocuments.documents', 'Documents')} ({filteredDocuments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('aiDocuments.noDocuments', 'No documents found')}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? t('aiDocuments.noDocumentsMatch', 'No documents match your search')
                  : t('aiDocuments.uploadFirstDocument', 'Upload your first document to get started')
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('aiDocuments.name', 'Name')}</TableHead>
                  <TableHead>{t('aiDocuments.status', 'Status')}</TableHead>
                  <TableHead>{t('aiDocuments.size', 'Size')}</TableHead>
                  <TableHead>{t('aiDocuments.created', 'Created')}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow 
                    key={document.id}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedDocument === document.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onDocumentSelect(document.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{document.name}</div>
                          {document.summary && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {document.summary}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(document.status)}
                    </TableCell>
                    <TableCell>
                      {formatFileSize(document.file_size)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(document.created_at)}
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
                          <DropdownMenuItem onClick={() => onDocumentSelect(document.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('aiDocuments.view', 'View')}
                          </DropdownMenuItem>
                          {document.status === 'completed' && (
                            <DropdownMenuItem onClick={onStartChat}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              {t('aiDocuments.chat', 'Chat')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            {t('aiDocuments.download', 'Download')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteDocument(document.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('aiDocuments.delete', 'Delete')}
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
  )
}
