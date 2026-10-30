// Seção funcional principal: controles de fonte e método, KPIs, testes, gráficos e base de jogadores.
import { useRef } from "react";

import { CabecalhoSecao } from "@/components/CabecalhoSecao";
import { Indicadores } from "@/components/Indicadores";
import { PainelDescritiva } from "@/components/PainelDescritiva";
import { PainelIndices } from "@/components/PainelIndices";
import { PainelKruskal } from "@/components/PainelKruskal";
import { PainelTestes } from "@/components/PainelTestes";
import { Segmentado } from "@/components/Segmentado";
import { TabelaJogadores } from "@/components/TabelaJogadores";
import { useIdioma } from "@/i18n";
import { useRevelarSecao } from "@/lib/animacao";
import { arquivoResultados, comandoResultados } from "@/lib/dados";
import { cn } from "@/lib/utils";

function Controles({ modo, setModo, pool, setPool, carregando, erro, geradoEm }) {
  const { t, data } = useIdioma();
  return (
    <div className="grid grid-cols-12 gap-x-6 gap-y-6 border-t border-rule-strong pt-6">
      <div className="col-span-12 md:col-span-6 lg:col-span-4 lg:col-start-1">
        <Segmentado
          rotulo={t("controles.fonte")}
          opcoes={[
            { valor: "snapshot", rotulo: t("controles.snapshot") },
            { valor: "raw", rotulo: t("controles.raw") },
          ]}
          valor={modo}
          aoMudar={setModo}
        />
        <p className="mt-3 max-w-[44ch] text-sm text-muted-foreground">
          {t(modo === "snapshot" ? "controles.descSnapshot" : "controles.descRaw")}
        </p>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <Segmentado
          rotulo={t("controles.metodo")}
          opcoes={[
            { valor: "artigo", rotulo: t("controles.artigo") },
            { valor: "corrigido", rotulo: t("controles.corrigido") },
          ]}
          valor={pool}
          aoMudar={setPool}
        />
        <p className="mt-3 max-w-[44ch] text-sm text-muted-foreground">
          {t(pool === "artigo" ? "controles.descArtigo" : "controles.descCorrigido")}
        </p>
      </div>
      <div className="col-span-12 lg:col-span-4" role="status" aria-live="polite">
        {erro ? (
          <p className="border-l-2 border-destructive pl-3 text-sm text-destructive">
            {t("controles.erro", { arquivo: arquivoResultados(modo, pool), comando: comandoResultados(modo, pool) })}
          </p>
        ) : carregando ? (
          <p className="num flex items-center gap-2 text-sm">
            <span className="size-2 animate-pulse bg-lime" aria-hidden="true" />
            {t("controles.carregando")}
          </p>
        ) : geradoEm ? (
          <p className="num text-sm text-muted-foreground">{t("controles.gerado", { data: data(geradoEm) })}</p>
        ) : null}
      </div>
    </div>
  );
}

export function Analise({ modo, setModo, pool, setPool, estado }) {
  const { t } = useIdioma();
  const raiz = useRef(null);
  const { dados, carregando, erro } = estado;
  useRevelarSecao(raiz, Boolean(dados));

  return (
    <section id="analise" ref={raiz} aria-labelledby="titulo-analise" className="mx-auto max-w-[1440px] px-4 pt-28 md:px-8 md:pt-40">
      <CabecalhoSecao id="titulo-analise" numero="02" linha1={t("analise.titulo1")} linha2={t("analise.titulo2")}>
        {t("analise.intro")}
      </CabecalhoSecao>

      <div className="mt-14">
        <Controles
          modo={modo}
          setModo={setModo}
          pool={pool}
          setPool={setPool}
          carregando={carregando}
          erro={erro}
          geradoEm={dados?.geradoEm}
        />
      </div>

      {dados && (
        <div
          aria-busy={carregando}
          className={cn("mt-14 flex flex-col gap-24 transition-opacity duration-300 md:gap-32", carregando && "opacity-40")}
        >
          <Indicadores dados={dados} />
          <PainelKruskal kruskal={dados.kruskal} />
          <PainelIndices jogadores={dados.jogadores} academias={dados.academias} />
          <PainelDescritiva descritiva={dados.descritiva} academias={dados.academias} />
          <PainelTestes pares={dados.pares} />
          <TabelaJogadores jogadores={dados.jogadores} academias={dados.academias} modo={modo} pool={pool} />
        </div>
      )}
    </section>
  );
}
