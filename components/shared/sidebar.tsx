"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Database, Plus } from "lucide-react";
import { useDatabaseContext } from "@/context/database-context";

export function Sidebar() {
  const { addTable } = useDatabaseContext()
  const [isOpen, setIsOpen] = useState(true);

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
      {isOpen && (
        <div className="flex-1 p-3">
          <Button variant="secondary" size="sm" className="w-full" onClick={() => addTable()}>
            <Plus className="h-4 w-4 text-primary" />
            Nova Tabela
          </Button>
        </div>
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
