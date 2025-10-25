import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  FileText, 
  Loader2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react'
import { api } from '@/lib/api'

interface ChatMessage {
  id: string
  question: string
  answer: string
  context_chunks?: string[]
  created_at: string
  tokens_used?: number
  cost?: number
}

interface DocumentChatProps {
  documentId: string
}

export function DocumentChat({ documentId }: DocumentChatProps) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [document, setDocument] = useState<any>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchDocument()
    fetchChatHistory()
  }, [documentId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchDocument = async () => {
    try {
      const response = await api.get(`/ai-documents/${documentId}`)
      setDocument(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch document')
    }
  }

  const fetchChatHistory = async () => {
    try {
      const response = await api.get(`/ai-documents/${documentId}/chats`)
      setMessages(response.data.items || [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch chat history')
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const question = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post(`/ai-documents/${documentId}/chat`, {
        question,
      })

      const newMessage: ChatMessage = {
        id: response.data.id,
        question,
        answer: response.data.answer,
        context_chunks: response.data.context_chunks,
        created_at: response.data.created_at,
        tokens_used: response.data.tokens_used,
        cost: response.data.cost,
      }

      setMessages(prev => [...prev, newMessage])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!document) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
            <p className="text-muted-foreground">
              {t('aiDocuments.loadingDocument', 'Loading document...')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Document Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {document.name}
          </CardTitle>
          <CardDescription>
            {document.summary || t('aiDocuments.noSummary', 'No summary available')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="outline">
              {document.file_type}
            </Badge>
            <span>
              {t('aiDocuments.status', 'Status')}: {document.status}
            </span>
            {document.key_points && document.key_points.length > 0 && (
              <span>
                {t('aiDocuments.keyPoints', 'Key Points')}: {document.key_points.length}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t('aiDocuments.chatWithDocument', 'Chat with Document')}
          </CardTitle>
          <CardDescription>
            {t('aiDocuments.chatDescription', 'Ask questions about the document content')}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('aiDocuments.startConversation', 'Start a conversation')}
                  </h3>
                  <p className="text-gray-500">
                    {t('aiDocuments.askQuestion', 'Ask a question about the document to get started')}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="space-y-4">
                    {/* User Question */}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="text-sm">{message.question}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(message.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-white border rounded-lg p-3">
                          <p className="text-sm whitespace-pre-wrap">{message.answer}</p>
                          
                          {/* Context Chunks */}
                          {message.context_chunks && message.context_chunks.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs font-medium text-gray-600 mb-2">
                                {t('aiDocuments.relevantSections', 'Relevant sections:')}
                              </p>
                              <div className="space-y-1">
                                {message.context_chunks.map((chunk, index) => (
                                  <div key={index} className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                    {chunk}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Usage Info */}
                          {(message.tokens_used || message.cost) && (
                            <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs text-gray-500">
                              {message.tokens_used && (
                                <span>
                                  {t('aiDocuments.tokens', 'Tokens')}: {message.tokens_used}
                                </span>
                              )}
                              {message.cost && (
                                <span>
                                  {t('aiDocuments.cost', 'Cost')}: ${message.cost.toFixed(4)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {formatDate(message.created_at)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => copyToClipboard(message.answer, message.id)}
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white border rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-500">
                          {t('aiDocuments.thinking', 'AI is thinking...')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Input */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder={t('aiDocuments.askQuestion', 'Ask a question about the document...')}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!inputMessage.trim() || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {t('aiDocuments.send', 'Send')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
