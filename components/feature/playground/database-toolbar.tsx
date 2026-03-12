import { Button } from "@/components/ui/button";
import { Toolbar } from "@/components/ui/toolbar";
import { Sparkles } from "lucide-react";
import { DatabaseRelationshipModal } from "./database-relationship-modal";
import { DatabaseRelationshipOptionsPanel } from "./database-relationship-options-panel";

interface DatabaseToolbarProps {
    aiChatOpen: boolean
    onToggleAIChat: () => void
}

export function DatabaseToolbar({ aiChatOpen, onToggleAIChat }: DatabaseToolbarProps) {
    return (
        <div className="flex flex-col shrink-0">
            <Toolbar>
                <DatabaseRelationshipModal />
                <Button 
                    variant={aiChatOpen ? "default" : "outline"} 
                    size="sm"
                    className="gap-2"
                    onClick={onToggleAIChat}
                >
                    <Sparkles className="h-4 w-4" />
                    {aiChatOpen ? "Fechar IA" : "Gerar com IA"}
                </Button>
                <Button variant="outline" size="sm">
                    Executar
                </Button>
            </Toolbar>
            <DatabaseRelationshipOptionsPanel />
        </div>
    )
}