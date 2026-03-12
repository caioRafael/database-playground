'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useDatabaseContext } from "@/context/database-context"
import { Loader2, Sparkles, Copy, Check } from "lucide-react"

const STORAGE_KEY_PREFIX = "database-playground-generated-code:"

const LANGUAGE_OPTIONS = [
  { value: "sql-postgres", label: "SQL - PostgreSQL" },
  { value: "sql-mysql", label: "SQL - MySQL" },
  { value: "sql-sqlserver", label: "SQL - SQL Server" },
  { value: "sqlite", label: "SQL - SQLite" },
  { value: "prisma", label: "Prisma (Node.js / TS)" },
  { value: "typeorm", label: "TypeORM (Node.js / TS)" },
  { value: "sequelize", label: "Sequelize (Node.js)" },
  { value: "knex", label: "Knex.js (Node.js)" },
  { value: "laravel-migrations", label: "Laravel Migrations (PHP)" },
  { value: "eloquent", label: "Eloquent Models (PHP)" },
  { value: "django-models", label: "Django Models (Python)" },
  { value: "sqlalchemy", label: "SQLAlchemy (Python)" },
  { value: "hibernate", label: "Hibernate / JPA (Java)" },
  { value: "spring-data-jpa", label: "Spring Data JPA (Java)" },
  { value: "jooq", label: "jOOQ (Java)" },
  { value: "entity-framework", label: "Entity Framework (C#)" },
  { value: "ef-core", label: "Entity Framework Core (C#)" },
  { value: "custom", label: "Outra linguagem ou ORM..." },
] as const

type LanguageValue = (typeof LANGUAGE_OPTIONS)[number]["value"]

export function DatabaseGenerateCodeModal() {
  const { schema } = useDatabaseContext()

  const [open, setOpen] = useState(false)
  const [language, setLanguage] = useState<LanguageValue>("sql-postgres")
  const [code, setCode] = useState("")
  const [customTarget, setCustomTarget] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const hasSchema = schema.tables.length > 0

  useEffect(() => {
    if (!open) return
    try {
      const keySuffix =
        language === "custom"
          ? `custom:${customTarget.trim().toLowerCase() || "vazio"}`
          : language
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + keySuffix)
      if (stored) {
        setCode(stored)
      }
    } catch {
      // ignore storage errors
    }
  }, [open, language, customTarget])

  const handleGenerate = async () => {
    if (!hasSchema || loading) return

    const finalTarget =
      language === "custom" ? customTarget.trim() : LANGUAGE_OPTIONS.find(opt => opt.value === language)?.label ?? language

    if (language === "custom" && !finalTarget) {
      setError("Informe uma linguagem ou ORM válida.")
      return
    }

    setLoading(true)
    setError(null)
    setCopied(false)

    try {
      const res = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema,
          target: finalTarget,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (res.status === 401) {
          setError(
            data.error ||
              "Você precisa estar autenticado para usar a IA."
          )
          return
        }

        if (res.status === 402) {
          setError(
            data.error ||
              "Você não possui créditos suficientes. Adicione créditos na página de perfil."
          )
          return
        }

        setError(data.error || `Erro ${res.status}`)
        return
      }

      if (typeof data.code !== "string" || !data.code.trim()) {
        setError("A IA não retornou um código válido.")
        return
      }

      setCode(data.code)
      try {
        const keySuffix =
          language === "custom"
            ? `custom:${finalTarget.toLowerCase()}`
            : language
        localStorage.setItem(STORAGE_KEY_PREFIX + keySuffix, data.code)
      } catch {
        // ignore storage errors
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao chamar a IA.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!code.trim()) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setError(null)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Gerar código
        </Button>
      </DialogTrigger>

      <DialogContent className="p-4 sm:p-6 w-full max-w-6xl max-h-[calc(100vh-200px)]">
        <DialogHeader>
          <DialogTitle>Gerar código do banco com IA</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Linguagem / ORM
            </span>
            <Select
              value={language}
              onValueChange={(value) => {
                setLanguage(value as LanguageValue)
                setError(null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a linguagem ou ORM" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {language === "custom" && (
              <Input
                value={customTarget}
                onChange={(e) => setCustomTarget(e.target.value)}
                placeholder={'Ex: "Objection.js", "GORM (Go)", "Ecto (Elixir)"...'}
                className="mt-1"
              />
            )}
            <p className="text-[10px] text-muted-foreground">
              A IA só deve gerar código para linguagens e ORMs que existem de fato.
            </p>
          </div>

          {!hasSchema && (
            <p className="text-xs text-destructive">
              Crie pelo menos uma tabela no canvas para gerar o código.
            </p>
          )}

            <p className="text-xs text-muted-foreground">
              A IA irá converter o modelo atual do canvas em código pronto para uso neste alvo.
            </p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!code.trim()}
                className="gap-1"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copiar
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleGenerate}
                disabled={
                  !hasSchema ||
                  loading ||
                  (language === "custom" && !customTarget.trim())
                }
                className="gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Gerar código com IA
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Código gerado (salvo automaticamente no navegador)
            </span>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="min-h-[160px] max-h-[40vh] font-mono text-xs resize-none"
              placeholder="O código gerado aparecerá aqui..."
            />
            {error && (
              <p className="text-xs text-destructive">
                {error}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

