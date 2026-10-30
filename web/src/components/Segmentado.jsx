// Controle segmentado: um grupo de botões em que só uma opção fica ativa.
import { useId } from "react";

import { cn } from "@/lib/utils";

export function Segmentado({ rotulo, opcoes, valor, aoMudar, tamanho = "md", vertical = false, className }) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {rotulo && (
        <span id={id} className="rotulo">
          {rotulo}
        </span>
      )}
      <div
        role="group"
        aria-labelledby={rotulo ? id : undefined}
        className={cn(
          "border border-rule-strong",
          vertical ? "flex w-full flex-col" : "inline-flex w-full flex-wrap sm:w-auto",
        )}
      >
        {opcoes.map((opcao) => {
          const ativo = opcao.valor === valor;
          return (
            <button
              key={opcao.valor}
              type="button"
              aria-pressed={ativo}
              onClick={() => aoMudar(opcao.valor)}
              className={cn(
                "cursor-pointer font-mono transition-colors",
                vertical
                  ? "border-b border-rule-strong text-left last:border-b-0"
                  : "flex-1 border-r border-rule-strong last:border-r-0 sm:flex-none",
                tamanho === "sm" ? (vertical ? "px-3 py-2 text-xs" : "px-2.5 py-1 text-xs") : "px-4 py-2 text-sm",
                ativo
                  ? "bg-lime text-lime-ink"
                  : "text-foreground hover:bg-foreground/[0.06]",
              )}
            >
              {opcao.rotulo}
            </button>
          );
        })}
      </div>
    </div>
  );
}
