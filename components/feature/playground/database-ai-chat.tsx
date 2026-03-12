'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDatabaseContext } from '@/context/database-context'
import type { DatabaseSchema } from '@/interface/database-types'
import { Sparkles, Send, Loader2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface DatabaseAIChatProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function DatabaseAIChat({ isOpen, onOpenChange }: DatabaseAIChatProps) {
  const { schema, setSchema } = useDatabaseContext()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingSchema, setPendingSchema] = useState<DatabaseSchema | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [isOpen, messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setError(null)
    setLoading(true)

    const conversation = [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content,
    }))

    try {
      const res = await fetch('/api/generate-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversation,
          schema,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || `Erro ${res.status}`)
        setLoading(false)
        return
      }

      const newSchema = data.schema as DatabaseSchema
      if (newSchema?.tables && Array.isArray(newSchema.tables)) {
        setPendingSchema(newSchema)
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Pronto! Gerei um modelo com ${newSchema.tables.length} tabela(s) e ${newSchema.relationships?.length ?? 0} relacionamento(s). Clique em "Aplicar ao canvas" para usar.`,
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        setError('Schema inválido retornado pela IA.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao chamar a IA.')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (pendingSchema) {
      setSchema(pendingSchema)
      setPendingSchema(null)
    }
  }

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-full border-l bg-background/95 backdrop-blur-sm shadow-sm transition-all duration-300 ease-in-out',
        isOpen ? 'w-full max-w-md' : 'w-0'
      )}
    >
      {isOpen && (
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between px-3 py-2 border-b">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  Gerar modelo relacional com IA
                </span>
                <span className="text-xs text-muted-foreground">
                  Descreva o banco que você quer e a IA gera o modelo.
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar chat de IA</span>
            </Button>
          </header>

          <div className="flex-1 flex flex-col gap-3 p-3 min-h-0">
            <ScrollArea className="flex-1 rounded-lg border bg-muted/30 p-3">
              <div className="flex flex-col gap-3">
                {messages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Ex: &quot;Sistema de blog com posts, comentários e usuários&quot;
                  </p>
                )}
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm max-w-[90%]',
                      m.role === 'user'
                        ? 'ml-auto bg-primary text-primary-foreground'
                        : 'mr-auto bg-muted'
                    )}
                  >
                    {m.content}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando modelo...
                  </div>
                )}
                {error && (
                  <p className="text-sm text-destructive px-3 py-2">{error}</p>
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {pendingSchema && (
              <Button onClick={handleApply} className="gap-2 w-full">
                <Check className="h-4 w-4" />
                Aplicar ao canvas
              </Button>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Descreva o banco de dados..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={loading}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Enviar</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
