import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:py-16 flex-1 flex flex-col">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary shadow-sm shadow-primary/30">
              DB
            </div>
            <span className="text-sm font-semibold text-primary">
              DB Playground
            </span>
          </div>

          <nav className="hidden sm:flex items-center gap-6 text-xs md:text-sm text-muted-foreground">
            <span className="hover:text-foreground transition-colors cursor-default">
              Playground visual de banco de dados com IA
            </span>
          </nav>

          <Link
            href="/playground"
            className="inline-flex items-center justify-center rounded-full border border-border bg-secondary/60 px-4 py-1.5 text-xs md:text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary hover:border-primary transition-colors"
          >
            Entrar no playground
          </Link>
        </header>

        <section className="mt-14 grid gap-10 md:grid-cols-[minmax(0,1.5fr),minmax(0,1fr)] items-center flex-1">
          <div>
            <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] md:text-xs font-medium text-primary">
              Microsaas · Laboratório de bancos de dados com IA
            </p>

            <h1 className="mt-6 text-3xl md:text-5xl font-semibold tracking-tight">
              Brinque, modele e teste bancos de dados com ajuda de IA.
            </h1>

            <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
              O DB Playground é um ambiente visual para você desenhar schemas,
              iterar em cima do modelo, exportar SQL e conversar com uma IA que
              entende o seu banco de dados.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/playground"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
              >
                Começar agora no playground
              </Link>
              <span className="text-xs md:text-sm text-muted-foreground">
                Sem configurar servidor, sem instalar nada.
              </span>
            </div>

            <dl className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-xl text-sm">
              <div className="rounded-lg border border-border bg-card/60 p-4">
                <dt className="text-xs font-medium text-muted-foreground">
                  Canvas visual de entidades
                </dt>
                <dd className="mt-1.5 text-sm font-semibold">
                  Arraste, conecte e organize tabelas diretamente no{" "}
                  <span className="text-primary">Database Canvas</span>.
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-card/60 p-4">
                <dt className="text-xs font-medium text-muted-foreground">
                  Barra de ferramentas inteligente
                </dt>
                <dd className="mt-1.5 text-sm font-semibold">
                  Use o <span className="text-primary">Database Toolbar</span>{" "}
                  para salvar, limpar, exportar e abrir o chat de IA em um
                  clique.
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-card/60 p-4">
                <dt className="text-xs font-medium text-muted-foreground">
                  Navegação por projetos e tabelas
                </dt>
                <dd className="mt-1.5 text-sm font-semibold">
                  Organize seus objetos no{" "}
                  <span className="text-primary">Database Sidebar</span> e
                  navegue entre entidades com fluidez.
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-card/60 p-4">
                <dt className="text-xs font-medium text-muted-foreground">
                  Chat com IA para SQL e modelagem
                </dt>
                <dd className="mt-1.5 text-sm font-semibold">
                  Abra o <span className="text-primary">Database AI Chat</span>{" "}
                  para gerar queries, revisar modelos e pedir sugestões em
                  linguagem natural.
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative mt-2 md:mt-0">
            <div className="absolute inset-0 -translate-x-8 -translate-y-4 blur-3xl opacity-60 bg-primary/20" />
            <div className="relative rounded-2xl border border-border bg-card/80 p-4 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="ml-3 text-xs text-muted-foreground">
                  db-playground.schema
                </span>
              </div>

              <div className="mt-3 rounded-lg bg-background/80 border border-border/70 p-3 text-[11px] font-mono text-foreground/90 space-y-1.5">
                <div className="text-primary">
                  table <span className="text-foreground">orders</span> &#123;
                </div>
                <div className="pl-4">
                  id <span className="text-muted-foreground">uuid</span>{" "}
                  <span className="text-primary">primary key</span>
                </div>
                <div className="pl-4">
                  user_id <span className="text-muted-foreground">uuid</span>
                </div>
                <div className="pl-4">
                  total <span className="text-muted-foreground">numeric</span>
                </div>
                <div className="pl-4">
                  status <span className="text-muted-foreground">text</span>
                </div>
                <div className="pl-4">
                  created_at{" "}
                  <span className="text-muted-foreground">timestamp</span>
                </div>
                <div>&#125;</div>
              </div>

              <div className="mt-4 rounded-lg bg-secondary/20 border border-border/60 p-3 text-[11px] font-mono">
                <div className="text-muted-foreground mb-1">
                  Database AI Chat · sugestão de query
                </div>
                <div className="text-primary">
                  SELECT <span className="text-foreground/90">*</span> FROM{" "}
                  <span className="text-foreground/90">orders</span> WHERE{" "}
                  <span className="text-foreground/90">status</span> =
                  <span className="text-foreground/90"> {`'paid'`}</span> ORDER BY{" "}
                  <span className="text-foreground/90">created_at</span>{" "}
                  DESC;
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-border pt-6 text-[11px] md:text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p>DB Playground · experimente ideias de banco de dados com segurança.</p>
          <p className="text-muted-foreground/80">
            Construído com Next.js, Tailwind CSS e componentes do sistema.
          </p>
        </footer>
      </div>
    </main>
  );
}
