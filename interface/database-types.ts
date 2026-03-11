export type ColumnType = 
  | 'INT'
  | 'BIGINT'
  | 'VARCHAR'
  | 'TEXT'
  | 'BOOLEAN'
  | 'DATE'
  | 'TIMESTAMP'
  | 'DECIMAL'
  | 'FLOAT'
  | 'UUID'
  | 'JSON'

export interface Column {
  id: string
  name: string
  type: ColumnType
  isPrimaryKey: boolean
  isForeignKey: boolean
  isNullable: boolean
  isUnique: boolean
  defaultValue?: string
  references?: {
    tableId: string
    columnId: string
  }
}

export interface Table {
  id: string
  name: string
  columns: Column[]
  position: { x: number; y: number }
}

/** Side of the table where the relationship line connects */
export type TableAnchor = 'left' | 'right' | 'top' | 'bottom'

/** How the line is drawn between the two connection points */
export type RelationshipPathType = 'curve' | 'orthogonal'

export interface Relationship {
  id: string
  sourceTableId: string
  sourceColumnId: string
  targetTableId: string
  targetColumnId: string
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  /** Which side of the source table to connect the line (default: left) */
  sourceAnchor?: TableAnchor
  /** Which side of the target table to connect the line (default: right) */
  targetAnchor?: TableAnchor
  /** Curve (Bezier) or orthogonal (right-angle) path (default: curve) */
  pathType?: RelationshipPathType
  /** User-defined control point for the curve (bend). When set, the line uses it; otherwise auto-routes to avoid tables. */
  controlPoint?: { x: number; y: number }
  /** For orthogonal path: corner points (start → waypoints[0] → ... → end). Auto-generated if empty. */
  waypoints?: { x: number; y: number }[]
}

export interface DatabaseSchema {
  tables: Table[]
  relationships: Relationship[]
}
