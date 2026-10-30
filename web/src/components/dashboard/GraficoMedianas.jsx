// Medianas por academia: barras agrupadas dos dois índices, lidas da tabela descritiva.
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { Cartao } from "@/components/dashboard/Cartoes";
import { ChartContainer } from "@/components/ui/chart";
import { useIdioma } from "@/i18n";
import { ACADEMIAS, linhaDescritiva } from "@/lib/dados";
import { usePrefereMenosMovimento } from "@/lib/movimento";

const CORES = { tecnico: "var(--foreground)", explosivo: "var(--muted-foreground)" };

function Dica({ active, payload, label }) {
  const { t, numero } = useIdioma();
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
      <p className="font-medium">{ACADEMIAS[label]?.academia}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="mt-1 flex items-center gap-2">
          <span className="size-2 rounded-sm" style={{ background: CORES[item.dataKey] }} aria-hidden="true" />
          {t(`indices.indice_${item.dataKey}`)}
          <span className="ml-auto pl-4 tabular-nums">{numero(item.value, 1)}</span>
        </p>
      ))}
    </div>
  );
}

export function GraficoMedianas({ dados }) {
  const { t, numero } = useIdioma();
  const reduzir = usePrefereMenosMovimento();
  const linhas = dados.academias.map((clube) => ({
    clube,
    tecnico: linhaDescritiva(dados.descritiva, clube, "indice_tecnico")?.mediana,
    explosivo: linhaDescritiva(dados.descritiva, clube, "indice_explosivo")?.mediana,
  }));

  // Destaque: a maior mediana entre as oito já calculadas pelo pipeline.
  const destaque = linhas
    .flatMap((l) => [
      { clube: l.clube, indice: "tecnico", valor: l.tecnico },
      { clube: l.clube, indice: "explosivo", valor: l.explosivo },
    ])
    .filter((item) => item.valor != null)
    .reduce((maior, item) => (item.valor > maior.valor ? item : maior));

  return (
    <Cartao titulo={t("painel.medianasTitulo")}>
      <p className="-mt-2 flex flex-wrap items-baseline gap-x-3">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">{numero(destaque.valor, 1)}</span>
        <span className="text-sm text-muted-foreground">
          {t("painel.maiorMediana", {
            academia: ACADEMIAS[destaque.clube].academia,
            indice: t(`indices.indice_${destaque.indice}`).toLowerCase(),
          })}
        </span>
      </p>
      <ul className="mt-3 flex gap-4 text-xs text-muted-foreground">
        {Object.entries(CORES).map(([chave, cor]) => (
          <li key={chave} className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm" style={{ background: cor }} aria-hidden="true" />
            {t(`indices.indice_${chave}`)}
          </li>
        ))}
      </ul>
      <ChartContainer config={{}} className="mt-2 aspect-auto h-[230px] w-full">
        <BarChart data={linhas} margin={{ top: 12, right: 4, bottom: 0, left: -18 }} barGap={4}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
          <XAxis
            dataKey="clube"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickFormatter={(clube) => ACADEMIAS[clube]?.academia.replace("City Football Academy", "City Academy")}
          />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)" }} />
          <Tooltip cursor={{ fill: "var(--muted)" }} content={<Dica />} />
          <Bar dataKey="tecnico" fill={CORES.tecnico} radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={!reduzir} />
          <Bar dataKey="explosivo" fill={CORES.explosivo} radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={!reduzir} />
        </BarChart>
      </ChartContainer>
    </Cartao>
  );
}
