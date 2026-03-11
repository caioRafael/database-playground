'use client'

import type { Relationship, Table } from '@/interface/database-types'

interface RelationshipLinesProps {
  relationships: Relationship[]
  tables: Table[]
}

export function RelationshipLines({ relationships, tables }: RelationshipLinesProps) {
  const getColumnPosition = (tableId: string, columnId: string): { x: number; y: number } | null => {
    const table = tables.find(t => t.id === tableId)
    if (!table) return null

    const columnIndex = table.columns.findIndex(c => c.id === columnId)
    if (columnIndex === -1) return null

    // Table header height + column offset
    const headerHeight = 40
    const columnHeight = 28
    const tableWidth = 220

    return {
      x: table.position.x + tableWidth,
      y: table.position.y + headerHeight + (columnIndex * columnHeight) + (columnHeight / 2),
    }
  }

  const getSourcePosition = (tableId: string, columnId: string): { x: number; y: number } | null => {
    const table = tables.find(t => t.id === tableId)
    if (!table) return null

    const columnIndex = table.columns.findIndex(c => c.id === columnId)
    if (columnIndex === -1) return null

    const headerHeight = 40
    const columnHeight = 28

    return {
      x: table.position.x,
      y: table.position.y + headerHeight + (columnIndex * columnHeight) + (columnHeight / 2),
    }
  }

  return (
    <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="oklch(0.72 0.19 155)"
          />
        </marker>
        <marker
          id="circle-one"
          markerWidth="10"
          markerHeight="10"
          refX="5"
          refY="5"
        >
          <circle
            cx="5"
            cy="5"
            r="3"
            fill="none"
            stroke="oklch(0.72 0.19 155)"
            strokeWidth="1.5"
          />
        </marker>
        <marker
          id="circle-many"
          markerWidth="16"
          markerHeight="16"
          refX="8"
          refY="8"
        >
          <circle
            cx="8"
            cy="8"
            r="5"
            fill="none"
            stroke="oklch(0.72 0.19 155)"
            strokeWidth="1.5"
          />
          <line
            x1="8"
            y1="3"
            x2="8"
            y2="13"
            stroke="oklch(0.72 0.19 155)"
            strokeWidth="1.5"
          />
        </marker>
      </defs>

      {relationships.map((rel, index) => {
        const sourcePos = getSourcePosition(rel.sourceTableId, rel.sourceColumnId)
        const targetPos = getColumnPosition(rel.targetTableId, rel.targetColumnId)

        if (!sourcePos || !targetPos) return null

        // Stagger curve control points by relationship index to reduce overlapping lines
        const dx = Math.abs(targetPos.x - sourcePos.x)
        const baseOffset = Math.min(dx * 0.5, 100)
        const stagger = 24
        const curveOffset = baseOffset + (index - (relationships.length - 1) / 2) * stagger

        const path = `
          M ${sourcePos.x} ${sourcePos.y}
          C ${sourcePos.x - curveOffset} ${sourcePos.y},
            ${targetPos.x + curveOffset} ${targetPos.y},
            ${targetPos.x} ${targetPos.y}
        `

        return (
          <g key={rel.id}>
            <path
              d={path}
              fill="none"
              stroke="oklch(0.72 0.19 155 / 0.5)"
              strokeWidth="2"
              strokeDasharray={rel.type === 'many-to-many' ? '5,5' : undefined}
            />
            {/* Source indicator */}
            <circle
              cx={sourcePos.x}
              cy={sourcePos.y}
              r="4"
              fill="oklch(0.72 0.19 155)"
            />
            {/* Target indicator - arrow for one-to-many */}
            <circle
              cx={targetPos.x}
              cy={targetPos.y}
              r="4"
              fill="oklch(0.72 0.19 155)"
            />
          </g>
        )
      })}
    </svg>
  )
}
