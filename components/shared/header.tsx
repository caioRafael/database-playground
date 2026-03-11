"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/playground": "Playground",
  "/settings": "Configurações",
};

function getPageTitle(pathname: string): string {
  return ROUTE_LABELS[pathname] ?? "DB Playground";
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6"
      )}
    >
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-4">
        {/* Espaço para ações futuras (ex: user menu, notificações) */}
      </div>
    </header>
  );
}
