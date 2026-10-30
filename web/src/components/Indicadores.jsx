// KPIs do painel: tamanho da amostra e, para cada índice, onde caem as medianas das quatro academias.
import { useRef } from "react";

import { MarcaAcademia } from "@/components/MarcaAcademia";
import { useIdioma } from "@/i18n";
import { COM_MOVIMENTO, gsap, useGSAP } from "@/lib/animacao";
import { linhaDescritiva } from "@/lib/dados";

function FaixaMedianas({ dados, indice }) {
  const { t, numero } = useIdioma();
  const medianas = dados.academias
    .map((clube) => ({ clube, mediana: linhaDescritiva(dados.descritiva, clube, indice)?.mediana }))
    .filter((item) => item.mediana != null);
  const valores = medianas.map((item) => item.mediana);
  const menor = Math.min(...valores);
  const maior = Math.max(...valores);

  return (
    <>
      <div className="relative mt-6 mb-3 h-6" aria-hidden="true">
        <div className="absolute inset-x-0 top-1/2 h-px bg-rule-strong" />
        <div className="absolute top-1/2 left-1/2 h-2 w-px -translate-y-1/2 bg-muted-foreground" />
        {medianas.map(({ clube, mediana }) => (
          <span
            key={clube}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${mediana}%` }}
            title={`${clube}: ${numero(mediana, 1)}`}
          >
            <MarcaAcademia clube={clube} tamanho={14} />
          </span>
        ))}
      </div>
      <div className="num flex justify-between text-[11px] text-muted-foreground" aria-hidden="true">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {t("kpi.medianas", { min: numero(menor, 1), max: numero(maior, 1) })}
      </p>
    </>
  );
}

export function Indicadores({ dados }) {
  const { t } = useIdioma();
  const raiz = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        gsap.from("[data-kpi]", {
          y: 24,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: raiz.current, start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <dl ref={raiz} className="grid grid-cols-2 border-y border-rule-strong lg:grid-cols-12">
      <div data-kpi className="col-span-1 flex flex-col justify-between gap-4 py-6 pr-4 lg:col-span-2">
        <dt className="text-sm text-muted-foreground">{t("kpi.jogadores")}</dt>
        <dd>
          <span className="num block text-6xl leading-none font-medium tracking-tight">{dados.jogadores.length}</span>
          <span className="mt-2 block text-xs text-muted-foreground">{t("kpi.amostraValidada")}</span>
        </dd>
      </div>
      <div data-kpi className="col-span-1 flex flex-col justify-between gap-4 border-l border-rule py-6 pl-4 lg:col-span-2 lg:pl-6">
        <dt className="text-sm text-muted-foreground">{t("kpi.academias")}</dt>
        <dd>
          <span className="num block text-6xl leading-none font-medium tracking-tight">{dados.academias.length}</span>
          <span className="mt-2 block text-xs text-muted-foreground">{t("kpi.grupos")}</span>
        </dd>
      </div>
      {["indice_tecnico", "indice_explosivo"].map((indice) => (
        <div
          key={indice}
          data-kpi
          className="col-span-2 border-t border-rule py-6 lg:col-span-4 lg:border-t-0 lg:border-l lg:pl-6"
        >
          <dt className="text-sm text-muted-foreground">{t(indice === "indice_tecnico" ? "kpi.tecnico" : "kpi.explosivo")}</dt>
          <dd>
            <FaixaMedianas dados={dados} indice={indice} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
