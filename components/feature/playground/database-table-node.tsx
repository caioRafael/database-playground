'use client'

import { useDatabaseContext } from "@/context/database-context"
import { Table } from "@/interface/database-types"
import { GripVertical, Key, Link2, Table2 } from "lucide-react"

interface DatabaseTableNodeProps {
    table: Table
    onDragStart: (e: MouseEvent, tableId: string) => void
  }
  

export function DatabaseTableNode({ table, onDragStart }: DatabaseTableNodeProps) {
    const { selectedTableId, selectedColumnId, setSelectedTableId, setSelectedColumnId } = useDatabaseContext()
    const isSelected = selectedTableId === table.id

    const handleTableClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        setSelectedTableId(table.id)
        setSelectedColumnId(null)
      }
    
      const handleColumnClick = (e: MouseEvent, columnId: string) => {
        e.stopPropagation()
        setSelectedTableId(table.id)
        setSelectedColumnId(columnId)
      }
    
    return (
        <div
        className={`absolute z-10 min-w-[220px] select-none rounded-lg border bg-card shadow-lg transition-shadow ${
          isSelected 
            ? 'border-primary shadow-primary/20 ring-1 ring-primary' 
            : 'border-border hover:border-muted-foreground/50'
        }`}
        style={{
          left: table.position.x,
          top: table.position.y,
        }}
        onClick={handleTableClick}
      >
        {/* Header */}
        <div
          className="flex cursor-move items-center gap-2 rounded-t-lg border-b border-border bg-secondary px-3 py-2"
          onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => onDragStart(e as unknown as MouseEvent, table.id)}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <Table2 className="h-4 w-4 text-primary" />
          <span className="font-medium text-card-foreground">{table.name}</span>
        </div>
  
        {/* Columns */}
        <div className="flex flex-col">
          {table.columns.map((column, index) => (
            <div
              key={column.id}
              data-column-id={column.id}
              data-table-id={table.id}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => handleColumnClick(e as unknown as MouseEvent, column.id)}
              className={`flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                index === table.columns.length - 1 ? 'rounded-b-lg' : ''
              } ${
                selectedColumnId === column.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-card-foreground hover:bg-muted/50'
              }`}
            >
              <div className="flex w-4 items-center justify-center">
                {column.isPrimaryKey && <Key className="h-3 w-3 text-amber-500" />}
                {column.isForeignKey && !column.isPrimaryKey && <Link2 className="h-3 w-3 text-primary" />}
              </div>
              <span className="flex-1 truncate">{column.name}</span>
              <span className="text-xs text-muted-foreground">{column.type}</span>
              {!column.isNullable && (
                <span className="text-[10px] text-destructive">*</span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
}