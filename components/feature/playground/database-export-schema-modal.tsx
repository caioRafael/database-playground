'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useDatabaseContext } from "@/context/database-context"
import { FileJson2, FileText, Loader2, Download } from "lucide-react"
import { toPng } from "html-to-image"
import { PDFDocument } from "pdf-lib"

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function generateDiagramPdf(): Promise<Blob> {
  const element = document.querySelector<HTMLElement>('[data-db-canvas-root="true"]')
  if (!element) {
    throw new Error("Canvas do diagrama não encontrado.")
  }

  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
  })

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage()
  const pngImage = await pdfDoc.embedPng(dataUrl)
  const { width, height } = pngImage.size()

  const pageWidth = page.getWidth()
  const pageHeight = page.getHeight()
  const scale = Math.min(pageWidth / width, pageHeight / height)
  const imgWidth = width * scale
  const imgHeight = height * scale

  page.drawImage(pngImage, {
    x: (pageWidth - imgWidth) / 2,
    y: (pageHeight - imgHeight) / 2,
    width: imgWidth,
    height: imgHeight,
  })

  const pdfBytes = await pdfDoc.save()
  const pdfArray = new Uint8Array(pdfBytes)
  return new Blob([pdfArray], { type: "application/pdf" })
}

export function DatabaseExportSchemaModal() {
  const { schema } = useDatabaseContext()
  const [open, setOpen] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)

  const hasSchema = schema.tables.length > 0

  const handleDownloadJson = () => {
    if (!hasSchema) return
    const json = JSON.stringify(schema, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const today = new Date().toISOString().slice(0, 10)
    downloadBlob(blob, `database-schema-${today}.json`)
  }

  const handleDownloadPdf = async () => {
    if (!hasSchema || loadingPdf) return
    try {
      setLoadingPdf(true)
      const blob = await generateDiagramPdf()
      const today = new Date().toISOString().slice(0, 10)
      downloadBlob(blob, `database-schema-${today}.pdf`)
    } catch (err) {
      console.error("Erro ao gerar PDF do diagrama:", err)
      window.alert("Não foi possível gerar o PDF do diagrama. Tente novamente e, se o erro persistir, atualize a página.")
    } finally {
      setLoadingPdf(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar schema
        </Button>
      </DialogTrigger>

      <DialogContent className="p-4 sm:p-6 w-full max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Exportar schema do banco</DialogTitle>
          <DialogDescription>
            Gere arquivos JSON ou PDF com o schema atual do canvas para documentação, versionamento e integrações.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Exporte o schema atual do canvas para documentação, versionamento ou integração com outros sistemas.
            </p>
            <p className="text-[11px] text-muted-foreground">
              O arquivo sempre reflete exatamente o estado atual do seu modelo no canvas.
            </p>
          </div>

          {!hasSchema && (
            <p className="text-xs text-destructive">
              Crie pelo menos uma tabela no canvas para poder exportar o schema.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="justify-start gap-2 h-auto py-3"
              disabled={!hasSchema}
              onClick={handleDownloadJson}
            >
              <FileJson2 className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Exportar como JSON</span>
                <span className="text-[11px] text-muted-foreground">
                  Ideal para integrações e versionamento.
                </span>
              </div>
            </Button>

            <Button
              type="button"
              variant="default"
              className="justify-start gap-2 h-auto py-3"
              disabled={!hasSchema || loadingPdf}
              onClick={handleDownloadPdf}
            >
              {loadingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Exportar como PDF</span>
                <span className="text-[11px] text-muted-foreground">
                  Resumo legível do schema para documentação.
                </span>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

