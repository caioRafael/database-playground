import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ToolbarProps {
  className?: string;
  children: ReactNode
}

export function Toolbar({ className, children }: ToolbarProps) {
  return (
    <header
      className={cn(
        "w-full shrink-0 border-b border-border bg-card px-4 py-3 flex items-center gap-2",
        className
      )}
    >
      {children}
    </header>
  );
}
