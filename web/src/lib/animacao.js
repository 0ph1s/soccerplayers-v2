// GSAP registrado uma única vez. As animações só rodam sem "prefers-reduced-motion: reduce".
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export const COM_MOVIMENTO = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, useGSAP };

/**
 * Revela os filhos marcados com data-revelar quando a seção entra na tela.
 * "texto": sobe de dentro da máscara; "bloco": surge com leve subida; "grafico": abre da esquerda.
 */
export function useRevelarSecao(escopo, pronto = true) {
  useGSAP(
    () => {
      if (!pronto) return undefined;
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        const raiz = escopo.current;
        if (!raiz) return;

        raiz.querySelectorAll("[data-revelar='texto']").forEach((elemento) => {
          gsap.from(elemento, {
            yPercent: 105,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: elemento, start: "top 88%", once: true },
          });
        });

        raiz.querySelectorAll("[data-revelar='bloco']").forEach((elemento) => {
          gsap.from(elemento, {
            y: 28,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: elemento, start: "top 90%", once: true },
          });
        });

        raiz.querySelectorAll("[data-revelar='grafico']").forEach((elemento) => {
          gsap.from(elemento, {
            clipPath: "inset(0 100% 0 0)",
            duration: 1.3,
            ease: "expo.inOut",
            scrollTrigger: { trigger: elemento, start: "top 85%", once: true },
            clearProps: "clipPath",
          });
        });

        raiz.querySelectorAll("[data-revelar='regua']").forEach((elemento) => {
          gsap.from(elemento, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: { trigger: elemento, start: "top 92%", once: true },
          });
        });
      });
      return () => mm.revert();
    },
    // Roda uma vez quando o conteúdo aparece (pronto = dados carregados), não a cada troca de arquivo.
    { scope: escopo, dependencies: [pronto], revertOnUpdate: true },
  );
}
