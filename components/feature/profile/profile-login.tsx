"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function ProfileLogin() {
  const handleLoginGithub = () => {
    signIn("github");
  };

  return (
    <div className="p-6 flex flex-col gap-4 max-w-md">
      <h1 className="text-xl font-semibold">Perfil</h1>
      <p className="text-sm text-muted-foreground">
        Faça login para gerenciar seus créditos de IA.
      </p>
      <Button variant="outline" size="sm" onClick={handleLoginGithub}>
        Login com GitHub
      </Button>
    </div>
  );
}

