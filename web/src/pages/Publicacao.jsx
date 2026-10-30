// Página editorial ("/"): cabeçalho fixo fora do ScrollSmoother e o conteúdo com rolagem suave.
import { useEffect, useRef } from "react";

import { Analise } from "@/components/Analise";
import { Cabecalho } from "@/components/Cabecalho";
import { EfeitoPool } from "@/components/EfeitoPool";
import { Hero } from "@/components/Hero";
import { Metodologia } from "@/components/Metodologia";
import { Rodape } from "@/components/Rodape";
import { VisaoGeral } from "@/components/VisaoGeral";
import { useIdioma } from "@/i18n";
import { COM_MOVIMENTO, gsap, ScrollSmoother, ScrollTrigger, useGSAP } from "@/lib/animacao";

const DESLOCAMENTO_CABECALHO = 64;

function rolarAte(alvo, suave = true) {
  const elemento = typeof alvo === "string" ? document.querySelector(alvo) : alvo;
  if (!elemento) return false;
  const smoother = ScrollSmoother.get();
  if (smoother) {
    smoother.scrollTo(elemento, suave, `top ${DESLOCAMENTO_CABECALHO}px`);
  } else {
    const topo = elemento.getBoundingClientRect().top + window.scrollY - DESLOCAMENTO_CABECALHO;
    window.scrollTo({ top: topo, behavior: suave ? "smooth" : "auto" });
  }
  return true;
}

export function Publicacao({ modo, setModo, pool, setPool, estado }) {
  const { t } = useIdioma();
  const envoltorio = useRef(null);
  const conteudo = useRef(null);

  // Rolagem suave só para quem não pediu menos movimento; no toque, a rolagem nativa continua.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        const smoother = ScrollSmoother.create({
          wrapper: envoltorio.current,
          content: conteudo.current,
          smooth: 1.05,
          effects: true,
          smoothTouch: false,
        });
        return () => smoother.kill();
      });
      return () => mm.revert();
    },
    { scope: envoltorio },
  );

  // A dashboard muda o título da aba; ao voltar, restaura o da publicação.
  useEffect(() => {
    document.title = t("meta.titulo");
  }, [t]);

  // Links "#secao" passam pelo ScrollSmoother, com folga para o cabeçalho.
  useEffect(() => {
    const aoClicar = (evento) => {
      const link = evento.target.closest?.('a[href^="#"]');
      if (!link || evento.defaultPrevented || evento.metaKey || evento.ctrlKey) return;
      const hash = link.getAttribute("href");
      if (hash.length < 2 || !document.querySelector(hash)) return;
      evento.preventDefault();
      rolarAte(hash);
      window.history.replaceState(null, "", hash === "#inicio" ? window.location.pathname : hash);
    };
    document.addEventListener("click", aoClicar);
    return () => document.removeEventListener("click", aoClicar);
  }, []);

  // Chegando de outra página com "#secao" na URL (por exemplo, a partir da dashboard).
  useEffect(() => {
    if (!window.location.hash) return undefined;
    const quadro = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      rolarAte(window.location.hash, false);
    });
    return () => cancelAnimationFrame(quadro);
  }, []);

  return (
    <>
      <Cabecalho />
      <div id="smooth-wrapper" ref={envoltorio}>
        <div id="smooth-content" ref={conteudo}>
          <main>
            <Hero dados={estado.dados} />
            <VisaoGeral dados={estado.dados} />
            <Analise modo={modo} setModo={setModo} pool={pool} setPool={setPool} estado={estado} />
            <Metodologia />
            <EfeitoPool modo={modo} />
          </main>
          <Rodape geradoEm={estado.dados?.geradoEm} />
        </div>
      </div>
    </>
  );
}
