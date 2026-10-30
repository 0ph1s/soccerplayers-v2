// Índice por jogador: curva dos 35 jogadores do maior para o menor valor, com a marca de cada academia.
import { useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { Cartao, Pilulas } from "@/components/dashboard/Cartoes";
import { MarcaAcademia } from "@/components/MarcaAcademia";
import { ChartContainer } from "@/components/ui/chart";
import { useIdioma } from "@/i18n";
import { ACADEMIAS } from "@/lib/dados";
import { caminhoForma } from "@/lib/formas";
import { usePrefereMenosMovimento } from "@/lib/movimento";

function Dica({ active, payload }) {
  const { t, numero } = useIdioma();
  if (!active || !payload?.length) return null;
  const ponto = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
      <p className="text-muted-foreground">{t("painel.ranking", { n: ponto.posicao })}</p>
      <p className="mt-1 flex items-center gap-2 text-sm font-medium">
        <MarcaAcademia clube={ponto.clube} tamanho={10} />
        {ponto.nome}
        <span className="ml-auto pl-4 tabular-nums">{numero(ponto.valor, 1)}</span>
      </p>
      <p className="mt-0.5 text-muted-foreground">
        {ACADEMIAS[ponto.clube]?.academia} · {t(`posicoes.${ponto.position}`)}
      </p>
    </div>
  );
}

export function GraficoRanking({ jogadores }) {
  const { t, numero } = useIdioma();
  const reduzir = usePrefereMenosMovimento();
  const [indice, setIndice] = useState("indice_tecnico");
  const idGradiente = `gradiente-${useId().replace(/:/g, "")}`;

  const pontos = useMemo(
    () =>
      jogadores
        .filter((j) => j[indice] != null)
        .sort((a, b) => b[indice] - a[indice])
        .map((j, posicao) => ({ posicao: posicao + 1, valor: j[indice], nome: j.nome, clube: j.clube, position: j.position })),
    [jogadores, indice],
  );
  const topo = pontos[0];

  return (
    <Cartao
      titulo={t("painel.graficoTitulo")}
      info={t("painel.graficoInfo")}
      acao={
        <Pilulas
          rotulo={t("painel.graficoTitulo")}
          opcoes={[
            { valor: "indice_tecnico", rotulo: t("indices.indice_tecnico") },
            { valor: "indice_explosivo", rotulo: t("indices.indice_explosivo") },
          ]}
          valor={indice}
          aoMudar={setIndice}
        />
      }
    >
      {topo && (
        <p className="-mt-2 mb-4 flex flex-wrap items-baseline gap-x-3">
          <span className="text-3xl font-semibold tracking-tight tabular-nums">{numero(topo.valor, 1)}</span>
          <span className="text-sm text-muted-foreground">{t("painel.maximo", { nome: topo.nome })}</span>
        </p>
      )}
      <ChartContainer config={{}} className="aspect-auto h-[280px] w-full md:h-[320px]">
        <AreaChart data={pontos} margin={{ top: 8, right: 8, bottom: 22, left: -12 }}>
          <defs>
            <linearGradient id={idGradiente} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
          <XAxis
            dataKey="posicao"
            type="number"
            domain={[1, pontos.length]}
            ticks={[1, 5, 10, 15, 20, 25, 30, 35].filter((n) => n <= pontos.length)}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)" }}
            label={{ value: t("painel.eixoRanking"), position: "insideBottom", offset: -16, fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)" }} />
          <Tooltip cursor={{ stroke: "var(--foreground)", strokeWidth: 1 }} content={<Dica />} />
          <Area
            type="monotone"
            dataKey="valor"
            stroke="var(--foreground)"
            strokeWidth={1.75}
            fill={`url(#${idGradiente})`}
            isAnimationActive={!reduzir}
            animationDuration={700}
            dot={({ cx, cy, payload }) => (
              <path
                key={payload.posicao}
                d={caminhoForma(ACADEMIAS[payload.clube]?.forma, cx, cy, 3.4)}
                fill={ACADEMIAS[payload.clube]?.cor}
                stroke="var(--marca-contorno)"
                strokeWidth={0.9}
              />
            )}
            activeDot={{ r: 5, fill: "var(--card)", stroke: "var(--foreground)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ChartContainer>
    </Cartao>
  );
}
