// Cabeçalho fixo: logo tipográfico, seções, idioma e tema. Compacta ao rolar e some ao descer a página.
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";

import { IDIOMAS, useIdioma } from "@/i18n";
import { useTema } from "@/lib/tema";
import { cn } from "@/lib/utils";

const SECOES = [
  { id: "visao", chave: "nav.visao" },
  { id: "analise", chave: "nav.analise" },
  { id: "metodo", chave: "nav.metodo" },
  { id: "pool", chave: "nav.pool" },
];

function useSecaoAtiva() {
  const [ativa, setAtiva] = useState(null);
  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => entrada.isIntersecting && setAtiva(entrada.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SECOES.forEach(({ id }) => {
      const elemento = document.getElementById(id);
      if (elemento) observador.observe(elemento);
    });
    return () => observador.disconnect();
  }, []);
  return ativa;
}

function useEstadoRolagem() {
  const [estado, setEstado] = useState({ rolou: false, oculto: false });
  useEffect(() => {
    let ultimo = window.scrollY;
    let quadro = 0;
    const aoRolar = () => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const atual = window.scrollY;
        const descendo = atual > ultimo + 4;
        const subindo = atual < ultimo - 4;
        setEstado((anterior) => ({
          rolou: atual > 16,
          oculto: descendo && atual > 480 ? true : subindo ? false : anterior.oculto,
        }));
        ultimo = atual;
      });
    };
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      window.removeEventListener("scroll", aoRolar);
      cancelAnimationFrame(quadro);
    };
  }, []);
  return estado;
}

function SeletorIdioma({ className }) {
  const { idioma, setIdioma, t } = useIdioma();
  return (
    <div role="group" aria-label={t("nav.idioma")} className={cn("flex items-center", className)}>
      {Object.entries(IDIOMAS).map(([codigo, { rotulo, nome }]) => (
        <button
          key={codigo}
          type="button"
          lang={IDIOMAS[codigo].tag}
          title={nome}
          aria-label={nome}
          aria-pressed={idioma === codigo}
          onClick={() => setIdioma(codigo)}
          className={cn(
            "num cursor-pointer px-1.5 py-1 text-xs transition-colors",
            idioma === codigo ? "bg-lime text-lime-ink" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {rotulo}
        </button>
      ))}
    </div>
  );
}

function BotaoTema({ tema, alternar }) {
  const { t } = useIdioma();
  const escuro = tema === "escuro";
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={escuro ? t("nav.temaClaro") : t("nav.temaEscuro")}
      title={escuro ? t("nav.temaClaro") : t("nav.temaEscuro")}
      className="flex size-9 cursor-pointer items-center justify-center border border-rule-strong transition-colors hover:bg-lime hover:text-lime-ink"
    >
      {escuro ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
    </button>
  );
}

export function Cabecalho() {
  const { t } = useIdioma();
  const ativa = useSecaoAtiva();
  const { rolou, oculto } = useEstadoRolagem();
  const { tema, alternar } = useTema();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (!menuAberto) return undefined;
    const aoTeclar = (evento) => evento.key === "Escape" && setMenuAberto(false);
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [menuAberto]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color,padding] duration-500 ease-out",
        rolou ? "border-b border-rule bg-background/90 py-2 backdrop-blur-md" : "border-b border-transparent py-4",
        oculto && !menuAberto ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <a
        href="#analise"
        className="num absolute top-2 left-4 -translate-y-24 bg-lime px-3 py-2 text-xs text-lime-ink focus:translate-y-0"
      >
        {t("nav.pular")}
      </a>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-4 md:px-8">
        <a href="#inicio" aria-label={t("nav.inicio")} className="display text-lg leading-none font-bold tracking-tight">
          SOCCER<span className="text-muted-foreground">/</span>ANALYTICS
        </a>

        <nav aria-label={t("nav.principal")} className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {SECOES.map(({ id, chave }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={ativa === id ? "location" : undefined}
                  className={cn(
                    "relative py-1 text-sm transition-colors",
                    "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:bg-lime after:transition-transform after:duration-300",
                    ativa === id ? "text-foreground after:scale-x-100" : "text-muted-foreground after:scale-x-0 hover:text-foreground",
                  )}
                >
                  {t(chave)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <SeletorIdioma />
          <BotaoTema tema={tema} alternar={alternar} />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <BotaoTema tema={tema} alternar={alternar} />
          <button
            type="button"
            aria-expanded={menuAberto}
            aria-controls="menu-movel"
            aria-label={menuAberto ? t("nav.fecharMenu") : t("nav.abrirMenu")}
            onClick={() => setMenuAberto((aberto) => !aberto)}
            className="flex size-9 cursor-pointer items-center justify-center border border-rule-strong"
          >
            {menuAberto ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuAberto && (
        <div id="menu-movel" className="border-t border-rule bg-background px-4 pt-4 pb-6 lg:hidden">
          <nav aria-label={t("nav.principal")}>
            <ul className="flex flex-col">
              {SECOES.map(({ id, chave }) => (
                <li key={id} className="border-b border-rule">
                  <a
                    href={`#${id}`}
                    onClick={() => setMenuAberto(false)}
                    aria-current={ativa === id ? "location" : undefined}
                    className="display block py-3 text-2xl font-semibold"
                  >
                    {t(chave)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <SeletorIdioma className="mt-5 gap-1" />
        </div>
      )}
    </header>
  );
}
