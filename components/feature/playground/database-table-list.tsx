'use client';

import { ScrollArea } from "@/components/ui/scroll-area"
import { useDatabaseContext } from "@/context/database-context";
import { Table2 } from "lucide-react"

export function DatabaseTableList() {
    const { schema, selectedTableId, setSelectedTableId, setSelectedColumnId } = useDatabaseContext();
    return (
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
    )
}