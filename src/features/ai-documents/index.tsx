import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileText, MessageSquare, Settings } from 'lucide-react'
import { DocumentUpload } from './components/document-upload'
import { DocumentLibrary } from './components/document-library'
import { DocumentChat } from './components/document-chat'
import { DocumentSettings } from './components/document-settings'

export default function AIDocumentsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('upload')
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('aiDocuments.title', 'AI Document Intelligence')}
          </h1>
          <p className="text-muted-foreground">
            {t('aiDocuments.description', 'Upload, process, and chat with your documents using AI')}
          </p>
        </div>
        <Button size="lg" className="gap-2">
          <Upload className="h-4 w-4" />
          {t('aiDocuments.uploadDocument', 'Upload Document')}
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            {t('aiDocuments.upload', 'Upload')}
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-2">
            <FileText className="h-4 w-4" />
            {t('aiDocuments.library', 'Library')}
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2" disabled={!selectedDocument}>
            <MessageSquare className="h-4 w-4" />
            {t('aiDocuments.chat', 'Chat')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            {t('aiDocuments.settings', 'Settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <DocumentUpload onUploadSuccess={(docId) => {
            setSelectedDocument(docId)
            setActiveTab('library')
          }} />
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <DocumentLibrary 
            onDocumentSelect={setSelectedDocument}
            selectedDocument={selectedDocument}
            onStartChat={() => setActiveTab('chat')}
          />
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          {selectedDocument ? (
            <DocumentChat documentId={selectedDocument} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {t('aiDocuments.selectDocumentToChat', 'Select a document to start chatting')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <DocumentSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
