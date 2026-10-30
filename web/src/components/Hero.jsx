// Hero: o título editorial sobre a própria amostra. A arte é o conjunto real de jogadores no plano dos dois índices.
import { useRef } from "react";

import { useIdioma } from "@/i18n";
import { COM_MOVIMENTO, gsap, useGSAP } from "@/lib/animacao";
import { ACADEMIAS } from "@/lib/dados";
import { caminhoForma } from "@/lib/formas";

const MARCAS_GRADE = Array.from({ length: 11 }, (_, i) => i * 10);

function doisDigitos(valor) {
  return valor == null ? "··" : String(valor).padStart(2, "0");
}

function ArteAmostra({ jogadores }) {
  return (
    <svg viewBox="-6 -6 112 112" className="h-full w-full overflow-visible" aria-hidden="true" data-arte>
      {/* Quadrante em que os dois índices passam de 50. */}
      <rect data-quadrante x="50" y="0" width="50" height="50" fill="var(--lime)" />
      <g data-grade stroke="var(--muted-foreground)" strokeWidth="0.18" opacity="0.55">
        {MARCAS_GRADE.flatMap((x) =>
          MARCAS_GRADE.map((y) => (
            <g key={`${x}-${y}`} data-cruz>
              <line x1={x - 0.9} y1={y} x2={x + 0.9} y2={y} />
              <line x1={x} y1={y - 0.9} x2={x} y2={y + 0.9} />
            </g>
          )),
        )}
      </g>
      <g stroke="var(--foreground)" strokeWidth="0.25">
        <line data-eixo x1="0" y1="100" x2="100" y2="100" />
        <line data-eixo x1="0" y1="0" x2="0" y2="100" />
      </g>
      <g className="num" fill="var(--muted-foreground)" fontSize="2.4">
        <text x="0" y="104.5">0</text>
        <text x="48.5" y="104.5">50</text>
        <text x="95" y="104.5">100</text>
        <text x="-4.8" y="51">50</text>
        <text x="-5.6" y="1.5">100</text>
        <text x="51.5" y="3.6" fill="var(--lime-ink)">&gt; 50 / &gt; 50</text>
      </g>
      <g>
        {jogadores.map((jogador) => {
          const meta = ACADEMIAS[jogador.clube];
          if (!meta || jogador.indice_tecnico == null || jogador.indice_explosivo == null) return null;
          const x = jogador.indice_tecnico;
          const y = 100 - jogador.indice_explosivo;
          return (
            <path
              key={jogador.player_id}
              data-ponto
              d={caminhoForma(meta.forma, x, y, 1.55)}
              fill={meta.cor}
              stroke="var(--background)"
              strokeWidth="0.35"
            />
          );
        })}
      </g>
    </svg>
  );
}

export function Hero({ dados }) {
  const { t } = useIdioma();
  const raiz = useRef(null);
  const jogadores = dados?.jogadores ?? [];
  const pronto = jogadores.length > 0;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        const linha = gsap.timeline({ defaults: { ease: "expo.out" } });
        linha
          .from("[data-titulo] > span > span", { yPercent: 110, duration: 1.3, stagger: 0.12 })
          .from("[data-subtitulo]", { autoAlpha: 0, y: 16, duration: 0.9 }, "-=0.8")
          .from("[data-estatistica] [data-valor]", { yPercent: 105, duration: 1, stagger: 0.08 }, "-=0.7")
          .from("[data-estatistica] [data-legenda]", { autoAlpha: 0, duration: 0.6, stagger: 0.08 }, "<0.2");

        if (pronto) {
          linha
            .from("[data-cruz]", { autoAlpha: 0, duration: 0.6, stagger: { amount: 0.6, from: "center", grid: [11, 11] } }, 0.2)
            .from("[data-eixo]", { scaleX: 0, scaleY: 0, transformOrigin: "0% 100%", duration: 1.1 }, 0.4)
            .from("[data-quadrante]", { scaleY: 0, transformOrigin: "50% 100%", duration: 1.2, ease: "expo.inOut" }, 0.5)
            .from(
              "[data-ponto]",
              { scale: 0, transformOrigin: "center center", transformBox: "fill-box", duration: 0.7, ease: "back.out(2.2)", stagger: { amount: 0.9, from: "random" } },
              0.9,
            );
        }
      });
      return () => mm.revert();
    },
    // O App só monta o hero depois da primeira tentativa de carga, então isto roda uma vez, já com os dados.
    { scope: raiz },
  );

  const estatisticas = [
    { valor: dados?.academias?.length, legenda: t("hero.academias") },
    { valor: dados?.jogadores?.length, legenda: t("hero.jogadores") },
    { valor: dados?.kruskal?.length, legenda: t("hero.indices") },
    { valor: 1, legenda: t("hero.projeto") },
  ];

  return (
    <section id="inicio" ref={raiz} aria-labelledby="titulo-hero" className="relative mx-auto max-w-[1440px] px-4 pt-28 md:px-8 md:pt-32">
      <div className="grid grid-cols-12 gap-x-6 gap-y-10">
        <div className="relative z-10 col-span-12 lg:col-span-8">
          <h1
            id="titulo-hero"
            data-titulo
            className="display text-[clamp(3.2rem,8.2vw,10rem)] font-bold uppercase"
          >
            <span className="linha-mascara">
              <span>{t("hero.linha1")}</span>
            </span>
            <span className="linha-mascara">
              <span>{t("hero.linha2")}</span>
            </span>
          </h1>
          <p data-subtitulo className="mt-8 max-w-[44ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
            {t("hero.subtitulo")}
          </p>
          <a
            href="#visao"
            className="mt-8 inline-flex items-center gap-3 border-b border-rule-strong pb-1 text-sm font-medium transition-colors hover:border-lime"
          >
            {t("hero.explorar")}
            <span aria-hidden="true" className="inline-block size-2 bg-lime" />
          </a>
        </div>

        <figure className="col-span-12 mx-auto w-full max-w-[520px] lg:col-span-4 lg:mt-4 lg:max-w-none">
          <div className="aspect-square w-full">{pronto && <ArteAmostra jogadores={jogadores} />}</div>
          <figcaption className="rotulo mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <span className="max-w-[42ch]">{t("hero.legendaArte", { n: jogadores.length || "··" })}</span>
            <span className="whitespace-nowrap">
              x {t("hero.eixoTecnico")} / y {t("hero.eixoExplosivo")}
            </span>
          </figcaption>
        </figure>
      </div>

      <dl className="mt-16 grid grid-cols-2 border-t border-rule-strong md:mt-20 md:grid-cols-4">
        {estatisticas.map(({ valor, legenda }, indice) => (
          <div
            key={legenda}
            data-estatistica
            className={[
              "flex flex-col gap-2 py-6 pr-4",
              indice % 2 === 1 ? "border-l border-rule pl-4 md:pl-6" : "md:pl-0",
              indice >= 2 ? "border-t border-rule md:border-t-0" : "",
              indice === 2 ? "md:border-l md:pl-6" : "",
            ].join(" ")}
          >
            <dt data-legenda className="order-2 text-sm text-muted-foreground">
              {legenda}
            </dt>
            <dd className="linha-mascara order-1">
              <span data-valor className="num block text-[clamp(3rem,7vw,6rem)] leading-none font-medium tracking-tight">
                {doisDigitos(valor)}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
