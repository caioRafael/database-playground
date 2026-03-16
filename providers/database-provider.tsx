'use client'

import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import type { Table, Column, Relationship, DatabaseSchema } from '@/interface/database-types'
import { 
  DatabaseContext, 
  createEmptyTable, 
  createEmptyColumn,
  generateId 
} from '@/context/database-context'

const STORAGE_KEY = 'database-playground-schema'

const EMPTY_SCHEMA: DatabaseSchema = { tables: [], relationships: [] }

function loadSchemaFromStorage(): DatabaseSchema {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_SCHEMA
    const parsed = JSON.parse(raw) as DatabaseSchema
    if (!parsed || !Array.isArray(parsed.tables) || !Array.isArray(parsed.relationships)) {
      return EMPTY_SCHEMA
    }
    return parsed
  } catch {
    return EMPTY_SCHEMA
  }
}

const TABLE_WIDTH = 220
const TABLE_HEADER_HEIGHT = 40
const TABLE_COLUMN_HEIGHT = 28
const TABLE_MIN_HEIGHT = TABLE_HEADER_HEIGHT + TABLE_COLUMN_HEIGHT
const TABLE_GAP = 40

function getTableBounds(table: Table): { x: number; y: number; width: number; height: number } {
  const height = TABLE_HEADER_HEIGHT + table.columns.length * TABLE_COLUMN_HEIGHT
  return {
    x: table.position.x,
    y: table.position.y,
    width: TABLE_WIDTH,
    height,
  }
}

function boundsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

function findNextPosition(tables: Table[]): { x: number; y: number } {
  const newBounds = { x: 0, y: 0, width: TABLE_WIDTH, height: TABLE_MIN_HEIGHT }
  const startX = 50
  const startY = 50
  const stepX = TABLE_WIDTH + TABLE_GAP
  const stepY = TABLE_MIN_HEIGHT + TABLE_GAP
  for (let row = 0; row < 100; row++) {
    for (let col = 0; col < 100; col++) {
      newBounds.x = startX + col * stepX
      newBounds.y = startY + row * stepY
      const overlaps = tables.some(t => boundsOverlap(newBounds, getTableBounds(t)))
      if (!overlaps) return { x: newBounds.x, y: newBounds.y }
    }
  }
  return { x: startX, y: startY }
}

function findNearestFreePosition(tables: Table[], preferX: number, preferY: number): { x: number; y: number } {
  const newBounds = { x: preferX, y: preferY, width: TABLE_WIDTH, height: TABLE_MIN_HEIGHT }
  const overlaps = tables.some(t => boundsOverlap(newBounds, getTableBounds(t)))
  if (!overlaps) return { x: preferX, y: preferY }
  const stepX = TABLE_WIDTH + TABLE_GAP
  const stepY = TABLE_MIN_HEIGHT + TABLE_GAP
  for (let radius = 1; radius <= 20; radius++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue
        newBounds.x = preferX + dx * stepX
        newBounds.y = preferY + dy * stepY
        const stillOverlaps = tables.some(t => boundsOverlap(newBounds, getTableBounds(t)))
        if (!stillOverlaps) return { x: newBounds.x, y: newBounds.y }
      }
    }
  }
  return findNextPosition(tables)
}

interface DatabaseProviderProps {
  children: ReactNode
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [schema, setSchema] = useState<DatabaseSchema>(EMPTY_SCHEMA)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null)
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false)
  const hasLoadedFromStorage = useRef(false)

  // Load from localStorage after hydration so server and client first render match
  useEffect(() => {
    const stored = loadSchemaFromStorage()
    const id = setTimeout(() => {
      if (stored.tables.length > 0 || stored.relationships.length > 0) {
        setSchema(stored)
      }
      hasLoadedFromStorage.current = true
    }, 0)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!hasLoadedFromStorage.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schema))
    } catch {
      // ignore quota or other storage errors
    }
  }, [schema])

  const autoLayoutSchema = useCallback((input: DatabaseSchema): DatabaseSchema => {
    if (input.tables.length === 0) return input

    const tables = input.tables
    const relationships = input.relationships

    const layerByTable = new Map<string, number>()
    tables.forEach(t => layerByTable.set(t.id, 0))

    // Direção: tabela alvo (referenciada) → tabela origem (FK)
    for (let pass = 0; pass < tables.length; pass++) {
      let changed = false
      for (const rel of relationships) {
        const parentId = rel.targetTableId
        const childId = rel.sourceTableId
        const parentLayer = layerByTable.get(parentId)
        const childLayer = layerByTable.get(childId)
        if (parentLayer == null || childLayer == null) continue
        if (childLayer <= parentLayer) {
          layerByTable.set(childId, parentLayer + 1)
          changed = true
        }
      }
      if (!changed) break
    }

    const layers = new Map<number, string[]>()
    layerByTable.forEach((layer, tableId) => {
      const list = layers.get(layer) ?? []
      list.push(tableId)
      layers.set(layer, list)
    })

    // Descobre altura máxima de qualquer tabela para evitar sobreposição vertical
    const maxTableHeight =
      tables.reduce((max, t) => {
        const height = TABLE_HEADER_HEIGHT + t.columns.length * TABLE_COLUMN_HEIGHT
        return Math.max(max, height)
      }, TABLE_MIN_HEIGHT) || TABLE_MIN_HEIGHT

    const startX = 50
    const startY = 50
    const stepX = TABLE_WIDTH + TABLE_GAP
    const stepY = maxTableHeight + TABLE_GAP
    const maxColumns = 4

    const positionedTables = tables.map(table => {
      const rawLayer = layerByTable.get(table.id) ?? 0
      const layer = Math.min(rawLayer, maxColumns - 1)
      const layerTables = layers.get(layer) ?? []
      const indexInLayer = layerTables.indexOf(table.id)
      const order = indexInLayer === -1 ? 0 : indexInLayer

      return {
        ...table,
        position: {
          x: startX + layer * stepX,
          y: startY + order * stepY,
        },
      }
    })

    return { ...input, tables: positionedTables }
  }, [])

  const addTable = useCallback((position?: { x: number; y: number }) => {
    const newId = generateId()
    setSchema(prev => {
      const tables = prev.tables
      const finalPosition =
        position != null
          ? findNearestFreePosition(tables, position.x, position.y)
          : findNextPosition(tables)
      const newTable = createEmptyTable(finalPosition, newId)
      return { ...prev, tables: [...tables, newTable] }
    })
    setSelectedTableId(newId)
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

  const updateRelationship = useCallback((relationshipId: string, updates: Partial<Relationship>) => {
    setSchema(prev => ({
      ...prev,
      relationships: prev.relationships.map(r =>
        r.id === relationshipId ? { ...r, ...updates } : r
      ),
    }))
  }, [])

  const removeRelationship = useCallback((relationshipId: string) => {
    const relationship = schema.relationships.find(r => r.id === relationshipId)
    if (relationship) {
      if (selectedRelationshipId === relationshipId) {
        setSelectedRelationshipId(null)
      }
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
  }, [schema.relationships, selectedRelationshipId])

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
    setSelectedRelationshipId(null)
  }, [])

  const setSchemaFromExternal = useCallback((newSchema: DatabaseSchema) => {
    const laidOut = autoLayoutSchema(newSchema)
    setSchema(laidOut)
    setSelectedTableId(null)
    setSelectedColumnId(null)
    setSelectedRelationshipId(null)
  }, [autoLayoutSchema])

  return (
    <DatabaseContext.Provider
      value={{
        schema,
        selectedTableId,
        selectedColumnId,
        isGeneratingWithAI,
        setSelectedTableId,
        setSelectedColumnId,
        setIsGeneratingWithAI,
        addTable,
        removeTable,
        updateTable,
        addColumn,
        removeColumn,
        updateColumn,
        addRelationship,
        removeRelationship,
        updateRelationship,
        selectedRelationshipId,
        setSelectedRelationshipId,
        updateTablePosition,
        clearSchema,
        setSchema: setSchemaFromExternal,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}
