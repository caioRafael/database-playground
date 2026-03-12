import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 },
    );
  }

  const userRef = db.collection("users").doc(session.user.id);
  const doc = await userRef.get();
  const data = doc.data() || {};

  const credits = typeof data.credits === "number" ? data.credits : 0;

  return NextResponse.json({ credits });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 },
    );
  }

  let body: { amount?: number };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body inválido." },
      { status: 400 },
    );
  }

  const amount = Number(body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Informe um valor positivo em 'amount'." },
      { status: 400 },
    );
  }

  const userRef = db.collection("users").doc(session.user.id);
  const doc = await userRef.get();
  const data = doc.data() || {};
  const currentCredits =
    typeof data.credits === "number" ? data.credits : 0;

  const newCredits = currentCredits + amount;

  await userRef.set(
    {
      credits: newCredits,
    },
    { merge: true },
  );

  return NextResponse.json({ credits: newCredits });
}

