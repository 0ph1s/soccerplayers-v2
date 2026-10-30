// Blocos visuais da dashboard: cartão, selo e cartão de KPI.
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

export function Cartao({ id, titulo, info, acao, className, children }) {
  return (
    <section
      id={id}
      data-cartao
      aria-label={typeof titulo === "string" ? titulo : undefined}
      className={cn("min-w-0 scroll-mt-6 rounded-[18px] border border-border bg-card p-5 text-card-foreground", className)}
    >
      {(titulo || acao) && (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {titulo}
            {info && (
              <span title={info} aria-label={info} role="img" className="inline-flex cursor-help">
                <Info className="size-3.5" aria-hidden="true" />
              </span>
            )}
          </h2>
          {acao}
        </header>
      )}
      {children}
    </section>
  );
}

export function Selo({ tipo = "neutro", children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        tipo === "positivo" && "bg-lime text-lime-ink",
        tipo === "neutro" && "bg-muted text-muted-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", tipo === "positivo" ? "bg-lime-ink" : "bg-muted-foreground")}
      />
      {children}
    </span>
  );
}

export function CartaoKpi({ titulo, valor, selo, linha, className }) {
  return (
    <Cartao className={className}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm text-muted-foreground">{titulo}</h2>
        {selo}
      </div>
      <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-4xl font-semibold tracking-tight tabular-nums">{valor}</span>
        {linha && <span className="text-sm text-muted-foreground">{linha}</span>}
      </p>
    </Cartao>
  );
}

/** Abas no estilo da dashboard: sublinhado no item ativo, navegação por botões. */
export function Abas({ rotulo, opcoes, valor, aoMudar, idPainel }) {
  return (
    <div role="tablist" aria-label={rotulo} className="flex border-b border-border">
      {opcoes.map((opcao) => {
        const ativa = opcao.valor === valor;
        return (
          <button
            key={opcao.valor}
            type="button"
            role="tab"
            aria-selected={ativa}
            aria-controls={idPainel}
            onClick={() => aoMudar(opcao.valor)}
            className={cn(
              "-mb-px flex-1 cursor-pointer border-b-2 px-3 py-2 text-sm transition-colors duration-300",
              ativa ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {opcao.rotulo}
          </button>
        );
      })}
    </div>
  );
}

/** Seletor compacto em pílula, usado no topo dos cartões. */
export function Pilulas({ rotulo, opcoes, valor, aoMudar }) {
  return (
    <div role="group" aria-label={rotulo} className="inline-flex rounded-full border border-border p-0.5">
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          aria-pressed={opcao.valor === valor}
          onClick={() => aoMudar(opcao.valor)}
          className={cn(
            "cursor-pointer rounded-full px-3 py-1 text-xs transition-colors duration-300",
            opcao.valor === valor ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opcao.rotulo}
        </button>
      ))}
    </div>
  );
}
