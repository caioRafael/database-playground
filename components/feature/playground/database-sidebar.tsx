import { Database, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidbarTrigger, Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { DatabaseUpdate } from "./database-update";
import { DatabaseTableList } from "./database-table-list";
import { DatabaseTableEdit } from "./database-table-edit";
import { DatabaseColumnEdit } from "./database-column-edit";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDatabaseContext } from "@/context/database-context";

export function DatabaseSidebar() {
  const { isGeneratingWithAI } = useDatabaseContext()

  return (
    <Sidebar isCollapsable={false}>
        <SidebarHeader>
            <SidbarTrigger>
                <Database className="h-4 w-4 text-primary" />
                DB-playground
            </SidbarTrigger>
        </SidebarHeader>
        <ScrollArea className="h-full">
          <SidebarContent className="gap-2">
              {isGeneratingWithAI && (
                <div className="mx-2 mt-2 flex items-center gap-2 rounded-md border border-dashed border-primary/40 bg-primary/5 px-2 py-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span>IA atualizando o schema no canvas...</span>
                </div>
              )}
              <DatabaseUpdate />
              <Separator className="w-full"/>
              <DatabaseTableList />
              <Separator className="w-full"/>
              <DatabaseTableEdit/>
              <Separator className="w-full"/>
              <DatabaseColumnEdit/>
          </SidebarContent>
        </ScrollArea>
    </Sidebar>
  );
}
