import { SessionProvider } from "@/components/providers/session-provider";
import { Header } from "@/components/shared/header";
import { SidebarSystem } from "@/components/shared/sidebar-system";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
    <div className="flex min-h-screen">
      <SidebarSystem />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  </SessionProvider>
  )
}