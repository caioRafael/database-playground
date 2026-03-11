'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useDatabaseContext } from '@/context/database-context'
import type { DatabaseSchema } from '@/interface/database-types'
import { Sparkles, Send, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function DatabaseAIChat() {
  const { setSchema } = useDatabaseContext()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingSchema, setPendingSchema] = useState<DatabaseSchema | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [open, messages])

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
        body: JSON.stringify({ messages: conversation }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || `Erro ${res.status}`)
        setLoading(false)
        return
      }

      const schema = data.schema as DatabaseSchema
      if (schema?.tables && Array.isArray(schema.tables)) {
        setPendingSchema(schema)
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Pronto! Gerei um modelo com ${schema.tables.length} tabela(s) e ${schema.relationships?.length ?? 0} relacionamento(s). Clique em "Aplicar ao canvas" para usar.`,
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
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Gerar com IA
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-xl flex flex-col max-h-[85vh]"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Gerar modelo relacional com IA
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Descreva o banco que você quer (ex: &quot;e-commerce com usuários, pedidos e produtos&quot;) e a IA gera o modelo.
        </p>
        <ScrollArea className="flex-1 min-h-[200px] max-h-[320px] rounded-lg border bg-muted/30 p-3">
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
      </DialogContent>
    </Dialog>
  )
}
