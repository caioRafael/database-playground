import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className }: ToolbarProps) {
  return (
    <header
      className={cn(
        "w-full shrink-0 border-b border-border bg-card px-4 py-3 flex items-center gap-2",
        className
      )}
    >
      <Button variant="outline" size="sm">
        Novo
      </Button>
      <Button variant="outline" size="sm">
        Executar
      </Button>
    </header>
  );
}
