'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDatabaseContext } from '@/context/database-context'
import type { TableAnchor, RelationshipPathType } from '@/interface/database-types'
import { Trash2 } from 'lucide-react'

const ANCHOR_OPTIONS: { value: TableAnchor; label: string }[] = [
  { value: 'left', label: 'Esquerda' },
  { value: 'right', label: 'Direita' },
  { value: 'top', label: 'Topo' },
  { value: 'bottom', label: 'Base' },
]

const PATH_TYPE_OPTIONS: { value: RelationshipPathType; label: string }[] = [
  { value: 'curve', label: 'Curva' },
  { value: 'orthogonal', label: 'Ângulos retos' },
]

export function DatabaseRelationshipOptionsPanel() {
  const {
    schema,
    selectedRelationshipId,
    setSelectedRelationshipId,
    updateRelationship,
    removeRelationship,
  } = useDatabaseContext()

  const rel = schema.relationships.find(r => r.id === selectedRelationshipId)
  if (!rel) return null

  const sourceTable = schema.tables.find(t => t.id === rel.sourceTableId)
  const targetTable = schema.tables.find(t => t.id === rel.targetTableId)
  const sourceAnchor = rel.sourceAnchor ?? 'left'
  const targetAnchor = rel.targetAnchor ?? 'right'
  const pathType = rel.pathType ?? 'curve'

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 px-4 py-2 text-sm">
      <span className="font-medium text-muted-foreground">Relação selecionada</span>
      <span className="text-muted-foreground">
        {sourceTable?.name} → {targetTable?.name}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={sourceAnchor}
          onValueChange={(v: TableAnchor) => updateRelationship(rel.id, { sourceAnchor: v })}
        >
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="Fonte" />
          </SelectTrigger>
          <SelectContent>
            {ANCHOR_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={targetAnchor}
          onValueChange={(v: TableAnchor) => updateRelationship(rel.id, { targetAnchor: v })}
        >
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="Destino" />
          </SelectTrigger>
          <SelectContent>
            {ANCHOR_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={pathType}
          onValueChange={(v: RelationshipPathType) => updateRelationship(rel.id, { pathType: v })}
        >
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue placeholder="Traçado" />
          </SelectTrigger>
          <SelectContent>
            {PATH_TYPE_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => {
          removeRelationship(rel.id)
          setSelectedRelationshipId(null)
        }}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Remover relação
      </Button>
    </div>
  )
}
