// Academias: composição da amostra e, por aba, mediana e quartis de cada índice ou o tamanho de cada grupo.
import { useId, useState } from "react";

import { Abas, Cartao } from "@/components/dashboard/Cartoes";
import { useIdioma } from "@/i18n";
import { ACADEMIAS, linhaDescritiva } from "@/lib/dados";

export function CartaoAcademias({ id, dados }) {
  const { t, numero } = useIdioma();
  const [aba, setAba] = useState("indice_tecnico");
  const idPainel = `painel-${useId().replace(/:/g, "")}`;
  const total = dados.jogadores.length;
  const grupos = dados.academias.map((clube) => ({
    clube,
    n: dados.jogadores.filter((j) => j.clube === clube).length,
  }));

  return (
    <Cartao id={id} titulo={t("painel.academiasTitulo")}>
      <Abas
        rotulo={t("painel.academiasTitulo")}
        idPainel={idPainel}
        opcoes={[
          { valor: "indice_tecnico", rotulo: t("indices.indice_tecnico") },
          { valor: "indice_explosivo", rotulo: t("indices.indice_explosivo") },
          { valor: "amostra", rotulo: t("painel.abaAmostra") },
        ]}
        valor={aba}
        aoMudar={setAba}
      />

      <div className="mt-4 flex h-1.5 gap-1" role="img" aria-label={t("painel.composicao")}>
        {grupos.map(({ clube, n }) => (
          <span
            key={clube}
            title={`${ACADEMIAS[clube].academia}: ${n}`}
            className="rounded-full transition-[flex-grow] duration-500"
            style={{ flexGrow: n, background: ACADEMIAS[clube].cor }}
          />
        ))}
      </div>

      <div id={idPainel} role="tabpanel" className="mt-4 grid grid-cols-2 gap-3">
        {grupos.map(({ clube, n }) => {
          const linha = aba === "amostra" ? null : linhaDescritiva(dados.descritiva, clube, aba);
          return (
            <article key={clube} className="rounded-xl border border-border p-4">
              <span className="block h-1 w-8 rounded-full" style={{ background: ACADEMIAS[clube].cor }} aria-hidden="true" />
              <h3 className="mt-3 truncate text-sm">{ACADEMIAS[clube].academia}</h3>
              {aba === "amostra" ? (
                <>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{n}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("painel.participacao", { p: Math.round((n / total) * 100) })}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{numero(linha?.mediana, 1)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("painel.faixaQ", { q1: numero(linha?.q1, 1), q3: numero(linha?.q3, 1) })}
                  </p>
                </>
              )}
            </article>
          );
        })}
      </div>
    </Cartao>
  );
}
