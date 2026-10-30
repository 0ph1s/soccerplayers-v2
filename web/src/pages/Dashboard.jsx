// Página de dashboard ("/dashboard"): barra lateral e cartões com os mesmos JSONs da publicação.
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { BarraLateral, ITENS_NAVEGACAO } from "@/components/dashboard/BarraLateral";
import { CartaoAcademias } from "@/components/dashboard/CartaoAcademias";
import { CartaoPares } from "@/components/dashboard/CartaoPares";
import { CartaoKpi, Selo } from "@/components/dashboard/Cartoes";
import { GraficoMedianas } from "@/components/dashboard/GraficoMedianas";
import { GraficoRanking } from "@/components/dashboard/GraficoRanking";
import { TabelaDashboard } from "@/components/dashboard/TabelaDashboard";
import { useIdioma } from "@/i18n";
import { COM_MOVIMENTO, gsap, ScrollSmoother, ScrollTrigger, useGSAP } from "@/lib/animacao";
import { ACADEMIAS, arquivoResultados, comandoResultados, useResultadosDosDoisPools } from "@/lib/dados";
import { useTema } from "@/lib/tema";
import { cn } from "@/lib/utils";

function useCartaoAtivo() {
  const [ativo, setAtivo] = useState(ITENS_NAVEGACAO[0].id);
  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => entradas.forEach((entrada) => entrada.isIntersecting && setAtivo(entrada.target.id)),
      { rootMargin: "-30% 0px -60% 0px" },
    );
    ITENS_NAVEGACAO.forEach(({ id }) => {
      const elemento = document.getElementById(id);
      if (elemento) observador.observe(elemento);
    });
    return () => observador.disconnect();
  }, []);
  return ativo;
}

function diferenca(numero, valor) {
  if (valor == null || Number.isNaN(valor)) return "—";
  if (Math.abs(valor) < 1e-9) return numero(0, 4);
  return `${valor > 0 ? "+" : "−"}${numero(Math.abs(valor), 4)}`;
}

export function Dashboard({ modo, setModo, pool, setPool, estado }) {
  const { t, numero, pValor, data } = useIdioma();
  const { tema, alternar } = useTema();
  const { dados, carregando, erro } = estado;
  const doisPools = useResultadosDosDoisPools(modo);
  const outroPool = pool === "artigo" ? "corrigido" : "artigo";
  const outro = doisPools[outroPool];

  const [busca, setBusca] = useState("");
  const [recolhido, setRecolhido] = useState(false);
  const [menuMovel, setMenuMovel] = useState(false);
  // A gaveta continua montada durante a animação de fechar.
  const [gavetaMontada, setGavetaMontada] = useState(false);
  const gaveta = useRef(null);
  const fundo = useRef(null);
  const abrirGaveta = useCallback(() => {
    setGavetaMontada(true);
    setMenuMovel(true);
  }, []);
  const buscaRef = useRef(null);
  const buscaMovelRef = useRef(null);
  const principal = useRef(null);
  const envoltorio = useRef(null);
  const conteudo = useRef(null);
  const ativo = useCartaoAtivo();

  useEffect(() => {
    document.title = `${t("painel.titulo")} · Soccer Analytics`;
  }, [t]);

  // Ctrl/⌘ K foca a busca; Esc fecha o menu móvel.
  useEffect(() => {
    const aoTeclar = (evento) => {
      if ((evento.metaKey || evento.ctrlKey) && evento.key.toLowerCase() === "k") {
        evento.preventDefault();
        if (window.matchMedia("(min-width: 1024px)").matches) {
          setRecolhido(false);
          requestAnimationFrame(() => buscaRef.current?.focus());
        } else {
          abrirGaveta();
          requestAnimationFrame(() => buscaMovelRef.current?.focus());
        }
      }
      if (evento.key === "Escape") setMenuMovel(false);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [abrirGaveta]);

  // Gaveta móvel: desliza da esquerda com o fundo escurecendo; ao fechar, volta e só então desmonta.
  useGSAP(
    () => {
      if (!gaveta.current || !fundo.current) return;
      const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (menuMovel) {
        gsap.fromTo(fundo.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduzir ? 0 : 0.35, ease: "power2.out", overwrite: true });
        gsap.fromTo(gaveta.current, { xPercent: -100 }, { xPercent: 0, duration: reduzir ? 0 : 0.5, ease: "power3.out", overwrite: true });
        gsap.fromTo(
          gaveta.current.querySelectorAll("nav li"),
          { x: -14, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: reduzir ? 0 : 0.4, ease: "power3.out", stagger: reduzir ? 0 : 0.04, delay: reduzir ? 0 : 0.15 },
        );
      } else {
        gsap.to(fundo.current, { autoAlpha: 0, duration: reduzir ? 0 : 0.3, ease: "power2.in", overwrite: true });
        gsap.to(gaveta.current, {
          xPercent: -100,
          duration: reduzir ? 0 : 0.35,
          ease: "power3.in",
          overwrite: true,
          onComplete: () => setGavetaMontada(false),
        });
      }
    },
    { dependencies: [menuMovel, gavetaMontada] },
  );

  useGSAP(
    () => {
      if (!dados) return undefined;
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        gsap.from("[data-cartao]", { y: 24, autoAlpha: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 });
      });
      return () => mm.revert();
    },
    { scope: principal, dependencies: [Boolean(dados)], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        const smoother = ScrollSmoother.create({
          wrapper: envoltorio.current,
          content: conteudo.current,
          smooth: 1.05,
          smoothTouch: false,
        });
        return () => smoother.kill();
      });
      return () => mm.revert();
    },
    { scope: envoltorio },
  );

  // Recolher a barra muda a largura do conteúdo e a altura dos cartões: reposiciona a rolagem depois.
  useEffect(() => {
    const espera = window.setTimeout(() => ScrollTrigger.refresh(), 550);
    return () => window.clearTimeout(espera);
  }, [recolhido]);

  const irPara = (id) => {
    setMenuMovel(false);
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alvo = document.getElementById(id);
    if (!alvo) return;
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.scrollTo(alvo, !reduzir, "top 24px");
    else alvo.scrollIntoView({ behavior: reduzir ? "auto" : "smooth", block: "start" });
  };

  const propsLateral = {
    busca,
    aoBuscar: setBusca,
    aoConfirmarBusca: () => irPara("dash-jogadores"),
    ativa: ativo,
    aoIrPara: irPara,
    tema,
    alternarTema: alternar,
    modo,
    setModo,
    pool,
    setPool,
  };

  const testes = dados
    ? ["indice_tecnico", "indice_explosivo"].map((indice) => ({
        indice,
        atual: dados.kruskal.find((k) => k.indice === indice),
        outro: outro?.kruskal.find((k) => k.indice === indice),
      }))
    : [];
  const maiorGrupo = dados
    ? dados.academias
        .map((clube) => ({ clube, n: dados.jogadores.filter((j) => j.clube === clube).length }))
        .reduce((maior, grupo) => (grupo.n > maior.n ? grupo : maior))
    : null;

  return (
    <div className="min-h-svh bg-background text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-background transition-[width] duration-500 ease-out lg:block",
          recolhido ? "w-[72px]" : "w-64",
        )}
      >
        <BarraLateral {...propsLateral} recolhido={recolhido} aoRecolher={() => setRecolhido((r) => !r)} buscaRef={buscaRef} />
      </aside>

      {gavetaMontada && (
        <div className={cn("fixed inset-0 z-50 lg:hidden", !menuMovel && "pointer-events-none")}>
          <button
            ref={fundo}
            type="button"
            aria-label={t("nav.fecharMenu")}
            onClick={() => setMenuMovel(false)}
            className="invisible absolute inset-0 cursor-default bg-background/70 backdrop-blur-sm"
          />
          <aside
            ref={gaveta}
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border bg-card shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setMenuMovel(false)}
              aria-label={t("nav.fecharMenu")}
              className="absolute top-3 right-3 z-10 grid size-8 cursor-pointer place-items-center rounded-md hover:bg-muted"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
            <BarraLateral {...propsLateral} movel recolhido={false} aoRecolher={() => {}} buscaRef={buscaMovelRef} />
          </aside>
        </div>
      )}

      <div id="smooth-wrapper" ref={envoltorio}>
        <div id="smooth-content" ref={conteudo}>
      <main
        ref={principal}
        className={cn(
          "min-w-0 px-4 py-5 transition-[padding-left] duration-500 ease-out md:px-6 lg:py-7 lg:pr-8",
          recolhido ? "lg:pl-[calc(72px+2rem)]" : "lg:pl-[calc(16rem+2rem)]",
        )}
      >
        <div className="mx-auto flex max-w-[1280px] flex-col gap-5">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={abrirGaveta}
                aria-expanded={menuMovel}
                aria-label={t("nav.abrirMenu")}
                className="grid size-9 cursor-pointer place-items-center rounded-lg transition-colors duration-300 hover:bg-foreground/[0.08] lg:hidden"
              >
                <Menu className="size-4" aria-hidden="true" />
              </button>
              <h1 className="text-2xl font-semibold tracking-tight">{t("painel.titulo")}</h1>
            </div>
            <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
              {erro
                ? t("controles.erro", { arquivo: arquivoResultados(modo, pool), comando: comandoResultados(modo, pool) })
                : carregando
                  ? t("controles.carregando")
                  : dados && t("controles.gerado", { data: data(dados.geradoEm) })}
            </p>
          </header>

          {dados && (
            <div className={cn("grid grid-cols-1 gap-4 transition-opacity duration-300 lg:grid-cols-12", carregando && "opacity-50")}>
              <div id="dash-visao" className="grid scroll-mt-6 grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-12">
                <CartaoKpi
                  titulo={t("painel.kpiJogadores")}
                  valor={dados.jogadores.length}
                  selo={<Selo>{t("painel.academias", { n: dados.academias.length })}</Selo>}
                  linha={t("painel.maiorGrupo", { n: maiorGrupo.n, academia: ACADEMIAS[maiorGrupo.clube].academia })}
                />
                {testes.map(({ indice, atual, outro: doOutro }) => (
                  <CartaoKpi
                    key={indice}
                    titulo={t(indice === "indice_tecnico" ? "painel.kpiTecnico" : "painel.kpiExplosivo")}
                    valor={`p ${pValor(atual?.p_valor)}`}
                    selo={
                      <Selo tipo={atual?.significativo ? "positivo" : "neutro"}>
                        {atual?.significativo ? t("painel.sig") : t("painel.naoSig")}
                      </Selo>
                    }
                    linha={
                      <>
                        H {numero(atual?.H, 4)}{" "}
                        <span className="text-foreground">{diferenca(numero, doOutro ? atual?.H - doOutro.H : null)}</span>{" "}
                        {t("painel.vsOutro", { metodo: t(`controles.${outroPool}`).toLowerCase() })}
                      </>
                    }
                  />
                ))}
              </div>

              <div className="lg:col-span-12">
                <GraficoRanking jogadores={dados.jogadores} />
              </div>

              <div className="lg:col-span-6">
                <CartaoAcademias id="dash-academias" dados={dados} />
              </div>
              <div className="lg:col-span-6">
                <GraficoMedianas dados={dados} />
              </div>

              <div className="lg:col-span-5">
                <CartaoPares id="dash-testes" pares={dados.pares} />
              </div>
              <div className="lg:col-span-7">
                <TabelaDashboard id="dash-jogadores" jogadores={dados.jogadores} busca={busca} modo={modo} pool={pool} />
              </div>
            </div>
          )}
        </div>
      </main>
        </div>
      </div>
    </div>
  );
}
