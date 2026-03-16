"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, LayoutDashboard, Settings, User } from "lucide-react";
import {
  SidbarTrigger,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "../ui/sidebar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/playground",
    label: "Playground",
    icon: LayoutDashboard,
  },
  {
    href: "/settings",
    label: "Configurações",
    icon: Settings,
  },
  {
    href: "/profile",
    label: "Perfil",
    icon: User,
  },
];

export function SidebarSystem() {
  return (
    <Sidebar className="h-screen" collapsible={false}>
      <SidebarHeader>
        <SidbarTrigger className="flex items-center gap-2 justify-start">
          <Database className="h-4 w-4 text-primary" />
          <span className="font-semibold text-primary">DB Playground</span>
        </SidbarTrigger>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
    </Sidebar>
  );
}

function SidebarNav() {
  const pathname = usePathname();
  const { isOpen } = useSidebar();

  return (
    <nav className="flex flex-col gap-1 mt-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
              isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {isOpen && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
