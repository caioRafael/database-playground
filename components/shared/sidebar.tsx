"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Columns3, Database, Link2, Plus, Table2, Trash, Trash2 } from "lucide-react";
import { COLUMN_TYPES, useDatabaseContext } from "@/context/database-context";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ColumnType } from "@/interface/database-types";
import { Switch } from "../ui/switch";

export function Sidebar() {
  const { 
    schema, 
    addTable, 
    clearSchema, 
    selectedTableId, 
    setSelectedTableId, 
    setSelectedColumnId,
    selectedColumnId,
    removeTable,
    updateTable,
    addColumn,
    removeColumn,
    updateColumn
  } = useDatabaseContext()
  const [isOpen, setIsOpen] = useState(true);

  const selectedTable = schema.tables.find(t => t.id === selectedTableId)
  const selectedColumn = selectedTable?.columns.find(c => c.id === selectedColumnId)

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-300 ease-in-out overflow-hidden",
        isOpen ? "w-56 min-w-56" : "w-14 min-w-14"
      )}
    >
      <div className="flex items-center gap-2 p-3 border-b border-sidebar-border shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen((prev) => !prev)}
          className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label={isOpen ? "Recolher sidebar" : "Expandir sidebar"}
        >
          <ChevronIcon isOpen={isOpen} />
        </Button>
        {isOpen && (
          <h2 className="flex items-center gap-2 text-lg font-semibold text-primary truncate">
            <Database className="h-4 w-4 text-primary" />
            DB-playground
          </h2>
        )}
      </div>
        <div className="flex flex-col gap-2 p-3">
          <Button size="sm" className="w-full" onClick={() => addTable()}>
            <Plus className="h-4 w-4" />
            {isOpen && "Nova Tabela"}
          </Button>
          <Button size="sm" className="w-full" variant="ghost" onClick={() => clearSchema()}>
            <Trash className="h-4 w-4" />
            Limpar Schema
          </Button>
        </div>
        <Separator className="w-full"/>
        <div className="flex-1 overflow-hidden">
            <div className="px-3 py-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                    Tabelas ({schema.tables.length})
                </h3>
            </div>
            <ScrollArea className="h-[200px] px-2">
                <div className="flex flex-col gap-1 px-2">
                {schema.tables.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                    Nenhuma tabela criada
                </p>
                ) : (
                schema.tables.map(table => (
                    <button
                    key={table.id}
                    onClick={() => {
                        setSelectedTableId(table.id)
                        setSelectedColumnId(null)
                    }}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                        selectedTableId === table.id
                        ? 'bg-primary/20 text-primary'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    }`}
                    >
                    <Table2 className="h-4 w-4" />
                    <span className="truncate">{table.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                        {table.columns.length}
                    </span>
                    </button>
                ))
                )}
            </div>
            </ScrollArea>
        </div>

        <Separator className="w-full"/>

        {selectedTable && (
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Editar Tabela
                    </h3>
                    <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => removeTable(selectedTable.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="tableName" className="text-xs text-muted-foreground">
                        Nome
                    </Label>
                    <Input
                        id="tableName"
                        value={selectedTable.name}
                        onChange={e => updateTable(selectedTable.id, { name: e.target.value })}
                        className="h-8 bg-input text-foreground"
                    />
                </div>

                <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Colunas</Label>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 px-2 text-xs"
                        onClick={() => addColumn(selectedTable.id)}
                    >
                        <Plus className="h-3 w-3" />
                        Adicionar
                    </Button>
                    </div>
                    <ScrollArea className="h-[120px]">
                    <div className="flex flex-col gap-1">
                        {selectedTable.columns.map(column => (
                        <button
                            key={column.id}
                            onClick={() => setSelectedColumnId(column.id)}
                            className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors ${
                            selectedColumnId === column.id
                                ? 'bg-primary/20 text-primary'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent'
                            }`}
                        >
                            <Columns3 className="h-3 w-3" />
                            <span className="truncate">{column.name}</span>
                            <span className="ml-auto text-[10px] text-muted-foreground">
                            {column.type}
                            </span>
                            {column.isPrimaryKey && (
                            <span className="rounded bg-primary/20 px-1 text-[9px] text-primary">
                                PK
                            </span>
                            )}
                            {column.isForeignKey && (
                            <Link2 className="h-3 w-3 text-accent" />
                            )}
                        </button>
                        ))}
                    </div>
                    </ScrollArea>
                </div>
            </div>
        )}

        {selectedColumn && (
            <>
            <Separator />
            <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Editar Coluna
                </h3>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => removeColumn(selectedTable?.id ?? '', selectedColumn.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                </div>

                <div className="flex flex-col gap-2">
                <Label htmlFor="columnName" className="text-xs text-muted-foreground">
                    Nome
                </Label>
                <Input
                    id="columnName"
                    value={selectedColumn.name}
                    onChange={e => updateColumn(selectedTable?.id ?? '', selectedColumn.id, { name: e.target.value })}
                    className="h-8 bg-input text-foreground"
                />
                </div>

                <div className="flex flex-col gap-2">
                <Label htmlFor="columnType" className="text-xs text-muted-foreground">
                    Tipo
                </Label>
                <Select
                    value={selectedColumn.type}
                    onValueChange={(value: ColumnType) => 
                    updateColumn(selectedTable?.id ?? '', selectedColumn.id, { type: value })
                    }
                >
                    <SelectTrigger className="h-8 bg-input">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    {COLUMN_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                        {type}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="isPrimaryKey" className="text-xs text-muted-foreground">
                    Primary Key
                    </Label>
                    <Switch
                    id="isPrimaryKey"
                    checked={selectedColumn.isPrimaryKey}
                    onCheckedChange={(checked) =>
                        updateColumn(selectedTable?.id ?? '', selectedColumn.id, { 
                        isPrimaryKey: checked,
                        isNullable: checked ? false : selectedColumn.isNullable,
                        isUnique: checked ? true : selectedColumn.isUnique,
                        })
                    }
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label htmlFor="isNullable" className="text-xs text-muted-foreground">
                    Nullable
                    </Label>
                    <Switch
                    id="isNullable"
                    checked={selectedColumn.isNullable}
                    disabled={selectedColumn.isPrimaryKey}
                    onCheckedChange={(checked) =>
                        updateColumn(selectedTable?.id ?? '', selectedColumn.id, { isNullable: checked })
                    }
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label htmlFor="isUnique" className="text-xs text-muted-foreground">
                    Unique
                    </Label>
                    <Switch
                    id="isUnique"
                    checked={selectedColumn.isUnique}
                    disabled={selectedColumn.isPrimaryKey}
                    onCheckedChange={(checked) =>
                        updateColumn(selectedTable?.id ?? '', selectedColumn.id, { isUnique: checked })
                    }
                    />
                </div>
                </div>
            </div>
            </>
        )}
    </aside>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("transition-transform duration-200", !isOpen && "rotate-180")}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
