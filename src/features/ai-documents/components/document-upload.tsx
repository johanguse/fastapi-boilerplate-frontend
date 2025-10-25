import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'
import { api } from '@/lib/api'

interface DocumentUploadProps {
  onUploadSuccess: (documentId: string) => void
}

interface UploadFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  documentId?: string
}

export function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const { t } = useTranslation()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0,
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: true,
  })

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const uploadFile = async (uploadFile: UploadFile) => {
    const formData = new FormData()
    formData.append('file', uploadFile.file)

    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ))

      // Upload file
      const response = await api.post('/ai-documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress }
              : f
          ))
        },
      })

      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'processing', progress: 100 }
          : f
      ))

      // Wait for processing to complete (polling)
      const documentId = response.data.document_id
      await pollProcessingStatus(documentId, uploadFile.id)

    } catch (error: any) {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'error', 
              error: error.response?.data?.detail || 'Upload failed',
              progress: 0
            }
          : f
      ))
    }
  }

  const pollProcessingStatus = async (documentId: string, fileId: string) => {
    const maxAttempts = 30 // 5 minutes max
    let attempts = 0

    const poll = async () => {
      try {
        const response = await api.get(`/ai-documents/${documentId}`)
        const document = response.data

        if (document.status === 'completed') {
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'completed', documentId }
              : f
          ))
          onUploadSuccess(documentId)
          return
        } else if (document.status === 'failed') {
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'error', error: 'Processing failed' }
              : f
          ))
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000) // Poll every 10 seconds
        } else {
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'error', error: 'Processing timeout' }
              : f
          ))
        }
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error', error: 'Failed to check status' }
            : f
        ))
      }
    }

    setTimeout(poll, 2000) // Start polling after 2 seconds
  }

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsUploading(true)
    
    try {
      await Promise.all(pendingFiles.map(uploadFile))
    } finally {
      setIsUploading(false)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return '📄'
    if (file.type.includes('word')) return '📝'
    return '📄'
  }

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'uploading':
      case 'processing':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'uploading':
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t('aiDocuments.uploadDocuments', 'Upload Documents')}
          </CardTitle>
          <CardDescription>
            {t('aiDocuments.uploadDescription', 'Upload PDF, DOCX, or TXT files to process with AI')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {isDragActive 
                ? t('aiDocuments.dropFilesHere', 'Drop files here...')
                : t('aiDocuments.dragDropFiles', 'Drag & drop files here, or click to select')
              }
            </p>
            <p className="text-sm text-gray-500">
              {t('aiDocuments.supportedFormats', 'PDF, DOCX, TXT files up to 10MB')}
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {t('aiDocuments.selectedFiles', 'Selected Files')} ({files.length})
                </h3>
                <Button 
                  onClick={uploadAllFiles} 
                  disabled={isUploading || files.every(f => f.status !== 'pending')}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {isUploading 
                    ? t('aiDocuments.uploading', 'Uploading...')
                    : t('aiDocuments.uploadAll', 'Upload All')
                  }
                </Button>
              </div>

              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="text-2xl">{getFileIcon(file.file)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{file.file.name}</p>
                        <Badge className={getStatusColor(file.status)}>
                          {file.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusIcon(file.status)}
                        <p className="text-xs text-gray-500">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className="mt-2" />
                      )}

                      {file.error && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{file.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={file.status === 'uploading' || file.status === 'processing'}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">PDF</div>
              <div className="text-sm text-gray-500">
                {t('aiDocuments.pdfSupport', 'PDF documents')}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">DOCX</div>
              <div className="text-sm text-gray-500">
                {t('aiDocuments.docxSupport', 'Word documents')}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">TXT</div>
              <div className="text-sm text-gray-500">
                {t('aiDocuments.txtSupport', 'Text files')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
