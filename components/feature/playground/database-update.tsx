'use client';

import { Button } from "@/components/ui/button";
import { useDatabaseContext } from "@/context/database-context";
import { Plus, Trash } from "lucide-react";

export function DatabaseUpdate() {
    const { addTable, clearSchema } = useDatabaseContext();
    return (
        <>
            <Button size="sm" className="w-full" onClick={() => addTable()}>
                <Plus className="h-4 w-4" />
                Nova Tabela
            </Button>
            <Button size="sm" className="w-full" variant="ghost" onClick={() => clearSchema()}>
                <Trash className="h-4 w-4" />
                Limpar Schema   
            </Button>
        </>
    )
}