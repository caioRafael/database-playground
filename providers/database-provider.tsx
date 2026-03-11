'use client'

import { useState, useCallback, type ReactNode } from 'react'
import type { Table, Column, Relationship, DatabaseSchema } from '@/interface/database-types'
import { 
  DatabaseContext, 
  createEmptyTable, 
  createEmptyColumn,
  generateId 
} from '@/context/database-context'

interface DatabaseProviderProps {
  children: ReactNode
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [schema, setSchema] = useState<DatabaseSchema>({
    tables: [],
    relationships: [],
  })
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)

  const addTable = useCallback((position?: { x: number; y: number }) => {
    const newTable = createEmptyTable(position || { x: 100, y: 100 })
    setSchema(prev => ({
      ...prev,
      tables: [...prev.tables, newTable],
    }))
    setSelectedTableId(newTable.id)
  }, [])

  const removeTable = useCallback((tableId: string) => {
    setSchema(prev => ({
      tables: prev.tables.filter(t => t.id !== tableId),
      relationships: prev.relationships.filter(
        r => r.sourceTableId !== tableId && r.targetTableId !== tableId
      ),
    }))
    if (selectedTableId === tableId) {
      setSelectedTableId(null)
      setSelectedColumnId(null)
    }
  }, [selectedTableId])

  const updateTable = useCallback((tableId: string, updates: Partial<Table>) => {
    setSchema(prev => ({
      ...prev,
      tables: prev.tables.map(t => 
        t.id === tableId ? { ...t, ...updates } : t
      ),
    }))
  }, [])

  const addColumn = useCallback((tableId: string) => {
    const newColumn = createEmptyColumn()
    setSchema(prev => ({
      ...prev,
      tables: prev.tables.map(t => 
        t.id === tableId 
          ? { ...t, columns: [...t.columns, newColumn] }
          : t
      ),
    }))
    setSelectedColumnId(newColumn.id)
  }, [])

  const removeColumn = useCallback((tableId: string, columnId: string) => {
    setSchema(prev => ({
      tables: prev.tables.map(t => 
        t.id === tableId 
          ? { ...t, columns: t.columns.filter(c => c.id !== columnId) }
          : t
      ),
      relationships: prev.relationships.filter(
        r => r.sourceColumnId !== columnId && r.targetColumnId !== columnId
      ),
    }))
    if (selectedColumnId === columnId) {
      setSelectedColumnId(null)
    }
  }, [selectedColumnId])

  const updateColumn = useCallback((tableId: string, columnId: string, updates: Partial<Column>) => {
    setSchema(prev => ({
      ...prev,
      tables: prev.tables.map(t => 
        t.id === tableId 
          ? {
              ...t,
              columns: t.columns.map(c => 
                c.id === columnId ? { ...c, ...updates } : c
              ),
            }
          : t
      ),
    }))
  }, [])

  const addRelationship = useCallback((relationship: Omit<Relationship, 'id'>) => {
    const newRelationship: Relationship = {
      ...relationship,
      id: generateId(),
    }
    setSchema(prev => ({
      ...prev,
      relationships: [...prev.relationships, newRelationship],
    }))

    // Update the source column to be a foreign key
    setSchema(prev => ({
      ...prev,
      tables: prev.tables.map(t => 
        t.id === relationship.sourceTableId 
          ? {
              ...t,
              columns: t.columns.map(c => 
                c.id === relationship.sourceColumnId 
                  ? { 
                      ...c, 
                      isForeignKey: true,
                      references: {
                        tableId: relationship.targetTableId,
                        columnId: relationship.targetColumnId,
                      }
                    } 
                  : c
              ),
            }
          : t
      ),
    }))
  }, [])

  const removeRelationship = useCallback((relationshipId: string) => {
    const relationship = schema.relationships.find(r => r.id === relationshipId)
    if (relationship) {
      // Remove foreign key flag from source column
      setSchema(prev => ({
        tables: prev.tables.map(t => 
          t.id === relationship.sourceTableId 
            ? {
                ...t,
                columns: t.columns.map(c => 
                  c.id === relationship.sourceColumnId 
                    ? { ...c, isForeignKey: false, references: undefined } 
                    : c
                ),
              }
            : t
        ),
        relationships: prev.relationships.filter(r => r.id !== relationshipId),
      }))
    }
  }, [schema.relationships])

  const updateTablePosition = useCallback((tableId: string, position: { x: number; y: number }) => {
    setSchema(prev => ({
      ...prev,
      tables: prev.tables.map(t => 
        t.id === tableId ? { ...t, position } : t
      ),
    }))
  }, [])

  const clearSchema = useCallback(() => {
    setSchema({ tables: [], relationships: [] })
    setSelectedTableId(null)
    setSelectedColumnId(null)
  }, [])

  return (
    <DatabaseContext.Provider
      value={{
        schema,
        selectedTableId,
        selectedColumnId,
        setSelectedTableId,
        setSelectedColumnId,
        addTable,
        removeTable,
        updateTable,
        addColumn,
        removeColumn,
        updateColumn,
        addRelationship,
        removeRelationship,
        updateTablePosition,
        clearSchema,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}
