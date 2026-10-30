// Visão geral: a pergunta da pesquisa e as quatro academias em uma composição editorial.
import { useRef } from "react";

import { CabecalhoSecao } from "@/components/CabecalhoSecao";
import { MarcaAcademia } from "@/components/MarcaAcademia";
import { useIdioma } from "@/i18n";
import { useRevelarSecao } from "@/lib/animacao";
import { ACADEMIAS, linhaDescritiva } from "@/lib/dados";

export function VisaoGeral({ dados }) {
  const { t, numero } = useIdioma();
  const raiz = useRef(null);
  const pronto = Boolean(dados);
  useRevelarSecao(raiz, pronto);

  const academias = dados?.academias ?? Object.keys(ACADEMIAS);

  return (
    <section id="visao" ref={raiz} aria-labelledby="titulo-visao" className="mx-auto max-w-[1440px] px-4 pt-28 md:px-8 md:pt-40">
      <CabecalhoSecao id="titulo-visao" numero="01" linha1={t("visao.titulo1")} linha2={t("visao.titulo2")} />

      <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-8 md:mt-16">
        <p data-revelar="bloco" className="display col-span-12 max-w-[24ch] text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.05] font-medium md:col-span-9 md:col-start-3">
          {t("visao.pergunta")}
        </p>
        <p data-revelar="bloco" className="col-span-12 max-w-[60ch] leading-relaxed text-muted-foreground md:col-span-6 md:col-start-3">
          {t("visao.contexto")}
        </p>
      </div>

      <ol className="mt-16 grid grid-cols-1 border-t border-rule-strong sm:grid-cols-2 md:mt-24 xl:grid-cols-4">
        {academias.map((clube, indice) => {
          const meta = ACADEMIAS[clube];
          const n = dados?.jogadores.filter((jogador) => jogador.clube === clube).length;
          const tecnica = dados && linhaDescritiva(dados.descritiva, clube, "indice_tecnico");
          const explosiva = dados && linhaDescritiva(dados.descritiva, clube, "indice_explosivo");
          return (
            <li
              key={clube}
              data-revelar="bloco"
              className={[
                "relative flex flex-col gap-6 border-b border-rule py-8 sm:pr-6",
                indice % 2 === 1 ? "sm:border-l sm:pl-6" : "",
                indice > 0 ? "xl:border-l xl:pl-6" : "",
              ].join(" ")}
            >
              <span className="absolute top-0 left-0 h-1 w-16" style={{ background: meta.cor }} aria-hidden="true" />
              <div className="flex items-baseline justify-between gap-4">
                <span className="num text-[clamp(4rem,8vw,7rem)] leading-none font-medium tracking-tight">
                  {n == null ? "··" : String(n).padStart(2, "0")}
                </span>
                <MarcaAcademia clube={clube} tamanho={18} />
              </div>
              <p className="text-sm text-muted-foreground">{t("visao.jogadores")}</p>
              <div>
                <h3 className="display text-3xl leading-none font-semibold">{meta.academia}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{meta.clube}</p>
              </div>
              <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-rule pt-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">{t("visao.medianaTecnica")}</dt>
                  <dd className="num mt-1 text-lg">{numero(tecnica?.mediana, 1)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("visao.medianaExplosiva")}</dt>
                  <dd className="num mt-1 text-lg">{numero(explosiva?.mediana, 1)}</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
