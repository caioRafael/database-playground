'use client'

import { createContext, useContext } from 'react'
import type { Table, Column, Relationship, ColumnType, DatabaseSchema } from '../interface/database-types'

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function createEmptyTable(position: { x: number; y: number }, existingId?: string): Table {
  const id = existingId ?? generateId()
  return {
    id,
    name: 'nova_tabela',
    columns: [
      {
        id: generateId(),
        name: 'id',
        type: 'INT',
        isPrimaryKey: true,
        isForeignKey: false,
        isNullable: false,
        isUnique: true,
      }
    ],
    position,
  }
}

export function createEmptyColumn(): Column {
  return {
    id: generateId(),
    name: 'nova_coluna',
    type: 'VARCHAR',
    isPrimaryKey: false,
    isForeignKey: false,
    isNullable: true,
    isUnique: false,
  }
}

export const COLUMN_TYPES: ColumnType[] = [
  'INT',
  'BIGINT',
  'VARCHAR',
  'TEXT',
  'BOOLEAN',
  'DATE',
  'TIMESTAMP',
  'DECIMAL',
  'FLOAT',
  'UUID',
  'JSON',
]

export interface DatabaseContextType {
  schema: DatabaseSchema
  selectedTableId: string | null
  selectedColumnId: string | null
  setSelectedTableId: (id: string | null) => void
  setSelectedColumnId: (id: string | null) => void
  addTable: (position?: { x: number; y: number }) => void
  removeTable: (tableId: string) => void
  updateTable: (tableId: string, updates: Partial<Table>) => void
  addColumn: (tableId: string) => void
  removeColumn: (tableId: string, columnId: string) => void
  updateColumn: (tableId: string, columnId: string, updates: Partial<Column>) => void
  addRelationship: (relationship: Omit<Relationship, 'id'>) => void
  removeRelationship: (relationshipId: string) => void
  updateRelationship: (relationshipId: string, updates: Partial<Relationship>) => void
  selectedRelationshipId: string | null
  setSelectedRelationshipId: (id: string | null) => void
  updateTablePosition: (tableId: string, position: { x: number; y: number }) => void
  clearSchema: () => void
  setSchema: (schema: DatabaseSchema) => void
}

export const DatabaseContext = createContext<DatabaseContextType | null>(null)

export function useDatabaseContext() {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider')
  }
  return context
}
