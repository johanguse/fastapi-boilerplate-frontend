import { AlertCircle, CheckCircle, FileText, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
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
import { Progress } from '@/components/ui/progress'
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

// Helper to extract error message from unknown error
const getErrorMessage = (error: unknown): string => {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'detail' in error.response.data &&
    typeof error.response.data.detail === 'string'
  ) {
    return error.response.data.detail
  }
  return 'Upload failed'
}

export function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const { t } = useTranslation()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: true,
  })

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const uploadFile = async (uploadFile: UploadFile) => {
    const formData = new FormData()
    formData.append('file', uploadFile.file)

    try {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        )
      )

      // Upload file
      const response = await api.post('/ai-documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          setFiles((prev) =>
            prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f))
          )
        },
      })

      // Update status to processing
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: 'processing', progress: 100 }
            : f
        )
      )

      // Wait for processing to complete (polling)
      const documentId = response.data.document_id
      await pollProcessingStatus(documentId, uploadFile.id)
    } catch (error: unknown) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: 'error',
                error: getErrorMessage(error),
                progress: 0,
              }
            : f
        )
      )
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
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, status: 'completed', documentId } : f
            )
          )
          onUploadSuccess(documentId)
          return
        } else if (document.status === 'failed') {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, status: 'error', error: 'Processing failed' }
                : f
            )
          )
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000) // Poll every 10 seconds
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, status: 'error', error: 'Processing timeout' }
                : f
            )
          )
        }
      } catch (_error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: 'error', error: 'Failed to check status' }
              : f
          )
        )
      }
    }

    setTimeout(poll, 2000) // Start polling after 2 seconds
  }

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')
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
        return <CheckCircle className='h-4 w-4 text-green-500' />
      case 'error':
        return <AlertCircle className='h-4 w-4 text-red-500' />
      case 'uploading':
      case 'processing':
        return (
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
        )
      default:
        return <FileText className='h-4 w-4 text-gray-500' />
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
    <div className='space-y-6'>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            {t('aiDocuments.uploadDocuments', 'Upload Documents')}
          </CardTitle>
          <CardDescription>
            {t(
              'aiDocuments.uploadDescription',
              'Upload PDF, DOCX, or TXT files to process with AI'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }
            `}
          >
            <input {...getInputProps()} />
            <Upload className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <p className='mb-2 font-medium text-lg'>
              {isDragActive
                ? t('aiDocuments.dropFilesHere', 'Drop files here...')
                : t(
                    'aiDocuments.dragDropFiles',
                    'Drag & drop files here, or click to select'
                  )}
            </p>
            <p className='text-gray-500 text-sm'>
              {t(
                'aiDocuments.supportedFormats',
                'PDF, DOCX, TXT files up to 10MB'
              )}
            </p>
          </div>

          {files.length > 0 && (
            <div className='mt-6'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='font-medium text-lg'>
                  {t('aiDocuments.selectedFiles', 'Selected Files')} (
                  {files.length})
                </h3>
                <Button
                  onClick={uploadAllFiles}
                  disabled={
                    isUploading || files.every((f) => f.status !== 'pending')
                  }
                  className='gap-2'
                >
                  <Upload className='h-4 w-4' />
                  {isUploading
                    ? t('aiDocuments.uploading', 'Uploading...')
                    : t('aiDocuments.uploadAll', 'Upload All')}
                </Button>
              </div>

              <div className='space-y-3'>
                {files.map((file) => (
                  <div
                    key={file.id}
                    className='flex items-center gap-4 rounded-lg border p-4'
                  >
                    <div className='text-2xl'>{getFileIcon(file.file)}</div>

                    <div className='min-w-0 flex-1'>
                      <div className='mb-1 flex items-center gap-2'>
                        <p className='truncate font-medium text-sm'>
                          {file.file.name}
                        </p>
                        <Badge className={getStatusColor(file.status)}>
                          {file.status}
                        </Badge>
                      </div>

                      <div className='flex items-center gap-2'>
                        {getStatusIcon(file.status)}
                        <p className='text-gray-500 text-xs'>
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className='mt-2' />
                      )}

                      {file.error && (
                        <Alert className='mt-2'>
                          <AlertCircle className='h-4 w-4' />
                          <AlertDescription>{file.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => removeFile(file.id)}
                      disabled={
                        file.status === 'uploading' ||
                        file.status === 'processing'
                      }
                    >
                      <X className='h-4 w-4' />
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
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 gap-4 text-center md:grid-cols-3'>
            <div>
              <div className='font-bold text-2xl text-blue-600'>PDF</div>
              <div className='text-gray-500 text-sm'>
                {t('aiDocuments.pdfSupport', 'PDF documents')}
              </div>
            </div>
            <div>
              <div className='font-bold text-2xl text-green-600'>DOCX</div>
              <div className='text-gray-500 text-sm'>
                {t('aiDocuments.docxSupport', 'Word documents')}
              </div>
            </div>
            <div>
              <div className='font-bold text-2xl text-purple-600'>TXT</div>
              <div className='text-gray-500 text-sm'>
                {t('aiDocuments.txtSupport', 'Text files')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
