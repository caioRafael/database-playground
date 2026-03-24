"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createPayment } from "@/lib/abacate";

type ProfileClientProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  initialCredits: number;
};

export function ProfileClient({ user, initialCredits }: ProfileClientProps) {
  const [credits, setCredits] = useState<number | null>(initialCredits);
  const [addAmount, setAddAmount] = useState<string>("5");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // const handleAddCredits = async () => {
  //   const amountNumber = Number(addAmount);
  //   if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
  //     setError("Informe um valor positivo para adicionar créditos.");
  //     return;
  //   }

  //   setSaving(true);
  //   setError(null);
  //   setSuccess(null);

  //   try {
  //     const res = await fetch("/api/credits", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ amount: amountNumber }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       setError(data.error || "Não foi possível adicionar créditos.");
  //       return;
  //     }

  //     setCredits(
  //       typeof data.credits === "number" ? data.credits : amountNumber,
  //     );
  //     setSuccess("Créditos adicionados com sucesso!");
  //   } catch (e) {
  //     setError(
  //       e instanceof Error
  //         ? e.message
  //         : "Erro inesperado ao adicionar créditos.",
  //     );
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleAddCredits = async () => {
    const price = 5;

    const payment = await createPayment(price, "PIX_QRCODE");

    console.log(payment);
  }

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-2xl rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="flex flex-row items-center gap-4 border-b border-border/60 px-6 py-5">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
            <AvatarFallback>
              {(user.name ?? user.email ?? "?")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-lg font-semibold leading-none tracking-tight">
              {user.name ?? user.email ?? "Usuário"}
            </p>
            {user.email && (
              <p className="text-xs text-muted-foreground">
                {user.email}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                Conta GitHub
              </span>
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                Workspace: Database Playground
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Créditos disponíveis
              </p>
              <p className="text-3xl font-semibold leading-none">
                {credits === null ? "..." : credits}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Cada geração de schema consome 1 crédito.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Adicionar créditos
              </p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="w-24"
                />
                <Button onClick={handleAddCredits} disabled={saving}>
                  {saving ? "Salvando..." : "Adicionar"}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Simulação de compra de créditos. Em produção, integre com um
                provedor de pagamento (Stripe, etc.).
              </p>
            </div>
          </div>

          {(error || success) && (
            <div className="space-y-1">
              {error && (
                <p className="text-xs text-destructive">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-xs text-emerald-600">
                  {success}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

