import { Database } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidbarTrigger, Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { DatabaseUpdate } from "./database-update";
import { DatabaseTableList } from "./database-table-list";
import { DatabaseTableEdit } from "./database-table-edit";
import { DatabaseColumnEdit } from "./database-column-edit";

export function DatabaseSidebar() {

  return (
    <Sidebar isCollapsable={false}>
        <SidebarHeader>
            <SidbarTrigger>
                <Database className="h-4 w-4 text-primary" />
                DB-playground
            </SidbarTrigger>
        </SidebarHeader>
        <SidebarContent className="gap-2">
            <DatabaseUpdate />
            <Separator className="w-full"/>
            <DatabaseTableList />
            <Separator className="w-full"/>
            <DatabaseTableEdit/>
            <Separator className="w-full"/>
            <DatabaseColumnEdit/>
        </SidebarContent>
    </Sidebar>
  );
}
