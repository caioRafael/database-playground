import { Button } from "@/components/ui/button";
import { Toolbar } from "@/components/ui/toolbar";
import { Sparkles } from "lucide-react";
import { DatabaseRelationshipModal } from "./database-relationship-modal";
import { DatabaseRelationshipOptionsPanel } from "./database-relationship-options-panel";
import { DatabaseGenerateCodeModal } from "./database-generate-code-modal";
import { DatabaseExportSchemaModal } from "./database-export-schema-modal";
import { DatabaseImportSchemaButton } from "./database-import-schema-button";

interface DatabaseToolbarProps {
    aiChatOpen: boolean
    onToggleAIChat: () => void
}

export function DatabaseToolbar({ aiChatOpen, onToggleAIChat }: DatabaseToolbarProps) {
    return (
        <div className="flex flex-col shrink-0">
            <Toolbar>
                <DatabaseRelationshipModal />
                <DatabaseImportSchemaButton />
                <DatabaseExportSchemaModal />
                <Button 
                    variant={aiChatOpen ? "default" : "outline"} 
                    size="sm"
                    className="gap-2"
                    onClick={onToggleAIChat}
                >
                    <Sparkles className="h-4 w-4" />
                    {aiChatOpen ? "Fechar IA" : "Gerar com IA"}
                </Button>
                <DatabaseGenerateCodeModal />
            </Toolbar>
            <DatabaseRelationshipOptionsPanel />
        </div>
    )
}