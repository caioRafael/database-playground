'use client'

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDatabaseContext } from "@/context/database-context"
import type { TableAnchor, RelationshipPathType } from "@/interface/database-types"

type RelationshipType = 'one-to-one' | 'one-to-many' | 'many-to-many'

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

export function DatabaseRelationshipModal() {
    const { schema, addRelationship } = useDatabaseContext()

    const tables = schema.tables

    const [open, setOpen] = useState(false)
    const [sourceTableId, setSourceTableId] = useState<string | undefined>()
    const [sourceColumnId, setSourceColumnId] = useState<string | undefined>()
    const [targetTableId, setTargetTableId] = useState<string | undefined>()
    const [targetColumnId, setTargetColumnId] = useState<string | undefined>()
    const [relationshipType, setRelationshipType] = useState<RelationshipType>('one-to-many')
    const [sourceAnchor, setSourceAnchor] = useState<TableAnchor>('left')
    const [targetAnchor, setTargetAnchor] = useState<TableAnchor>('right')
    const [pathType, setPathType] = useState<RelationshipPathType>('curve')

    const sourceTable = useMemo(
        () => tables.find(t => t.id === sourceTableId),
        [tables, sourceTableId],
    )

    const targetTable = useMemo(
        () => tables.find(t => t.id === targetTableId),
        [tables, targetTableId],
    )

    const sourceColumns = sourceTable?.columns ?? []

    const targetColumns = useMemo(() => {
        if (!targetTable) return []
        // Preferencialmente chaves primárias ou únicas como alvo
        const primaryOrUnique = targetTable.columns.filter(c => c.isPrimaryKey || c.isUnique)
        return primaryOrUnique.length > 0 ? primaryOrUnique : targetTable.columns
    }, [targetTable])

    const canSubmit =
        !!sourceTableId &&
        !!targetTableId &&
        !!sourceColumnId &&
        !!targetColumnId &&
        sourceTableId !== targetTableId

    function resetState() {
        setSourceTableId(undefined)
        setSourceColumnId(undefined)
        setTargetTableId(undefined)
        setTargetColumnId(undefined)
        setRelationshipType('one-to-many')
        setSourceAnchor('left')
        setTargetAnchor('right')
        setPathType('curve')
    }

    function handleCreateRelationship() {
        if (!canSubmit || !sourceTableId || !sourceColumnId || !targetTableId || !targetColumnId) return

        addRelationship({
            sourceTableId,
            sourceColumnId,
            targetTableId,
            targetColumnId,
            type: relationshipType,
            sourceAnchor,
            targetAnchor,
            pathType,
        })

        setOpen(false)
        resetState()
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen)
                if (!nextOpen) {
                    resetState()
                }
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={tables.length < 2}>
                    Relacionar tabelas
                </Button>
            </DialogTrigger>
            <DialogContent className="p-4 sm:p-6 w-full min-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nova relação</DialogTitle>
                </DialogHeader>

                <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
                    <div className="w-full grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Tabela fonte</span>
                            <Select
                                value={sourceTableId}
                                onValueChange={(value) => {
                                    setSourceTableId(value)
                                    setSourceColumnId(undefined)
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a tabela fonte" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tables.map(table => (
                                        <SelectItem key={table.id} value={table.id}>
                                            {table.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Tabela destino</span>
                            <Select
                                value={targetTableId}
                                onValueChange={(value) => {
                                    setTargetTableId(value)
                                    setTargetColumnId(undefined)
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a tabela destino" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tables
                                        .filter(table => table.id !== sourceTableId)
                                        .map(table => (
                                            <SelectItem key={table.id} value={table.id}>
                                                {table.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Coluna fonte (FK)</span>
                            <Select
                                value={sourceColumnId}
                                onValueChange={setSourceColumnId}
                                disabled={!sourceTable}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={sourceTable ? "Selecione a coluna" : "Selecione a tabela fonte"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {sourceColumns.map(column => (
                                        <SelectItem key={column.id} value={column.id}>
                                            {column.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Coluna destino (PK/UK)</span>
                            <Select
                                value={targetColumnId}
                                onValueChange={setTargetColumnId}
                                disabled={!targetTable}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={targetTable ? "Selecione a coluna" : "Selecione a tabela destino"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {targetColumns.map(column => (
                                        <SelectItem key={column.id} value={column.id}>
                                            {column.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Tipo de relação</span>
                        <Select
                            value={relationshipType}
                            onValueChange={(value: RelationshipType) => setRelationshipType(value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="one-to-one">1 : 1 (one-to-one)</SelectItem>
                                <SelectItem value="one-to-many">1 : N (one-to-many)</SelectItem>
                                <SelectItem value="many-to-many">N : N (many-to-many)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Conexão na tabela fonte</span>
                            <Select value={sourceAnchor} onValueChange={(v: TableAnchor) => setSourceAnchor(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ANCHOR_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Conexão na tabela destino</span>
                            <Select value={targetAnchor} onValueChange={(v: TableAnchor) => setTargetAnchor(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ANCHOR_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Traçado da linha</span>
                            <Select value={pathType} onValueChange={(v: RelationshipPathType) => setPathType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PATH_TYPE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button size="sm" onClick={handleCreateRelationship} disabled={!canSubmit}>
                            Criar relação
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}