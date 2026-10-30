// Efeito do pool: os arquivos Artigo e Corrigido da mesma fonte, lado a lado. Só leitura e subtração para exibir a diferença.
import { useRef } from "react";

import { CabecalhoSecao } from "@/components/CabecalhoSecao";
import { MarcaAcademia } from "@/components/MarcaAcademia";
import { useIdioma } from "@/i18n";
import { useRevelarSecao } from "@/lib/animacao";
import { ACADEMIAS, INDICES, useResultadosDosDoisPools } from "@/lib/dados";
import { cn } from "@/lib/utils";

const TOLERANCIA = 1e-6;

function diferenca(numero, valor, casas) {
  if (valor == null) return "—";
  const texto = numero(Math.abs(valor), casas);
  if (Math.abs(valor) < TOLERANCIA) return texto;
  return `${valor > 0 ? "+" : "−"}${texto}`;
}

function GraficoInclinacao({ artigo, corrigido, indice }) {
  const { t, numero } = useIdioma();
  const porId = new Map(corrigido.jogadores.map((j) => [j.player_id, j]));
  const linhas = artigo.jogadores
    .map((j) => ({ jogador: j, de: j[indice], para: porId.get(j.player_id)?.[indice] }))
    .filter((linha) => linha.de != null && linha.para != null);
  const mudaram = linhas.filter((linha) => Math.abs(linha.para - linha.de) > TOLERANCIA).length;

  return (
    <figure className="border-t border-rule-strong pt-6" data-revelar="grafico">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <span className="display text-2xl font-semibold">{t(`indices.${indice}`)}</span>
        <span className="num text-sm text-muted-foreground">{t("pool.mudaram", { n: mudaram, total: linhas.length })}</span>
      </figcaption>
      <div className="relative mt-6 grid grid-cols-[2.5rem_1fr_2.5rem] gap-x-2">
        <div className="num relative text-[11px] text-muted-foreground" aria-hidden="true">
          {[100, 75, 50, 25, 0].map((marca) => (
            <span key={marca} className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - marca}%` }}>
              {marca}
            </span>
          ))}
        </div>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-[340px] w-full overflow-visible md:h-[420px]"
          role="img"
          aria-label={t("pool.resumoSlope", { indice: t(`indices.${indice}`), n: linhas.length })}
        >
          {[0, 25, 50, 75, 100].map((marca) => (
            <line
              key={marca}
              x1="0"
              x2="100"
              y1={100 - marca}
              y2={100 - marca}
              stroke="var(--border)"
              strokeDasharray="1 2"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <line x1="0" x2="0" y1="0" y2="100" stroke="var(--rule-strong)" vectorEffect="non-scaling-stroke" />
          <line x1="100" x2="100" y1="0" y2="100" stroke="var(--rule-strong)" vectorEffect="non-scaling-stroke" />
          {linhas.map(({ jogador, de, para }) => {
            const mudou = Math.abs(para - de) > TOLERANCIA;
            return (
              <line
                key={jogador.player_id}
                x1="0"
                y1={100 - de}
                x2="100"
                y2={100 - para}
                stroke={ACADEMIAS[jogador.clube]?.linha}
                strokeWidth={mudou ? 1.6 : 1}
                strokeOpacity={mudou ? 0.85 : 0.25}
                vectorEffect="non-scaling-stroke"
              >
                <title>
                  {`${jogador.nome}: ${numero(de, 1)} → ${numero(para, 1)}`}
                </title>
              </line>
            );
          })}
        </svg>
        <div aria-hidden="true" />
      </div>
      <div className="mt-3 grid grid-cols-[2.5rem_1fr_2.5rem] gap-x-2 text-sm">
        <span />
        <span className="flex justify-between">
          <span>{t("pool.artigo")}</span>
          <span>{t("pool.corrigido")}</span>
        </span>
        <span />
      </div>
    </figure>
  );
}

export function EfeitoPool({ modo }) {
  const { t, numero, pValor } = useIdioma();
  const raiz = useRef(null);
  const { artigo, corrigido, erro } = useResultadosDosDoisPools(modo);
  const pronto = Boolean(artigo && corrigido);
  useRevelarSecao(raiz, pronto);

  const fonte = t(modo === "snapshot" ? "controles.snapshot" : "controles.raw");

  const testes = pronto
    ? INDICES.map((indice) => ({
        indice,
        artigo: artigo.kruskal.find((k) => k.indice === indice),
        corrigido: corrigido.kruskal.find((k) => k.indice === indice),
      }))
    : [];
  const conclusaoIgual = testes.every((teste) => teste.artigo?.significativo === teste.corrigido?.significativo);

  return (
    <section id="pool" ref={raiz} aria-labelledby="titulo-pool" className="mx-auto max-w-[1440px] px-4 pt-28 md:px-8 md:pt-40">
      <CabecalhoSecao id="titulo-pool" numero="04" linha1={t("pool.titulo1")} linha2={t("pool.titulo2")}>
        {t("pool.intro", { fonte })}
      </CabecalhoSecao>

      {erro && (
        <p className="mt-10 border-l-2 border-destructive pl-3 text-sm text-destructive">
          {t("controles.erro", { arquivo: `resultados_${modo}_*.json`, comando: `uv run python -m soccerplayers executar --modo ${modo}` })}
        </p>
      )}

      {pronto && (
        <div className="mt-14 flex flex-col gap-24 md:gap-32">
          <div className="grid grid-cols-12 gap-x-6 gap-y-8">
            <div className="col-span-12 lg:col-span-3">
              <h3 className="display text-3xl font-semibold">{t("pool.testeTitulo")}</h3>
              <p className="mt-4 max-w-[36ch] text-sm leading-relaxed">
                {conclusaoIgual ? t("pool.conclusao") : t("pool.conclusaoAlterada")}
              </p>
            </div>
            <div className="col-span-12 overflow-x-auto lg:col-span-9" data-revelar="bloco">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th scope="col" rowSpan={2} className="border-y border-rule-strong py-2 pr-4 align-bottom font-normal" />
                    <th scope="colgroup" colSpan={3} className="border-t border-rule-strong pt-2 pr-4 text-right font-normal">H</th>
                    <th scope="colgroup" colSpan={3} className="border-t border-rule-strong pt-2 text-right font-normal">{t("kruskal.p")}</th>
                  </tr>
                  <tr className="border-b border-rule-strong text-right text-muted-foreground">
                    <th scope="col" className="py-2 pr-4 font-normal">{t("pool.artigo")}</th>
                    <th scope="col" className="py-2 pr-4 font-normal">{t("pool.corrigido")}</th>
                    <th scope="col" className="py-2 pr-4 font-normal">{t("pool.delta")}</th>
                    <th scope="col" className="py-2 pr-4 font-normal">{t("pool.artigo")}</th>
                    <th scope="col" className="py-2 pr-4 font-normal">{t("pool.corrigido")}</th>
                    <th scope="col" className="py-2 font-normal">{t("pool.delta")}</th>
                  </tr>
                </thead>
                <tbody className="num">
                  {testes.map((teste) => (
                    <tr key={teste.indice} className="border-b border-rule">
                      <th scope="row" className="display py-4 pr-4 text-left text-xl font-semibold">{t(`indices.${teste.indice}`)}</th>
                      <td className="py-4 pr-4 text-right">{numero(teste.artigo?.H, 4)}</td>
                      <td className="py-4 pr-4 text-right">{numero(teste.corrigido?.H, 4)}</td>
                      <td className="py-4 pr-4 text-right font-medium">{diferenca(numero, teste.corrigido?.H - teste.artigo?.H, 4)}</td>
                      <td className="py-4 pr-4 text-right">{pValor(teste.artigo?.p_valor)}</td>
                      <td className="py-4 pr-4 text-right">{pValor(teste.corrigido?.p_valor)}</td>
                      <td className="py-4 text-right font-medium">{diferenca(numero, teste.corrigido?.p_valor - teste.artigo?.p_valor, 3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-x-6 gap-y-8">
            <div className="col-span-12 lg:col-span-3">
              <h3 className="display text-3xl font-semibold">{t("pool.jogadoresTitulo")}</h3>
              <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">{t("pool.jogadoresDescricao")}</p>
              <ul className="mt-6 flex flex-col gap-2 text-sm">
                {artigo.academias.map((clube) => (
                  <li key={clube} className="flex items-center gap-2">
                    <MarcaAcademia clube={clube} tamanho={12} />
                    {ACADEMIAS[clube].academia}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-12 grid min-w-0 grid-cols-1 gap-10 md:grid-cols-2 md:gap-8 lg:col-span-9">
              {INDICES.map((indice) => (
                <GraficoInclinacao key={indice} artigo={artigo} corrigido={corrigido} indice={indice} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-x-6 gap-y-8">
            <div className="col-span-12 lg:col-span-3">
              <h3 className="display text-3xl font-semibold">{t("pool.paresTitulo")}</h3>
              <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">{t("pool.paresDescricao")}</p>
            </div>
            <div className="col-span-12 flex flex-col gap-10 lg:col-span-9">
              {INDICES.map((indice) => (
                <div key={indice} className="overflow-x-auto" data-revelar="bloco">
                  <table className="w-full min-w-[680px] text-sm">
                    <caption className="display mb-3 text-left text-2xl font-semibold">{t(`indices.${indice}`)}</caption>
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th scope="col" rowSpan={2} className="border-y border-rule-strong py-2 pr-4 align-bottom font-normal">{t("pares.par")}</th>
                        <th scope="colgroup" colSpan={2} className="border-t border-rule-strong pt-2 pr-4 text-right font-normal">{t("pares.pBruto")}</th>
                        <th scope="colgroup" colSpan={2} className="border-t border-rule-strong pt-2 text-right font-normal">{t("pares.rankBiserial")}</th>
                      </tr>
                      <tr className="border-b border-rule-strong text-right text-muted-foreground">
                        <th scope="col" className="py-2 pr-4 font-normal">{t("pool.artigo")}</th>
                        <th scope="col" className="py-2 pr-4 font-normal">{t("pool.corrigido")}</th>
                        <th scope="col" className="py-2 pr-4 font-normal">{t("pool.artigo")}</th>
                        <th scope="col" className="py-2 font-normal">{t("pool.corrigido")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {artigo.pares
                        .filter((par) => par.indice === indice)
                        .map((par) => {
                          const outro = corrigido.pares.find(
                            (p) => p.indice === indice && p.grupo_a === par.grupo_a && p.grupo_b === par.grupo_b,
                          );
                          const mudouP = outro && Math.abs(outro.p_valor - par.p_valor) > TOLERANCIA;
                          return (
                            <tr key={`${par.grupo_a}-${par.grupo_b}`} className="border-b border-rule">
                              <th scope="row" className="py-2.5 pr-4 text-left font-normal">
                                {par.grupo_a} × {par.grupo_b}
                              </th>
                              <td className="num py-2.5 pr-4 text-right">{pValor(par.p_valor)}</td>
                              <td className={cn("num py-2.5 pr-4 text-right", mudouP && "font-medium")}>{pValor(outro?.p_valor)}</td>
                              <td className="num py-2.5 pr-4 text-right">{numero(par.rank_biserial, 2)}</td>
                              <td className="num py-2.5 text-right">{numero(outro?.rank_biserial, 2)}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
