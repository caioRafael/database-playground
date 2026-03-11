import { Button } from "@/components/ui/button";
import { Toolbar } from "@/components/ui/toolbar";
import { DatabaseRelationshipModal } from "./database-relationship-modal";
import { DatabaseAIChat } from "./database-ai-chat";
import { DatabaseRelationshipOptionsPanel } from "./database-relationship-options-panel";

export function DatabaseToolbar() {
    return (
        <div className="flex flex-col shrink-0">
            <Toolbar>
                <DatabaseRelationshipModal />
                <DatabaseAIChat />
                <Button variant="outline" size="sm">
                    Executar
                </Button>
            </Toolbar>
            <DatabaseRelationshipOptionsPanel />
        </div>
    )
}