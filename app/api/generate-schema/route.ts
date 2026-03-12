import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { DatabaseSchema, ColumnType, Relationship } from '@/interface/database-types'

const COLUMN_TYPES: ColumnType[] = [
  'INT', 'BIGINT', 'VARCHAR', 'TEXT', 'BOOLEAN', 'DATE', 'TIMESTAMP',
  'DECIMAL', 'FLOAT', 'UUID', 'JSON',
]

const SYSTEM_PROMPT = `Você é um especialista em modelagem de bancos de dados relacionais. Sua tarefa é gerar ou editar um schema de banco de dados em JSON estrito, a partir da descrição do usuário e, quando fornecido, de um schema atual.

Regras do schema:
- tables: array de tabelas. Cada tabela tem: id (string única, ex: "tbl_1"), name (nome da tabela em snake_case), columns (array), position (objeto { x: number, y: number } para posição no canvas).
- Colunas: id (string única, ex: "col_1"), name (snake_case), type (um de: ${COLUMN_TYPES.join(', ')}), isPrimaryKey (boolean), isForeignKey (boolean), isNullable (boolean), isUnique (boolean). Opcional: defaultValue (string), references (apenas se isForeignKey true: { tableId, columnId }).
- Toda tabela deve ter pelo menos uma coluna com isPrimaryKey true (geralmente "id" do tipo INT ou UUID).
- relationships: array. Cada item: id (string única), sourceTableId, sourceColumnId (coluna FK), targetTableId, targetColumnId (coluna referenciada), type: "one-to-one" | "one-to-many" | "many-to-many".
- Posições no canvas: use grid. x: 50, 310, 570, ... (incremento 260). y: 50, 138, 226, ... (incremento 88). Coloque até 3 tabelas por linha.
- Quando um schema atual for fornecido, ele será enviado em JSON. Use-o como base e aplique as alterações solicitadas pelo usuário, preservando o que já faz sentido e ajustando apenas o necessário (por exemplo: adicionar tabelas/colunas, renomear, mudar tipos, criar/remover relacionamentos).

Responda APENAS com o JSON válido do schema, sem markdown e sem texto antes ou depois. Formato:
{"tables":[...],"relationships":[...]}`

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY não configurada' },
      { status: 500 }
    )
  }

  let body: { messages?: { role: string; content: string }[]; schema?: DatabaseSchema }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Body inválido' },
      { status: 400 }
    )
  }

  const messages = body.messages as { role: string; content: string }[] | undefined
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: 'Envie messages (array de { role, content })' },
      { status: 400 }
    )
  }

  const openai = new OpenAI({ apiKey })

  const historyMessages =
    messages
      ?.filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })) ?? []

  const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...(body.schema
      ? [
          {
            role: 'system' as const,
            content:
              'A seguir está o schema atual do banco de dados em JSON. Use-o como base e aplique apenas as alterações que o usuário solicitar, mantendo o que já funciona quando fizer sentido:\n\n' +
              JSON.stringify(body.schema),
          },
        ]
      : []),
    ...historyMessages,
  ]

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openAiMessages,
      temperature: 0.2,
    })

    const content = completion.choices[0]?.message?.content?.trim()
    if (!content) {
      return NextResponse.json(
        { error: 'Resposta vazia da IA' },
        { status: 502 }
      )
    }

    // Remove possible markdown code block
    let jsonStr = content
    const codeMatch = content.match(/^```(?:json)?\s*([\s\S]*?)```$/m)
    if (codeMatch) jsonStr = codeMatch[1].trim()

    const parsed = JSON.parse(jsonStr) as unknown
    if (!parsed || typeof parsed !== 'object' || !('tables' in parsed) || !('relationships' in parsed)) {
      return NextResponse.json(
        { error: 'Schema retornado em formato inválido' },
        { status: 502 }
      )
    }

    const schema = validateAndNormalizeSchema(parsed)
    return NextResponse.json({ schema })
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: err.message || 'Erro na API OpenAI' },
        { status: 502 }
      )
    }
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Resposta da IA não é JSON válido' },
        { status: 502 }
      )
    }
    throw err
  }
}

function validateAndNormalizeSchema(raw: unknown): DatabaseSchema {
  const tables = Array.isArray((raw as { tables?: unknown }).tables)
    ? (raw as { tables: unknown[] }).tables
    : []
  const relationships = Array.isArray((raw as { relationships?: unknown }).relationships)
    ? (raw as { relationships: unknown[] }).relationships
    : []

  const normalizedTables = tables.map((t, i) => {
    const table = t as Record<string, unknown>
    const id = typeof table.id === 'string' ? table.id : `tbl_${i + 1}`
    const name = typeof table.name === 'string' ? table.name : `tabela_${i + 1}`
    const pos = table.position as { x?: number; y?: number } | undefined
    const position = {
      x: typeof pos?.x === 'number' ? pos.x : 50 + (i % 3) * 260,
      y: typeof pos?.y === 'number' ? pos.y : 50 + Math.floor(i / 3) * 88,
    }
    const cols = Array.isArray(table.columns) ? table.columns : []
    const columns = cols.map((c, j) => {
      const col = c as Record<string, unknown>
      const colId = typeof col.id === 'string' ? col.id : `col_${id}_${j}`
      const type = COLUMN_TYPES.includes((col.type as ColumnType)) ? (col.type as ColumnType) : 'VARCHAR'
      const refs = col.references as { tableId?: string; columnId?: string } | undefined
      const hasRef = col.isForeignKey && refs && typeof refs.tableId === 'string' && typeof refs.columnId === 'string'
      const base = {
        id: colId,
        name: typeof col.name === 'string' ? col.name : `coluna_${j}`,
        type,
        isPrimaryKey: Boolean(col.isPrimaryKey),
        isForeignKey: Boolean(col.isForeignKey),
        isNullable: Boolean(col.isNullable),
        isUnique: Boolean(col.isUnique),
        ...(typeof col.defaultValue === 'string' ? { defaultValue: col.defaultValue } : {}),
      }
      return hasRef ? { ...base, references: { tableId: refs!.tableId!, columnId: refs!.columnId! } } : base
    })
    return { id, name, columns, position }
  })

  const relType = (r: Record<string, unknown>): Relationship['type'] =>
    r.type === 'one-to-one' || r.type === 'one-to-many' || r.type === 'many-to-many'
      ? r.type
      : 'one-to-many'

  const normalizedRels: Relationship[] = relationships
    .filter((r): r is Record<string, unknown> => r != null && typeof r === 'object')
    .map((r, i) => ({
      id: typeof r.id === 'string' ? r.id : `rel_${i + 1}`,
      sourceTableId: String(r.sourceTableId ?? ''),
      sourceColumnId: String(r.sourceColumnId ?? ''),
      targetTableId: String(r.targetTableId ?? ''),
      targetColumnId: String(r.targetColumnId ?? ''),
      type: relType(r),
    }))
    .filter(
      r =>
        r.sourceTableId &&
        r.sourceColumnId &&
        r.targetTableId &&
        r.targetColumnId &&
        normalizedTables.some(t => t.id === r.sourceTableId) &&
        normalizedTables.some(t => t.id === r.targetTableId)
    )

  return { tables: normalizedTables, relationships: normalizedRels }
}
