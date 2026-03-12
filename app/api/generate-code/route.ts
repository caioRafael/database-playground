import { NextResponse } from "next/server"
import OpenAI from "openai"
import type { DatabaseSchema } from "@/interface/database-types"
import { auth } from "@/lib/auth"
import { db } from "@/lib/firebase"

const SYSTEM_PROMPT = `Você é um especialista em bancos de dados e ORMs.
Receberá:
- Um schema relacional em JSON (tabelas, colunas e relacionamentos).
- Um alvo de saída (por exemplo: "SQL - PostgreSQL", "Prisma (Node.js)", "Laravel Migrations (PHP)", etc.).

Sua tarefa é gerar o código completo para criar esse banco de dados nesse alvo específico.

Regras:
- Use boas práticas e tipos apropriados para o alvo escolhido.
- Inclua chaves primárias, estrangeiras, índices e constraints conforme refletidos no schema.
- Se o alvo for ORM, gere as entidades / models / migrations mais idiomáticos possíveis.
- O alvo SEMPRE será uma linguagem de programação ou ORM que existe de fato (Java, Python, C#, Node.js, Go, ORMs populares, etc.).
- NÃO explique nada em texto.
- NÃO use markdown.
- Responda APENAS com o código puro que o desenvolvedor poderia colar no projeto.`

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY não configurada" },
      { status: 500 },
    )
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Você precisa estar autenticado para usar a IA." },
      { status: 401 },
    )
  }

  const userRef = db.collection("users").doc(session.user.id)
  const userSnap = await userRef.get()
  const userData = userSnap.data() || {}
  const currentCredits =
    typeof userData.credits === "number" ? userData.credits : 0

  if (currentCredits <= 0) {
    return NextResponse.json(
      {
        error:
          "Você não possui créditos suficientes para gerar código. Adicione créditos na página de perfil.",
      },
      { status: 402 },
    )
  }

  const newCredits = currentCredits - 1
  await userRef.set(
    {
      credits: newCredits,
    },
    { merge: true },
  )

  let body: { schema?: DatabaseSchema; target?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Body inválido" },
      { status: 400 },
    )
  }

  if (!body?.schema || !body.schema.tables || !Array.isArray(body.schema.tables)) {
    return NextResponse.json(
      { error: "Envie um schema de banco de dados válido." },
      { status: 400 },
    )
  }

  if (!body.target || typeof body.target !== "string") {
    return NextResponse.json(
      { error: "Envie o alvo (linguagem/ORM) em 'target'." },
      { status: 400 },
    )
  }

  const openai = new OpenAI({ apiKey })

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content:
        "Alvo de saída (linguagem/ORM): " +
        body.target +
        "\n\nSchema relacional em JSON:\n\n" +
        JSON.stringify(body.schema),
    },
  ]

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
    })

    const content = completion.choices[0]?.message?.content?.trim()
    if (!content) {
      return NextResponse.json(
        { error: "Resposta vazia da IA" },
        { status: 502 },
      )
    }

    // Remove possível bloco de código markdown
    let code = content
    const codeMatch = content.match(/^```[a-zA-Z0-9]*\s*([\s\S]*?)```$/m)
    if (codeMatch) {
      code = codeMatch[1].trim()
    }

    return NextResponse.json({ code, credits: newCredits })
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: err.message || "Erro na API OpenAI" },
        { status: 502 },
      )
    }
    return NextResponse.json(
      { error: "Erro inesperado ao gerar código." },
      { status: 502 },
    )
  }
}

