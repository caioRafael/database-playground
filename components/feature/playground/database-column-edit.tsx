'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { COLUMN_TYPES, useDatabaseContext } from "@/context/database-context";
import { ColumnType } from "@/interface/database-types";
import { Trash2 } from "lucide-react";

export function DatabaseColumnEdit() {
    const { schema, selectedTableId, selectedColumnId, removeColumn, updateColumn } = useDatabaseContext();

    const selectedTable = schema.tables.find(t => t.id === selectedTableId)
    const selectedColumn = selectedTable?.columns.find(c => c.id === selectedColumnId)
    return (
        <>
                {selectedColumn && (
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
        )}
        </>
    )
}