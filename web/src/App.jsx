import { useEffect, useState } from "react";

import { Analise } from "@/components/Analise";
import { Cabecalho } from "@/components/Cabecalho";
import { EfeitoPool } from "@/components/EfeitoPool";
import { Hero } from "@/components/Hero";
import { Metodologia } from "@/components/Metodologia";
import { Rodape } from "@/components/Rodape";
import { VisaoGeral } from "@/components/VisaoGeral";
import { ProvedorIdioma, useIdioma } from "@/i18n";
import { ScrollTrigger } from "@/lib/animacao";
import { useResultados } from "@/lib/dados";

function Pagina() {
  const { t } = useIdioma();
  const [modo, setModo] = useState("snapshot");
  const [pool, setPool] = useState("artigo");
  const estado = useResultados(modo, pool);
  const primeiraCarga = estado.carregando && !estado.dados && !estado.erro;

  // A altura da página muda quando os dados entram ou trocam; os gatilhos de rolagem precisam se reposicionar.
  useEffect(() => {
    if (primeiraCarga) return undefined;
    const quadro = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(quadro);
  }, [estado.dados, primeiraCarga]);

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  // O hero e as seções só montam depois da primeira tentativa de carga, para animar já com os dados.
  if (primeiraCarga) {
    return (
      <p className="num flex min-h-svh items-center justify-center gap-2 text-sm" role="status">
        <span className="size-2 animate-pulse bg-lime" aria-hidden="true" />
        {t("controles.carregando")}
      </p>
    );
  }

  return (
    <>
      <Cabecalho />
      <main>
        <Hero dados={estado.dados} />
        <VisaoGeral dados={estado.dados} />
        <Analise modo={modo} setModo={setModo} pool={pool} setPool={setPool} estado={estado} />
        <Metodologia />
        <EfeitoPool modo={modo} />
      </main>
      <Rodape geradoEm={estado.dados?.geradoEm} />
    </>
  );
}

export default function App() {
  return (
    <ProvedorIdioma>
      <Pagina />
    </ProvedorIdioma>
  );
}
