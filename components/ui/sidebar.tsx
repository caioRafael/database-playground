"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


interface SidebarProps {
  children: ReactNode;
  className?: string;
  isCollapsable?: boolean;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  setIsOpen: () => {},
  isCollapsable: true,
});

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsable: boolean;
}

export function useSidebar() {
    return useContext(SidebarContext);
}

export function Sidebar({ children, className, isCollapsable = true }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isCollapsable }}>
        <aside
            className={cn(
                "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-300 ease-in-out overflow-hidden",
                isCollapsable && (isOpen ? "w-56 min-w-56" : "w-14 min-w-14"),
                className
            )}
        >
        {children}
        </aside>
    </SidebarContext.Provider>
  );
}

export function SidebarHeader({children, className}: SidebarProps) {
    return (
        <div className={cn("flex items-center gap-2 p-3 border-b border-sidebar-border shrink-0", className)}>
            {children}
        </div>
    )
}

export function SidbarTrigger({children, className}: SidebarProps) {
    const { isOpen, setIsOpen, isCollapsable } = useSidebar();
    return (
        <Button
            variant="ghost"
            size={isCollapsable ? "icon" : "default"}
            onClick={() => isCollapsable && setIsOpen(!isOpen)}
            className={cn("shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", className)}
            
        >
            {!isOpen ? <ChevronIcon isOpen={isOpen} /> : children}
        </Button>
    );
}

export function SidebarContent({children, className}: SidebarProps) {
    return (
        <div className={cn("flex flex-col gap-2 p-3", className)}>
            {children}
        </div>
    )
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("transition-transform duration-200", !isOpen && "rotate-180")}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
