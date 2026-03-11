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

export interface Relationship {
  id: string
  sourceTableId: string
  sourceColumnId: string
  targetTableId: string
  targetColumnId: string
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
}

export interface DatabaseSchema {
  tables: Table[]
  relationships: Relationship[]
}
