"use client";

import { Button } from "@/components/ui/button";
import { useDatabaseContext } from "@/context/database-context";
import { Maximize2, Plus, ZoomIn, ZoomOut } from "lucide-react";
import { useRef, useState, useCallback   } from "react";
import { DatabaseTableNode } from "./database-table-node";
import { RelationshipLines } from "./database-relationship-lines";

interface DragState {
    isDragging: boolean
    tableId: string | null
    startX: number
    startY: number
    initialTableX: number
    initialTableY: number
  }
  
  interface PanState {
    isPanning: boolean
    startX: number
    startY: number
    initialOffsetX: number
    initialOffsetY: number
  }
  

export function DatabaseCanvas() {
    const { schema, addTable, setSelectedTableId, setSelectedColumnId, updateTablePosition } = useDatabaseContext()
    const canvasRef = useRef<HTMLDivElement>(null)
  
    const [zoom, setZoom] = useState(1)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    
    const [dragState, setDragState] = useState<DragState>({
      isDragging: false,
      tableId: null,
      startX: 0,
      startY: 0,
      initialTableX: 0,
      initialTableY: 0,
    })
  
    const [panState, setPanState] = useState<PanState>({
      isPanning: false,
      startX: 0,
      startY: 0,
      initialOffsetX: 0,
      initialOffsetY: 0,
    })
  
    const handleTableDragStart = useCallback((e: MouseEvent, tableId: string) => {
      e.stopPropagation()
      const table = schema.tables.find(t => t.id === tableId)
      if (!table) return
  
      setDragState({
        isDragging: true,
        tableId,
        startX: e.clientX,
        startY: e.clientY,
        initialTableX: table.position.x,
        initialTableY: table.position.y,
      })
    }, [schema.tables])
  
    const handleMouseMove = useCallback((e: MouseEvent) => {
      if (dragState.isDragging && dragState.tableId) {
        const deltaX = (e.clientX - dragState.startX) / zoom
        const deltaY = (e.clientY - dragState.startY) / zoom
  
        updateTablePosition(dragState.tableId, {
          x: dragState.initialTableX + deltaX,
          y: dragState.initialTableY + deltaY,
        })
      } else if (panState.isPanning) {
        const deltaX = e.clientX - panState.startX
        const deltaY = e.clientY - panState.startY
  
        setOffset({
          x: panState.initialOffsetX + deltaX,
          y: panState.initialOffsetY + deltaY,
        })
      }
    }, [dragState, panState, zoom, updateTablePosition])
  
    const handleMouseUp = useCallback(() => {
      setDragState(prev => ({ ...prev, isDragging: false, tableId: null }))
      setPanState(prev => ({ ...prev, isPanning: false }))
    }, [])
  
    const handleCanvasMouseDown = useCallback((e: MouseEvent) => {
      // Only start panning if clicking directly on canvas (not on a table)
      if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
        setSelectedTableId(null)
        setSelectedColumnId(null)
        
        // Middle mouse button or space + left click for panning
        if (e.button === 1 || e.shiftKey) {
          e.preventDefault()
          setPanState({
            isPanning: true,
            startX: e.clientX,
            startY: e.clientY,
            initialOffsetX: offset.x,
            initialOffsetY: offset.y,
          })
        }
      }
    }, [offset, setSelectedTableId, setSelectedColumnId])
  
    const handleWheel = useCallback((e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoom(prev => Math.max(0.25, Math.min(2, prev + delta)))
      } else {
        // Pan with scroll
        setOffset(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }))
      }
    }, [])
  
    const handleDoubleClick = useCallback((e: MouseEvent) => {
      if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
  
        const x = (e.clientX - rect.left - offset.x) / zoom
        const y = (e.clientY - rect.top - offset.y) / zoom
  
        addTable({ x, y })
      }
    }, [addTable, offset, zoom])
  
    const resetView = useCallback(() => {
      setZoom(1)
      setOffset({ x: 0, y: 0 })
    }, [])
    return (
        <div className="relative flex-1 overflow-hidden bg-background">
            {/* controles do canvas */}
            <div className="absolute left-4 top-4 z-10 flex gap-2">
                <Button
                variant="secondary"
                size="sm"
                className="gap-2"
                  onClick={() => addTable({ x: 50, y: 50 })}
                >
                <Plus className="h-4 w-4" />
                Nova Tabela
                </Button>
            </div>
            
            {/* canvas */}
            <div
                ref={canvasRef}
                className="canvas-bg h-full w-full cursor-grab active:cursor-grabbing"
                onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => handleCanvasMouseDown(e as unknown as MouseEvent)}
                onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => handleMouseMove(e as unknown as MouseEvent)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={(e: React.WheelEvent<HTMLDivElement>) => handleWheel(e as unknown as WheelEvent)}
                onDoubleClick={(e: React.MouseEvent<HTMLDivElement>) => handleDoubleClick(e as unknown as MouseEvent)}
                style={{
                    backgroundImage: `
                        radial-gradient(circle, oklch(0.35 0.01 260) 1px, transparent 1px)
                    `,
                    backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                    backgroundPosition: `${offset.x}px ${offset.y}px`,
                }}
            >
                <div
                className="relative h-full w-full"
                style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                }}
                >
                {/* Relationship Lines */}
                <RelationshipLines 
                    relationships={schema.relationships} 
                    tables={schema.tables} 
                />

                {/* Table Nodes */}
                {schema.tables.map(table => (
                    <DatabaseTableNode
                        key={table.id}
                        table={table}
                        onDragStart={handleTableDragStart}
                    />
                ))}
                </div>
            </div>

            {/* controles de zoom */}
            <div className="absolute bottom-4 right-4 z-10 flex gap-1">
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setZoom(prev => Math.max(0.25, prev - 0.1))}
                >
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={resetView}
                >
                    <Maximize2 className="h-4 w-4" />
                </Button>
                <div className="flex h-8 items-center rounded-md bg-secondary px-2 text-xs text-muted-foreground">
                    {Math.round(zoom * 100)}%
                </div>
            </div>
        </div>
    )
}