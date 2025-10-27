import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Bot,
  Check,
  Copy,
  FileText,
  Loader2,
  MessageSquare,
  Send,
  User,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
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

interface DocumentData {
  id: string
  name: string
  summary?: string
  file_type: string
  status: string
  key_points?: string[]
}

interface DocumentChatProps {
  documentId: string
}

export function DocumentChat({ documentId }: DocumentChatProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [inputMessage, setInputMessage] = useState('')
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const prevMessagesLengthRef = useRef(0)

  // Fetch document details
  const { data: document, isLoading: isLoadingDocument } = useQuery({
    queryKey: ['ai-documents', documentId],
    queryFn: async () => {
      const response = await api.get(`/ai-documents/${documentId}`)
      return response.data as DocumentData
    },
  })

  // Fetch chat history
  const { data: messages = [] } = useQuery({
    queryKey: ['ai-documents', documentId, 'chats'],
    queryFn: async () => {
      const response = await api.get(`/ai-documents/${documentId}/chats`)
      return (response.data.items || []) as ChatMessage[]
    },
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await api.post(`/ai-documents/${documentId}/chat`, {
        question,
      })
      return response.data as ChatMessage
    },
    onSuccess: () => {
      // Invalidate chats to refetch
      queryClient.invalidateQueries({
        queryKey: ['ai-documents', documentId, 'chats'],
      })
    },
  })

  const sendMessage = () => {
    if (!inputMessage.trim() || sendMessageMutation.isPending) return

    const question = inputMessage.trim()
    setInputMessage('')
    sendMessageMutation.mutate(question)
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
    } catch {
      // Silently handle clipboard errors
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (
      messages.length !== prevMessagesLengthRef.current &&
      messages.length > 0
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      prevMessagesLengthRef.current = messages.length
    }
  }, [messages.length])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoadingDocument || !document) {
    return (
      <Card>
        <CardContent className='flex h-64 items-center justify-center'>
          <div className='space-y-2 text-center'>
            <Loader2 className='mx-auto h-8 w-8 animate-spin text-gray-400' />
            <p className='text-muted-foreground'>
              {t('aiDocuments.loadingDocument', 'Loading document...')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Document Info */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            {document.name}
          </CardTitle>
          <CardDescription>
            {document.summary ||
              t('aiDocuments.noSummary', 'No summary available')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4 text-muted-foreground text-sm'>
            <Badge variant='outline'>{document.file_type}</Badge>
            <span>
              {t('aiDocuments.status', 'Status')}: {document.status}
            </span>
            {document.key_points && document.key_points.length > 0 && (
              <span>
                {t('aiDocuments.keyPoints', 'Key Points')}:{' '}
                {document.key_points.length}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className='flex h-[600px] flex-col'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MessageSquare className='h-5 w-5' />
            {t('aiDocuments.chatWithDocument', 'Chat with Document')}
          </CardTitle>
          <CardDescription>
            {t(
              'aiDocuments.chatDescription',
              'Ask questions about the document content'
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className='flex flex-1 flex-col'>
          {/* Messages */}
          <ScrollArea className='flex-1 pr-4'>
            <div className='space-y-4'>
              {messages.length === 0 ? (
                <div className='py-8 text-center'>
                  <MessageSquare className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                  <h3 className='mb-2 font-medium text-gray-900 text-lg'>
                    {t('aiDocuments.startConversation', 'Start a conversation')}
                  </h3>
                  <p className='text-gray-500'>
                    {t(
                      'aiDocuments.askQuestion',
                      'Ask a question about the document to get started'
                    )}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className='space-y-4'>
                    {/* User Question */}
                    <div className='flex gap-3'>
                      <div className='shrink-0'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100'>
                          <User className='h-4 w-4 text-blue-600' />
                        </div>
                      </div>
                      <div className='flex-1'>
                        <div className='rounded-lg bg-gray-100 p-3'>
                          <p className='text-sm'>{message.question}</p>
                        </div>
                        <p className='mt-1 text-gray-500 text-xs'>
                          {formatDate(message.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className='flex gap-3'>
                      <div className='shrink-0'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100'>
                          <Bot className='h-4 w-4 text-green-600' />
                        </div>
                      </div>
                      <div className='flex-1'>
                        <div className='rounded-lg border bg-white p-3'>
                          <p className='whitespace-pre-wrap text-sm'>
                            {message.answer}
                          </p>

                          {/* Context Chunks */}
                          {message.context_chunks &&
                            message.context_chunks.length > 0 && (
                              <div className='mt-3 border-t pt-3'>
                                <p className='mb-2 font-medium text-gray-600 text-xs'>
                                  {t(
                                    'aiDocuments.relevantSections',
                                    'Relevant sections:'
                                  )}
                                </p>
                                <div className='space-y-1'>
                                  {message.context_chunks.map(
                                    (chunk, index) => (
                                      <div
                                        key={index}
                                        className='rounded bg-gray-50 p-2 text-gray-500 text-xs'
                                      >
                                        {chunk}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Usage Info */}
                          {(message.tokens_used || message.cost) && (
                            <div className='mt-3 flex items-center gap-4 border-t pt-3 text-gray-500 text-xs'>
                              {message.tokens_used && (
                                <span>
                                  {t('aiDocuments.tokens', 'Tokens')}:{' '}
                                  {message.tokens_used}
                                </span>
                              )}
                              {message.cost && (
                                <span>
                                  {t('aiDocuments.cost', 'Cost')}: $
                                  {message.cost.toFixed(4)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className='mt-1 flex items-center gap-2'>
                          <p className='text-gray-500 text-xs'>
                            {formatDate(message.created_at)}
                          </p>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 px-2'
                            onClick={() =>
                              copyToClipboard(message.answer, message.id)
                            }
                          >
                            {copiedMessageId === message.id ? (
                              <Check className='h-3 w-3 text-green-600' />
                            ) : (
                              <Copy className='h-3 w-3' />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {sendMessageMutation.isPending && (
                <div className='flex gap-3'>
                  <div className='shrink-0'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100'>
                      <Bot className='h-4 w-4 text-green-600' />
                    </div>
                  </div>
                  <div className='flex-1'>
                    <div className='rounded-lg border bg-white p-3'>
                      <div className='flex items-center gap-2'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        <span className='text-gray-500 text-sm'>
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
          {sendMessageMutation.isError && (
            <Alert variant='destructive' className='mt-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                {t('aiDocuments.messageError', 'Failed to send message')}
              </AlertDescription>
            </Alert>
          )}

          {/* Input */}
          <div className='mt-4 border-t pt-4'>
            <div className='flex gap-2'>
              <Input
                ref={inputRef}
                placeholder={t(
                  'aiDocuments.askQuestion',
                  'Ask a question about the document...'
                )}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sendMessageMutation.isPending}
                className='flex-1'
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                className='gap-2'
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Send className='h-4 w-4' />
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
