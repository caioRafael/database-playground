'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useDatabaseContext } from '@/context/database-context'
import type { Relationship, Table, TableAnchor } from '@/interface/database-types'

const TABLE_WIDTH = 220
const HEADER_HEIGHT = 40
const COLUMN_HEIGHT = 28

interface RelationshipLinesProps {
  relationships: Relationship[]
  tables: Table[]
}

interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

function getTableBounds(table: Table): Bounds {
  const height = HEADER_HEIGHT + table.columns.length * COLUMN_HEIGHT
  return {
    x: table.position.x,
    y: table.position.y,
    width: TABLE_WIDTH,
    height,
  }
}

function pointInBounds(x: number, y: number, b: Bounds): boolean {
  return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height
}

function getTableCenter(bounds: Bounds): { x: number; y: number } {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  }
}

function pickBestAnchors(
  sourceTable: Table,
  targetTable: Table
): { sourceAnchor: TableAnchor; targetAnchor: TableAnchor } {
  const sourceBounds = getTableBounds(sourceTable)
  const targetBounds = getTableBounds(targetTable)
  const sourceCenter = getTableCenter(sourceBounds)
  const targetCenter = getTableCenter(targetBounds)

  const dx = targetCenter.x - sourceCenter.x
  const dy = targetCenter.y - sourceCenter.y

  if (Math.abs(dx) >= Math.abs(dy)) {
    // Predominant direção horizontal
    if (dx >= 0) {
      return { sourceAnchor: 'right', targetAnchor: 'left' }
    }
    return { sourceAnchor: 'left', targetAnchor: 'right' }
  }

  // Predominant direção vertical
  if (dy >= 0) {
    return { sourceAnchor: 'bottom', targetAnchor: 'top' }
  }
  return { sourceAnchor: 'top', targetAnchor: 'bottom' }
}

// Sample point on quadratic curve: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2, t in [0,1]
function sampleQuadratic(
  sx: number, sy: number,
  cx: number, cy: number,
  tx: number, ty: number,
  t: number
): { x: number; y: number } {
  const u = 1 - t
  return {
    x: u * u * sx + 2 * u * t * cx + t * t * tx,
    y: u * u * sy + 2 * u * t * cy + t * t * ty,
  }
}

function curveIntersectsBounds(
  sx: number, sy: number, cx: number, cy: number, tx: number, ty: number,
  bounds: Bounds,
  steps = 24
): boolean {
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    const p = sampleQuadratic(sx, sy, cx, cy, tx, ty, t)
    if (pointInBounds(p.x, p.y, bounds)) return true
  }
  return false
}

/** Find a control point so the quadratic curve from source to target avoids the given table bounds. */
function findControlPointAvoidingTables(
  source: { x: number; y: number },
  target: { x: number; y: number },
  tablesToAvoid: Bounds[],
  relationshipIndex: number,
  totalRelations: number
): { x: number; y: number } {
  const midX = (source.x + target.x) / 2
  const midY = (source.y + target.y) / 2
  const dx = target.x - source.x
  const dy = target.y - source.y
  const len = Math.hypot(dx, dy) || 1
  const perpX = -dy / len
  const perpY = dx / len

  // Stagger multiple relationships so they don't all use the same path
  const stagger = 40
  const offset = (relationshipIndex - (totalRelations - 1) / 2) * stagger

  const candidates: { x: number; y: number }[] = []
  const baseOffset = Math.min(Math.max(len * 0.4, 80), 180)
  for (let sign = -1; sign <= 1; sign += 2) {
    for (let k = 0; k <= 8; k++) {
      const dist = baseOffset + k * 30
      candidates.push({
        x: midX + (perpX * dist + perpX * offset) * sign,
        y: midY + (perpY * dist + perpY * offset) * sign,
      })
    }
  }
  // Also try midpoint first (might work if no table in between)
  candidates.unshift({ x: midX + perpX * offset, y: midY + perpY * offset })

  for (const cp of candidates) {
    const intersects = tablesToAvoid.some(b =>
      curveIntersectsBounds(source.x, source.y, cp.x, cp.y, target.x, target.y, b)
    )
    if (!intersects) return cp
  }
  return { x: midX + perpX * 100, y: midY + perpY * 100 }
}

/** Get connection point on a table for the given column and anchor (side). */
function getConnectionPosition(
  table: Table,
  columnId: string,
  anchor: TableAnchor
): { x: number; y: number } {
  const columnIndex = table.columns.findIndex(c => c.id === columnId)
  const col = Math.max(0, columnIndex)
  const n = table.columns.length
  const headerHeight = HEADER_HEIGHT
  const columnHeight = COLUMN_HEIGHT
  const tableHeight = headerHeight + n * columnHeight

  const baseY = table.position.y + headerHeight + col * columnHeight + columnHeight / 2
  const baseX = table.position.x + ((col + 0.5) / n) * TABLE_WIDTH

  switch (anchor) {
    case 'left':
      return { x: table.position.x, y: baseY }
    case 'right':
      return { x: table.position.x + TABLE_WIDTH, y: baseY }
    case 'top':
      return { x: baseX, y: table.position.y }
    case 'bottom':
      return { x: baseX, y: table.position.y + tableHeight }
    default:
      return { x: table.position.x, y: baseY }
  }
}

/** Default orthogonal waypoints: V-H-V path (vertical, horizontal, vertical). */
function defaultOrthogonalWaypoints(
  startX: number, startY: number,
  endX: number, endY: number
): { x: number; y: number }[] {
  const midY = (startY + endY) / 2
  return [
    { x: startX, y: midY },
    { x: endX, y: midY },
  ]
}

export function RelationshipLines({ relationships, tables }: RelationshipLinesProps) {
  const {
    selectedRelationshipId,
    setSelectedRelationshipId,
    setSelectedTableId,
    setSelectedColumnId,
    updateRelationship,
  } = useDatabaseContext()

  const [dragState, setDragState] = useState<
    | { type: 'curve'; relationshipId: string; startX: number; startY: number; initialControl: { x: number; y: number } }
    | { type: 'orthogonal'; relationshipId: string; startX: number; startY: number; initialMidY: number; sourceX: number; targetX: number }
    | null
  >(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const getPosition = useCallback(
    (tableId: string, columnId: string, anchor: TableAnchor): { x: number; y: number } | null => {
      const table = tables.find(t => t.id === tableId)
      if (!table) return null
      const columnIndex = table.columns.findIndex(c => c.id === columnId)
      if (columnIndex === -1) return null
      return getConnectionPosition(table, columnId, anchor)
    },
    [tables]
  )

  const handlePathClick = useCallback(
    (e: React.MouseEvent, relId: string) => {
      e.stopPropagation()
      setSelectedTableId(null)
      setSelectedColumnId(null)
      setSelectedRelationshipId(relId)
    },
    [setSelectedTableId, setSelectedColumnId, setSelectedRelationshipId]
  )

  const handleCanvasClick = useCallback(() => {
    setSelectedRelationshipId(null)
  }, [setSelectedRelationshipId])

  const getControlPoint = useCallback(
    (
      rel: Relationship,
      sourcePos: { x: number; y: number },
      targetPos: { x: number; y: number },
      index: number
    ): { x: number; y: number } => {
      if (rel.controlPoint) return rel.controlPoint
      const tablesToAvoid = tables
        .filter(t => t.id !== rel.sourceTableId && t.id !== rel.targetTableId)
        .map(t => getTableBounds(t))
      return findControlPointAvoidingTables(
        sourcePos,
        targetPos,
        tablesToAvoid,
        index,
        relationships.length
      )
    },
    [tables, relationships.length]
  )

  const handleCurveHandleMouseDown = useCallback(
    (e: React.MouseEvent, relId: string, control: { x: number; y: number }) => {
      e.stopPropagation()
      setDragState({
        type: 'curve',
        relationshipId: relId,
        startX: e.clientX,
        startY: e.clientY,
        initialControl: control,
      })
    },
    []
  )

  const handleOrthogonalHandleMouseDown = useCallback(
    (e: React.MouseEvent, relId: string, midY: number, sourceX: number, targetX: number) => {
      e.stopPropagation()
      setDragState({
        type: 'orthogonal',
        relationshipId: relId,
        startX: e.clientX,
        startY: e.clientY,
        initialMidY: midY,
        sourceX,
        targetX,
      })
    },
    []
  )

  useEffect(() => {
    if (!dragState) return
    const onMove = (e: MouseEvent) => {
      const svg = svgRef.current
      if (!svg) return
      const ctm = svg.getScreenCTM()
      if (!ctm) return
      const dx = (e.clientX - dragState.startX) / (ctm.a || 1)
      const dy = (e.clientY - dragState.startY) / (ctm.d || 1)
      if (dragState.type === 'curve') {
        updateRelationship(dragState.relationshipId, {
          controlPoint: {
            x: dragState.initialControl.x + dx,
            y: dragState.initialControl.y + dy,
          },
        })
      } else {
        const newMidY = dragState.initialMidY + dy
        updateRelationship(dragState.relationshipId, {
          waypoints: [
            { x: dragState.sourceX, y: newMidY },
            { x: dragState.targetX, y: newMidY },
          ],
        })
      }
    }
    const onUp = () => setDragState(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragState, updateRelationship])

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 z-0 h-full w-full overflow-visible"
      style={{ pointerEvents: dragState ? 'none' : 'auto' }}
      onClick={handleCanvasClick}
    >
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
        <marker id="circle-one" markerWidth="10" markerHeight="10" refX="5" refY="5">
          <circle cx="5" cy="5" r="3" fill="none" stroke="oklch(0.72 0.19 155)" strokeWidth="1.5" />
        </marker>
        <marker id="circle-many" markerWidth="16" markerHeight="16" refX="8" refY="8">
          <circle cx="8" cy="8" r="5" fill="none" stroke="oklch(0.72 0.19 155)" strokeWidth="1.5" />
          <line x1="8" y1="3" x2="8" y2="13" stroke="oklch(0.72 0.19 155)" strokeWidth="1.5" />
        </marker>
      </defs>

      {relationships.map((rel, index) => {
        const sourceTable = tables.find(t => t.id === rel.sourceTableId)
        const targetTable = tables.find(t => t.id === rel.targetTableId)
        if (!sourceTable || !targetTable) return null

        const autoAnchors = pickBestAnchors(sourceTable, targetTable)

        const sourceAnchor = rel.sourceAnchor ?? autoAnchors.sourceAnchor
        const targetAnchor = rel.targetAnchor ?? autoAnchors.targetAnchor

        const sourcePos = getPosition(rel.sourceTableId, rel.sourceColumnId, sourceAnchor)
        const targetPos = getPosition(rel.targetTableId, rel.targetColumnId, targetAnchor)
        if (!sourcePos || !targetPos) return null

        const pathType = rel.pathType ?? 'orthogonal'
        const isOrthogonal = pathType === 'orthogonal'

        let path: string
        let waypoints: { x: number; y: number }[]

        if (isOrthogonal) {
          const raw =
            rel.waypoints && rel.waypoints.length >= 2
              ? rel.waypoints
              : defaultOrthogonalWaypoints(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y)
          const midY = raw.length >= 2 ? (raw[0].y + raw[1].y) / 2 : (sourcePos.y + targetPos.y) / 2
          waypoints = [
            { x: sourcePos.x, y: midY },
            { x: targetPos.x, y: midY },
          ]
          const segments = [sourcePos, ...waypoints, targetPos]
          path = segments.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), '')
        } else {
          waypoints = []
          const control = getControlPoint(rel, sourcePos, targetPos, index)
          path = `M ${sourcePos.x} ${sourcePos.y} Q ${control.x} ${control.y} ${targetPos.x} ${targetPos.y}`
        }

        const isSelected = selectedRelationshipId === rel.id
        const control = !isOrthogonal
          ? getControlPoint(rel, sourcePos, targetPos, index)
          : null

        return (
          <g key={rel.id}>
            <path
              d={path}
              fill="none"
              stroke="oklch(0.72 0.19 155 / 0.5)"
              strokeWidth={isSelected ? 3 : 2}
              strokeDasharray={rel.type === 'many-to-many' ? '5,5' : undefined}
              style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
              onClick={e => handlePathClick(e, rel.id)}
            />
            <circle cx={sourcePos.x} cy={sourcePos.y} r="4" fill="oklch(0.72 0.19 155)" />
            <circle cx={targetPos.x} cy={targetPos.y} r="4" fill="oklch(0.72 0.19 155)" />

            {isSelected && !isOrthogonal && control && (
              <circle
                cx={control.x}
                cy={control.y}
                r="8"
                fill="oklch(0.72 0.19 155 / 0.3)"
                stroke="oklch(0.72 0.19 155)"
                strokeWidth="2"
                style={{ cursor: 'grab', pointerEvents: 'all' }}
                onMouseDown={e => handleCurveHandleMouseDown(e, rel.id, control)}
              />
            )}

            {isSelected && isOrthogonal && waypoints.length >= 2 && (
              <circle
                cx={(waypoints[0].x + waypoints[1].x) / 2}
                cy={waypoints[0].y}
                r="8"
                fill="oklch(0.72 0.19 155 / 0.3)"
                stroke="oklch(0.72 0.19 155)"
                strokeWidth="2"
                style={{ cursor: 'grab', pointerEvents: 'all' }}
                onMouseDown={e =>
                  handleOrthogonalHandleMouseDown(e, rel.id, waypoints[0].y, sourcePos.x, targetPos.x)
                }
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}
