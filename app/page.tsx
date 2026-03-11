import { Toolbar } from "@/components/shared/toolbar";
import { DatabaseCanvas } from "@/components/feature/playground/database-canvas";
import { DatabaseProvider } from "@/providers/database-provider";
import { DatabaseSidebar } from "@/components/feature/playground/database-sidebar";

export default function Home() {
  return (
    <DatabaseProvider> 
      <div className="flex h-screen overflow-hidden">
        <DatabaseSidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-auto">
          <Toolbar />
          <DatabaseCanvas />
        </main>
      </div>
    </DatabaseProvider>
  );
}
