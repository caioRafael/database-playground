'use client'

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useDatabaseContext } from "@/context/database-context"
import type { DatabaseSchema } from "@/interface/database-types"

export function DatabaseImportSchemaButton() {
  const { setSchema } = useDatabaseContext()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [importing, setImporting] = useState(false)

  const handleClick = () => {
    if (importing) return
    inputRef.current?.click()
  }

  const handleImportJson = async (file: File | null) => {
    if (!file || importing) return
    setImporting(true)

    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as unknown

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !Array.isArray((parsed as { tables?: unknown }).tables) ||
        !Array.isArray((parsed as { relationships?: unknown }).relationships)
      ) {
        window.alert("JSON inválido. Use um arquivo exportado deste playground.")
        return
      }

      setSchema(parsed as DatabaseSchema)
    } catch {
      window.alert("Não foi possível ler o arquivo. Verifique o conteúdo e tente novamente.")
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null
          void handleImportJson(file)
          event.target.value = ""
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleClick}
        disabled={importing}
      >
        <Upload className="h-4 w-4" />
        Importar modelo
      </Button>
    </>
  )
}

