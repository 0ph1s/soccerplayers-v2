// Dispersão técnico × explosivo: um ponto por jogador, cor e forma por academia, filtros por academia e posição.
import { useMemo, useRef, useState } from "react";
import { CartesianGrid, ReferenceLine, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";

import { MarcaAcademia } from "@/components/MarcaAcademia";
import { Segmentado } from "@/components/Segmentado";
import { ChartContainer } from "@/components/ui/chart";
import { useIdioma } from "@/i18n";
import { COM_MOVIMENTO, gsap, useGSAP } from "@/lib/animacao";
import { ACADEMIAS, POSICOES } from "@/lib/dados";
import { usePrefereMenosMovimento } from "@/lib/movimento";
import { cn } from "@/lib/utils";

function DicaJogador({ active, payload }) {
  const { t, numero } = useIdioma();
  if (!active || !payload?.length) return null;
  const jogador = payload[0].payload;
  const meta = ACADEMIAS[jogador.clube];
  return (
    <div className="min-w-48 border border-rule-strong bg-popover px-4 py-3 text-popover-foreground">
      <p className="display text-base leading-tight font-semibold">{jogador.nome}</p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
        <dt className="text-muted-foreground">{t("tooltip.academia")}</dt>
        <dd className="flex items-center gap-1.5">
          <MarcaAcademia clube={jogador.clube} tamanho={10} />
          {meta?.academia}
        </dd>
        <dt className="text-muted-foreground">{t("tooltip.posicao")}</dt>
        <dd>{t(`posicoes.${jogador.position}`)}</dd>
        <dt className="text-muted-foreground">{t("tooltip.tecnico")}</dt>
        <dd className="num">{numero(jogador.indice_tecnico, 1)}</dd>
        <dt className="text-muted-foreground">{t("tooltip.explosivo")}</dt>
        <dd className="num">{numero(jogador.indice_explosivo, 1)}</dd>
      </dl>
    </div>
  );
}

export function PainelIndices({ jogadores, academias }) {
  const { t } = useIdioma();
  const reduzirMovimento = usePrefereMenosMovimento();
  const [ocultas, setOcultas] = useState(() => new Set());
  const [posicao, setPosicao] = useState("todas");
  const contador = useRef(null);

  const daPosicao = useMemo(
    () =>
      jogadores.filter(
        (j) => (posicao === "todas" || j.position === posicao) && j.indice_tecnico != null && j.indice_explosivo != null,
      ),
    [jogadores, posicao],
  );
  const visiveis = daPosicao.filter((j) => !ocultas.has(j.clube));

  const alternarAcademia = (clube) =>
    setOcultas((atual) => {
      const nova = new Set(atual);
      if (nova.has(clube)) nova.delete(clube);
      else nova.add(clube);
      return nova;
    });

  // Retorno visual do filtro: o contador pisca de leve quando o recorte muda.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        gsap.fromTo(contador.current, { autoAlpha: 0.2, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" });
      });
      return () => mm.revert();
    },
    { dependencies: [visiveis.length, posicao, ocultas.size], scope: contador },
  );

  const opcoesPosicao = [
    { valor: "todas", rotulo: t("dispersao.todas") },
    ...POSICOES.map((p) => ({ valor: p, rotulo: t(`posicoes.${p}`) })),
  ];

  return (
    <div className="grid grid-cols-12 gap-x-6 gap-y-8">
      <div className="col-span-12 flex flex-col gap-8 lg:col-span-3">
        <div>
          <h3 className="display text-3xl font-semibold">{t("dispersao.titulo")}</h3>
          <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">{t("dispersao.descricao")}</p>
        </div>

        <fieldset>
          <legend className="rotulo mb-2">{t("dispersao.academias")}</legend>
          <ul className="border-t border-rule">
            {academias.map((clube) => {
              const ativa = !ocultas.has(clube);
              const n = daPosicao.filter((j) => j.clube === clube).length;
              return (
                <li key={clube} className="border-b border-rule">
                  <button
                    type="button"
                    aria-pressed={ativa}
                    aria-label={t("dispersao.alternar", { academia: ACADEMIAS[clube].academia })}
                    onClick={() => alternarAcademia(clube)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 py-2.5 text-left text-sm transition-opacity",
                      !ativa && "opacity-35",
                    )}
                  >
                    <MarcaAcademia clube={clube} tamanho={14} />
                    <span className="flex-1">{ACADEMIAS[clube].academia}</span>
                    <span className="num text-xs text-muted-foreground">{n}</span>
                    <span
                      aria-hidden="true"
                      className={cn("size-3 border border-rule-strong", ativa && "bg-lime")}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <Segmentado
          rotulo={t("dispersao.posicao")}
          opcoes={opcoesPosicao}
          valor={posicao}
          aoMudar={setPosicao}
          tamanho="sm"
          vertical
        />

        <p ref={contador} className="num text-sm" aria-live="polite">
          {t("dispersao.contagem", { n: visiveis.length, total: jogadores.length })}
        </p>
      </div>

      <figure className="col-span-12 lg:col-span-9" data-revelar="grafico">
        <div className="relative">
          <ChartContainer
            config={{}}
            className="aspect-auto h-[380px] w-full md:h-[560px]"
            role="img"
            aria-label={t("dispersao.resumo", { n: visiveis.length })}
          >
            <ScatterChart margin={{ top: 12, right: 12, bottom: 36, left: 4 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" />
              <XAxis
                type="number"
                dataKey="indice_tecnico"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                stroke="var(--rule-strong)"
                tick={{ fill: "var(--muted-foreground)" }}
                label={{ value: t("dispersao.eixoX"), position: "insideBottom", offset: -24, fill: "var(--foreground)", fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="indice_explosivo"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                width={44}
                stroke="var(--rule-strong)"
                tick={{ fill: "var(--muted-foreground)" }}
                label={{ value: t("dispersao.eixoY"), angle: -90, position: "insideLeft", offset: 10, fill: "var(--foreground)", fontSize: 12 }}
              />
              <ZAxis range={[120, 120]} />
              <ReferenceLine x={50} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
              <ReferenceLine y={50} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
              <Tooltip cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }} content={<DicaJogador />} />
              {academias.map((clube) => (
                <Scatter
                  key={clube}
                  name={ACADEMIAS[clube].academia}
                  data={visiveis.filter((j) => j.clube === clube)}
                  fill={ACADEMIAS[clube].cor}
                  stroke="var(--background)"
                  strokeWidth={1.5}
                  shape={ACADEMIAS[clube].forma}
                  isAnimationActive={!reduzirMovimento}
                  animationDuration={500}
                />
              ))}
            </ScatterChart>
          </ChartContainer>
          {visiveis.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center p-8 text-center text-sm text-muted-foreground">
              {t("dispersao.vazio")}
            </p>
          )}
        </div>
      </figure>
    </div>
  );
}
