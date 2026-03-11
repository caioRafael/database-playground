'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDatabaseContext } from "@/context/database-context";
import { Columns3, Link2, Plus, Trash2 } from "lucide-react";

export function DatabaseTableEdit() {
    const { schema, selectedTableId, setSelectedColumnId, selectedColumnId, removeTable, updateTable, addColumn } = useDatabaseContext();

    const selectedTable = schema.tables.find(t => t.id === selectedTableId)
    return (
        <>
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
        </>
    )
}