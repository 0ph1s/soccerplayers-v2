import { useEffect, useState } from "react";

import { ProvedorIdioma, useIdioma } from "@/i18n";
import { ScrollTrigger } from "@/lib/animacao";
import { useResultados } from "@/lib/dados";
import { ProvedorRota, useRota } from "@/lib/rota";
import { Dashboard } from "@/pages/Dashboard";
import { Publicacao } from "@/pages/Publicacao";

function Pagina() {
  const { t } = useIdioma();
  const { caminho } = useRota();
  // Fonte e método ficam aqui para valerem nas duas páginas.
  const [modo, setModo] = useState("snapshot");
  const [pool, setPool] = useState("artigo");
  const estado = useResultados(modo, pool);
  const primeiraCarga = estado.carregando && !estado.dados && !estado.erro;
  const naDashboard = caminho.replace(/\/+$/, "") === "/dashboard";

  // A altura da página muda quando os dados entram ou trocam; os gatilhos de rolagem precisam se reposicionar.
  useEffect(() => {
    if (primeiraCarga) return undefined;
    const quadro = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(quadro);
  }, [estado.dados, primeiraCarga, naDashboard]);

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  // As páginas só montam depois da primeira tentativa de carga, para animar já com os dados.
  if (primeiraCarga) {
    return (
      <p className="num flex min-h-svh items-center justify-center gap-2 text-sm" role="status">
        <span className="size-2 animate-pulse bg-lime" aria-hidden="true" />
        {t("controles.carregando")}
      </p>
    );
  }

  const props = { modo, setModo, pool, setPool, estado };
  return naDashboard ? <Dashboard {...props} /> : <Publicacao {...props} />;
}

export default function App() {
  return (
    <ProvedorIdioma>
      <ProvedorRota>
        <Pagina />
      </ProvedorRota>
    </ProvedorIdioma>
  );
}
