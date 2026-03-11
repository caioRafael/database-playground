import { Sidebar } from "@/components/shared/sidebar";
import { Toolbar } from "@/components/shared/toolbar";
import { DatabaseCanvas } from "@/components/feature/playground/database-canvas";
import { DatabaseProvider } from "@/providers/database-provider";

export default function Home() {
  return (
    <DatabaseProvider> 
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-auto">
          <Toolbar />
          <DatabaseCanvas />
        </main>
      </div>
    </DatabaseProvider>
  );
}
