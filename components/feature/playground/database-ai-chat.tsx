'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDatabaseContext } from '@/context/database-context'
import type { DatabaseSchema } from '@/interface/database-types'
import { Sparkles, Send, Loader2, X } from 'lucide-react'
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
  const router = useRouter()
  const { schema, setSchema, setIsGeneratingWithAI } = useDatabaseContext()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingCredits, setCheckingCredits] = useState(false)
  const [hasCredits, setHasCredits] = useState<boolean | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [isOpen, messages])

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false

    const fetchCredits = async () => {
      setCheckingCredits(true)
      try {
        const res = await fetch('/api/credits')
        if (!res.ok) {
          if (!cancelled) {
            setHasCredits(false)
          }
          return
        }

        const data = await res.json()
        const credits =
          typeof data.credits === 'number' ? data.credits : 0

        if (!cancelled) {
          setHasCredits(credits > 0)
        }
      } catch {
        if (!cancelled) {
          setHasCredits(false)
        }
      } finally {
        if (!cancelled) {
          setCheckingCredits(false)
        }
      }
    }

    fetchCredits()

    return () => {
      cancelled = true
    }
  }, [isOpen])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    // Revalida créditos sempre que o usuário tenta enviar
    try {
      const creditsRes = await fetch('/api/credits')
      if (!creditsRes.ok) {
        setHasCredits(false)
        setError('Não foi possível verificar seus créditos agora. Tente novamente em alguns instantes.')
        return
      }
      const creditsData = await creditsRes.json()
      const credits =
        typeof creditsData.credits === 'number' ? creditsData.credits : 0
      const stillHasCredits = credits > 0
      setHasCredits(stillHasCredits)
      if (!stillHasCredits) {
        setError('Você precisa de créditos para usar a IA. Vá até a página de perfil para comprar mais créditos.')
        return
      }
    } catch {
      setHasCredits(false)
      setError('Não foi possível verificar seus créditos agora. Tente novamente em alguns instantes.')
      return
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setError(null)
    setLoading(true)
    setIsGeneratingWithAI(true)

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
        setIsGeneratingWithAI(false)
        return
      }

      const newSchema = data.schema as DatabaseSchema
      if (newSchema?.tables && Array.isArray(newSchema.tables)) {
        // aplica imediatamente ao canvas
        setSchema(newSchema)
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Pronto! Gerei um modelo com ${newSchema.tables.length} tabela(s) e ${newSchema.relationships?.length ?? 0} relacionamento(s). O canvas já foi atualizado automaticamente.`,
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        setError('Schema inválido retornado pela IA.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao chamar a IA.')
    } finally {
      setLoading(false)
      setIsGeneratingWithAI(false)
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
            <ScrollArea className="max-h-[calc(100vh-200px)] flex-1 rounded-lg border bg-muted/30 p-3">
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

            {checkingCredits || hasCredits === null ? (
              <div className="text-sm text-muted-foreground text-center py-2">
                Verificando créditos disponíveis...
              </div>
            ) : hasCredits ? (
              <div className="flex gap-2">
                <Textarea
                  placeholder="Descreva o banco de dados..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={loading}
                  className="min-h-[44px] max-h-32 resize-none"
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
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  Você não possui créditos suficientes para usar a IA de geração de modelo.
                </p>
                <Button
                  className="w-full"
                  onClick={() => router.push('/profile')}
                >
                  Ir para a página de perfil para comprar créditos
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
