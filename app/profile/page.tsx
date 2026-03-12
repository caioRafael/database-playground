"use client";

import { useEffect, useState } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [addAmount, setAddAmount] = useState<string>("5");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCredits = async () => {
    if (!session?.user) return;
    setLoadingCredits(true);
    setError(null);
    try {
      const res = await fetch("/api/credits");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Não foi possível carregar os créditos.");
        return;
      }

      setCredits(typeof data.credits === "number" ? data.credits : 0);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Erro inesperado ao carregar créditos."
      );
    } finally {
      setLoadingCredits(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchCredits();
    }
  }, [session?.user]);

  const handleLoginGithub = async () => {
    await authClient.signIn.social({
      provider: "github",
    });
  };

  const handleAddCredits = async () => {
    const amountNumber = Number(addAmount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError("Informe um valor positivo para adicionar créditos.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Não foi possível adicionar créditos.");
        return;
      }

      setCredits(typeof data.credits === "number" ? data.credits : amountNumber);
      setSuccess("Créditos adicionados com sucesso!");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Erro inesperado ao adicionar créditos."
      );
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!session?.user) {
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

  return (
    <div className="p-6 max-w-xl flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seus créditos para usar a IA de geração de banco de dados.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Usuário</p>
        <p className="text-sm text-foreground">
          {session.user.name ?? session.user.email}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Créditos disponíveis</p>
        <p className="text-2xl font-bold">
          {loadingCredits || credits === null ? "..." : credits}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Adicionar créditos</p>
        <div className="flex gap-2 max-w-xs">
          <Input
            type="number"
            min={1}
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
          />
          <Button onClick={handleAddCredits} disabled={saving}>
            {saving ? "Salvando..." : "Adicionar"}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Esta é uma simulação de compra de créditos. Em produção você integraria
          com um provedor de pagamento.
        </p>
      </div>

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
  );
}

