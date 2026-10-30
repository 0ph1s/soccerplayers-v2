// Roteamento mínimo: duas páginas ("/" e "/dashboard") com a History API, sem biblioteca.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

const ContextoRota = createContext(null);

/**
 * Troca de página com a View Transitions API: a página atual sai e a nova entra (animação em index.css,
 * classe "transicao-pagina"). Sem suporte no navegador ou com menos movimento, a troca é instantânea.
 */
function trocarPagina(atualizar) {
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduzir) {
    atualizar();
    return;
  }
  const raiz = document.documentElement;
  raiz.classList.add("transicao-pagina");
  // flushSync faz o React aplicar a nova página dentro do callback, antes da "foto" do estado novo.
  const transicao = document.startViewTransition(() => flushSync(atualizar));
  transicao.finished.finally(() => raiz.classList.remove("transicao-pagina"));
}

export function ProvedorRota({ children }) {
  const [caminho, setCaminho] = useState(() => window.location.pathname);
  const caminhoAtual = useRef(caminho);
  useEffect(() => {
    caminhoAtual.current = caminho;
  }, [caminho]);

  useEffect(() => {
    // Voltar/avançar do navegador: anima só quando muda de página, não quando muda só o "#".
    const aoVoltar = () => {
      const novo = window.location.pathname;
      if (novo !== caminhoAtual.current) trocarPagina(() => setCaminho(novo));
    };
    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, []);

  const navegar = useCallback((destino) => {
    const url = new URL(destino, window.location.origin);
    if (url.pathname === window.location.pathname && url.hash === window.location.hash) return;
    const mudaPagina = url.pathname !== window.location.pathname;
    window.history.pushState(null, "", url.pathname + url.hash);
    const atualizar = () => {
      setCaminho(url.pathname);
      if (!url.hash) window.scrollTo(0, 0);
    };
    if (mudaPagina) trocarPagina(atualizar);
    else atualizar();
  }, []);

  const valor = useMemo(() => ({ caminho, navegar }), [caminho, navegar]);
  return <ContextoRota.Provider value={valor}>{children}</ContextoRota.Provider>;
}

export function useRota() {
  const contexto = useContext(ContextoRota);
  if (!contexto) throw new Error("useRota precisa estar dentro de <ProvedorRota>.");
  return contexto;
}

/** Link interno: navega sem recarregar; com Ctrl/Cmd/Shift ou botão do meio, deixa o navegador abrir. */
export function Link({ para, onClick, children, ...props }) {
  const { navegar } = useRota();
  return (
    <a
      href={para}
      onClick={(evento) => {
        onClick?.(evento);
        if (evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey) return;
        evento.preventDefault();
        navegar(para);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
