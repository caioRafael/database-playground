'use client'

import { useState } from "react";
import { DatabaseCanvas } from "@/components/feature/playground/database-canvas";
import { DatabaseProvider } from "@/providers/database-provider";
import { DatabaseSidebar } from "@/components/feature/playground/database-sidebar";
import { DatabaseToolbar } from "@/components/feature/playground/database-toolbar";
import { DatabaseAIChat } from "@/components/feature/playground/database-ai-chat";

export default function Home() {
  const [aiChatOpen, setAiChatOpen] = useState(false);

  return (
    <DatabaseProvider> 
      <div className="flex h-full overflow-hidden">
        <DatabaseSidebar />
        <div className="flex flex-1 min-w-0">
          <main className="flex-1 flex flex-col min-w-0 overflow-auto">
            <DatabaseToolbar 
              aiChatOpen={aiChatOpen}
              onToggleAIChat={() => setAiChatOpen(prev => !prev)}
            />
            <DatabaseCanvas />
          </main>
          <DatabaseAIChat 
            isOpen={aiChatOpen}
            onOpenChange={setAiChatOpen}
          />
        </div>
      </div>
    </DatabaseProvider>
  );
}
