"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient, useSession } from "@/lib/auth-client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const { data: session } = useSession();

  const handleGithubLogin = async () => {
    await authClient.signIn.social({
      provider: "github",
    });
  };

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6"
      )}
    >
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-4">
        {session?.user ? (
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "Avatar"} />
              <AvatarFallback>
                {session.user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground">
              {session.user.name ?? session.user.email}
            </span>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={handleGithubLogin}>
            Login com GitHub
          </Button>
        )}
      </div>
    </header>
  );
}
