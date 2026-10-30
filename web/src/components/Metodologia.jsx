// Metodologia: como cada número foi produzido, na ordem do pipeline, com pesos e validação contra o artigo.
import { useRef } from "react";

import { CabecalhoSecao } from "@/components/CabecalhoSecao";
import { MAIOR_PESO, PESOS, VALIDACAO } from "@/content/metodologia";
import { useIdioma } from "@/i18n";
import { useRevelarSecao } from "@/lib/animacao";
import { cn } from "@/lib/utils";

const PASSOS = ["amostra", "valores", "percentis", "indices", "testes", "bonferroni"];

function TabelaPesos({ indice }) {
  const { t, numero } = useIdioma();
  return (
    <table className="w-full text-sm">
      <caption className="display mb-3 text-left text-xl font-semibold">{t(`indices.${indice}`)}</caption>
      <thead>
        <tr className="border-y border-rule-strong text-left text-muted-foreground">
          <th scope="col" className="py-2 pr-3 font-normal">{t("metodo.tabelaPesos.metrica")}</th>
          <th scope="col" className="hidden py-2 pr-3 font-normal sm:table-cell">{t("metodo.tabelaPesos.fonte")}</th>
          <th scope="col" className="py-2 text-right font-normal" colSpan={2}>{t("metodo.tabelaPesos.peso")}</th>
        </tr>
      </thead>
      <tbody>
        {PESOS[indice].map(({ metrica, fonte, peso }) => (
          <tr key={metrica} className="border-b border-rule">
            <th scope="row" className="py-2 pr-3 text-left font-normal">{t(`metricas.${metrica}`)}</th>
            <td className="hidden py-2 pr-3 text-muted-foreground sm:table-cell">{t(`metodo.fontes.${fonte}`)}</td>
            <td className="num py-2 pr-3 text-right">{numero(peso, 1)}</td>
            <td className="w-16 py-2" aria-hidden="true">
              <div className="h-1.5 bg-foreground" style={{ width: `${(peso / MAIOR_PESO) * 100}%` }} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ValorValidacao({ linha, lado }) {
  const { t, numero } = useIdioma();
  const valor = linha[lado];
  if (linha.tipo === "texto") return t(`metodo.linhasValidacao.${valor}`);
  const textos = valor.map(([numeroBase, casas]) => numero(numeroBase, casas));
  if (linha.tipo === "par") return textos.join(" / ");
  if (linha.tipo === "faixa") return textos.join(" – ");
  return textos.join("; ");
}

export function Metodologia() {
  const { t } = useIdioma();
  const raiz = useRef(null);
  useRevelarSecao(raiz);

  return (
    <section id="metodo" ref={raiz} aria-labelledby="titulo-metodo" className="mx-auto max-w-[1440px] px-4 pt-28 md:px-8 md:pt-40">
      <CabecalhoSecao id="titulo-metodo" numero="03" linha1={t("metodo.titulo1")} linha2={t("metodo.titulo2")}>
        {t("metodo.intro")}
      </CabecalhoSecao>

      <div data-revelar="bloco" className="mt-14 grid grid-cols-12 gap-6 bg-lime px-5 py-8 text-lime-ink md:px-8 md:py-10">
        <p className="display col-span-12 text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.02] font-semibold md:col-span-7">
          {t("metodo.avisoCausa")}
        </p>
        <p className="col-span-12 max-w-[48ch] self-end text-base leading-relaxed md:col-span-5">{t("metodo.avisoAmostra")}</p>
      </div>

      <ol className="mt-16 border-t border-rule-strong md:mt-24">
        {PASSOS.map((passo, indice) => (
          <li key={passo} data-revelar="bloco" className="grid grid-cols-12 gap-x-6 gap-y-4 border-b border-rule py-8 md:py-10">
            <span className="num col-span-12 text-sm text-muted-foreground md:col-span-2">
              {String(indice + 1).padStart(2, "0")}
            </span>
            <h3 className="display col-span-12 text-2xl font-semibold md:col-span-4 lg:text-3xl">{t(`metodo.${passo}Titulo`)}</h3>
            <div className="col-span-12 md:col-span-6">
              <p className="max-w-[62ch] leading-relaxed text-muted-foreground">{t(`metodo.${passo}Texto`)}</p>
              {passo === "indices" && (
                <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-8">
                  <TabelaPesos indice="indice_tecnico" />
                  <TabelaPesos indice="indice_explosivo" />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-16 grid grid-cols-12 gap-x-6 gap-y-12 md:mt-24">
        {["pool", "arredondamento"].map((tema) => (
          <article key={tema} data-revelar="bloco" className="col-span-12 border-t border-rule-strong pt-6 md:col-span-6">
            <h3 className="display text-2xl font-semibold lg:text-3xl">{t(`metodo.${tema}Titulo`)}</h3>
            <p className="mt-4 max-w-[58ch] leading-relaxed text-muted-foreground">{t(`metodo.${tema}Texto`)}</p>
          </article>
        ))}
      </div>

      <div className="mt-16 grid grid-cols-12 gap-x-6 gap-y-8 md:mt-24">
        <div className="col-span-12 lg:col-span-3">
          <h3 className="display text-3xl font-semibold">{t("metodo.validacaoTitulo")}</h3>
          <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">{t("metodo.validacaoTexto")}</p>
        </div>
        <div className="col-span-12 lg:col-span-9" data-revelar="bloco">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-y border-rule-strong text-left text-muted-foreground">
                  <th scope="col" className="py-2 pr-4 font-normal">{t("metodo.tabelaValidacao.resultado")}</th>
                  <th scope="col" className="py-2 pr-4 text-right font-normal">{t("metodo.tabelaValidacao.artigo")}</th>
                  <th scope="col" className="py-2 pr-4 text-right font-normal">{t("metodo.tabelaValidacao.projeto")}</th>
                  <th scope="col" className="py-2 text-right font-normal">{t("metodo.tabelaValidacao.situacao")}</th>
                </tr>
              </thead>
              <tbody>
                {VALIDACAO.map((linha) => (
                  <tr key={linha.chave} className="border-b border-rule">
                    <th scope="row" className="py-2.5 pr-4 text-left font-normal">{t(`metodo.linhasValidacao.${linha.chave}`)}</th>
                    <td className="num py-2.5 pr-4 text-right">
                      <ValorValidacao linha={linha} lado="artigo" />
                    </td>
                    <td className="num py-2.5 pr-4 text-right">
                      <ValorValidacao linha={linha} lado="projeto" />
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={cn(
                          "num inline-block px-2 py-0.5 text-xs",
                          linha.igual ? "border border-rule-strong" : "bg-foreground text-background",
                        )}
                      >
                        {linha.igual ? t("metodo.tabelaValidacao.igual") : t("metodo.tabelaValidacao.difere")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">{t("metodo.notaValidacao")}</p>
        </div>
      </div>
    </section>
  );
}
