// Roteamento mínimo: duas páginas ("/" e "/dashboard") com a History API, sem biblioteca.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ContextoRota = createContext(null);

export function ProvedorRota({ children }) {
  const [caminho, setCaminho] = useState(() => window.location.pathname);

  useEffect(() => {
    const aoVoltar = () => setCaminho(window.location.pathname);
    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, []);

  const navegar = useCallback((destino) => {
    const url = new URL(destino, window.location.origin);
    if (url.pathname === window.location.pathname && url.hash === window.location.hash) return;
    window.history.pushState(null, "", url.pathname + url.hash);
    setCaminho(url.pathname);
    if (!url.hash) window.scrollTo(0, 0);
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
