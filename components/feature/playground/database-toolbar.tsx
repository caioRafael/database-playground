import { Button } from "@/components/ui/button";
import { Toolbar } from "@/components/ui/toolbar";
import { DatabaseRelationshipModal } from "./database-relationship-modal";

export function DatabaseToolbar() {
    return (
        <Toolbar>
            <DatabaseRelationshipModal />
            <Button variant="outline" size="sm">
                Executar
            </Button>
        </Toolbar>
    )
}