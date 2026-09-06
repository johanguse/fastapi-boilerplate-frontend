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
    <Card className='mx-auto flex h-[600px] w-full max-w-2xl flex-col border-border shadow-soft-xl'>
      <div className='flex items-center justify-between border-b p-4'>
        <h3 className='flex items-center gap-2 font-semibold text-lg'>
          <Bot className='h-5 w-5 text-primary' />
          AI Assistant
        </h3>
        <select
          className='rounded border bg-background p-1 text-sm'
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
          <div className='flex h-full items-center justify-center text-muted-foreground'>
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
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10'>
                    <Bot className='h-5 w-5 text-primary' />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border/50 bg-muted/50 text-foreground'
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
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary'>
                    <User className='h-5 w-5 text-secondary-foreground' />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className='flex justify-start gap-3'>
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10'>
                  <Bot className='h-5 w-5 text-primary' />
                </div>
                <div className='flex items-center gap-2 rounded-2xl border border-border/50 bg-muted/50 px-4 py-3'>
                  <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                  <span className='text-muted-foreground text-sm'>
                    Thinking...
                  </span>
                </div>
              </div>
            )}
            {error && (
              <div className='mt-4 rounded bg-destructive/10 p-3 text-destructive text-sm'>
                An error occurred: {error.message}
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className='rounded-b-xl border-t bg-background p-4'>
        <form onSubmit={handleSubmit} className='flex gap-2'>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder='Type your message...'
            className='flex-1'
            disabled={isLoading}
          />
          <Button type='submit' disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <SendHorizontal className='h-4 w-4' />
            )}
            <span className='sr-only'>Send</span>
          </Button>
        </form>
      </div>
    </Card>
  )
}
