// @ts-nocheck
import { useChat } from '@tanstack/ai-react'
import { Bot, Loader2, SendHorizontal, User } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

export function Chat() {
  // Default api endpoint based on vite environment
  const [apiEndpoint, setApiEndpoint] = useState<string>(
    `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL_FASTAPI}/api/v1/chat/stream`
  )

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: apiEndpoint,
    })

  return (
    <Card className='flex flex-col h-[600px] w-full max-w-2xl mx-auto shadow-soft-xl border-border'>
      <div className='flex items-center justify-between p-4 border-b'>
        <h3 className='text-lg font-semibold flex items-center gap-2'>
          <Bot className='w-5 h-5 text-primary' />
          AI Assistant
        </h3>
        <select
          className='text-sm border rounded p-1 bg-background'
          value={apiEndpoint}
          onChange={(e) => setApiEndpoint(e.target.value)}
        >
          <option
            value={`${import.meta.env.VITE_API_URL_FASTAPI}/api/v1/chat/stream`}
          >
            FastAPI Backend
          </option>
          <option
            value={`${import.meta.env.VITE_API_URL_BUN}/api/v1/chat/stream`}
          >
            Hono/Bun Backend
          </option>
          <option value={`${import.meta.env.VITE_API_URL}/api/v1/chat/stream`}>
            Default / Fallback
          </option>
        </select>
      </div>

      <ScrollArea className='flex-1 p-4'>
        {messages.length === 0 ? (
          <div className='h-full flex items-center justify-center text-muted-foreground'>
            <p>Send a message to start the conversation.</p>
          </div>
        ) : (
          <div className='space-y-4 pb-4'>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role !== 'user' && (
                  <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
                    <Bot className='w-5 h-5 text-primary' />
                  </div>
                )}

                <div
                  className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-foreground border border-border/50'
                  }`}
                >
                  {m.role === 'user' ? (
                    <div className='whitespace-pre-wrap'>{m.content}</div>
                  ) : (
                    <div className='prose prose-sm dark:prose-invert max-w-none break-words'>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className='w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0'>
                    <User className='w-5 h-5 text-secondary-foreground' />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className='flex gap-3 justify-start'>
                <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
                  <Bot className='w-5 h-5 text-primary' />
                </div>
                <div className='px-4 py-3 rounded-2xl bg-muted/50 border border-border/50 flex items-center gap-2'>
                  <Loader2 className='w-4 h-4 animate-spin text-muted-foreground' />
                  <span className='text-sm text-muted-foreground'>
                    Thinking...
                  </span>
                </div>
              </div>
            )}
            {error && (
              <div className='p-3 rounded bg-destructive/10 text-destructive text-sm mt-4'>
                An error occurred: {error.message}
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className='p-4 border-t bg-background rounded-b-xl'>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(e)
          }}
          className='flex gap-2'
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder='Type your message...'
            className='flex-1'
            disabled={isLoading}
          />
          <Button type='submit' disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <SendHorizontal className='w-4 h-4' />
            )}
            <span className='sr-only'>Send</span>
          </Button>
        </form>
      </div>
    </Card>
  )
}
